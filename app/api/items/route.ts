import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ITEMS, WheelItem } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await getDb()
    const docs = await db.collection('items').find({}).sort({ order: 1 }).toArray()

    if (docs.length === 0) {
      await db.collection('items').insertMany(ITEMS.map((item, i) => ({ ...item, order: i })))
      return NextResponse.json(ITEMS)
    }

    const items: WheelItem[] = docs.map(doc => ({
      label: doc.label as string,
      image: (doc.image as string) || '',
      color: (doc.color as string) || '#FF6B9D',
      emoji: (doc.emoji as string) || '🎡',
    }))

    return NextResponse.json(items)
  } catch (e) {
    console.error('[GET /api/items]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ error: 'Body must be a non-empty array' }, { status: 400 })
    }

    for (const item of body) {
      if (!item.label || !item.color || !item.emoji) {
        return NextResponse.json({ error: 'Each item needs label, color, emoji' }, { status: 400 })
      }
    }

    const db = await getDb()
    await db.collection('items').deleteMany({})
    await db.collection('items').insertMany(
      (body as WheelItem[]).map((item, i) => ({ ...item, order: i }))
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[PUT /api/items]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
