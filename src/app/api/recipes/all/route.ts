// app/api/recipes/all/route.ts
import { db } from '@/lib/firebase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const snapshot = await db.collection('Recipes').get()
    const recipes = snapshot.docs.map(doc => doc.data())
    return NextResponse.json({ recipes })
  } catch (error) {
    console.error('❌ Error fetching recipes:', error)
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
  }
}
