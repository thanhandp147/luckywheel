'use client'
import { useEffect } from 'react'
import { WheelItem } from '@/lib/config'

interface Props {
  item: WheelItem
  onAgain: () => void
}

export default function ResultPopup({ item, onAgain }: Props) {
  useEffect(() => {
    // confetti is loaded as a global via Script in layout.tsx
    const w = window as Window & { confetti?: (opts: object) => void }
    if (typeof w.confetti === 'function') {
      w.confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
      setTimeout(() => w.confetti!({ particleCount: 80, spread: 120, origin: { y: 0.5 } }), 400)
    }
  }, [])

  return (
    <div className="popup-overlay active">
      <div className="popup-box">
        <div className="popup-emoji">{item.emoji}</div>
        <h2>Kết quả của em! 🎊</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img id="result-image" src={item.image} alt={item.label} />
        <p id="result-label">{item.label}</p>
        <button className="btn-secondary" onClick={onAgain}>
          Quay lại!
        </button>
      </div>
    </div>
  )
}
