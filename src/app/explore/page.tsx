'use client'

import React, { useEffect, useState } from 'react'
import './explore.css'

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

const ExplorePage: React.FC = () => {
  const filters = ['Vegetarian', 'Halal', 'Vegan', 'Lactose-Free']
  const [filterStates, setFilterStates] = useState<Record<string, string>>({})
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  // Toggle filter state: none -> whitelisted -> blacklisted
  const toggleFilter = (name: string) => {
    setFilterStates(prev => {
      const current = prev[name] || 'none'
      const next =
        current === 'none'
          ? 'whitelisted'
          : current === 'whitelisted'
          ? 'blacklisted'
          : 'none'
      return { ...prev, [name]: next }
    })
  }

  // Fetch recipes from backend
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch('/api/allRecipes')
        const data = await res.json()
        setRecipes(data.recipes)
      } catch (err) {
        console.error('Failed to fetch recipes:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecipes()
  }, [])

  // Filter logic (optional: expand based on whitelist/blacklist)
  const filteredRecipes = recipes.filter((recipe) => {
    return filters.every((filter) => {
      const state = filterStates[filter] || 'none'
      if (state === 'whitelisted') {
        if (filter === 'Vegetarian') return recipe.vegetarian
        if (filter === 'Halal') return recipe.halal
        if (filter === 'Vegan') return recipe.vegan
        if (filter === 'Lactose-Free') return recipe.lactoseFree
      }
      if (state === 'blacklisted') {
        if (filter === 'Vegetarian') return !recipe.vegetarian
        if (filter === 'Halal') return !recipe.halal
        if (filter === 'Vegan') return !recipe.vegan
        if (filter === 'Lactose-Free') return !recipe.lactoseFree
      }
      return true
    })
  })

  return (
    <div>
      <div className="navbar">
        <div>Explore Recipes</div>
        <div>
          <a href="#">Home</a> | <a href="#">My Recipes</a> | <a href="#">Profile</a>
        </div>
      </div>

      <div className="container">
        <div className="main-content">
          <div className="search-filter-bar">
            <input type="text" placeholder="Search recipes..." />
            <input type="text" placeholder="Filter by tags..." />
          </div>

          {loading ? (
            <p style={{ padding: '2rem' }}>Loading recipes...</p>
          ) : (
            filteredRecipes.map((recipe) => (
              <div className="recipe-block" key={recipe.recipeId}>
                <div className="recipe-header">{recipe.name}</div>
                <img
                  src="https://via.placeholder.com/600x200"
                  alt={recipe.name}
                  className="recipe-image"
                />
                <div className="recipe-description">
                  {recipe.steps[0]?.slice(0, 100) || 'No description available...'}
                </div>
                <div className="recipe-tags">
                  {recipe.vegetarian && <span>Vegetarian</span>}
                  {recipe.vegan && <span>Vegan</span>}
                  {recipe.halal && <span>Halal</span>}
                  {recipe.lactoseFree && <span>Lactose-Free</span>}
                </div>
                <div className="recipe-footer">
                  <div className="ratings">
                    <div>Rating: {recipe.rating}/5</div>
                    <div>Ingredients: {recipe.ingredients.length}</div>
                  </div>
                  <div className="price">Free</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="filters-column">
          <div className="filter-title">Filters</div>
          <input
            type="text"
            placeholder="Search filters..."
            style={{ width: '100%', padding: '0.5em', marginBottom: '1em' }}
          />
          <div className="filter-list">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={filterStates[filter] || ''}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExplorePage
