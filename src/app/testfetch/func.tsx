'use client'

import React, { useEffect, useState } from 'react'
import { fetchRecipeById } from '@/lib/utils/Recipes/RecipeByID'
import type { Recipe } from '@/types/Recipe'

const TestFetchRecipe: React.FC = () => {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const runFetch = async () => {
      try {
        const data = await fetchRecipeById('HExI3Hv58LdOKutdYMAN')
        setRecipe(data as Recipe)
      } catch (err: any) {
        setError(err.message)
      }
    }

    runFetch()
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Recipe Fetch Test</h1>
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}
      {recipe ? (
        <div>
          <h2>{recipe.name}</h2>
          <p><strong>Ingredients:</strong> {recipe.ingredients.join(', ')}</p>
          <p><strong>Steps:</strong> {recipe.steps.join(' → ')}</p>
          <p><strong>Created At:</strong> {String(recipe.createdAt?.toDate?.() || recipe.createdAt)}</p>
        </div>
      ) : (
        !error && <p>Loading recipe...</p>
      )}
    </div>
  )
}

export default TestFetchRecipe
