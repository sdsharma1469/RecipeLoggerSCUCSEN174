'use client'

import Image from 'next/image'

interface RecipeCardProps {
  title: string
  author: string
  imageUrl: string
  score: number // Assume 0–5 or 0–10 scale
}

export default function RecipeCard({ title, author, imageUrl, score }: RecipeCardProps) {
  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden w-full max-w-sm hover:shadow-lg transition">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4 space-y-1">
        <h2 className="text-lg font-semibold truncate">{title}</h2>
        <p className="text-sm text-gray-600">By {author}</p>
        <div className="text-yellow-500 font-medium">⭐ {score.toFixed(1)}</div>
      </div>
    </div>
  )
}
