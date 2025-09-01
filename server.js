const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

// Import language enums and helpers
const { getSupportedLanguages } = require('./azureLangs')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.static(path.join(__dirname, 'public')))

const activeConnections = new Map()

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)
  
  activeConnections.set(socket.id, {
    isStreaming: false,
    sourceLanguage: null,
    targetLanguage: null
  })

  socket.on('speechTranscription', async (data) => {
    try {
      console.log(`🎤 Received: "${data.transcription}"`)
      
      const { transcription, sourceLanguage, targetLanguage } = data
      
      const connection = activeConnections.get(socket.id)
      if (connection) {
        connection.isStreaming = true
        connection.sourceLanguage = sourceLanguage
        connection.targetLanguage = targetLanguage
      }

      const translatedText = await processTranscription(transcription, sourceLanguage, targetLanguage)
      
      if (translatedText) {
        socket.emit('translation', {
          translatedText,
          sourceLanguage,
          targetLanguage,
          timestamp: new Date().toISOString()
        })
      }
      
    } catch (error) {
      console.error('Error processing speech transcription:', error)
      socket.emit('error', { message: 'Failed to process transcription: ' + error.message })
    }
  });

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

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
    activeConnections.delete(socket.id)
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
    activeConnections: activeConnections.size
  })
})

app.get('/api/languages', (req, res) => {
  const languages = getSupportedLanguages()
  res.json(languages)
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Tongues Backend Server running on port ${PORT}`)
  console.log(`📡 WebSocket server ready for real-time connections`)
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`)
  console.log(`📚 Languages API: http://localhost:${PORT}/api/languages`)
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})
