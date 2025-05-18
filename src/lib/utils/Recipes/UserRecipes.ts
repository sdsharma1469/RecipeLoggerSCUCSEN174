import { getFirestore, doc, getDoc } from 'firebase/firestore'
import type { Recipe } from '@/types/Recipe'
import { RecipeObjectList } from '@/types/RecipeObjectList'

export async function fetchAllRecipesByUserId(userId: string): Promise<RecipeObjectList> {
  const db = getFirestore()
  const userRef = doc(db, 'Users', userId)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    throw new Error(`User with ID "${userId}" not found.`)
  }

  const { SavedRecipes = [], UploadedRecipes = [] } = userSnap.data()
  const allRecipeIds = Array.from(new Set([...SavedRecipes, ...UploadedRecipes]))

  const recipeList = new RecipeObjectList()

  for (const recipeId of allRecipeIds) {
    try {
      const recipeRef = doc(db, 'Recipes', recipeId)
      const recipeSnap = await getDoc(recipeRef)

      if (recipeSnap.exists()) {
        const data = recipeSnap.data()

        const recipe: Recipe = {
          recipeId,
          name: data.name ?? '',
          description: data.description ?? '',
          ingredients: data.ingredients ?? [],
          steps: data.steps ?? [],
          tags: {
            vegan: data.tags?.vegan ?? false,
            vegetarian: data.tags?.vegetarian ?? false,
            lactoseFree: data.tags?.lactoseFree ?? false,
            halal: data.tags?.halal ?? false,
            soy: data.tags?.soy ?? false,
            peanuts: data.tags?.peanuts ?? false,
          },
          creatorRating: data.creatorRating ?? 0,
          difficulty: data.difficulty ?? 0,
        }

        recipeList.append(recipe)
      }
    } catch (error) {
      console.warn(`⚠️ Skipping recipe ${recipeId}:`, error)
    }
  }

  return recipeList
}
