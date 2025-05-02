'use client'

import { useEffect, useState } from 'react'
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
    
    <h1>All Recipes</h1>
    
    <div id="navbar">
      <ul id="nav">
          <li className="navLi"><a className="navA" href="Home.html">Home</a></li>
          <li className="navLi"><a className="navA" href="page2.html">ShoppingCart</a></li>
          <li className="navLi"><a className="navA" href="page3.html">Test 3</a></li>
          <li className="navLi"><a className="navA" href="page4.html">Test 4</a></li>
      </ul>
    </div>

    <div id="filterSearch">
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="text" placeholder="Search recipes..." style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ddd' }}/>
        <button type="submit" style={{ padding: '0.5rem', borderRadius: '5px', background: '#007bff', color: '#fff' }}>
          Search
        </button>
      </form>
    </div>

      <div id="mainContent">
        {/*Big div for all recipe items */}
        <div id="recipeItems">
          {/*This recipe div defines the recipe block. I added three of these for now*/}
          <div id="recipe">
            <h1>Recipe Title</h1>
            <img src="https://placeholder" alt="Recipe Image" style={{ width: '100%', borderRadius: '10px' }} />
            <div id="recipeDescription">
              <p>This is the description for a recipe</p>
            </div>

            <div id="recipeTags">
              <ul id="tag">
                <li className="tagLi"><a className="tagA" href="" target="_self">Tag1</a></li>
                <li className="tagLi"><a className="tagA" href="" target="_self">Tag2</a></li>
                <li className="tagLi"><a className="tagA" href="" target="_self">Tag3</a></li>
              </ul>
            </div>

            <div id="recipeRating">
              <ul id="ratingList">
                <li className="ratingLi">Creator Rating: 3/5</li>
                <li className="ratingLi">User Rating: 1/5</li>
                <li className="ratingLi">Difficulty: 2.5/5</li>
              </ul>
            </div>

            <div id="recipePrice">
              <p>Price: $23.45</p>
            </div>
          </div>

        </div>

        {/*Temporary breaks. Gonna remove later*/}
        <br />


        {/*Aside is used to add the filter side bar*/}
        <aside>
          <div id="filtersSidebar">
            <h2>Filters</h2>

            <div className="searchByFilter">
              <h3>Search By Filter</h3>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="Search by filter..." style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ddd' }} />
                <button type="submit" style={{ padding: '0.5rem', borderRadius: '5px', background: '#007bff', color: '#fff' }}>
                  Search
                </button>
              </form>

              <ul>
                <li>Filter A <input type="checkbox"></input></li>
                <li>Filter B <input type="checkbox"></input></li>
                <li>Filter C <input type="checkbox"></input></li>
                <li>Filter D <input type="checkbox"></input></li>
                <li>Filter E <input type="checkbox"></input></li>
                <li>Filter F <input type="checkbox"></input></li>
              </ul>
            </div>

            <div className="tagsChosen">
              <h3>Tags Chosen</h3>
              <ul className="tagsL">
                <li>Choosen Tag 1</li>
                <li>Choosen Tag 2</li>
                <li>Choosen Tag 3</li>
                <li>Choosen Tag 4</li>
                <li>Choosen Tag 5</li>
              </ul>
            </div>

            <div className="ratingsTips">
              <p>Ratings are based from 1 to 5 (5: Harder/Better)</p>
            </div>
          </div>
        </aside>
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
