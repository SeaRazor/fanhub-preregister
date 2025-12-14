'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

function getFakePreRegisterCount() {
  const baseCount = 2847
  const startDate = new Date('2024-12-01')
  const currentDate = new Date()
  const daysDiff = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24))
  const dailyIncrease = Math.floor(Math.random() * 50) + 25
  return baseCount + (daysDiff * dailyIncrease)
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/register')
      if (response.ok) {
        const stats = await response.json()
        // Use the consistent display count from the API
        setUserCount(stats.displayCount || stats.fakeBaseCount + stats.totalRegistered)
      } else {
        // Fallback to fake count if API fails
        setUserCount(getFakePreRegisterCount())
      }
    } catch (error) {
      // Fallback to fake count if API fails
      setUserCount(getFakePreRegisterCount())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsRegistered(true)
        setEmail('')
        // Reload stats to get updated count
        loadStats()
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#2C5282] to-[#4A90E2] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.png"
                alt="Scorefluence Logo"
                width={120}
                height={120}
                className="w-24 h-24 md:w-32 md:h-32"
              />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#4A90E2] to-[#6BB6FF] bg-clip-text text-transparent mb-4">
              Scorefluence
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-2">
              The Ultimate Sports Fan Experience
            </p>
            <p className="text-lg text-gray-400">
              Coming July 20, 2026
            </p>
          </div>

          <div className="mb-12">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 border border-[#4A90E2]/20">
              <div className="text-4xl md:text-5xl font-bold text-[#00BCD4] mb-2">
                {userCount.toLocaleString()}
              </div>
              <div className="text-lg text-gray-300">
                Fans Already Pre-Registered
              </div>
            </div>
          </div>

          {!isRegistered ? (
            <div className="max-w-md mx-auto mb-16">
              <h3 className="text-2xl font-bold mb-6">
                Be the First to Know
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 rounded-lg bg-white/10 backdrop-blur-sm border border-[#4A90E2]/40 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-[#6BB6FF] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {error && (
                  <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#4A90E2] to-[#6BB6FF] hover:from-[#2C5282] hover:to-[#4A90E2] text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#00BCD4] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? 'Sending...' : 'Pre-Register Now'}
                </button>
              </form>
              <p className="text-sm text-gray-400 mt-4">
                Get early access, exclusive rewards, and be first in line for launch
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto mb-16">
              <div className="bg-[#00BCD4]/20 backdrop-blur-sm border border-[#00BCD4]/30 rounded-lg p-8">
                <div className="text-4xl mb-4">📧</div>
                <h3 className="text-2xl font-bold mb-4 text-[#00BCD4]">
                  Check Your Email!
                </h3>
                <p className="text-gray-300 mb-4">
                  We've sent you a verification email. Please click the link in the email to complete your 
                  registration and secure your spot for early access.
                </p>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-[#4A90E2]/10 mb-4">
                  <p className="text-sm text-gray-300">
                    <strong className="text-[#00BCD4]">Important:</strong> The verification link expires in 24 hours for security.
                  </p>
                </div>
                <p className="text-sm text-gray-400">
                  Didn't receive the email? Check your spam folder or try registering again.
                </p>
              </div>
            </div>
          )}

          <div className="max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Where Sports Passion Meets Community
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              Join the revolutionary platform that brings sports fans closer to their teams, 
              players, and fellow supporters. Experience live matches, earn rewards, and 
              connect with a global community of passionate fans.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-[#4A90E2]/10">
                <h3 className="text-xl font-semibold mb-3 text-[#00BCD4]">Live Matches & Scores</h3>
                <p className="text-gray-400">
                  Follow Premier League, NBA, NFL, and more with real-time scores and live commentary
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-[#4A90E2]/10">
                <h3 className="text-xl font-semibold mb-3 text-[#6BB6FF]">Earn Rewards</h3>
                <p className="text-gray-400">
                  Predict match outcomes, complete challenges, and earn points for exclusive rewards
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-[#4A90E2]/10">
                <h3 className="text-xl font-semibold mb-3 text-[#E91E63]">Fan Communities</h3>
                <p className="text-gray-400">
                  Connect with supporters worldwide, share match moments, and climb the leaderboards
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-gray-400">
              Follow us for updates: 
              <span className="mx-2">•</span>
              <a href="#" className="text-[#4A90E2] hover:text-[#6BB6FF] transition-colors">Twitter</a>
              <span className="mx-2">•</span>
              <a href="#" className="text-[#4A90E2] hover:text-[#6BB6FF] transition-colors">Instagram</a>
              <span className="mx-2">•</span>
              <a href="#" className="text-[#4A90E2] hover:text-[#6BB6FF] transition-colors">Discord</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}