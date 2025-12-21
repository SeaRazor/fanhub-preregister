import crypto from 'crypto'

/**
 * Abstract base class for storage implementations
 * Defines the interface that all storage implementations must follow
 */
class BaseStorage {
  
  /**
   * Add a new registration
   * @param {string} email - User email address
   * @param {string} fullName - User full name
   * @returns {Promise<Object>} Registration object with id, email, fullName, status, etc.
   * @throws {Error} If email already exists
   */
  async addRegistration(email, fullName) {
    throw new Error('addRegistration method must be implemented')
  }

  /**
   * Get registration by verification token
   * @param {string} token - Verification token
   * @returns {Promise<Object|null>} Registration object or null if not found
   */
  async getRegistrationByToken(token) {
    throw new Error('getRegistrationByToken method must be implemented')
  }

  /**
   * Verify a registration using token
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Updated registration object
   * @throws {Error} If token invalid, expired, or already verified
   */
  async verifyRegistration(token) {
    throw new Error('verifyRegistration method must be implemented')
  }

  /**
   * Get registration statistics
   * @returns {Promise<Object>} Stats object with counts and fake base count
   */
  async getStats() {
    throw new Error('getStats method must be implemented')
  }

  /**
   * Generate a secure random token
   * @returns {string} 64-character hex token
   */
  generateToken() {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Generate fake base count based on launch date
   * @returns {number} Calculated base count
   */
  generateFakeBaseCount() {
    const baseCount = 2847
    const startDate = new Date('2024-12-01')
    const currentDate = new Date()
    const daysDiff = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24))
    const dailyIncrease = 35
    return baseCount + (daysDiff * dailyIncrease)
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Normalize email (lowercase, trim)
   * @param {string} email - Email to normalize
   * @returns {string} Normalized email
   */
  normalizeEmail(email) {
    return email.toLowerCase().trim()
  }

  /**
   * Create standardized registration object
   * @param {Object} data - Raw registration data
   * @returns {Object} Standardized registration object
   */
  formatRegistration(data) {
    return {
      id: data.id?.toString(),
      email: data.email,
      fullName: data.fullName,
      status: data.status,
      createdAt: data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt,
      verificationToken: data.verificationToken,
      verificationExpiresAt: data.verificationExpiresAt instanceof Date ? 
        data.verificationExpiresAt.toISOString() : data.verificationExpiresAt,
      verifiedAt: data.verifiedAt instanceof Date ? 
        data.verifiedAt.toISOString() : data.verifiedAt
    }
  }
}

export default BaseStorage