const { io } = require('socket.io-client')

// Test session-based connection
const testSessionConnection = () => {
  console.log('🧪 Testing session-based connection...')
  
  const sessionId = 'TEST1234'
  
  const socket = io('http://localhost:3001', {
    auth: {
      sessionId: sessionId
    }
  })
  
  socket.on('connect', () => {
    console.log('✅ Session-based connection successful!')
    console.log('🔗 Session ID:', sessionId)
    console.log('🆔 Socket ID:', socket.id)
    
    // Test setting target language
    socket.emit('setTargetLanguage', { targetLanguage: 'es' })
    
    // Listen for connection count
    socket.on('connectionCount', (data) => {
      console.log('📊 Connection count:', data)
    })
    
    // Listen for transcriptions
    socket.on('transcription', (data) => {
      console.log('📝 Received transcription:', data)
    })
    
    // Disconnect after 5 seconds
    setTimeout(() => {
      console.log('🔌 Disconnecting test socket...')
      socket.disconnect()
      process.exit(0)
    }, 5000)
  })
  
  socket.on('connect_error', (error) => {
    console.error('❌ Connection failed:', error.message)
    process.exit(1)
  })
  
  socket.on('disconnect', () => {
    console.log('🔌 Disconnected')
  })
}

// Test authenticated connection
const testAuthenticatedConnection = () => {
  console.log('🧪 Testing authenticated connection...')
  
  const socket = io('http://localhost:3001', {
    auth: {
      token: 'fake_token_for_testing',
      sessionId: 'TEST5678'
    }
  })
  
  socket.on('connect_error', (error) => {
    console.log('❌ Authenticated connection failed (expected):', error.message)
    console.log('✅ This is expected since we used a fake token')
  })
}

// Run tests
console.log('🚀 Starting connection tests...\n')

testSessionConnection()
setTimeout(testAuthenticatedConnection, 1000)
