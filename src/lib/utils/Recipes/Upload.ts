// lib/utils/Recipes/uploadRecipeClientSide.ts
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase-client'
import type { Recipe } from '@/types/Recipe'

export async function uploadRecipeClientSide(recipe: Recipe): Promise<boolean> {
  const user = auth.currentUser

  if (!user) {
    console.warn('🚫 User not logged in')
    return false
  }

  console.log(`📦 Uploading recipe for user: ${user.uid}`)

  try {
    await setDoc(doc(db, 'Recipes', recipe.recipeId), {
      ...recipe,
      ownerId: user.uid,
    })

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
