// lib/utils/Recipes/uploadRecipeClientSide.ts
import { getFirestore, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import type { Recipe } from '@/types/Recipe'


export async function uploadRecipeClientSide(recipe: Recipe): Promise<boolean> {
  const db = getFirestore()
  const auth = getAuth()
  const user = auth.currentUser

  if (!user) {
    console.warn('🚫 User not logged in')
    return false
  }

  try {
    // 1. Add recipe to Recipes collection
    await setDoc(doc(db, 'Recipes', recipe.recipeId), {
      ...recipe,
      ownerId: user.uid,
    })

    // 2. Add recipe ID to user's UploadedRecipes
    await updateDoc(doc(db, 'Users', user.uid), {
      UploadedRecipes: arrayUnion(recipe.recipeId),
    })

    console.log('✅ Recipe uploaded successfully')
    return true
  } catch (error) {
    console.error('❌ Error uploading recipe:', error)
    return false
  }
}
