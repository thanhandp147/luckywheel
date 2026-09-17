'use client'
import { AppConfig } from '@/lib/config'

interface Props {
  onStart: () => void
  appConfig: AppConfig
}

export default function WelcomePopup({ onStart, appConfig }: Props) {
  return (
    <div className="popup-overlay active">
      <div className="popup-box">
        <div className="popup-emoji">{appConfig.welcomeEmoji}</div>
        <h2>{appConfig.welcomeTitle}</h2>
        <p>{appConfig.welcomeMessage}</p>
        <button className="btn-primary" onClick={onStart}>
          {appConfig.startButtonText}
        </button>
      </div>
    </div>
  )
}
