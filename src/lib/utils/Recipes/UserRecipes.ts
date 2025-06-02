import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
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

  const recipeList = new RecipeObjectList()
  const validSaved: string[] = []
  const validUploaded: string[] = []

  // Track which IDs came from which list
  const savedSet = new Set(SavedRecipes)
  const uploadedSet = new Set(UploadedRecipes)
  const allIds = Array.from(new Set([...SavedRecipes, ...UploadedRecipes]))

  for (const recipeId of allIds) {
    try {
      const recipeRef = doc(db, 'Recipes', recipeId)
      const recipeSnap = await getDoc(recipeRef)

      if (recipeSnap.exists()) {
        const data = recipeSnap.data()

        const recipe: Recipe = {
          recipeId,
          name: data.name ?? '',
          author: data.author ?? '',
          createdAt: data.createdAt ?? new Date(),
          description: data.description ?? '',
          ingredients: data.ingredients ?? [],
          steps: data.steps ?? [],
          comments: data.comments ?? [],
          tags: {
            vegan: data.tags?.vegan ?? false,
            vegetarian: data.tags?.vegetarian ?? false,
            lactoseFree: data.tags?.lactoseFree ?? false,
            halal: data.tags?.halal ?? false,
            soy: data.tags?.soy ?? false,
            peanuts: data.tags?.peanuts ?? false,
          },
          tools: {
            knife: data.tools?.knife ?? false,
            oven: data.tools?.oven ?? false,
            airFryer: data.tools?.airFryer ?? false,
            stainlessSteelPan: data.tools?.stainlessSteelPan ?? false,
            kettle: data.tools?.kettle ?? false,
            wok: data.tools?.wok ?? false,
            smallPot: data.tools?.smallPot ?? false,
            mediumPot: data.tools?.mediumPot ?? false,
            largePot: data.tools?.largePot ?? false,
          },
          rating: data.rating ?? [],
          userDiff: data.userDiff ?? 0,
          authorDiff: data.authorDiff ?? 0,
          cost: data.cost ?? 0,
        }

        recipeList.append(recipe)

        if (savedSet.has(recipeId)) validSaved.push(recipeId)
        if (uploadedSet.has(recipeId)) validUploaded.push(recipeId)
      } else {
        console.warn(`❌ Recipe not found: ${recipeId}. Will remove from user record.`)
      }
    } catch (error) {
      console.warn(`⚠️ Skipping recipe ${recipeId} due to error:`, error)
    }
  }

  // Update Firestore if cleanup is needed
  if (
    validSaved.length !== SavedRecipes.length ||
    validUploaded.length !== UploadedRecipes.length
  ) {
    await updateDoc(userRef, {
      SavedRecipes: validSaved,
      UploadedRecipes: validUploaded
    })
    console.info(`Cleaned up invalid recipe IDs from user document.`)
  }

  return recipeList
}
