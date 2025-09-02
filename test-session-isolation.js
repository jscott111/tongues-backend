const { io } = require('socket.io-client')

// Test session isolation
const testSessionIsolation = () => {
  console.log('🧪 Testing session isolation...')
  
  const session1 = 'ABC12345'
  const session2 = 'DEF67890'
  
  // Create two connections with different session IDs
  const socket1 = io('http://localhost:3001', {
    auth: { sessionId: session1 }
  })
  
  const socket2 = io('http://localhost:3001', {
    auth: { sessionId: session2 }
  })
  
  let socket1Connected = false
  let socket2Connected = false
  
  socket1.on('connect', () => {
    console.log('✅ Socket 1 connected to session:', session1)
    socket1Connected = true
    socket1.emit('setTargetLanguage', { targetLanguage: 'es' })
  })
  
  socket2.on('connect', () => {
    console.log('✅ Socket 2 connected to session:', session2)
    socket2Connected = true
    socket2.emit('setTargetLanguage', { targetLanguage: 'fr' })
  })
  
  // Test connection counts
  socket1.on('connectionCount', (data) => {
    console.log('📊 Socket 1 connection count:', data)
  })
  
  socket2.on('connectionCount', (data) => {
    console.log('📊 Socket 2 connection count:', data)
  })
  
  // Test transcription isolation
  socket1.on('transcription', (data) => {
    console.log('📝 Socket 1 received transcription:', data.originalText)
  })
  
  socket2.on('transcription', (data) => {
    console.log('📝 Socket 2 received transcription:', data.originalText)
  })
  
  // Wait for both to connect, then test isolation
  setTimeout(() => {
    if (socket1Connected && socket2Connected) {
      console.log('🎤 Testing transcription isolation...')
      // Simulate a transcription from socket1 - should only go to socket1
      socket1.emit('speechTranscription', {
        transcription: 'Hello from session 1',
        sourceLanguage: 'en',
        bubbleId: 'test1'
      })
    }
  }, 2000)
  
  // Clean up after 10 seconds
  setTimeout(() => {
    console.log('🔌 Disconnecting test sockets...')
    socket1.disconnect()
    socket2.disconnect()
    process.exit(0)
  }, 10000)
}

// Test invalid session ID
const testInvalidSession = () => {
  console.log('🧪 Testing invalid session ID...')
  
  const socket = io('http://localhost:3001', {
    auth: { sessionId: 'invalid_session' }
  })
  
  socket.on('connect_error', (error) => {
    console.log('✅ Invalid session correctly rejected:', error.message)
  })
  
  setTimeout(() => {
    socket.disconnect()
  }, 2000)
}

// Run tests
console.log('🚀 Starting session isolation tests...\n')

testSessionIsolation()
setTimeout(testInvalidSession, 1000)
