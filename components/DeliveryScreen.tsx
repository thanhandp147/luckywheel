'use client'
import { useState } from 'react'
import { DotLottieReact, type DotLottie } from '@lottiefiles/dotlottie-react'
import { AppConfig } from '@/lib/config'

interface Props {
  appConfig: AppConfig
}

export default function DeliveryScreen({ appConfig }: Props) {
  const [failed, setFailed] = useState(false)

  return (
    <main id="screen-delivery" className="delivery-screen">
      <h2>{appConfig.deliveryTitle}</h2>
      <div className="delivery-lottie">
        {failed ? (
          <span className="delivery-fallback-emoji">🛵</span>
        ) : (
          <DotLottieReact
            src={appConfig.deliveryLottieUrl}
            loop
            autoplay
            dotLottieRefCallback={(dotLottie: DotLottie | null) => {
              dotLottie?.addEventListener('loadError', () => setFailed(true))
            }}
          />
        )}
      </div>
      <p>{appConfig.deliveryMessage}</p>
    </main>
  )
}
