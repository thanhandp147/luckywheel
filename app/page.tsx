import { getDb } from '@/lib/mongodb'
import { ITEMS, DEFAULT_APP_CONFIG, WheelItem, AppConfig } from '@/lib/config'
import WheelClient from '@/components/WheelClient'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let items: WheelItem[] = ITEMS
  let appConfig: AppConfig = DEFAULT_APP_CONFIG

  try {
    const db = await getDb()

    const docs = await db.collection('items').find({}).sort({ order: 1 }).toArray()
    if (docs.length > 0) {
      items = docs.map(doc => ({
        label: doc.label as string,
        image: (doc.image as string) || '',
        color: (doc.color as string) || '#FF6B9D',
        emoji: (doc.emoji as string) || '🎡',
      }))
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const configDoc = await db.collection('appConfig').findOne({ _id: 'singleton' as any })
    if (configDoc) {
      const { _id, ...config } = configDoc
      appConfig = { ...DEFAULT_APP_CONFIG, ...config }
    }
  } catch (e) {
    console.error('HomePage: DB load failed, using defaults', e)
  }

  return <WheelClient items={items} appConfig={appConfig} />
}
