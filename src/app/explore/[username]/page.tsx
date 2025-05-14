'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import './explore.css'
import type { Recipe } from '@/types/Recipe'


const ExplorePage: React.FC = () => {
  const { username } = useParams();
  const filters = ['Vegetarian', 'Halal', 'Vegan', 'Lactose-Free']
  const [filterStates, setFilterStates] = useState<Record<string, string>>({})
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSearchQuery, setFilterSearchQuery] = useState('')
  const [filterSearchInput, setFilterSearchInput] = useState('')

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
        const res = await fetch('/api/GetAllRecipes')
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

  // Ensures that the visible filters logic ONLY applies when filterSearchQuery is set first!
  const visibleFilters = filterSearchQuery ? filters.filter(filter => filter.toLowerCase().includes(filterSearchQuery.toLowerCase())) : filters

  // Filter logic for whitelist, blacklist, and search
  const filteredRecipes = recipes.filter((recipe) => {
    // This line ensures that we filter by name search
    const matchsSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase())

    // Skips this particular recipe if it doesn't match the search query
    if (!matchsSearch) return false

    // The following applies the tag filter states
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
        <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>Explore Recipes</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <a href={`/home/${username}`}>Home</a> |
          <a href={`/explore/${username}`}>Explore</a> |
          <a href="/cart">Cart </a> |
        </div>
      </div>

      <div className="container">
        <div className="main-content">
          <div className="search-filter-bar">
            <input className="recipe-search" type="text" placeholder="Search recipes by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          {loading ? (
            <p style={{ padding: '2rem' }}>Loading recipes...</p>
          ) : (
            filteredRecipes.map((recipe) => (
              <div className="recipe-block" key={recipe.recipeId}>
                <div className="recipe-header">{recipe.name}</div>
                
                <img src="https://via.placeholder.com/600x200" alt={recipe.name} className="recipe-image"/>
                
                <div className="recipe-description">
                  {recipe.steps[0]?.slice(0, 100) || 'No description available...'}
                </div>
                
                <div className="recipe-tags">
                  {recipe.vegetarian && <span key="vegetarian">Vegetarian</span>}
                  {recipe.vegan && <span key="vegan">Vegan</span>}
                  {recipe.halal && <span key="halal">Halal</span>}
                  {recipe.lactoseFree && <span key="lactoseFree">Lactose-Free</span>}
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
          <input className="filter-search" type="text" placeholder="Search filters..." style={{ width: '100%', padding: '0.5em', marginBottom: '1em' }} value={filterSearchQuery} onChange={(e) => setFilterSearchQuery(e.target.value)} onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setFilterSearchQuery(filterSearchInput.trim())
            }
          }}/>
          
          <div className="filter-list">
            {visibleFilters.map((filter) => (
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
