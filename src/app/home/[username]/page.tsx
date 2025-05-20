'use client'

import { useState } from 'react'
import { uploadRecipeClientSide } from '@/lib/utils/Recipes/Upload'
import { v4 as uuidv4 } from 'uuid'
import {app} from '@/lib/firebase-client'
import './home.css'

export default function UploadRecipePage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [steps, setSteps] = useState('')
  const [status, setStatus] = useState('')
  const [creatorRating, setCreatorRating] = useState(0)
  const [difficulty, setDifficulty] = useState(1)

  // Tags
  const [halal, setHalal] = useState(false)
  const [vegan, setVegan] = useState(false)
  const [vegetarian, setVegetarian] = useState(false)
  const [lactoseFree, setLactoseFree] = useState(false)
  const [soy, setSoy] = useState(false)
  const [peanuts, setPeanuts] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const recipeId = uuidv4()
    const recipe = {
      recipeId,
      name,
      description,
      ingredients: ingredients.split(',').map((item) => {
        const trimmed = item.trim()
        return { quantity: 1, name: trimmed }
      }),
      steps: steps.split('\n').map((step) => step.trim()).filter(Boolean),
      tags: {
        halal,
        vegan,
        vegetarian,
        lactoseFree,
        soy,
        peanuts,
      },
      creatorRating,
      difficulty,
    }

    const success = await uploadRecipeClientSide(recipe)

    if (success) {
      setStatus('✅ Recipe uploaded!')
      setName('')
      setDescription('')
      setIngredients('')
      setSteps('')
      setCreatorRating(0)
      setDifficulty(1)
      setHalal(false)
      setVegan(false)
      setVegetarian(false)
      setLactoseFree(false)
      setSoy(false)
      setPeanuts(false)
    } else {
      setStatus('❌ Failed to upload recipe.')
    }
  }

  return (
    <div>
      <div className="navbar">
        <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>Recipe Logger</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
          <a href="/home">Home</a> |
          <a href="/explore">Explore</a> |
          <a href="/cart">Cart </a> |
          <img
            src="https://placehold.co/100"
            alt="User Profile"
            style={{ borderRadius: '50%', width: '30px', height: '30px' }}
          />
        </div>
      </div>

      <div className="container">
        <div className="filters-column">
          <div className="menu-section">
            <a href="/home" style={{ display: 'block', padding: '0.5em', textDecoration: 'none', color: 'inherit' }}>
              Back to Home
            </a>
          </div>
        </div>

        <div className="main-content">
          <h1>Upload a Recipe</h1>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Recipe Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Short Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9',
                  minHeight: '80px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Ingredients (comma-separated)</label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9',
                  minHeight: '100px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Steps (one per line)</label>
              <textarea
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9',
                  minHeight: '150px'
                }}
              />
            </div>

            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>Dietary Tags</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={halal} onChange={() => setHalal(!halal)} />
                  Halal
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={vegan} onChange={() => setVegan(!vegan)} />
                  Vegan
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={vegetarian} onChange={() => setVegetarian(!vegetarian)} />
                  Vegetarian
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={lactoseFree} onChange={() => setLactoseFree(!lactoseFree)} />
                  Lactose Free
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={soy} onChange={() => setSoy(!soy)} />
                  Contains Soy
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={peanuts} onChange={() => setPeanuts(!peanuts)} />
                  Contains Peanuts
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Your Rating (0-5)</label>
                <input
                  type="number"
                  value={creatorRating}
                  onChange={(e) => setCreatorRating(parseInt(e.target.value, 10))}
                  min="0"
                  max="5"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    backgroundColor: '#f9f9f9'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Difficulty (1-5)</label>
                <input
                  type="number"
                  value={difficulty}
                  onChange={(e) => setDifficulty(parseInt(e.target.value, 10))}
                  min="1"
                  max="5"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    backgroundColor: '#f9f9f9'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'background-color 0.3s',
                alignSelf: 'flex-start'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
            >
              Upload Recipe
            </button>
          </form>
          <p style={{ marginTop: '1rem', color: status.includes('✅') ? 'green' : 'red' }}>{status}</p>
        </div>
      </div>
    </div>
  )
}