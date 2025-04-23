import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  const { name, ingredients, steps } = await req.json()
  try {
    await db.collection('Recipes').add({
      name,
      ingredients,
      steps,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ success: false, error: 'Failed to upload' }, { status: 500 })
  }
}
