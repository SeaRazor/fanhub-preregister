#!/usr/bin/env node

/**
 * Migration script to move data from existing registrations.json to the new storage system
 * Run this script to import your existing data into the new storage abstraction
 */

import fs from 'fs/promises'
import path from 'path'

async function migrateExistingData() {
  console.log('🔄 Migrating existing data to new storage format...')
  
  const oldDataPath = path.join(process.cwd(), 'data', 'registrations.json')
  const newDataPath = path.join(process.cwd(), 'data', 'registrations.json.backup')
  
  try {
    // Check if old data file exists
    try {
      await fs.access(oldDataPath)
    } catch (error) {
      console.log('ℹ️  No existing data file found. Starting fresh.')
      return
    }

    // Read existing data
    const oldDataContent = await fs.readFile(oldDataPath, 'utf8')
    const oldData = JSON.parse(oldDataContent)
    
    console.log(`📋 Found ${oldData.registrations?.length || 0} existing registrations`)
    
    // Create backup of old data
    await fs.writeFile(newDataPath, oldDataContent)
    console.log(`💾 Created backup at: ${newDataPath}`)
    
    // Convert to new format if needed
    const newData = {
      registrations: oldData.registrations || [],
      stats: {
        fakeBaseCount: oldData.stats?.fakeBaseCount || 2847,
        lastUpdated: new Date().toISOString()
      }
    }
    
    // Ensure all registrations have proper format
    newData.registrations = newData.registrations.map(reg => ({
      id: reg.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email: reg.email,
      status: reg.status || 'pending',
      createdAt: reg.createdAt || new Date().toISOString(),
      verificationToken: reg.verificationToken || null,
      verificationExpiresAt: reg.verificationExpiresAt || null,
      verifiedAt: reg.verifiedAt || null
    }))
    
    // Write updated data
    await fs.writeFile(oldDataPath, JSON.stringify(newData, null, 2))
    
    console.log('✅ Migration completed successfully!')
    console.log(`📊 Migrated ${newData.registrations.length} registrations`)
    console.log(`📈 Base count: ${newData.stats.fakeBaseCount}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

async function migrateFromDatabase() {
  console.log('🔄 Migrating data from PostgreSQL to JSON...')
  
  try {
    // Set environment to use database temporarily
    process.env.STORAGE_TYPE = 'database'
    
    // Import storage modules
    const { default: DatabaseStorage } = await import('./src/lib/storage/database-storage.js')
    const { default: JsonStorage } = await import('./src/lib/storage/json-storage.js')
    
    const dbStorage = new DatabaseStorage()
    const jsonStorage = new JsonStorage()
    
    // Test database connection
    const isConnected = await dbStorage.testConnection()
    if (!isConnected) {
      throw new Error('Cannot connect to database')
    }
    
    console.log('✅ Database connection successful')
    
    // Get all data from database
    const stats = await dbStorage.getStats()
    console.log(`📊 Found ${stats.total} total registrations in database`)
    
    // For database storage, we need to query directly for all registrations
    const { default: db } = await import('./src/lib/database.js')
    const result = await db.query('SELECT * FROM registrations ORDER BY created_at DESC')
    
    const registrations = result.rows.map(reg => ({
      id: reg.id.toString(),
      email: reg.email,
      status: reg.status,
      createdAt: reg.created_at.toISOString(),
      verificationToken: reg.verification_token,
      verificationExpiresAt: reg.verification_expires_at?.toISOString(),
      verifiedAt: reg.verified_at?.toISOString()
    }))
    
    // Import to JSON storage
    await jsonStorage.importData(registrations, { fakeBaseCount: stats.fakeBaseCount })
    
    console.log('✅ Database to JSON migration completed!')
    console.log('ℹ️  You can now deploy to Vercel with STORAGE_TYPE=json')
    
    await db.end()
    
  } catch (error) {
    console.error('❌ Database migration failed:', error)
    console.log('ℹ️  Make sure your database is running and .env is configured')
    process.exit(1)
  }
}

// Main script
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'from-db':
      await migrateFromDatabase()
      break
      
    case 'existing':
    default:
      await migrateExistingData()
      break
  }
}

// Show help if no command
if (process.argv.length < 3) {
  console.log(`
🔄 Data Migration Utility

Usage:
  node migrate-to-json.js existing    # Migrate existing JSON data to new format
  node migrate-to-json.js from-db     # Migrate from PostgreSQL to JSON

Examples:
  # Prepare existing data for new storage system
  node migrate-to-json.js existing
  
  # Move from database to JSON for Vercel deployment
  node migrate-to-json.js from-db
`)
  process.exit(0)
}

main().catch(console.error)