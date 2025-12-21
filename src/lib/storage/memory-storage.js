import BaseStorage from './base-storage.js'

/**
 * In-memory storage implementation for serverless environments
 * Note: Data will be lost between function invocations
 */
class MemoryStorage extends BaseStorage {
  
  constructor() {
    super()
    // Initialize with some fake data for demo
    this.data = {
      registrations: [],
      stats: {
        fakeBaseCount: this.generateFakeBaseCount(),
        lastUpdated: new Date().toISOString()
      }
    }
  }

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
    const existingRegistration = this.data.registrations.find(r => r.email === normalizedEmail)
    if (existingRegistration) {
      throw new Error('Email already registered')
    }

    const verificationToken = this.generateToken()
    const now = new Date()
    const verificationExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const registration = {
      id: this.generateId(),
      email: normalizedEmail,
      fullName: trimmedFullName,
      status: 'pending',
      createdAt: now.toISOString(),
      verificationToken: verificationToken,
      verificationExpiresAt: verificationExpiresAt.toISOString(),
      verifiedAt: null
    }

    this.data.registrations.push(registration)
    
    return this.formatRegistration(registration)
  }

  async getRegistrationByToken(token) {
    const registration = this.data.registrations.find(r => r.verificationToken === token)
    
    if (!registration) {
      return null
    }
    
    return this.formatRegistration(registration)
  }

  async verifyRegistration(token) {
    const registrationIndex = this.data.registrations.findIndex(r => r.verificationToken === token)
    
    if (registrationIndex === -1) {
      throw new Error('Invalid verification token')
    }

    const registration = this.data.registrations[registrationIndex]
    
    // Check if token has expired
    if (new Date() > new Date(registration.verificationExpiresAt)) {
      throw new Error('Verification token has expired')
    }

    // Check if already verified
    if (registration.status === 'registered') {
      throw new Error('Email already verified')
    }

    // Update registration
    registration.status = 'registered'
    registration.verifiedAt = new Date().toISOString()
    registration.verificationToken = null
    registration.verificationExpiresAt = null

    return this.formatRegistration(registration)
  }

  async getStats() {
    const registeredCount = this.data.registrations.filter(r => r.status === 'registered').length
    const pendingCount = this.data.registrations.filter(r => r.status === 'pending').length
    const total = this.data.registrations.length

    // Update fake base count
    const currentFakeBase = this.generateFakeBaseCount()
    this.data.stats.fakeBaseCount = Math.max(this.data.stats.fakeBaseCount, currentFakeBase)
    this.data.stats.lastUpdated = new Date().toISOString()
    
    return {
      totalRegistered: registeredCount,
      totalPending: pendingCount,
      total: total,
      fakeBaseCount: this.data.stats.fakeBaseCount,
      displayCount: this.data.stats.fakeBaseCount + registeredCount
    }
  }

  /**
   * Generate unique ID for registration
   * @returns {string} Unique ID
   */
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  /**
   * Get all registrations (for admin purposes)
   * @returns {Promise<Array>} Array of all registrations
   */
  async getAllRegistrations() {
    return this.data.registrations.map(r => this.formatRegistration(r))
  }
}

export default MemoryStorage