'use client'

import { useState } from 'react'
import { generateRecipe } from '../../lib/utils/Recipes/generateRecipe'
import { auth } from '@/lib/firebase-client' // ✅ Use your shared instance
import { getIdToken } from 'firebase/auth'
import {uploadRecipeClientSide} from '@/lib/utils/Recipes/Upload'


export default function UploadRecipePage() {
  const [name, setName] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [steps, setSteps] = useState('')
  const [status, setStatus] = useState('')
  const [rating, setRating] = useState(0)
  const [halal, setHalal] = useState(false)
  const [vegan, setVegan] = useState(false)
  const [vegetarian, setVegetarian] = useState(false)
  const [lactoseFree, setLactoseFree] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    const user = auth.currentUser
    if (!user) {
      setStatus('❌ User not logged in.')
      return
    }
  
    const token = await user.getIdToken()
  
    const recipe = generateRecipe({
      name,
      ingredients,
      steps,
      halal,
      vegan,
      vegetarian,
      lactoseFree,
      rating,
    })
  

    const success = await uploadRecipeClientSide(recipe)

    if (success) {
      setStatus('✅ Recipe uploaded!')
      setName('')
      setIngredients('')
      setSteps('')
      setRating(0)
      setHalal(false)
      setVegan(false)
      setVegetarian(false)
      setLactoseFree(false)
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
        <label>
          <input type="checkbox" checked={halal} onChange={() => setHalal(!halal)} />
          Halal
        </label>
        <label>
          <input type="checkbox" checked={vegan} onChange={() => setVegan(!vegan)} />
          Vegan
        </label>
        <label>
          <input type="checkbox" checked={vegetarian} onChange={() => setVegetarian(!vegetarian)} />
          Vegetarian
        </label>
        <label>
          <input type="checkbox" checked={lactoseFree} onChange={() => setLactoseFree(!lactoseFree)} />
          Lactose Free
        </label>
        <input
          type="number"
          placeholder="Rating (e.g. 5)"
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value, 10))}
          min="0"
          max="5"
        />
        <button type="submit">Upload</button>
      </form>
      <p>{status}</p>
    </div>
  )
}
