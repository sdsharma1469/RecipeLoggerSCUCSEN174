import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { UserProfile } from '@/types/User'
import { RecipeList } from '@/types/RecipeList' // ✅ Your wrapper class

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const auth = getAuth()
  const db = getFirestore()
  const user = auth.currentUser

  if (!user) {
    console.warn('❌ No authenticated user.')
    return null
  }

  const userRef = doc(db, 'Users', user.uid)
  const docSnap = await getDoc(userRef)

  if (!docSnap.exists()) {
    console.warn('⚠️ No user document found in Firestore.')
    return {
      uid: user.uid,
      email: user.email ?? null,
      username: user.displayName ?? 'anonymous',
      name: user.displayName ?? '',
      photoURL: user.photoURL ?? null,
      createdAt: null,
      savedRecipes: new RecipeList(),
      uploadedRecipes: new RecipeList(),
    }
  }

  const data = docSnap.data()

  return {
    uid: user.uid,
    email: user.email ?? null,
    username: data.username ?? user.displayName ?? 'anonymous',
    name: data.name ?? user.displayName ?? '',
    photoURL: user.photoURL ?? null,
    createdAt: data.createdAt?.toDate?.() ?? null,
    uploadedRecipes: new RecipeList(data.uploadedRecipes),
    savedRecipes: new RecipeList(data.savedRecipes),
  }
}
