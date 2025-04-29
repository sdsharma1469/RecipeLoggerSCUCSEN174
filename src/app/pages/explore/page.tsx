'use client'

import { useEffect, useState } from 'react'

interface Recipe {
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

export default function RecipeListPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch('/api/allRecipes')
        if(res) {console.log("result")}
        const data = await res.json()
        console.log(data)
        setRecipes(data.recipes)
      } catch (err) {
        console.error('Failed to fetch recipes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [])

  if (loading) return <p style={{ padding: '2rem' }}>Loading recipes...</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h1>All Recipes</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginTop: '1.5rem',
        }}
      >
        {recipes.map((recipe) => (
          <div
            key={recipe.recipeId}
            style={{
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '1rem',
              background: '#fafafa',
            }}
          >
            <h2>{recipe.name}</h2>
            <p><strong>Rating:</strong> {recipe.rating}/5</p>
            <p><strong>Tags:</strong> {[
              recipe.halal && 'Halal',
              recipe.vegan && 'Vegan',
              recipe.vegetarian && 'Vegetarian',
              recipe.lactoseFree && 'Lactose-Free'
            ].filter(Boolean).join(', ') || 'None'}</p>
            <p><strong>Ingredients:</strong></p>
            <ul>{recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  )
}
