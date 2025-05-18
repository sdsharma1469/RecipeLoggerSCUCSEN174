// types/recipe.ts
/*
export interface Recipe {
  createdAt : any
  recipeId: string
  name: string
  ingredients: string[]
  steps: string[]
  halal: boolean
  vegan: boolean
  vegetarian: boolean
  lactoseFree: boolean
  rating: number
  comments: string[]
}

*/

// src/types/Recipe.ts
export type Recipe = {
  recipeId: string;
  name: string;
  description?: string;
  ingredients: Array<{
    quantity: number;
    name: string;
  }>;
  steps: string[];
  tags: {
    vegan: boolean;
    vegetarian: boolean;
    lactoseFree: boolean;
    halal: boolean;
    soy: boolean;
    peanuts: boolean;
  };
  creatorRating: number;
  difficulty: number;
};
