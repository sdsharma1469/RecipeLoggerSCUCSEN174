'use client'

import { useState } from 'react'
import { uploadRecipeClientSide } from '@/lib/utils/Recipes/Upload'
import { v4 as uuidv4 } from 'uuid' // Make sure this is installed
import {app} from '@/lib/firebase-client'

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
        return { quantity: 1, name: trimmed } // Adjust quantity parsing if needed
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
    <div style={{ padding: '2rem' }}>
      <h1>Upload a Recipe</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Recipe name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Short description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <textarea
          placeholder="Ingredients (comma-separated)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          required
        />
        <textarea
          placeholder="Steps (one per line)"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          required
        />
        {/* Tags */}
        <label><input type="checkbox" checked={halal} onChange={() => setHalal(!halal)} /> Halal</label>
        <label><input type="checkbox" checked={vegan} onChange={() => setVegan(!vegan)} /> Vegan</label>
        <label><input type="checkbox" checked={vegetarian} onChange={() => setVegetarian(!vegetarian)} /> Vegetarian</label>
        <label><input type="checkbox" checked={lactoseFree} onChange={() => setLactoseFree(!lactoseFree)} /> Lactose Free</label>
        <label><input type="checkbox" checked={soy} onChange={() => setSoy(!soy)} /> Soy</label>
        <label><input type="checkbox" checked={peanuts} onChange={() => setPeanuts(!peanuts)} /> Peanuts</label>
        {/* Rating and Difficulty */}
        <input
          type="number"
          placeholder="Rating (0–5)"
          value={creatorRating}
          onChange={(e) => setCreatorRating(parseInt(e.target.value, 10))}
          min="0"
          max="5"
        />
        <input
          type="number"
          placeholder="Difficulty (1–5)"
          value={difficulty}
          onChange={(e) => setDifficulty(parseInt(e.target.value, 10))}
          min="1"
          max="5"
        />
        <button type="submit">Upload</button>
      </form>
      <p>{status}</p>
    </div>
  )
}
