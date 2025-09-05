module.exports = {
  NODE_ENV: 'dev',
  PORT: 3001,
  HOST: '0.0.0.0',
  
  // Database
  DB_TYPE: 'sqlite',
  DB_PATH: './data/scribe-dev.db',
  
  // JWT Configuration
  JWT_SECRET: 'dev-super-secret-jwt-key-change-this-in-production',
  JWT_ACCESS_EXPIRES_IN: '24h',
  JWT_REFRESH_EXPIRES_IN: '7d',
  
  // Azure Translator
  AZURE_TRANSLATOR_KEY: process.env.AZURE_TRANSLATOR_KEY || 'your-azure-translator-key-here',
  AZURE_TRANSLATOR_REGION: process.env.AZURE_TRANSLATOR_REGION || 'your-azure-region-here',
  
  // CORS
  CORS_ORIGIN: 'http://speaker.localhost:5173,http://listener.localhost:5173',
  
  // Logging
  LOG_LEVEL: 'debug'
}