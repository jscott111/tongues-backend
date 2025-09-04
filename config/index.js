const path = require('path');

// Get environment from NODE_ENV or default to dev
const environment = process.env.NODE_ENV || 'dev';

// Normalize environment names
const normalizedEnv = environment === 'development' ? 'dev' : 
                     environment === 'production' ? 'prod' : 
                     environment;

// Load environment-specific configuration
let config;
try {
  config = require(`./environments/${normalizedEnv}`);
} catch (error) {
  console.warn(`No configuration found for environment: ${normalizedEnv}, falling back to dev`);
  config = require('./environments/dev');
}

// Override with environment variables if they exist
const finalConfig = {
  ...config,
  // Override with process.env values if they exist
  NODE_ENV: process.env.NODE_ENV || config.NODE_ENV,
  PORT: process.env.PORT || config.PORT,
  HOST: process.env.HOST || config.HOST,
  DB_TYPE: process.env.DB_TYPE || config.DB_TYPE,
  DB_PATH: process.env.DB_PATH || config.DB_PATH,
  JWT_SECRET: process.env.JWT_SECRET || config.JWT_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || config.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || config.JWT_REFRESH_EXPIRES_IN,
  AZURE_TRANSLATOR_KEY: process.env.AZURE_TRANSLATOR_KEY || config.AZURE_TRANSLATOR_KEY,
  AZURE_TRANSLATOR_REGION: process.env.AZURE_TRANSLATOR_REGION || config.AZURE_TRANSLATOR_REGION,
  CORS_ORIGIN: process.env.CORS_ORIGIN || config.CORS_ORIGIN,
  LOG_LEVEL: process.env.LOG_LEVEL || config.LOG_LEVEL
};

// Validate required environment variables for production
if (normalizedEnv === 'prod') {
  const requiredVars = ['JWT_SECRET', 'AZURE_TRANSLATOR_KEY', 'AZURE_TRANSLATOR_REGION', 'CORS_ORIGIN'];
  const missingVars = requiredVars.filter(varName => !finalConfig[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables for production: ${missingVars.join(', ')}`);
    process.exit(1);
  }
}

// Log configuration (without sensitive data)
console.log(`🔧 Environment: ${finalConfig.NODE_ENV}`);
console.log(`🔧 Port: ${finalConfig.PORT}`);
console.log(`🔧 Database: ${finalConfig.DB_TYPE} at ${finalConfig.DB_PATH}`);
console.log(`🔧 CORS Origin: ${finalConfig.CORS_ORIGIN}`);

module.exports = finalConfig;
