// lib/utils/UserHandling/addUsers.ts

import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { User } from 'firebase/auth'

export async function addUserToFirestore(user: User): Promise<'created' | 'existing'> {
  console.log('📥 Checking/Adding user in Firestore:', user.email)
  const db = getFirestore()
  const userRef = doc(db, 'Users', user.uid)
  const docSnap = await getDoc(userRef)

  if (docSnap.exists()) {
    return 'existing'
  }

  const username = user.displayName?.toLowerCase().replace(/\s+/g, '') || user.email?.split('@')[0] || ''

  await setDoc(userRef, {
    email: user.email,
    username,
    createdAt: serverTimestamp(),
    SavedRecipes: [],
    UploadedRecipes: [],
  })

  console.log('✅ New user profile created')
  return 'created'
}
