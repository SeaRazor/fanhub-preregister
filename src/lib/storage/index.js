import JsonStorage from './json-storage.js'
import DatabaseStorage from './database-storage.js'

/**
 * Storage factory that automatically selects the appropriate storage implementation
 * based on environment configuration
 */
class StorageFactory {
  
  constructor() {
    this._storage = null
    this._storageType = null
  }

  /**
   * Determine which storage type to use based on environment
   * @returns {string} 'json' or 'database'
   */
  detectStorageType() {
    // Check explicit environment variable first
    if (process.env.STORAGE_TYPE) {
      return process.env.STORAGE_TYPE.toLowerCase()
    }

    // Auto-detect based on available configuration
    const hasDbConfig = process.env.DB_HOST && 
                       process.env.DB_NAME && 
                       process.env.DB_USER && 
                       process.env.DB_PASSWORD

    // In Vercel environment or when DB config is missing, use JSON
    if (process.env.VERCEL || !hasDbConfig) {
      return 'json'
    }

    // Default to database if configuration is available
    return 'database'
  }

  /**
   * Get the storage instance (singleton pattern)
   * @returns {BaseStorage} Storage implementation instance
   */
  getStorage() {
    const currentStorageType = this.detectStorageType()

    // Return existing instance if storage type hasn't changed
    if (this._storage && this._storageType === currentStorageType) {
      return this._storage
    }

    // Create new storage instance
    console.log(`Initializing ${currentStorageType} storage...`)

    try {
      switch (currentStorageType) {
        case 'json':
          this._storage = new JsonStorage()
          this._storageType = 'json'
          break
          
        case 'database':
          this._storage = new DatabaseStorage()
          this._storageType = 'database'
          break
          
        default:
          console.warn(`Unknown storage type: ${currentStorageType}, falling back to JSON`)
          this._storage = new JsonStorage()
          this._storageType = 'json'
      }

      return this._storage
      
    } catch (error) {
      console.error(`Failed to initialize ${currentStorageType} storage:`, error)
      
      // Fallback to JSON storage if database fails
      if (currentStorageType === 'database') {
        console.log('Falling back to JSON storage...')
        this._storage = new JsonStorage()
        this._storageType = 'json'
        return this._storage
      }
      
      throw error
    }
  }

  /**
   * Get current storage type
   * @returns {string} Current storage type
   */
  getStorageType() {
    return this._storageType || this.detectStorageType()
  }

  /**
   * Force refresh of storage instance (useful for testing or config changes)
   */
  refresh() {
    this._storage = null
    this._storageType = null
    return this.getStorage()
  }

  /**
   * Test storage connection/availability
   * @returns {Promise<boolean>} True if storage is working
   */
  async testStorage() {
    try {
      const storage = this.getStorage()
      
      if (this._storageType === 'database' && typeof storage.testConnection === 'function') {
        return await storage.testConnection()
      } else if (this._storageType === 'json') {
        // Test JSON storage by attempting to read stats
        await storage.getStats()
        return true
      }
      
      return true
    } catch (error) {
      console.error('Storage test failed:', error)
      return false
    }
  }
}

// Create singleton factory instance
const storageFactory = new StorageFactory()

// Export the storage instance directly for convenience
const storage = storageFactory.getStorage()

// Also export factory for advanced usage
export { storageFactory }
export default storage

/**
 * Utility functions for storage management
 */
export const StorageUtils = {
  /**
   * Get current storage type
   */
  getType: () => storageFactory.getStorageType(),
  
  /**
   * Test current storage
   */
  test: () => storageFactory.testStorage(),
  
  /**
   * Refresh storage instance
   */
  refresh: () => storageFactory.refresh(),
  
  /**
   * Get storage configuration info
   */
  getConfig: () => ({
    type: storageFactory.getStorageType(),
    isVercel: !!process.env.VERCEL,
    hasDbConfig: !!(process.env.DB_HOST && process.env.DB_NAME),
    explicitType: process.env.STORAGE_TYPE
  })
}