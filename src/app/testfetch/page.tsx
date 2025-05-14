'use client'

import { useEffect, useState } from 'react'
import { fetchRecipeById } from '@/lib/utils/Recipes/RecipeByID'
import type { Recipe } from '@/types/Recipe'

export default function TestFetchRecipePage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const data = await fetchRecipeById('HExI3Hv58LdOKutdYMAN')
        setRecipe(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadRecipe()
  }, [])

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🔥 Testing fetchRecipeById()</h1>

      {loading && <p>Loading...</p>}

      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>
          ❌ {error}
        </p>
      )}

      {recipe && (
        <div style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>{recipe.name}</h2>
          <p><strong>Created At:</strong> {String(recipe.createdAt?.toDate?.() || recipe.createdAt)}</p>
          <p><strong>Ingredients:</strong> {recipe.ingredients.join(', ')}</p>
          <p><strong>Steps:</strong> {recipe.steps.join(' → ')}</p>
        </div>
      )}
    </main>
  )
}
