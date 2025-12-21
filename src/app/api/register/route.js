import { NextResponse } from 'next/server'
import storage from '../../../lib/storage/index.js'
import emailService from '../../../lib/email.js'

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request) {
  try {
    const { email, fullName } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Full name is required and must be at least 2 characters' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const trimmedFullName = fullName.trim()

    try {
      const registration = await storage.addRegistration(normalizedEmail, trimmedFullName)
      
      await emailService.sendVerificationEmail(normalizedEmail, registration.verificationToken, trimmedFullName)

      return NextResponse.json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        id: registration.id
      })

    } catch (storageError) {
      if (storageError.message === 'Email already registered') {
        return NextResponse.json(
          { error: 'This email is already registered for pre-launch access' },
          { status: 409 }
        )
      }
      throw storageError
    }

  } catch (error) {
    console.error('Registration error:', error)
    
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const stats = await storage.getStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Could not fetch registration stats' },
      { status: 500 }
    )
  }
}