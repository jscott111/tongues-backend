const { Pool } = require('pg');
const config = require('./index');

let pool;

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    try {
      // Create connection pool
      pool = new Pool({
        host: config.DB_HOST,
        port: config.DB_PORT,
        database: config.DB_NAME,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        ssl: config.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
      });

      // Test the connection
      pool.query('SELECT NOW()', (err, result) => {
        if (err) {
          console.error('❌ Database connection failed:', err.message);
          return reject(err);
        }
        
        console.log('✅ Connected to PostgreSQL database');
        console.log('📊 Database time:', result.rows[0].now);
        
        // Run migrations
        runMigrations()
          .then(() => {
            console.log('✅ Database migrations completed');
            resolve();
          })
          .catch(reject);
      });
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      reject(error);
    }
  });
};

const runMigrations = async () => {
  const migrationFiles = [
    '001_create_users_table.sql',
    '002_create_sessions_table.sql'
  ];

  for (const file of migrationFiles) {
    try {
      const fs = require('fs');
      const path = require('path');
      const migrationPath = path.join(__dirname, '..', 'migrations', file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      await pool.query(migrationSQL);
      console.log(`✅ Migration ${file} completed`);
    } catch (error) {
      console.error(`❌ Migration ${file} failed:`, error.message);
      throw error;
    }
  }
};

const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    pool.query(query, params, (err, result) => {
      if (err) {
        console.error('❌ Query error:', err.message);
        return reject(err);
      }
      resolve(result);
    });
  });
};

const getQuery = async (query, params = []) => {
  const result = await runQuery(query, params);
  return result.rows[0] || null;
};

const allQuery = async (query, params = []) => {
  const result = await runQuery(query, params);
  return result.rows;
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Closing database connection...');
  if (pool) {
    await pool.end();
    console.log('✅ Database connection closed');
  }
  process.exit(0);
});

module.exports = { initDatabase, runQuery, getQuery, allQuery };
