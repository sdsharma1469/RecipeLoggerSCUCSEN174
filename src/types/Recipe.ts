// types/recipe.ts

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
  author: string[]
  cost: number;
}

  
