// lib/utils/RecipeHandling/fetchRecipeById.ts
// lib/utils/RecipeHandling/fetchRecipeById.ts

import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase-client' // ✅ Correct import path to your initialized app
import type { Recipe } from '@/types/Recipe'

export async function fetchRecipeById(recipeId: string): Promise<Recipe> {
  const recipeRef = doc(db, 'Recipes', recipeId)

  try {
    const docSnap = await getDoc(recipeRef)

    if (!docSnap.exists()) {
      throw new Error(`No recipe found with ID: ${recipeId}`)
    }

    const data = docSnap.data()

    const recipe: Recipe = {
      recipeId: recipeId,
      name: data.name,
      ingredients: data.ingredients,
      steps: data.steps,
      halal: data.halal,
      vegan: data.vegan,
      vegetarian: data.vegetarian,
      lactoseFree: data.lactoseFree,
      rating: data.rating,
      comments: data.comments,
      createdAt: data.createdAt
    }
    
    return recipe
  } catch (error) {
    console.error('❌ Error fetching recipe:', error)
    throw error
  }
}
