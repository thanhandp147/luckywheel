'use client'
import { useState, useCallback } from 'react'
import { WheelItem, AppConfig } from '@/lib/config'
import WelcomePopup from '@/components/WelcomePopup'
import WheelCanvas from '@/components/WheelCanvas'
import ResultPopup from '@/components/ResultPopup'
import DeliveryScreen from '@/components/DeliveryScreen'

interface Props {
  items: WheelItem[]
  appConfig: AppConfig
}

type Step = 'welcome' | 'wheel' | 'result' | 'delivery'

export default function WheelClient({ items, appConfig }: Props) {
  const [step, setStep] = useState<Step>('welcome')
  const [selectedItem, setSelectedItem] = useState<WheelItem | null>(null)
  const [spinId, setSpinId] = useState<string | null>(null)

  const handleStart = useCallback(() => setStep('wheel'), [])

  const handleResult = useCallback(async (item: WheelItem) => {
    setSelectedItem(item)
    setStep('result')
    setSpinId(null)
    try {
      const res = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: item.label, emoji: item.emoji, image: item.image })
      })
      const data = await res.json()
      if (data.id) setSpinId(data.id)
    } catch (e) {
      console.error('Failed to save spin result:', e)
    }
  }, [])

  const sendVote = useCallback(async (vote: 'like' | 'dislike') => {
    if (!spinId) return
    try {
      await fetch(`/api/spin/${spinId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote })
      })
    } catch (e) {
      console.error('Failed to save vote:', e)
    }
  }, [spinId])

  const handleDislike = useCallback(() => {
    sendVote('dislike')
    setSelectedItem(null)
    setStep('wheel')
  }, [sendVote])

  const handleLike = useCallback(() => {
    sendVote('like')
    setStep('delivery')
  }, [sendVote])

  return (
    <>
      {step === 'welcome' && (
        <WelcomePopup onStart={handleStart} appConfig={appConfig} />
      )}
      {(step === 'wheel' || step === 'result') && (
        <WheelCanvas onResult={handleResult} items={items} appConfig={appConfig} />
      )}
      {step === 'result' && selectedItem && (
        <ResultPopup item={selectedItem} onLike={handleLike} onDislike={handleDislike} appConfig={appConfig} />
      )}
      {step === 'delivery' && <DeliveryScreen appConfig={appConfig} />}
    </>
  )
}
