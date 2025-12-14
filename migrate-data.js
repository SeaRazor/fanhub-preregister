const fs = require('fs/promises')
const path = require('path')
const db = require('./src/lib/database.js')

async function migrateData() {
  try {
    const dataFile = path.join(__dirname, 'data', 'registrations.json')
    const data = JSON.parse(await fs.readFile(dataFile, 'utf8'))
    
    console.log(`Found ${data.registrations.length} registrations to migrate`)
    
    for (const reg of data.registrations) {
      const insertQuery = `
        INSERT INTO registrations (
          email, 
          status, 
          created_at, 
          verification_token, 
          verification_expires_at,
          verified_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
      `
      
      await db.query(insertQuery, [
        reg.email,
        reg.status,
        new Date(reg.createdAt),
        reg.verificationToken,
        reg.verificationExpiresAt ? new Date(reg.verificationExpiresAt) : null,
        reg.verifiedAt ? new Date(reg.verifiedAt) : null
      ])
    }
    
    // Update stats if exists
    if (data.stats && data.stats.fakeBaseCount) {
      await db.query(
        'UPDATE stats SET fake_base_count = $1 WHERE id = 1',
        [data.stats.fakeBaseCount]
      )
    }
    
    console.log('Data migration completed successfully!')
    
    // Verify migration
    const result = await db.query('SELECT COUNT(*) FROM registrations')
    console.log(`Total registrations in database: ${result.rows[0].count}`)
    
    await db.end()
  } catch (error) {
    console.error('Migration error:', error)
    process.exit(1)
  }
}

migrateData()