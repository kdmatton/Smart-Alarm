const { config } = require('dotenv');
const { Pool } = require('pg');

// load variables from .env into process.env
config();

const poolConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port:  parseInt(process.env.DB_PORT || '5432', 10),
  // fail fast instead of hanging when the DB is unreachable
  connectionTimeoutMillis: 5000
};

const db = new Pool(poolConfig)

// without a listener, a pool connection error crashes the process
db.on('error', (err) => {
  console.error('unexpected postgres pool error:', err)
})

module.exports = db