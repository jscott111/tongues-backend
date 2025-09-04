module.exports = {
  NODE_ENV: 'prod',
  PORT: process.env.PORT || 3001,
  HOST: '0.0.0.0',
  
  // Database
  DB_TYPE: process.env.DB_TYPE || 'sqlite',
  DB_PATH: process.env.DB_PATH || './data/scribe-prod.db',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_EXPIRES_IN: '1h',
  JWT_REFRESH_EXPIRES_IN: '7d',
  
  // Azure Translator
  AZURE_TRANSLATOR_KEY: process.env.AZURE_TRANSLATOR_KEY,
  AZURE_TRANSLATOR_REGION: process.env.AZURE_TRANSLATOR_REGION,
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  
  // Logging
  LOG_LEVEL: 'warn'
}