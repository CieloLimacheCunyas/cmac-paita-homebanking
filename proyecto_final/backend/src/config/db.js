const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

pool.on('connect', () => { if (process.env.NODE_ENV !== 'test') console.log('📦 PostgreSQL conectado') })
pool.on('error', (err) => { console.error('❌ Error PostgreSQL:', err); process.exit(-1) })

module.exports = pool
