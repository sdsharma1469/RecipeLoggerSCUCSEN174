'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { app } from '@/lib/firebase-client' // ensure you export your `app` here

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsername = async () => {
      const auth = getAuth(app)
      const user = auth.currentUser
      if (!user) return

      const db = getFirestore(app)
      const userRef = doc(db, 'Users', user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const data = userSnap.data()
        setUsername(data.username || null)
      }
    }

    fetchUsername()
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar-logo">GreenKitchen</div>
      <div className="navbar-links">
        {username && (
          <Link href={`/home/${username}`} className="navbar-link">
            Home
          </Link>
        )}
        <Link href="/explore" className="navbar-link">
          Explore
        </Link>
        <Link href="/upload" className="navbar-button">
          Upload Recipe
        </Link>
      </div>
    </nav>
  )
}
