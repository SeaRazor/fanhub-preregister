'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

function VerifyContent() {
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. No token provided.')
      return
    }

    verifyToken(token)
  }, [token])

  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
        setEmail(data.email)
      } else {
        setStatus('error')
        setMessage(data.error)
      }
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again later.')
    }
  }

  const getStatusIcon = () => {
    if (status === 'loading') return '⏳'
    if (status === 'success') return '🎉'
    if (status === 'error') return '❌'
    return '⚽'
  }

  const getStatusColor = () => {
    if (status === 'success') return 'text-[#00BCD4]'
    if (status === 'error') return 'text-red-400'
    return 'text-[#6BB6FF]'
  }

  const getBackgroundColor = () => {
    if (status === 'success') return 'bg-[#00BCD4]/20 border-[#00BCD4]/30'
    if (status === 'error') return 'bg-red-500/20 border-red-400/30'
    return 'bg-[#6BB6FF]/20 border-[#6BB6FF]/30'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#2C5282] to-[#4A90E2] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.png"
                alt="Scorefluence Logo"
                width={96}
                height={96}
                className="w-20 h-20 md:w-24 md:h-24"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#4A90E2] to-[#6BB6FF] bg-clip-text text-transparent mb-4">
              Scorefluence
            </h1>
            <p className="text-xl text-gray-300">
              Email Verification
            </p>
          </div>

          <div className={`backdrop-blur-sm rounded-lg p-8 border ${getBackgroundColor()}`}>
            <div className="text-6xl mb-6">{getStatusIcon()}</div>
            
            <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${getStatusColor()}`}>
              {status === 'loading' && 'Verifying Your Email...'}
              {status === 'success' && 'Welcome to the Team!'}
              {status === 'error' && 'Verification Failed'}
            </h2>

            <p className="text-lg text-gray-300 mb-6">
              {status === 'loading' && 'Please wait while we verify your email address.'}
              {message}
            </p>

            {status === 'success' && (
              <div className="space-y-4">
                {email && (
                  <p className="text-sm text-gray-400">
                    Verified email: <span className="text-[#00BCD4]">{email}</span>
                  </p>
                )}
                
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-[#4A90E2]/10">
                  <h3 className="text-lg font-semibold mb-2 text-[#00BCD4]">What's Next?</h3>
                  <ul className="text-left text-sm text-gray-300 space-y-1">
                    <li>• You'll receive launch updates via email</li>
                    <li>• Early access notifications before July 20, 2026</li>
                    <li>• Exclusive rewards and points when we launch</li>
                    <li>• First access to premium fan features</li>
                  </ul>
                </div>

                <a 
                  href="/"
                  className="inline-block bg-gradient-to-r from-[#4A90E2] to-[#6BB6FF] hover:from-[#2C5282] hover:to-[#4A90E2] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Back to Home
                </a>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-red-400/10">
                  <h3 className="text-lg font-semibold mb-2 text-red-400">Need Help?</h3>
                  <p className="text-sm text-gray-300">
                    If you continue having issues, try registering again with a fresh email verification link.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a 
                    href="/"
                    className="inline-block bg-gradient-to-r from-[#4A90E2] to-[#6BB6FF] hover:from-[#2C5282] hover:to-[#4A90E2] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    Try Again
                  </a>
                  <a 
                    href="/"
                    className="inline-block bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg border border-white/20 transition-all duration-300"
                  >
                    Back to Home
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-gray-400">
              Launch Date: July 20, 2026 | 
              <span className="mx-2">Follow us:</span>
              <a href="#" className="text-[#4A90E2] hover:text-[#6BB6FF] transition-colors">Twitter</a>
              <span className="mx-2">•</span>
              <a href="#" className="text-[#4A90E2] hover:text-[#6BB6FF] transition-colors">Instagram</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#2C5282] to-[#4A90E2] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.png"
                alt="Scorefluence Logo"
                width={96}
                height={96}
                className="w-20 h-20 md:w-24 md:h-24"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#4A90E2] to-[#6BB6FF] bg-clip-text text-transparent mb-4">
              Scorefluence
            </h1>
            <p className="text-xl text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyContent />
    </Suspense>
  )
}