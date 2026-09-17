// app/api/history/route.ts
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const db = await getDb()
    const raw = await db.collection('spins')
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray()

    const spins = raw.map(doc => ({
      _id: (doc._id as ObjectId).toString(),
      label: (doc.label as string) || 'Unknown',
      emoji: (doc.emoji as string) || '🎡',
      image: (doc.image as string) || '',
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : null
    }))

    return NextResponse.json(spins)
  } catch (e) {
    console.error('[GET /api/history]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
