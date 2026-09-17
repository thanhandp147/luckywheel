// app/history/page.tsx
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

interface SpinRecord {
  id: string
  label: string
  emoji: string
  image: string
  vote: 'like' | 'dislike' | null
  createdAt: string | null
}

function voteBadge(vote: 'like' | 'dislike' | null): { text: string; className: string } {
  if (vote === 'like') return { text: '❤️ Thích', className: 'vote-badge vote-like' }
  if (vote === 'dislike') return { text: '👎 Không thích', className: 'vote-badge vote-dislike' }
  return { text: '⏳ Chưa chọn', className: 'vote-badge vote-pending' }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Chưa rõ thời gian'
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Chưa rõ thời gian'
  }
}

export default async function HistoryPage() {
  let spins: SpinRecord[] = []
  let error = ''

  try {
    const db = await getDb()
    const raw = await db
      .collection('spins')
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray()

    spins = raw.map(doc => ({
      id: (doc._id as ObjectId).toString(),
      label: (doc.label as string) || 'Unknown',
      emoji: (doc.emoji as string) || '🎡',
      image: (doc.image as string) || '',
      vote: (doc.vote as 'like' | 'dislike' | null) ?? null,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : null
    }))
  } catch (e) {
    error = String(e)
  }

  // Compute stats
  const counts: Record<string, number> = {}
  spins.forEach(s => {
    counts[s.label] = (counts[s.label] || 0) + 1
  })
  const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]

  return (
    <main className="history-page">
      <h1 className="title">📋 Lịch sử tất cả các lần quay</h1>

      {error ? (
        <p className="loading-text">Lỗi tải dữ liệu: {error}</p>
      ) : (
        <>
          {spins.length > 0 && (
            <div className="stats-bar">
              <div className="stat-item">
                <span className="stat-label">Tổng số lần quay</span>
                <span className="stat-value">{spins.length} lần</span>
              </div>
              {topEntry && (
                <div className="stat-item">
                  <span className="stat-label">Món được chọn nhiều nhất</span>
                  <span className="stat-value">
                    {topEntry[0]} ({topEntry[1]} lần)
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="history-list">
            {spins.length === 0 ? (
              <p className="loading-text">Chưa có lần quay nào. 🎡</p>
            ) : (
              spins.map((spin, i) => (
                <div
                  key={spin.id}
                  className="history-card"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  {spin.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={spin.image} alt={spin.label} />
                  )}
                  <div className="history-card-info">
                    <div className="history-card-label">{spin.label}</div>
                    <div className="history-card-time">{formatDate(spin.createdAt)}</div>
                    <span className={voteBadge(spin.vote).className}>{voteBadge(spin.vote).text}</span>
                  </div>
                  <div className="history-card-emoji">{spin.emoji}</div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </main>
  )
}
