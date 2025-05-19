// lib/utils/UserHandling/addUsers.ts

import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { db } from '@/lib/firebase-client'

export async function addUserToFirestore(user: User): Promise<'created' | 'existing'> {
  const userRef = doc(db, 'Users', user.uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) return 'existing'

  // Start with displayName as base username
  let baseUsername = user.displayName?.toLowerCase().replace(/\s+/g, '') || 'user'
  let username = baseUsername
  let counter = 1

  // Check if the username already exists in any user
  const usernames = collection(db, 'Users')
  let usernameTaken = true

  while (usernameTaken) {
    const q = query(usernames, where('username', '==', username))
    const snapshot = await getDocs(q)
    if (snapshot.empty) {
      usernameTaken = false
    } else {
      username = `${baseUsername}${counter}`
      counter++
    }
  }

  await setDoc(userRef, {
    email: user.email,
    username,
    createdAt: new Date().toISOString(),
    SavedRecipes: [],
    UploadedRecipes: [],
  })

  return 'created'
}
