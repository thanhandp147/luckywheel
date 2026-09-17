// app/layout.tsx
import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap'
})

export const metadata: Metadata = {
  title: '"Tổng đài Thành An"',
  description: 'Mời cô giáo Thu Nga vào chọn nước'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={nunito.className}>
        {children}
        <Script
          src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  )
}
