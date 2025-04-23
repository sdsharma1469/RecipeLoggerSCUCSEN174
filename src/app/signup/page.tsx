'use client'

import { auth, provider } from '@/lib/firebase-client'
import { signInWithPopup } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuth = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      console.log(user.displayName ? '✅ Logged in:' : '✅ Signed up:', user.displayName)
      router.push('/') // or '/dashboard' if you want a post-login area
    } catch (err: any) {
      console.error('❌ Auth error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: '4rem', textAlign: 'center' }}>
      <h1>Welcome to SCU Recipes 🍳</h1>
      <p>Sign up or log in with your Google account to get started.</p>

      <button
        onClick={handleAuth}
        disabled={loading}
        style={{
          marginTop: '2rem',
          padding: '1rem 2rem',
          backgroundColor: '#4285F4',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Signing you in...' : 'Continue with Google'}
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>
          {error.includes('popup') ? 'Please allow popups!' : error}
        </p>
      )}
    </main>
  )
}
