import { db } from '@/lib/firebase-client'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { UserProfile } from '@/types/User'
import { RecipeList } from '@/types/RecipeList'

export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  const q = query(collection(db, 'Users'), where('username', '==', username))
  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  const data = doc.data()

  return {
    uid: doc.id,
    email: data.email ?? null,
    username: data.username ?? '',
    name: data.name ?? '',
    photoURL: data.photoURL ?? null,
    createdAt: data.createdAt?.toDate?.() ?? null,
    uploadedRecipes: new RecipeList(data.uploadedRecipes),
    savedRecipes: new RecipeList(data.savedRecipes),
  }
}
