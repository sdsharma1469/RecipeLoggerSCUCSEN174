// lib/utils/UserHandling/getUserIdByUsername.ts

import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase-client'

export async function getUserIdByUsername(username: string): Promise<string> {
  const usersRef = collection(db, 'Users')
  const q = query(usersRef, where('username', '==', username))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    throw new Error(`No user found with username: ${username}`)
  }

  return querySnapshot.docs[0].id // the UID
}
