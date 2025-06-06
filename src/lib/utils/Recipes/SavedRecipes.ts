import { getFirestore, doc, getDoc } from 'firebase/firestore'
import type { Recipe } from '@/types/Recipe'
import { RecipeObjectList } from '@/types/RecipeObjectList'

export async function getSavedRecipesByUserId(userId: string): Promise<RecipeObjectList> {
  const db = getFirestore();
  const userRef = doc(db, 'Users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error(`User with ID "${userId}" not found.`);
  }

  const { savedRecipes = [] } = userSnap.data();
  const recipeList = new RecipeObjectList();

  for (const entry of savedRecipes) {
    const recipeId = entry.recipeId;
    if (!recipeId) continue;

    try {
      const recipeRef = doc(db, 'Recipes', recipeId);
      const recipeSnap = await getDoc(recipeRef);

      if (recipeSnap.exists()) {
        const data = recipeSnap.data();

        const recipe: Recipe = {
          recipeId, // ✅ Add this so the homepage can link correctly
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
            grater: data.tools?.grater ?? false,
          },
          author: data.author ?? '',
          createdAt: data.createdAt ?? '',
          comments: data.comments ?? [],
          rating: data.rating ?? [],
          userDiff: data.userDiff ?? 0,
          authorDiff: data.authorDiff ?? 0,
          cost: data.cost ?? 0,
          price: data.cost ?? 0,
        };

        recipeList.append(recipe);
      }
    } catch (error) {
      console.warn(`⚠️ Skipping saved recipe ${recipeId}:`, error);
    }
  }

  return recipeList;
}
