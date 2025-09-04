module.exports = {
  NODE_ENV: 'staging',
  PORT: process.env.PORT || 3001,
  HOST: '0.0.0.0',
  
  // Database
  DB_TYPE: 'sqlite',
  DB_PATH: './data/scribe-staging.db',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'staging-super-secret-jwt-key-change-this',
  JWT_ACCESS_EXPIRES_IN: '12h',
  JWT_REFRESH_EXPIRES_IN: '3d',
  
  // Azure Translator
  AZURE_TRANSLATOR_KEY: process.env.AZURE_TRANSLATOR_KEY,
  AZURE_TRANSLATOR_REGION: process.env.AZURE_TRANSLATOR_REGION,
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://staging.yourapp.com',
  
  // Logging
  LOG_LEVEL: 'info'
}
