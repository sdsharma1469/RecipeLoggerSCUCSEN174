import { v4 as uuidv4 } from 'uuid'

export function generateRecipe({
  name,
  ingredients,
  steps,
  halal,
  vegan,
  vegetarian,
  lactoseFree,
  rating,
}: {
  name: string
  ingredients: string
  steps: string
  halal: boolean
  vegan: boolean
  vegetarian: boolean
  lactoseFree: boolean
  rating: number
}) {
  return {
    recipeId: uuidv4(),
    name,
    ingredients: ingredients.split(',').map((s) => s.trim()),
    steps: steps.split('\n').map((s) => s.trim()),
    halal,
    vegan,
    vegetarian,
    lactoseFree,
    rating: parseInt(String(rating), 10),
    comments: [],
  }
}
