import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { UserProfile } from '@/types/User'  // Or define inline

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const auth = getAuth()
  const db = getFirestore()
  const user = auth.currentUser

  if (!user) {
    console.warn('❌ No authenticated user.')
    return null
  }

  const userRef = doc(db, 'users', user.uid)
  const docSnap = await getDoc(userRef)

  if (!docSnap.exists()) {
    console.warn('⚠️ No user document found in Firestore.')
    return {
      uid: user.uid,
      email: user.email,
      name: user.displayName || '',
      photoURL: user.photoURL,
      createdAt: null,
    }
  }

  const data = docSnap.data()
  return {
    uid: user.uid,
    email: user.email,
    name: data.name || user.displayName || '',
    photoURL: user.photoURL,
    createdAt: data.createdAt?.toDate?.() || null,
  }
}
