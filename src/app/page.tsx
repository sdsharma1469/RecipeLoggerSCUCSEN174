'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup, User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, provider, db } from '@/lib/firebase-client'
import { addUserToFirestore } from '@/lib/utils/UserHandling/addUsers' // Make sure this returns 'created' | 'existing'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuth = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await signInWithPopup(auth, provider)
      const user: User = result.user
      console.log(user.displayName ? '✅ Logged in:' : '✅ Signed up:', user.displayName)

      const status = await addUserToFirestore(user)

      // Always fetch to check if username exists
      const userRef = doc(db, 'Users', user.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        throw new Error('User profile not found in Firestore.')
      }

      const { username } = userSnap.data()
      if (!username) {
        throw new Error('User profile is missing a username.')
      }
      
      router.push(`/home/${username}`)
      

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
