// components/WheelCanvas.tsx
'use client'
import { useRef, useEffect, useCallback, useState } from 'react'
import { WheelItem, AppConfig } from '@/lib/config'

interface Props {
  onResult: (item: WheelItem) => void
  items: WheelItem[]
  appConfig: AppConfig
}

function adjustHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount))
  return `rgb(${r},${g},${b})`
}

function playTick(audioCtx: AudioContext) {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.frequency.value = 480 + Math.random() * 240
  gain.gain.setValueAtTime(0.07, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04)
  osc.start()
  osc.stop(audioCtx.currentTime + 0.04)
}

export default function WheelCanvas({ onResult, items, appConfig }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const angleRef = useRef(0)
  const onResultRef = useRef(onResult)
  useEffect(() => { onResultRef.current = onResult }, [onResult])
  const [isSpinning, setIsSpinning] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const lastSegmentRef = useRef(-1)
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map())
  const [imageVersion, setImageVersion] = useState(0)

  useEffect(() => {
    items.forEach((item) => {
      if (!item.image || imageCacheRef.current.has(item.image)) return
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => setImageVersion((n) => n + 1)
      img.src = item.image
      imageCacheRef.current.set(item.image, img)
    })
  }, [items])

  const drawWheel = useCallback((rotationAngle: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const displaySize = canvas.clientWidth || canvas.width
    if (canvas.width !== displaySize) {
      canvas.width = displaySize
      canvas.height = displaySize
    }

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const r = cx - 4
    const sliceAngle = (2 * Math.PI) / items.length

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    items.forEach((item, i) => {
      const start = rotationAngle + i * sliceAngle
      const end = start + sliceAngle

      const gradient = ctx.createRadialGradient(cx, cy, r * 0.12, cx, cy, r)
      gradient.addColorStop(0, adjustHex(item.color, 90))
      gradient.addColorStop(0.45, item.color)
      gradient.addColorStop(1, adjustHex(item.color, -50))

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, end)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(start + sliceAngle / 2)

      const img = item.image ? imageCacheRef.current.get(item.image) : undefined
      const imgSize = Math.min(56, r * 0.32)
      const imgRadius = r * 0.62

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save()
        ctx.translate(imgRadius, 0)
        ctx.beginPath()
        ctx.arc(0, 0, imgSize / 2, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize)
        ctx.restore()
        ctx.beginPath()
        ctx.arc(imgRadius, 0, imgSize / 2, 0, 2 * Math.PI)
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'
        ctx.lineWidth = 2
        ctx.stroke()
      } else {
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = '28px serif'
        ctx.fillText(item.emoji, imgRadius, 0)
      }

      ctx.textAlign = 'right'
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 13px Nunito, sans-serif'
      ctx.shadowColor = 'rgba(0,0,0,0.6)'
      ctx.shadowBlur = 5

      const maxWidth = r - 30
      const words = item.label.split(' ')
      let line = ''
      const lines: string[] = []
      for (const word of words) {
        const test = line ? line + ' ' + word : word
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line)
          line = word
        } else {
          line = test
        }
      }
      lines.push(line)

      const lineHeight = 16
      const startY = -((lines.length - 1) * lineHeight) / 2
      lines.forEach((l, li) => {
        ctx.fillText(l, r - 16, startY + li * lineHeight)
      })
      ctx.restore()
    })

    ctx.save()
    ctx.shadowColor = '#FF6B9D'
    ctx.shadowBlur = 22
    ctx.beginPath()
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI)
    ctx.fillStyle = '#0d0d20'
    ctx.fill()
    ctx.strokeStyle = '#FF6B9D'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.restore()
    ctx.font = '22px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🎡', cx, cy)
  }, [items, imageVersion])

  useEffect(() => {
    drawWheel(angleRef.current)
  }, [drawWheel])

  const spin = useCallback(() => {
    if (isSpinning) return
    setIsSpinning(true)

    if (!audioCtxRef.current) {
      try { audioCtxRef.current = new AudioContext() } catch { /* ignore */ }
    }
    const audioCtx = audioCtxRef.current
    lastSegmentRef.current = -1

    const extraSpins = 8 + Math.floor(Math.random() * 5)
    const targetAngle = angleRef.current + extraSpins * 2 * Math.PI + Math.random() * 2 * Math.PI
    const duration = 6000 + Math.random() * 2000
    const startTime = performance.now()
    const startAngle = angleRef.current
    const sliceAngle = (2 * Math.PI) / items.length

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 6)
    }

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      angleRef.current = startAngle + (targetAngle - startAngle) * easeOut(progress)
      drawWheel(angleRef.current)

      if (audioCtx) {
        const norm = ((angleRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        const seg = Math.floor(norm / sliceAngle) % items.length
        if (lastSegmentRef.current !== seg && lastSegmentRef.current !== -1) {
          playTick(audioCtx)
        }
        lastSegmentRef.current = seg
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsSpinning(false)
        const normalized = ((angleRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        const pointerAngle = (2 * Math.PI - normalized + (3 * Math.PI) / 2) % (2 * Math.PI)
        const index = Math.floor(pointerAngle / sliceAngle) % items.length
        onResultRef.current(items[index])
      }
    }

    requestAnimationFrame(animate)
  }, [isSpinning, drawWheel, items])

  return (
    <main id="screen-wheel">
      <h1 className="title">{appConfig.title}</h1>
      <div className="wheel-container">
        <div className={`wheel-pointer${isSpinning ? ' spinning' : ''}`}>▼</div>
        <canvas
          ref={canvasRef}
          id="wheel-canvas"
          className={isSpinning ? 'spinning' : ''}
          width={400}
          height={400}
        />
      </div>
      <button className="btn-primary" onClick={spin} disabled={isSpinning}>
        {isSpinning ? '🎰 Đang quay...' : appConfig.spinButtonText}
      </button>
    </main>
  )
}
