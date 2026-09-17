import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { DEFAULT_APP_CONFIG } from '@/lib/config'

export const dynamic = 'force-dynamic'

const ID = 'singleton'

export async function GET() {
  try {
    const db = await getDb()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = await db.collection('appConfig').findOne({ _id: ID as any })

    if (!doc) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.collection('appConfig').insertOne({ _id: ID as any, ...DEFAULT_APP_CONFIG })
      return NextResponse.json(DEFAULT_APP_CONFIG)
    }

    const { _id, ...config } = doc
    return NextResponse.json({ ...DEFAULT_APP_CONFIG, ...config })
  } catch (e) {
    console.error('[GET /api/config]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const db = await getDb()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.collection('appConfig').updateOne(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { _id: ID as any },
      { $set: body },
      { upsert: true }
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[PUT /api/config]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
