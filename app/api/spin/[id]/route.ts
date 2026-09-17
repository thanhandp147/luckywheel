// app/api/spin/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { vote } = (await req.json()) as { vote?: string }

    if (vote !== 'like' && vote !== 'dislike') {
      return NextResponse.json({ error: 'vote must be "like" or "dislike"' }, { status: 400 })
    }
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const db = await getDb()
    await db.collection('spins').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { vote } }
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[PATCH /api/spin/[id]]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
