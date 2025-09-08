module.exports = {
  NODE_ENV: 'staging',
  PORT: process.env.PORT || 3001,
  HOST: '0.0.0.0',
  
  // Database
  DB_TYPE: process.env.DB_TYPE || 'postgres',
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT || '5432',
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_SSL: process.env.DB_SSL || 'true',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'staging-super-secret-jwt-key-change-this',
  JWT_ACCESS_EXPIRES_IN: '12h',
  JWT_REFRESH_EXPIRES_IN: '3d',
  
  // Azure Translator
  AZURE_TRANSLATOR_KEY: process.env.AZURE_TRANSLATOR_KEY,
  AZURE_TRANSLATOR_REGION: process.env.AZURE_TRANSLATOR_REGION,
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://speaker-staging.yourdomain.com,https://listener-staging.yourdomain.com',
  
  // Logging
  LOG_LEVEL: 'info'
}
