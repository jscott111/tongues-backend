const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const { getSupportedLanguages } = require('./azureLangs')

const app = express()
const server = http.createServer(app)

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}))

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
})

app.use(express.json({ limit: '50mb' }))
app.use(express.static(path.join(__dirname, 'public')))

const activeConnections = new Map()

const emitConnectionCount = () => {
  const connectionsByLanguage = {}
  activeConnections.forEach((connection) => {
    if (connection.targetLanguage) {
      connectionsByLanguage[connection.targetLanguage] = (connectionsByLanguage[connection.targetLanguage] || 0) + 1
    }
  })
  
  io.emit('connectionCount', {
    total: activeConnections.size,
    byLanguage: connectionsByLanguage
  })
}

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`)
  console.log(`📡 Total connections: ${io.engine.clientsCount}`)
  console.log(`🌐 Client origin: ${socket.handshake.headers.origin}`)
  
  activeConnections.set(socket.id, {
    isStreaming: false,
    sourceLanguage: null,
    targetLanguage: null
  })

  const currentActiveCount = activeConnections.size
  console.log(`👥 Active connections: ${currentActiveCount}`)
  
  emitConnectionCount()

  socket.on('speechTranscription', async (data) => {
    try {
      console.log(`🎤 Received: "${data.transcription}"`)
      
      const { transcription, sourceLanguage, bubbleId } = data
      
      const connection = activeConnections.get(socket.id)
      if (connection) {
        connection.isStreaming = true
        connection.sourceLanguage = sourceLanguage
      }

      emitConnectionCount()

      io.emit('transcription', {
        type: 'transcription',
        originalText: transcription,
        sourceLanguage,
        bubbleId,
        timestamp: new Date().toISOString()
      })
      
      socket.emit('transcriptionComplete', {
        type: 'transcriptionComplete',
        bubbleId
      })
      
    } catch (error) {
      console.error('Error processing speech transcription:', error)
      socket.emit('error', { message: 'Failed to process transcription: ' + error.message })
    }
  })

  socket.on('audioStream', async (data) => {
    try {
      const { audioData, sourceLanguage, targetLanguage } = data
      
      const connection = activeConnections.get(socket.id)
      if (connection) {
        connection.isStreaming = true
        connection.sourceLanguage = sourceLanguage
        connection.targetLanguage = targetLanguage
      }

      const translatedText = await processAudioStream(audioData, sourceLanguage, targetLanguage)
      
      if (translatedText) {
        socket.emit('translation', {
          translatedText,
          sourceLanguage,
          targetLanguage,
          timestamp: new Date().toISOString()
        })
      }
      
    } catch (error) {
      console.error('Error processing audio stream:', error)
      socket.emit('error', { message: 'Failed to process audio stream' })
    }
  })

  socket.on('stopStreaming', () => {
    const connection = activeConnections.get(socket.id)
    if (connection) {
      connection.isStreaming = false
    }
    console.log(`Client ${socket.id} stopped streaming`)
  })

  socket.on('setTargetLanguage', (data) => {
    const connection = activeConnections.get(socket.id)
    if (connection) {
      connection.targetLanguage = data.targetLanguage
      console.log(`🎯 Client ${socket.id} set target language to ${data.targetLanguage}`)
      emitConnectionCount()
    }
  })

  socket.on('getConnectionCount', () => {
    const connectionsByLanguage = {}
    activeConnections.forEach((connection) => {
      if (connection.targetLanguage) {
        connectionsByLanguage[connection.targetLanguage] = (connectionsByLanguage[connection.targetLanguage] || 0)
      }
    })
    
    socket.emit('connectionCount', {
      total: activeConnections.size,
      byLanguage: connectionsByLanguage
    })
  })

  socket.on('disconnect', () => {
    activeConnections.delete(socket.id)
    const currentActiveCount = activeConnections.size
    console.log(`📡 Remaining active connections: ${currentActiveCount}`)
    
    emitConnectionCount()
  })
})

app.get('/api/websocket-status', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    activeConnections: activeConnections.size,
    totalClients: io.engine.clientsCount,
    websocketEnabled: true
  })
})

async function processTranscription(transcription, sourceLanguage, targetLanguage) {
  try {
    console.log(`🌍 Processing: "${transcription}" (${sourceLanguage} → ${targetLanguage})`)
    
    const createClient = require('@azure-rest/ai-translation-text').default
    
    const client = createClient(process.env.AZURE_TRANSLATOR_ENDPOINT, {
      key: process.env.AZURE_TRANSLATOR_KEY,
      region: process.env.AZURE_TRANSLATOR_REGION
    })
    
    const azureSourceLang = sourceLanguage
    const azureTargetLang = targetLanguage
    
    const result = await client.path('/translate').post({
      body: [{
        text: transcription
      }],
      queryParameters: {
        'api-version': '3.0',
        'from': azureSourceLang,
        'to': azureTargetLang
      }
    })
    
    if (result.body && result.body[0] && result.body[0].translations && result.body[0].translations[0]) {
      const translatedText = result.body[0].translations[0].text
      console.log(`✅ Translated: "${transcription}" → "${translatedText}"`)
      return translatedText
    } else {
      throw new Error('Invalid response from Azure Translator')
    }
    
  } catch (error) {
    console.error('❌ Translation error:', error.message)
    
    return `Translation error: ${error.message}`
  }
}

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeConnections: activeConnections.size,
    totalClients: io.engine.clientsCount
  })
})

app.get('/api/languages', (req, res) => {
  const languages = getSupportedLanguages()
  res.json(languages)
})

app.post('/api/translate', async (req, res) => {
  try {
    const { text, from, to } = req.body
    
    if (!text || !from || !to) {
      return res.status(400).json({ error: 'Missing required fields: text, from, to' })
    }

    const translatedText = await processTranscription(text, from, to)
    
    res.json({
      translatedText,
      originalText: text,
      sourceLanguage: from,
      targetLanguage: to
    })
    
  } catch (error) {
    console.error('Translation API error:', error)
    res.status(500).json({ error: 'Translation failed' })
  }
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎤 Input Client: http://localhost:5173`)
  console.log(`🌍 Translation Client: http://localhost:5174`)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})
