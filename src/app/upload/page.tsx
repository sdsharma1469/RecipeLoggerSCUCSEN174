'use client'

import { useState } from 'react'

export default function UploadRecipePage() {
  const [name, setName] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [steps, setSteps] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/recipes/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        ingredients: ingredients.split(',').map((s) => s.trim()),
        steps: steps.split('\n').map((s) => s.trim()),
      }),
    })

    const data = await res.json()
    if (data.success) {
      setStatus('✅ Recipe uploaded!')
      setName('')
      setIngredients('')
      setSteps('')
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
        <button type="submit">Upload</button>
      </form>
      <p>{status}</p>
    </div>
  )
}
