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
        halal: data.tags.halal,
        vegan: data.tags.vegan,
        vegetarian: data.tags.vegetarian,
        lactoseFree: data.tags.lactoseFree,
        soy: data.tags.soy,
        peanuts: data.tags.peanuts,
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
