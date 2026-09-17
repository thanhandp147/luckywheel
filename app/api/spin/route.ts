// app/api/spin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { label, emoji, image } = body as { label?: string; emoji?: string; image?: string }

    if (!label || !emoji || !image) {
      return NextResponse.json({ error: 'Missing required fields: label, emoji, image' }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.collection('spins').insertOne({
      label,
      emoji,
      image,
      vote: null,
      createdAt: new Date()
    })

    return NextResponse.json({ ok: true, id: result.insertedId.toString() })
  } catch (e) {
    console.error('[POST /api/spin]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
