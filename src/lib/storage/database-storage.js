import BaseStorage from './base-storage.js'
import db from '../database.js'

/**
 * PostgreSQL database storage implementation
 */
class DatabaseStorage extends BaseStorage {

  async addRegistration(email, fullName) {
    const normalizedEmail = this.normalizeEmail(email)
    const trimmedFullName = fullName?.trim()
    
    if (!this.validateEmail(normalizedEmail)) {
      throw new Error('Invalid email format')
    }

    if (!trimmedFullName || trimmedFullName.length < 2) {
      throw new Error('Full name is required and must be at least 2 characters')
    }

    // Check if email already exists
    const existingQuery = 'SELECT id FROM registrations WHERE email = $1'
    const existingResult = await db.query(existingQuery, [normalizedEmail])
    
    if (existingResult.rows.length > 0) {
      throw new Error('Email already registered')
    }

    const verificationToken = this.generateToken()
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const insertQuery = `
      INSERT INTO registrations (email, full_name, status, verification_token, verification_expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, status, created_at, verification_token, verification_expires_at
    `
    
    const result = await db.query(insertQuery, [normalizedEmail, trimmedFullName, 'pending', verificationToken, verificationExpiresAt])
    const registration = result.rows[0]
    
    return this.formatRegistration({
      id: registration.id,
      email: registration.email,
      fullName: registration.full_name,
      status: registration.status,
      createdAt: registration.created_at,
      verificationToken: registration.verification_token,
      verificationExpiresAt: registration.verification_expires_at,
      verifiedAt: null
    })
  }

  async getRegistrationByToken(token) {
    const query = 'SELECT * FROM registrations WHERE verification_token = $1'
    const result = await db.query(query, [token])
    
    if (result.rows.length === 0) {
      return null
    }
    
    const registration = result.rows[0]
    return this.formatRegistration({
      id: registration.id,
      email: registration.email,
      fullName: registration.full_name,
      status: registration.status,
      createdAt: registration.created_at,
      verificationToken: registration.verification_token,
      verificationExpiresAt: registration.verification_expires_at,
      verifiedAt: registration.verified_at
    })
  }

  async verifyRegistration(token) {
    // Get current registration
    const selectQuery = 'SELECT * FROM registrations WHERE verification_token = $1'
    const selectResult = await db.query(selectQuery, [token])
    
    if (selectResult.rows.length === 0) {
      throw new Error('Invalid verification token')
    }

    const registration = selectResult.rows[0]
    
    // Check if token has expired
    if (new Date() > new Date(registration.verification_expires_at)) {
      throw new Error('Verification token has expired')
    }

    // Check if already verified
    if (registration.status === 'registered') {
      throw new Error('Email already verified')
    }

    // Update registration status
    const updateQuery = `
      UPDATE registrations 
      SET status = 'registered', 
          verified_at = CURRENT_TIMESTAMP, 
          verification_token = NULL, 
          verification_expires_at = NULL
      WHERE verification_token = $1
      RETURNING *
    `
    
    const updateResult = await db.query(updateQuery, [token])
    const updatedRegistration = updateResult.rows[0]
    
    return this.formatRegistration({
      id: updatedRegistration.id,
      email: updatedRegistration.email,
      status: updatedRegistration.status,
      createdAt: updatedRegistration.created_at,
      verificationToken: updatedRegistration.verification_token,
      verificationExpiresAt: updatedRegistration.verification_expires_at,
      verifiedAt: updatedRegistration.verified_at
    })
  }

  async getStats() {
    const registeredQuery = "SELECT COUNT(*) FROM registrations WHERE status = 'registered'"
    const pendingQuery = "SELECT COUNT(*) FROM registrations WHERE status = 'pending'"
    const totalQuery = 'SELECT COUNT(*) FROM registrations'
    const statsQuery = 'SELECT fake_base_count FROM stats WHERE id = 1'
    
    const [registeredResult, pendingResult, totalResult, statsResult] = await Promise.all([
      db.query(registeredQuery),
      db.query(pendingQuery),
      db.query(totalQuery),
      db.query(statsQuery)
    ])
    
    const registeredCount = parseInt(registeredResult.rows[0].count)
    const pendingCount = parseInt(pendingResult.rows[0].count)
    const total = parseInt(totalResult.rows[0].count)
    let fakeBaseCount = this.generateFakeBaseCount()
    
    if (statsResult.rows.length > 0) {
      fakeBaseCount = statsResult.rows[0].fake_base_count
    } else {
      // Insert initial stats if not exists
      await db.query('INSERT INTO stats (fake_base_count) VALUES ($1)', [fakeBaseCount])
    }
    
    return {
      totalRegistered: registeredCount,
      totalPending: pendingCount,
      total: total,
      fakeBaseCount: fakeBaseCount,
      displayCount: fakeBaseCount + registeredCount
    }
  }

  /**
   * Test database connection
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    try {
      await db.query('SELECT 1')
      return true
    } catch (error) {
      console.error('Database connection test failed:', error)
      return false
    }
  }

  /**
   * Close database connection
   */
  async close() {
    try {
      await db.end()
    } catch (error) {
      console.error('Error closing database connection:', error)
    }
  }
}

export default DatabaseStorage