import { NextResponse } from 'next/server'
import storage from '../../../lib/storage/index.js'

export async function POST(request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    try {
      const registration = await storage.verifyRegistration(token)
      
      return NextResponse.json({
        success: true,
        message: 'Email verified successfully! Welcome to Scorefluence.',
        email: registration.email,
        verifiedAt: registration.verifiedAt
      })

    } catch (storageError) {
      if (storageError.message === 'Invalid verification token') {
        return NextResponse.json(
          { error: 'Invalid verification link. Please try registering again.' },
          { status: 400 }
        )
      }
      
      if (storageError.message === 'Verification token has expired') {
        return NextResponse.json(
          { error: 'Verification link has expired. Please register again to receive a new link.' },
          { status: 400 }
        )
      }

      if (storageError.message === 'Email already verified') {
        return NextResponse.json(
          { error: 'This email has already been verified.' },
          { status: 400 }
        )
      }

      throw storageError
    }

  } catch (error) {
    console.error('Verification error:', error)
    
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const registration = await storage.getRegistrationByToken(token)
    
    if (!registration) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    if (new Date() > new Date(registration.verificationExpiresAt)) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    if (registration.status === 'registered') {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      email: registration.email,
      expiresAt: registration.verificationExpiresAt
    })

  } catch (error) {
    console.error('Token check error:', error)
    
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}