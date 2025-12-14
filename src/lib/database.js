import { Pool } from 'pg'

const pool = new Pool({
  user: process.env.DB_USER || process.env.USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'scorefluence',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
})

export default {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  end: () => pool.end(),
  pool
}