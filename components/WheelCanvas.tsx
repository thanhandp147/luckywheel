// components/WheelCanvas.tsx
'use client'
import { useRef, useEffect, useCallback, useState } from 'react'
import { ITEMS, WheelItem } from '@/lib/config'

interface Props {
  onResult: (item: WheelItem) => void
}

export default function WheelCanvas({ onResult }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const angleRef = useRef(0)
  const onResultRef = useRef(onResult)
  useEffect(() => { onResultRef.current = onResult }, [onResult])
  const [isSpinning, setIsSpinning] = useState(false)

  const drawWheel = useCallback((rotationAngle: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    // Sync canvas buffer to CSS display size for crisp rendering on mobile
    const displaySize = canvas.clientWidth || canvas.width
    if (canvas.width !== displaySize) {
      canvas.width = displaySize
      canvas.height = displaySize
    }

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const r = cx - 4
    const sliceAngle = (2 * Math.PI) / ITEMS.length

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ITEMS.forEach((item, i) => {
      const start = rotationAngle + i * sliceAngle
      const end = start + sliceAngle

      // Segment fill
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, end)
      ctx.closePath()
      ctx.fillStyle = item.color
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Label text with word-wrap
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(start + sliceAngle / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 13px Nunito, sans-serif'
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 3

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

    // Center circle
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, 24, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.strokeStyle = '#FF6B9D'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.font = '20px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🎡', cx, cy)
    ctx.restore()
  }, [])

  useEffect(() => {
    drawWheel(angleRef.current)
  }, [drawWheel])

  const spin = useCallback(() => {
    if (isSpinning) return
    setIsSpinning(true)

    const extraSpins = 5 + Math.floor(Math.random() * 5)  // 5-9 full rotations
    const targetAngle = angleRef.current + extraSpins * 2 * Math.PI + Math.random() * 2 * Math.PI
    const duration = 4000 + Math.random() * 1500  // 4-5.5 seconds
    const startTime = performance.now()
    const startAngle = angleRef.current

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 4)
    }

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      angleRef.current = startAngle + (targetAngle - startAngle) * easeOut(progress)
      drawWheel(angleRef.current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsSpinning(false)

        // Calculate which segment is at the top pointer
        const sliceAngle = (2 * Math.PI) / ITEMS.length
        const normalized = ((angleRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        const pointerAngle = (2 * Math.PI - normalized + (3 * Math.PI) / 2) % (2 * Math.PI)
        const index = Math.floor(pointerAngle / sliceAngle) % ITEMS.length
        onResultRef.current(ITEMS[index])
      }
    }

    requestAnimationFrame(animate)
  }, [isSpinning, drawWheel])

  return (
    <main id="screen-wheel">
      <h1 className="title">🎡 Vòng Quay May Mắn</h1>
      <div className="wheel-container">
        <div className="wheel-pointer">▼</div>
        <canvas ref={canvasRef} id="wheel-canvas" width={400} height={400} />
      </div>
      <button className="btn-primary" onClick={spin} disabled={isSpinning}>
        ✨ Quay!
      </button>
    </main>
  )
}
