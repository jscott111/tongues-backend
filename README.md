# 🚀 Tongues Backend

Node.js + Express backend server for the Tongues real-time audio translation application.

## ✨ Features

- 🎤 **Real-time Audio Processing** - WebSocket-based audio streaming
- 🌍 **Multi-language Support** - 12+ languages for translation
- 🔄 **Live Translation Pipeline** - Ready for AI service integration
- 📡 **Socket.IO Integration** - Low-latency real-time communication
- 🚀 **Express.js REST API** - Clean, modular API endpoints
- 🔒 **CORS Enabled** - Secure frontend integration

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

The server will be available at `http://localhost:3001`

## 🏗️ Architecture

- **Express.js** for REST API endpoints
- **Socket.IO** for real-time WebSocket communication
- **Web Audio Processing** pipeline ready for AI integration
- **Modular Design** for easy service integration
- **CORS Configuration** for frontend connectivity

## 🔌 Frontend Integration

This backend connects to the Tongues frontend service via WebSocket. The frontend should be running on `http://localhost:5173` for full functionality.

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Server status and active connections

### Languages
- `GET /api/languages` - List of supported languages

## 🔌 WebSocket Events

### Client to Server
- `audioStream` - Send audio data for translation
- `stopStreaming` - Stop audio processing

### Server to Client
- `translation` - Receive translated text
- `error` - Error messages
- `connect` - Connection established
- `disconnect` - Connection closed

## 🤖 AI Integration

The `processAudioStream` function in `server.js` is where you'll integrate with AI services:

### Speech-to-Text Options:
1. **Google Speech-to-Text** - High accuracy, supports 120+ languages
2. **OpenAI Whisper** - Excellent quality, good for multiple languages
3. **Azure Speech Services** - Enterprise-grade, good integration
4. **Amazon Transcribe** - AWS ecosystem integration

### Translation Options:
1. **Google Translate API** - 100+ languages, good accuracy
2. **DeepL API** - High quality for European languages
3. **OpenAI GPT** - Context-aware translations
4. **Microsoft Translator** - Good enterprise integration

### Example Integration:

```javascript
// Google Speech-to-Text + Google Translate
const speech = require('@google-cloud/speech');
const {Translate} = require('@google-cloud/translate').v2;

async function processAudioStream(audioData, sourceLanguage, targetLanguage) {
  // 1. Convert audio data to proper format
  const audioBuffer = Buffer.from(audioData);
  
  // 2. Speech-to-Text
  const speechClient = new speech.SpeechClient();
  const [response] = await speechClient.recognize({
    audio: { content: audioBuffer.toString('base64') },
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: sourceLanguage,
    },
  });
  
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  
  // 3. Translation
  const translate = new Translate();
  const [translation] = await translate.translate(transcription, targetLanguage);
  
  return translation;
}
```

## 🛠️ Development

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Check server health
curl http://localhost:3001/api/health
```

## 📁 Project Structure

```
├── server.js              # Main server with Socket.IO
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🌐 Supported Languages

- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇮🇹 Italian (it)
- 🇵🇹 Portuguese (pt)
- 🇷🇺 Russian (ru)
- 🇯🇵 Japanese (ja)
- 🇰🇷 Korean (ko)
- 🇨🇳 Chinese (zh)
- 🇸🇦 Arabic (ar)
- 🇮🇳 Hindi (hi)

## 🔧 Environment Variables

Create a `.env` file:
```bash
PORT=3001
NODE_ENV=development
# Add your AI service API keys here
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
OPENAI_API_KEY=your_openai_key
```

## 🚀 Production Deployment

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up reverse proxy (nginx/Apache)
4. Configure SSL certificates
5. Set up environment variables for API keys

## 🔒 Security Considerations

- Implement rate limiting
- Add authentication for API endpoints
- Validate audio data size and format
- Use HTTPS in production
- Implement proper error handling
- Add logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

**Part of the Tongues Audio Translation Platform**
