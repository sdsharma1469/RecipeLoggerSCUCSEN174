// getUserByUsername.ts
import { db } from '@/lib/firebase-client'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { UserProfile } from '@/types/User'

export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  const usersRef = collection(db, 'Users')
  const q = query(usersRef, where('username', '==', name))
  const snapshot = await getDocs(q)
  
  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  return {
    uid: doc.id,
    ...(doc.data() as Omit<UserProfile, 'uid'>), // cast to match UserProfile
  }
}
