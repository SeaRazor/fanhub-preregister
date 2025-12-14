import { Resend } from 'resend'

class EmailService {
  constructor() {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not found in environment variables')
      return
    }
    
    this.resend = new Resend(process.env.RESEND_API_KEY)
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@scorefluence.com'
  }

  async sendVerificationEmail(email, token) {
    if (!this.resend) {
      console.warn('⚠️ Email service not configured - skipping email send in development')
      console.log(`📧 Would send verification email to: ${email}`)
      console.log(`🔗 Verification URL: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify?token=${token}`)
      return { id: 'dev-mode-skip', message: 'Email sending skipped in development' }
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify?token=${token}`
    
    try {
      const data = await this.resend.emails.send({
        from: `Scorefluence <${this.fromEmail}>`,
        to: [email],
        subject: '⚽ Verify your Scorefluence pre-registration',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1A1A2E 0%, #2C5282 50%, #4A90E2 100%); color: white; border-radius: 12px; overflow: hidden;">
            <div style="padding: 40px 30px; text-align: center;">
              <div style="background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 30px; margin-bottom: 30px;">
                <h1 style="margin: 0 0 20px 0; color: #6BB6FF; font-size: 28px;">Welcome to Scorefluence!</h1>
                <p style="margin: 0 0 20px 0; font-size: 18px; color: #E5E5E5;">You're one step away from joining the ultimate sports fan experience.</p>
                
                <div style="background: rgba(0, 188, 212, 0.2); border: 1px solid rgba(0, 188, 212, 0.3); border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 16px; color: #00BCD4;">🏆 Early Access Benefits:</p>
                  <ul style="text-align: left; margin: 10px 0 0 20px; color: #E5E5E5; font-size: 14px;">
                    <li>First access to live matches and scores</li>
                    <li>Exclusive launch rewards and points</li>
                    <li>Premium fan community features</li>
                    <li>Behind-the-scenes content from your favorite teams</li>
                  </ul>
                </div>
                
                <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #4A90E2 0%, #6BB6FF 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0;">
                  Verify Your Email
                </a>
                
                <p style="margin: 20px 0 0 0; font-size: 14px; color: #B0B0B0;">
                  This link will expire in 24 hours for security reasons.
                </p>
              </div>
              
              <div style="text-align: center; font-size: 12px; color: #888;">
                <p>If you didn't sign up for Scorefluence, you can safely ignore this email.</p>
                <p style="margin: 10px 0 0 0;">Launch Date: July 20, 2026 🚀</p>
              </div>
            </div>
          </div>
        `,
        text: `
Welcome to Scorefluence!

You're one step away from joining the ultimate sports fan experience.

Please verify your email by clicking this link:
${verificationUrl}

Early Access Benefits:
- First access to live matches and scores  
- Exclusive launch rewards and points
- Premium fan community features
- Behind-the-scenes content from your favorite teams

This link will expire in 24 hours for security reasons.

Launch Date: July 20, 2026

If you didn't sign up for Scorefluence, you can safely ignore this email.
        `
      })

      console.log('✅ Verification email sent successfully:', {
        to: email,
        messageId: data.id,
        verificationUrl: verificationUrl
      })

      return data

    } catch (error) {
      console.error('❌ Failed to send verification email:', error)
      throw new Error(`Email sending failed: ${error.message}`)
    }
  }
}

const emailService = new EmailService()
export default emailService