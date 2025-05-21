import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import type { Recipe } from '@/types/Recipe';

export async function fetchRecipeById(recipeId: string): Promise<Recipe> {
  const recipeRef = doc(db, 'Recipes', recipeId);

  try {
    const docSnap = await getDoc(recipeRef);

    if (!docSnap.exists()) {
      throw new Error(`No recipe found with ID: ${recipeId}`);
    }

    const data = docSnap.data();

    const recipe: Recipe = {
      recipeId,
      author: data.author,
      createdAt: data.createdAt,
      name: data.name,
      description: data.description ?? '',
      ingredients: data.ingredients,
      steps: data.steps,
      comments: data.comments ?? [],
      tags: {
        halal: data.halal,
        vegan: data.vegan,
        vegetarian: data.vegetarian,
        lactoseFree: data.lactoseFree,
        soy: data.soy,
        peanuts: data.peanuts,
      },
      authorDiff: data.authorDiff,
      userDiff: data.userDiff,
      cost: data.cost,
      rating: data.rating,
    };

    return recipe;
  } catch (error) {
    console.error('❌ Error fetching recipe:', error);
    throw error;
  }
}
