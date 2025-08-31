const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Store active connections
const activeConnections = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Store connection info
  activeConnections.set(socket.id, {
    isStreaming: false,
    sourceLanguage: 'en',
    targetLanguage: 'es'
  });

  // Handle audio stream
  socket.on('audioStream', async (data) => {
    try {
      const { audioData, sourceLanguage, targetLanguage } = data;
      
      // Update connection info
      const connection = activeConnections.get(socket.id);
      if (connection) {
        connection.isStreaming = true;
        connection.sourceLanguage = sourceLanguage;
        connection.targetLanguage = targetLanguage;
      }

      // Process audio data (this is where you'd integrate with AI APIs)
      const translatedText = await processAudioStream(audioData, sourceLanguage, targetLanguage);
      
      if (translatedText) {
        socket.emit('translation', {
          translatedText,
          sourceLanguage,
          targetLanguage,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('Error processing audio stream:', error);
      socket.emit('error', { message: 'Failed to process audio stream' });
    }
  });

  // Handle stop streaming
  socket.on('stopStreaming', () => {
    const connection = activeConnections.get(socket.id);
    if (connection) {
      connection.isStreaming = false;
    }
    console.log(`Client ${socket.id} stopped streaming`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    activeConnections.delete(socket.id);
  });
});

// Audio processing function (placeholder for AI integration)
async function processAudioStream(audioData, sourceLanguage, targetLanguage) {
  // This is where you'd integrate with:
  // 1. Speech-to-Text API (Google Speech-to-Text, OpenAI Whisper, etc.)
  // 2. Translation API (Google Translate, DeepL, OpenAI, etc.)
  
  // For now, return a mock translation
  // In production, you'd:
  // 1. Convert audio data to proper format
  // 2. Send to speech-to-text service
  // 3. Send text to translation service
  // 4. Return translated text
  
  console.log(`Processing audio: ${sourceLanguage} -> ${targetLanguage}`);
  console.log(`Audio data length: ${audioData.length}`);
  
  // Mock translation for demonstration
  const mockTranslations = {
    'en-es': 'Hola, ¿cómo estás?',
    'es-en': 'Hello, how are you?',
    'en-fr': 'Bonjour, comment allez-vous?',
    'fr-en': 'Hello, how are you?',
    'en-de': 'Hallo, wie geht es dir?',
    'de-en': 'Hello, how are you?'
  };
  
  const key = `${sourceLanguage}-${targetLanguage}`;
  const reverseKey = `${targetLanguage}-${sourceLanguage}`;
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  return mockTranslations[key] || mockTranslations[reverseKey] || 'Translation not available';
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeConnections: activeConnections.size
  });
});

app.get('/api/languages', (req, res) => {
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
  ];
  
  res.json(languages);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Tongues Backend Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for real-time connections`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 Languages API: http://localhost:${PORT}/api/languages`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
