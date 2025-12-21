import BaseStorage from './base-storage.js'
import { supabaseAdmin } from '../supabase.js'

export default class SupabaseStorage extends BaseStorage {
  constructor() {
    super()
    this.supabase = supabaseAdmin
  }

  async addRegistration(email, fullName) {
    try {
      const normalizedEmail = this.normalizeEmail(email)
      const trimmedFullName = fullName?.trim()
      
      if (!this.validateEmail(normalizedEmail)) {
        throw new Error('Invalid email format')
      }

      if (!trimmedFullName || trimmedFullName.length < 2) {
        throw new Error('Full name is required and must be at least 2 characters')
      }

      // Check if email already exists
      const existing = await this.isEmailRegistered(normalizedEmail)
      if (existing) {
        throw new Error('Email already registered')
      }

      const verificationToken = this.generateToken()
      const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      const { data, error } = await this.supabase
        .from('registrations')
        .insert([
          { 
            email: normalizedEmail,
            full_name: trimmedFullName,
            created_at: new Date().toISOString(),
            is_verified: false,
            verification_token: verificationToken,
            verification_expires_at: verificationExpiresAt.toISOString()
          }
        ])
        .select()
        .single()

      if (error) throw error

      return this.formatRegistration({
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        status: data.is_verified ? 'verified' : 'pending',
        createdAt: data.created_at,
        verificationToken: data.verification_token,
        verificationExpiresAt: data.verification_expires_at,
        verifiedAt: data.verified_at
      })
    } catch (error) {
      console.error('Error adding registration to Supabase:', error)
      throw error
    }
  }

  async getRegistrationByToken(token) {
    try {
      const { data, error } = await this.supabase
        .from('registrations')
        .select('*')
        .eq('verification_token', token)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }

      if (!data) return null

      return this.formatRegistration({
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        status: data.is_verified ? 'verified' : 'pending',
        createdAt: data.created_at,
        verificationToken: data.verification_token,
        verificationExpiresAt: data.verification_expires_at,
        verifiedAt: data.verified_at
      })
    } catch (error) {
      console.error('Error getting registration by token from Supabase:', error)
      return null
    }
  }

  async verifyRegistration(token) {
    try {
      // First get the registration to check if it exists and is not already verified
      const registration = await this.getRegistrationByToken(token)
      
      if (!registration) {
        throw new Error('Invalid verification token')
      }

      if (registration.status === 'verified') {
        throw new Error('Email already verified')
      }

      // Check if token is expired
      if (registration.verificationExpiresAt && new Date(registration.verificationExpiresAt) < new Date()) {
        throw new Error('Verification token expired')
      }

      // Update the registration
      const { data, error } = await this.supabase
        .from('registrations')
        .update({ 
          is_verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('verification_token', token)
        .select()
        .single()

      if (error) throw error

      return this.formatRegistration({
        id: data.id,
        email: data.email,
        status: 'verified',
        createdAt: data.created_at,
        verificationToken: data.verification_token,
        verificationExpiresAt: data.verification_expires_at,
        verifiedAt: data.verified_at
      })
    } catch (error) {
      console.error('Error verifying registration in Supabase:', error)
      throw error
    }
  }

  async getAllRegistrations() {
    try {
      const { data, error } = await this.supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting registrations from Supabase:', error)
      throw error
    }
  }

  async isEmailRegistered(email) {
    try {
      const { data, error } = await this.supabase
        .from('registrations')
        .select('email')
        .eq('email', this.normalizeEmail(email))
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return !!data
    } catch (error) {
      console.error('Error checking email in Supabase:', error)
      return false
    }
  }

  async getStats() {
    try {
      const { data: statsData, error: statsError } = await this.supabase
        .from('stats')
        .select('total_registrations, verified_registrations, pending_registrations')

      if (statsError) {
        throw new Error(`Stats query failed: ${statsError.message} (${statsError.code})`)
      }

      if (statsData && statsData.length > 0) {
        const stats = statsData[0]
        return {
          totalRegistered: stats.verified_registrations || 0,
          totalPending: stats.pending_registrations || 0,
          total: stats.total_registrations || 0,
          fakeBaseCount: 0,
          displayCount: stats.verified_registrations || 0
        }
      } else {
        throw new Error('No stats records found in database')
      }
    } catch (error) {
      console.error('getStats error:', error.message)
      throw error // Don't hide the error, let it bubble up
    }
  }
}