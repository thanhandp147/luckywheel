// app/page.tsx
'use client'
import { useState, useCallback } from 'react'
import { WheelItem } from '@/lib/config'
import WelcomePopup from '@/components/WelcomePopup'
import WheelCanvas from '@/components/WheelCanvas'
import ResultPopup from '@/components/ResultPopup'

type Step = 'welcome' | 'wheel' | 'result'

export default function HomePage() {
  const [step, setStep] = useState<Step>('welcome')
  const [selectedItem, setSelectedItem] = useState<WheelItem | null>(null)

  const handleStart = useCallback(() => {
    setStep('wheel')
  }, [])

  const handleResult = useCallback(async (item: WheelItem) => {
    setSelectedItem(item)
    setStep('result')

    // Save spin result to MongoDB via API — fire and forget
    try {
      await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: item.label, emoji: item.emoji, image: item.image })
      })
    } catch (e) {
      console.error('Failed to save spin result:', e)
    }
  }, [])

  const handleAgain = useCallback(() => {
    setSelectedItem(null)
    setStep('wheel')
  }, [])

  return (
    <>
      {step === 'welcome' && <WelcomePopup onStart={handleStart} />}
      {step !== 'welcome' && <WheelCanvas onResult={handleResult} />}
      {step === 'result' && selectedItem && (
        <ResultPopup item={selectedItem} onAgain={handleAgain} />
      )}
    </>
  )
}
