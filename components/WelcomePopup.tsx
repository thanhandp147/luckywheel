'use client'

interface Props {
  onStart: () => void
}

export default function WelcomePopup({ onStart }: Props) {
  return (
    <div className="popup-overlay active">
      <div className="popup-box">
        <div className="popup-emoji">🎉</div>
        <h2>Chào mừng em yêu!</h2>
        <p>Quay để biết hôm nay uống gì nha~ 🥤</p>
        <button className="btn-primary" onClick={onStart}>
          Bắt đầu thôi!
        </button>
      </div>
    </div>
  )
}
