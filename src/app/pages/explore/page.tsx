'use client'

import { useEffect, useState } from 'react'
import React from "react"
import './explore.css';

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
    <head>
        <title>Explore Page</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="explore.css" />
    </head>
    
    <div className="navbar">
      <div>Explore Recipes</div>
      <div>
        <a href="#">Login</a>
        <a href="#">Shopping Cart</a>
        <a href="#">User</a>
      </div>
    </div>

    <div id="container">
      <div id="mainContent">
        {/*First main div is gonna be the search by recipe and tags boxes*/}
        <div className="recipeTagSearch">
          <input type="text" placeholder="Search recipes..." />
          <input type="text" placeholder="Filter by tags..." />
        </div>

        {/*This recipe div defines the recipe block. I added three of these for now*/}
        <div id="recipeBlock">
          <div className="recipeTitle">Recipe Title</div>
          <img className="recipeImage" src="https://placeholder" alt="Recipe Image"/>
          <div className="recipeDescription">
            <p>This is the description for a recipe</p>
          </div>
          <div className="recipeTags">
            <span>Vegetarian</span>
            <span>Intermediate</span>
            <span>45mins</span>
          </div>
          <div className="recipeFooter">
            <div className="recipeRatings">
              <div>Creator Rating: ⭐⭐⭐⭐</div>
              <div>User Rating: ⭐⭐⭐☆☆</div>
              <div>Difficulty Rating: ⭐⭐</div>
            </div>
            
            <div className="recipePrice">
              <p>$23.45</p>
            </div>
            
          </div>
        </div>

        {/*Aside is used to add the filter side bar*/}
        <div id="filtersSidebar">
          <div className="filterTitle">Filters</div>
          <input className="filterSearch"type="text" placeholder="Search filters..."/>
          <div className="filterList">
            <button>Vegetarian</button>
            <button>Quick</button>
            <button>Gluten-Free</button>
            <button>Over $10</button>
            <button>Under $10</button>
          </div>
        </div>

      </div>
    </div>

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
    </div>
  )
}
