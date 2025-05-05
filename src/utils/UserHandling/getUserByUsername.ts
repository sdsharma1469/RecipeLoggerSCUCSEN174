// src/utils/UserHandling/getUserByUsername.ts
import { db } from '@/lib/firebase-client'
import { collection, query, where, getDocs } from 'firebase/firestore'

export async function getUserProfileByUsername(username: string) {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('username', '==', username))
  const snapshot = await getDocs(q)


  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  return { uid: doc.id, ...doc.data() }
}
