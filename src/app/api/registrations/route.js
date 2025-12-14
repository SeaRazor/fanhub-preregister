import { NextResponse } from 'next/server'
import storage, { StorageUtils } from '../../../lib/storage/index.js'

export async function GET() {
  try {
    // Get stats first
    const stats = await storage.getStats()
    
    // Try to get all registrations if storage supports it
    let registrations = []
    
    if (typeof storage.getAllRegistrations === 'function') {
      // JSON storage has this method
      registrations = await storage.getAllRegistrations()
    } else if (StorageUtils.getType() === 'database') {
      // For database storage, we need to query directly
      const { default: db } = await import('../../../lib/database.js')
      const registrationsQuery = 'SELECT * FROM registrations ORDER BY created_at DESC'
      const registrationsResult = await db.query(registrationsQuery)
      
      registrations = registrationsResult.rows.map(reg => ({
        id: reg.id.toString(),
        email: reg.email,
        status: reg.status,
        createdAt: reg.created_at.toISOString(),
        verificationToken: reg.verification_token,
        verificationExpiresAt: reg.verification_expires_at?.toISOString(),
        verifiedAt: reg.verified_at?.toISOString()
      }))
    }
    
    // Add verification links for development
    const registrationsWithLinks = registrations.map(reg => ({
      ...reg,
      verificationLink: reg.verificationToken ? 
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify?token=${reg.verificationToken}` : 
        null
    }))

    return NextResponse.json({
      registrations: registrationsWithLinks,
      stats: stats,
      storageType: StorageUtils.getType()
    })
  } catch (error) {
    console.error('Registrations fetch error:', error)
    return NextResponse.json(
      { error: 'Could not fetch registrations' },
      { status: 500 }
    )
  }
}