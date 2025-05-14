import { getFirestore, doc, getDoc } from 'firebase/firestore'
import type { Recipe } from '@/types/Recipe'
import { RecipeObjectList } from '@/types/RecipeObjectList'


export async function getSavedRecipesByUserId(userId: string): Promise<RecipeObjectList> {
  const db = getFirestore()
  const userRef = doc(db, 'Users', userId)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    throw new Error(`User with ID "${userId}" not found.`)
  }

  const { SavedRecipes = [] } = userSnap.data()
  const recipeList = new RecipeObjectList()

  for (const recipeId of SavedRecipes) {
    try {
      const recipeRef = doc(db, 'Recipes', recipeId)
      const recipeSnap = await getDoc(recipeRef)

      if (recipeSnap.exists()) {
        const data = recipeSnap.data()
        recipeList.append({
          createdAt: data.createdAt,
          ingredients: data.ingredients,
          steps: data.steps,
          name: data.name,
        })
      }
    } catch (error) {
      console.warn(`⚠️ Skipping saved recipe ${recipeId}:`, error)
    }
  }

  return recipeList
}
