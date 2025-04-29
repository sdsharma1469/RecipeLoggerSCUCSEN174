'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center'
    }}>
      <h1>🍳 Welcome to SCU Recipes!</h1>
      <p style={{ marginBottom: '2rem' }}>Share your favorite dish with the world.</p>
      <Link href="/pages/upload">
        <button style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#4CAF50',
          color: '#fff',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}>
          Upload a Recipe
        </button>
      </Link>
    </main>
  )
}
