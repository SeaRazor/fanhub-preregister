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
  const [fullName, setFullName] = useState('')
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
        body: JSON.stringify({ email, fullName }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsRegistered(true)
        setEmail('')
        setFullName('')
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
    <div className="min-h-screen bg-gradient-to-b from-[#2d1b69] via-[#1e3a8a] to-[#1e40af] text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/logo-transparent.png"
                alt="Scorefluence Logo"
                width={60}
                height={60}
                className="w-12 h-12 mr-3"
              />
              <div className="text-left">
                <h1 className="text-2xl font-bold text-white">
                  SCOREFLUENCE™
                </h1>
                <p className="text-sm text-gray-300">
                  AI-powered fan engagement
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              Be the first to join Scorefluence
            </h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Pre-register ahead of our launch and get early access to exclusive rewards.
            </p>
          </div>

          {!isRegistered ? (
            <div className="mb-8">
              <div className="bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95] backdrop-blur-sm rounded-2xl p-6 border border-[#6366f1]/40">
                <div className="text-lg text-white font-medium mb-4">
                  Current registered members:
                </div>
                <div className="bg-gradient-to-r from-[#4338ca] to-[#7c3aed] rounded-xl p-4 inline-block mb-6">
                  <div className="text-4xl font-bold text-white">
                    {userCount.toLocaleString()}
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Full Name:</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg bg-[#0a0a1a] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-[#6366f1] disabled:opacity-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg bg-[#0a0a1a] border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-[#6366f1] disabled:opacity-50"
                    />
                  </div>
                  
                  {error && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !email || !fullName}
                    className="w-full bg-gradient-to-r from-[#4338ca] to-[#7c3aed] hover:from-[#3730a3] hover:to-[#6b21a8] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-[#4338ca]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? 'Sending...' : 'Pre-register now'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="bg-[#6366f1]/20 backdrop-blur-sm border border-[#6366f1]/30 rounded-2xl p-6">
                <div className="text-3xl mb-3">✓</div>
                <h3 className="text-xl font-bold mb-3 text-white">
                  Check Your Email!
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  We've sent you a verification email. Please click the link to complete your registration.
                </p>
                <p className="text-xs text-gray-400">
                  Didn't receive the email? Check your spam folder.
                </p>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-white/20 text-center">
            <p className="text-gray-400 text-sm mb-2">
              1 Mann Island, 3rd Floor, Liverpool, L3 1BP
            </p>
            <p className="text-gray-400 text-sm">
              play@scorefluence.ai
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}