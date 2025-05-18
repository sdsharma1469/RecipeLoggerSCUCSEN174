// types/recipe.ts

import { Timestamp } from "firebase-admin/firestore"

export interface Recipe {
  createdAt: Timestamp
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
  author: string[]
  cost: number;
  authorDiff: number;
  userDiff: number;
}

  
