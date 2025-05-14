// lib/utils/RecipeHandling/getCreatedRecipesByUserId.ts

import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { RecipeObjectList } from '@/types/RecipeObjectList'
import { fetchRecipeById } from './RecipeByID'

export async function getCreatedRecipesByUserId(userId: string): Promise<RecipeObjectList> {
  const db = getFirestore()
  const userRef = doc(db, 'Users', userId)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    throw new Error(`User with ID "${userId}" not found.`)
  }

  const { UploadedRecipes = [] } = userSnap.data()
  const recipeList = new RecipeObjectList()

  for (const recipeId of UploadedRecipes) {
    try {
      const recipe = await fetchRecipeById(recipeId) // ✅ wait for the recipe
      recipeList.append(recipe) // ✅ then append the result
    } catch (error) {
      console.warn(`⚠️ Skipping uploaded recipe ${recipeId}:`, error)
    }
  }

  return recipeList
}
