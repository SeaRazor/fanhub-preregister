
import BaseStorage from './base-storage.js'
import fs from 'fs/promises'
import path from 'path'

/**
 * JSON file storage implementation
 * Stores data in data/registrations.json file
 */
class JsonStorage extends BaseStorage {
  
  constructor() {
    super()
    this.dataFile = path.join(process.cwd(), 'data', 'registrations.json')
    this.lockFile = path.join(process.cwd(), 'data', '.lock')
  }

  /**
   * Read data from JSON file with file locking
   * @returns {Promise<Object>} Data object with registrations and stats
   */
  async readData() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dataFile)
      await fs.mkdir(dataDir, { recursive: true })

      // Check if file exists, create with default structure if not
      try {
        await fs.access(this.dataFile)
      } catch (error) {
        const defaultData = {
          registrations: [],
          stats: {
            fakeBaseCount: this.generateFakeBaseCount(),
            lastUpdated: new Date().toISOString()
          }
        }
        await fs.writeFile(this.dataFile, JSON.stringify(defaultData, null, 2))
      }

      const data = await fs.readFile(this.dataFile, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Error reading data file:', error)
      // Return default structure if file is corrupted
      return {
        registrations: [],
        stats: {
          fakeBaseCount: this.generateFakeBaseCount(),
          lastUpdated: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Write data to JSON file with atomic operation
   * @param {Object} data - Data to write
   */
  async writeData(data) {
    try {
      // Use atomic write (write to temp file then rename)
      const tempFile = this.dataFile + '.tmp'
      await fs.writeFile(tempFile, JSON.stringify(data, null, 2))
      await fs.rename(tempFile, this.dataFile)
    } catch (error) {
      console.error('Error writing data file:', error)
      throw new Error('Failed to save data')
    }
  }

  /**
   * Generate unique ID for registration
   * @returns {string} Unique ID
   */
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  async addRegistration(email) {
    const normalizedEmail = this.normalizeEmail(email)
    
    if (!this.validateEmail(normalizedEmail)) {
      throw new Error('Invalid email format')
    }

    const data = await this.readData()
    
    // Check if email already exists
    const existingRegistration = data.registrations.find(r => r.email === normalizedEmail)
    if (existingRegistration) {
      throw new Error('Email already registered')
    }

    const verificationToken = this.generateToken()
    const now = new Date()
    const verificationExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const registration = {
      id: this.generateId(),
      email: normalizedEmail,
      status: 'pending',
      createdAt: now.toISOString(),
      verificationToken: verificationToken,
      verificationExpiresAt: verificationExpiresAt.toISOString(),
      verifiedAt: null
    }

    data.registrations.push(registration)
    await this.writeData(data)
    
    return this.formatRegistration(registration)
  }

  async getRegistrationByToken(token) {
    const data = await this.readData()
    const registration = data.registrations.find(r => r.verificationToken === token)
    
    if (!registration) {
      return null
    }
    
    return this.formatRegistration(registration)
  }

  async verifyRegistration(token) {
    const data = await this.readData()
    const registrationIndex = data.registrations.findIndex(r => r.verificationToken === token)
    
    if (registrationIndex === -1) {
      throw new Error('Invalid verification token')
    }

    const registration = data.registrations[registrationIndex]
    
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

    await this.writeData(data)
    
    return this.formatRegistration(registration)
  }

  async getStats() {
    const data = await this.readData()
    
    const registeredCount = data.registrations.filter(r => r.status === 'registered').length
    const pendingCount = data.registrations.filter(r => r.status === 'pending').length
    const total = data.registrations.length

    // Update fake base count if needed
    const currentFakeBase = this.generateFakeBaseCount()
    if (!data.stats || data.stats.fakeBaseCount < currentFakeBase) {
      data.stats = {
        fakeBaseCount: currentFakeBase,
        lastUpdated: new Date().toISOString()
      }
      await this.writeData(data)
    }
    
    return {
      totalRegistered: registeredCount,
      totalPending: pendingCount,
      total: total,
      fakeBaseCount: data.stats.fakeBaseCount,
      displayCount: data.stats.fakeBaseCount + registeredCount
    }
  }

  /**
   * Get all registrations (for admin purposes)
   * @returns {Promise<Array>} Array of all registrations
   */
  async getAllRegistrations() {
    const data = await this.readData()
    return data.registrations.map(r => this.formatRegistration(r))
  }

  /**
   * Clear all data (for testing)
   */
  async clearData() {
    const defaultData = {
      registrations: [],
      stats: {
        fakeBaseCount: this.generateFakeBaseCount(),
        lastUpdated: new Date().toISOString()
      }
    }
    await this.writeData(defaultData)
  }

  /**
   * Import data from database format
   * @param {Array} registrations - Array of registrations from database
   * @param {Object} stats - Stats object from database
   */
  async importData(registrations, stats = null) {
    const data = await this.readData()
    
    // Convert database format to JSON format
    data.registrations = registrations.map(reg => ({
      id: reg.id?.toString() || this.generateId(),
      email: reg.email,
      status: reg.status,
      createdAt: reg.createdAt instanceof Date ? reg.createdAt.toISOString() : reg.createdAt,
      verificationToken: reg.verificationToken,
      verificationExpiresAt: reg.verificationExpiresAt instanceof Date ? 
        reg.verificationExpiresAt.toISOString() : reg.verificationExpiresAt,
      verifiedAt: reg.verifiedAt instanceof Date ? 
        reg.verifiedAt.toISOString() : reg.verifiedAt
    }))

    if (stats) {
      data.stats = {
        fakeBaseCount: stats.fakeBaseCount || this.generateFakeBaseCount(),
        lastUpdated: new Date().toISOString()
      }
    }

    await this.writeData(data)
    console.log(`Imported ${data.registrations.length} registrations to JSON storage`)
  }
}

export default JsonStorage