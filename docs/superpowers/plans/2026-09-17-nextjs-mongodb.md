# Lucky Wheel — Next.js + MongoDB Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate lucky wheel from vanilla HTML/Firebase to Next.js 14 App Router + MongoDB Atlas, deployed to Vercel.

**Architecture:** Next.js App Router with TypeScript. Three client components (WelcomePopup, WheelCanvas, ResultPopup) composed in a `'use client'` root page. History page is a Server Component that queries MongoDB directly. Two API routes handle write (POST /api/spin) and read (GET /api/history). MongoDB native driver with a connection singleton.

**Tech Stack:** Next.js 14, React 18, TypeScript strict, `mongodb` ^6.x (native driver, no Mongoose), Vercel deployment, canvas-confetti CDN, Nunito via next/font/google

**Spec:** `docs/superpowers/specs/2026-09-17-nextjs-mongodb-migration.md`

## Global Constraints

- Next.js 14.x, React 18.x — `npx create-next-app@14`
- TypeScript strict mode
- `mongodb` package `^6.0.0` — no Mongoose, no ORM
- `MONGODB_URI` env var required in `.env.local` and Vercel dashboard
- MongoDB database name: `luckywheel` (hardcoded in `getDb()`)
- MongoDB collection: `spins`
- History URL: `/history` — no auth, security by obscurity
- No Tailwind — plain CSS in `app/globals.css`
- canvas-confetti `@1.9.3` from `https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js`
- All image URLs in ITEMS must be HTTPS
- Working directory: `/Users/lethanhan/Documents/luckywheel`

---

### Task 1: Delete old files + scaffold Next.js + install deps

**Files:**
- Delete: `index.html`, `history.html`, `style.css`, `app.js`, `history.js`, `config.js`, `firebase-config.js`
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `.env.local`, `app/` directory scaffold

**Interfaces:**
- Consumes: nothing
- Produces: working `npm run dev` at `http://localhost:3000`, `package.json` with `mongodb ^6.x`

- [ ] **Step 1: Delete old vanilla files**

```bash
cd /Users/lethanhan/Documents/luckywheel
rm index.html history.html style.css app.js history.js config.js firebase-config.js
```

- [ ] **Step 2: Scaffold Next.js 14 in current directory**

```bash
npx create-next-app@14 . --typescript --no-tailwind --no-eslint --app --no-src-dir --no-import-alias --yes
```

When prompted "The directory is not empty. Would you like to continue?" → type `y` and Enter.

This creates: `app/`, `public/`, `package.json`, `tsconfig.json`, `next.config.js`, `next.config.ts` (delete one if both appear).

- [ ] **Step 3: Install mongodb driver**

```bash
npm install mongodb@^6.0.0
```

- [ ] **Step 4: Clean up create-next-app boilerplate**

Delete the default boilerplate files (keep the directory structure):

```bash
rm -f app/page.tsx app/globals.css app/layout.tsx public/next.svg public/vercel.svg
```

Also remove `app/page.module.css` if it exists:
```bash
rm -f app/page.module.css
```

- [ ] **Step 5: Update .gitignore to exclude .env.local**

Open `.gitignore` and verify these lines exist (create-next-app usually adds them):
```
.env*.local
```
If not present, add them.

- [ ] **Step 6: Create .env.local with MongoDB URI placeholder**

Create `/Users/lethanhan/Documents/luckywheel/.env.local`:
```
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/luckywheel?retryWrites=true&w=majority
```

User must replace with real Atlas connection string. The database name `luckywheel` at the end of the URI is important.

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: Next.js compiles, `http://localhost:3000` shows a 404 page (that's OK — we deleted app/page.tsx). No TypeScript errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 14 + mongodb, remove old vanilla files"
```

---

### Task 2: lib/config.ts + lib/mongodb.ts

**Files:**
- Create: `lib/config.ts`
- Create: `lib/mongodb.ts`

**Interfaces:**
- Consumes: `MONGODB_URI` env var (runtime)
- Produces:
  - `WheelItem` interface — `{ label: string, image: string, color: string, emoji: string }`
  - `ITEMS: WheelItem[]` — 8 drink items
  - `getDb(): Promise<Db>` — returns MongoDB Db instance for `luckywheel` database
  - `default clientPromise: Promise<MongoClient>` — used by API routes

- [ ] **Step 1: Create lib/config.ts**

```typescript
// lib/config.ts

export interface WheelItem {
  label: string
  image: string   // HTTPS URL
  color: string   // hex color for wheel segment
  emoji: string
}

export const ITEMS: WheelItem[] = [
  {
    label: 'Trà sữa trân châu',
    image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400',
    color: '#FF6B9D',
    emoji: '🧋'
  },
  {
    label: 'Matcha latte',
    image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=400',
    color: '#7BC67E',
    emoji: '🍵'
  },
  {
    label: 'Hồng trà sữa',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    color: '#FFB347',
    emoji: '🫖'
  },
  {
    label: 'Sinh tố xoài',
    image: 'https://images.unsplash.com/photo-1553177595-4de6a86bcd44?w=400',
    color: '#FFD700',
    emoji: '🥭'
  },
  {
    label: 'Nước ép dưa hấu',
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400',
    color: '#FF4D6D',
    emoji: '🍉'
  },
  {
    label: 'Cà phê sữa đá',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    color: '#8B4513',
    emoji: '☕'
  },
  {
    label: 'Soda chanh',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    color: '#90EE90',
    emoji: '🍋'
  },
  {
    label: 'Kem trà xanh',
    image: 'https://images.unsplash.com/photo-1567206563114-c179706a56dc?w=400',
    color: '#98FB98',
    emoji: '🍦'
  }
]
```

- [ ] **Step 2: Create lib/mongodb.ts**

```typescript
// lib/mongodb.ts
import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) throw new Error('MONGODB_URI environment variable is not set')

let clientPromise: Promise<MongoClient>

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === 'development') {
  // In dev, use global to preserve connection across hot reloads
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  const client = new MongoClient(uri)
  clientPromise = client.connect()
}

export default clientPromise

export async function getDb(): Promise<Db> {
  const client = await clientPromise
  return client.db('luckywheel')
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors. If `Cannot find module 'mongodb'` appears, run `npm install mongodb@^6.0.0` again.

- [ ] **Step 4: Commit**

```bash
git add lib/config.ts lib/mongodb.ts
git commit -m "feat: lib/config.ts items array and lib/mongodb.ts connection singleton"
```

---

### Task 3: app/layout.tsx + app/globals.css

**Files:**
- Create: `app/layout.tsx`
- Create: `app/globals.css`

**Interfaces:**
- Consumes: nothing from earlier tasks
- Produces: root HTML layout with Nunito font class + confetti Script; CSS classes consumed by all components

- [ ] **Step 1: Create app/globals.css**

```css
/* app/globals.css */

/* ===== RESET & BASE ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-nunito, 'Segoe UI', sans-serif);
  background: linear-gradient(135deg, #FFE0F0 0%, #FFF0E0 50%, #E0EEFF 100%);
  min-height: 100vh;
  overflow-x: hidden;
}

/* Animated background blobs */
body::before,
body::after {
  content: '';
  position: fixed;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.35;
  pointer-events: none;
  animation: blobFloat 8s ease-in-out infinite;
  z-index: 0;
}
body::before {
  width: 400px; height: 400px;
  background: #FF6B9D;
  top: -100px; left: -100px;
}
body::after {
  width: 350px; height: 350px;
  background: #60a5fa;
  bottom: -80px; right: -80px;
  animation-delay: -4s;
}
@keyframes blobFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50%       { transform: translateY(30px) scale(1.05); }
}

/* ===== UTILITY ===== */
.hidden { display: none !important; }

/* ===== POPUP OVERLAY ===== */
.popup-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 100;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.25s ease;
}
.popup-overlay.active { display: flex; }

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.popup-box {
  background: #fff;
  border-radius: 28px;
  padding: 36px 32px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  box-shadow: 0 24px 80px rgba(0,0,0,0.18);
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  z-index: 1;
}

@keyframes popIn {
  from { transform: scale(0.75) translateY(20px); opacity: 0; }
  to   { transform: scale(1)    translateY(0);    opacity: 1; }
}

.popup-emoji {
  font-size: 60px;
  margin-bottom: 10px;
  line-height: 1;
  animation: bounce 1s ease infinite alternate;
}
@keyframes bounce {
  from { transform: translateY(0); }
  to   { transform: translateY(-6px); }
}

.popup-box h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #2d2d2d;
  margin-bottom: 8px;
}
.popup-box p {
  font-size: 1rem;
  color: #777;
  margin-bottom: 24px;
  line-height: 1.55;
}

#result-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 20px;
  margin: 10px auto 14px;
  display: block;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  border: 3px solid #FFE0F0;
}

#result-label {
  font-size: 1.25rem;
  font-weight: 800;
  color: #e91e8c;
  margin-bottom: 20px;
}

/* ===== BUTTONS ===== */
.btn-primary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 36px;
  border: none;
  border-radius: 50px;
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  letter-spacing: 0.01em;
}
.btn-primary {
  background: linear-gradient(135deg, #FF6B9D, #FF9A3C);
  color: #fff;
  box-shadow: 0 6px 20px rgba(255,107,157,0.45);
}
.btn-primary:hover  { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(255,107,157,0.55); }
.btn-primary:active { transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

.btn-secondary {
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
  color: #fff;
  box-shadow: 0 6px 20px rgba(167,139,250,0.45);
}
.btn-secondary:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(167,139,250,0.55); }
.btn-secondary:active { transform: translateY(-1px); }

/* ===== WHEEL SCREEN ===== */
#screen-wheel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 20px;
  padding: 16px 20px 28px;
  position: relative;
  z-index: 1;
  width: 100%;
}

.title {
  font-size: 1.9rem;
  font-weight: 900;
  background: linear-gradient(135deg, #FF6B9D, #FF9A3C);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  line-height: 1.2;
}

/* ===== WHEEL CONTAINER ===== */
.wheel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(400px, 88vw);
}

.wheel-pointer {
  font-size: 32px;
  line-height: 1;
  color: #FF6B9D;
  filter: drop-shadow(0 2px 6px rgba(255,107,157,0.6));
  margin-bottom: -6px;
  animation: pointerBounce 1.5s ease-in-out infinite;
}
@keyframes pointerBounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(4px); }
}

#wheel-canvas {
  width: min(400px, 88vw);
  height: min(400px, 88vw);
  border-radius: 50%;
  box-shadow:
    0 12px 48px rgba(0,0,0,0.18),
    0 0 0 6px #fff,
    0 0 0 10px #FF6B9D,
    0 0 0 14px rgba(255,107,157,0.2);
}

/* ===== HISTORY PAGE ===== */
.history-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 16px 48px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.history-page .title {
  margin-bottom: 20px;
  font-size: 1.6rem;
}

.stats-bar {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 18px 22px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.07);
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  border: 1px solid rgba(255,107,157,0.15);
}

.stat-item { display: flex; flex-direction: column; gap: 3px; }
.stat-label { font-size: 0.8rem; color: #aaa; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-value { font-size: 1.3rem; font-weight: 900; color: #333; }

.history-list { display: flex; flex-direction: column; gap: 10px; }

.history-card {
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(8px);
  border-radius: 18px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid rgba(255,255,255,0.8);
  animation: slideIn 0.4s ease both;
  transition: transform 0.15s, box-shadow 0.15s;
}
.history-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }

@keyframes slideIn {
  from { transform: translateX(-16px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}

.history-card img {
  width: 60px; height: 60px;
  object-fit: cover;
  border-radius: 14px;
  flex-shrink: 0;
  border: 2px solid rgba(255,107,157,0.2);
}

.history-card-info { flex: 1; min-width: 0; }
.history-card-label { font-size: 1rem; font-weight: 800; color: #2d2d2d; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.history-card-time  { font-size: 0.8rem; color: #bbb; margin-top: 2px; }
.history-card-emoji { font-size: 26px; flex-shrink: 0; }

.loading-text { text-align: center; color: #bbb; padding: 48px 20px; font-size: 1rem; font-weight: 700; }

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .title { font-size: 1.5rem; }
  .popup-box { padding: 28px 22px; }
  .popup-emoji { font-size: 48px; }
  .btn-primary, .btn-secondary { padding: 13px 28px; font-size: 1rem; }
  #result-image { width: 130px; height: 130px; }
}
@media (max-width: 360px) {
  .title { font-size: 1.3rem; }
  #screen-wheel { gap: 14px; }
}
```

- [ ] **Step 2: Create app/layout.tsx**

```tsx
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
  title: 'Vòng Quay May Mắn 🎡',
  description: 'Quay vòng để biết hôm nay uống gì nha~'
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
```

- [ ] **Step 3: Verify dev server and check font loads**

```bash
npm run dev
```

Open `http://localhost:3000` — you'll see a 404 page but it should use Nunito font on the 404 text. Check Network tab — `confetti.browser.min.js` should be loaded.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: root layout with Nunito font, confetti script, global CSS"
```

---

### Task 4: API routes — POST /api/spin + GET /api/history

**Files:**
- Create: `app/api/spin/route.ts`
- Create: `app/api/history/route.ts`

**Interfaces:**
- Consumes: `getDb()` from `lib/mongodb.ts`
- Produces:
  - `POST /api/spin` — accepts `{ label, emoji, image }`, inserts into `spins`, returns `{ ok: true }`
  - `GET /api/history` — returns array of serialized SpinRecord `{ _id: string, label, emoji, image, createdAt: string | null }[]`

- [ ] **Step 1: Create app/api/spin/route.ts**

```typescript
// app/api/spin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { label, emoji, image } = body as { label?: string; emoji?: string; image?: string }

    if (!label || !emoji || !image) {
      return NextResponse.json({ error: 'Missing required fields: label, emoji, image' }, { status: 400 })
    }

    const db = await getDb()
    await db.collection('spins').insertOne({
      label,
      emoji,
      image,
      createdAt: new Date()
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[POST /api/spin]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create app/api/history/route.ts**

```typescript
// app/api/history/route.ts
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const db = await getDb()
    const raw = await db.collection('spins')
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray()

    const spins = raw.map(doc => ({
      _id: (doc._id as ObjectId).toString(),
      label: (doc.label as string) || 'Unknown',
      emoji: (doc.emoji as string) || '🎡',
      image: (doc.image as string) || '',
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : null
    }))

    return NextResponse.json(spins)
  } catch (e) {
    console.error('[GET /api/history]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
```

- [ ] **Step 3: Fill in real MONGODB_URI in .env.local**

Edit `.env.local` and replace the placeholder with the real Atlas connection string:
```
MONGODB_URI=mongodb+srv://REAL_USER:REAL_PASSWORD@REAL_CLUSTER.mongodb.net/luckywheel?retryWrites=true&w=majority
```

Restart `npm run dev` after editing `.env.local`.

- [ ] **Step 4: Test POST /api/spin with curl**

```bash
curl -X POST http://localhost:3000/api/spin \
  -H "Content-Type: application/json" \
  -d '{"label":"Test drink","emoji":"🧋","image":"https://example.com/img.jpg"}'
```

Expected response: `{"ok":true}`

Check MongoDB Atlas → luckywheel → spins collection → should see 1 document with `label`, `emoji`, `image`, `createdAt` fields.

- [ ] **Step 5: Test GET /api/history**

```bash
curl http://localhost:3000/api/history
```

Expected: JSON array with the test document: `[{"_id":"...","label":"Test drink","emoji":"🧋","image":"...","createdAt":"..."}]`

- [ ] **Step 6: Commit**

```bash
git add app/api/spin/route.ts app/api/history/route.ts
git commit -m "feat: API routes POST /api/spin and GET /api/history with MongoDB"
```

---

### Task 5: WelcomePopup + ResultPopup components

**Files:**
- Create: `components/WelcomePopup.tsx`
- Create: `components/ResultPopup.tsx`

**Interfaces:**
- Consumes: `WheelItem` from `lib/config.ts`
- Produces:
  - `WelcomePopup` — default export, props: `{ onStart: () => void }`
  - `ResultPopup` — default export, props: `{ item: WheelItem; onAgain: () => void }`

- [ ] **Step 1: Create components/WelcomePopup.tsx**

```tsx
// components/WelcomePopup.tsx
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
```

- [ ] **Step 2: Create components/ResultPopup.tsx**

```tsx
// components/ResultPopup.tsx
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
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/WelcomePopup.tsx components/ResultPopup.tsx
git commit -m "feat: WelcomePopup and ResultPopup client components"
```

---

### Task 6: WheelCanvas component

**Files:**
- Create: `components/WheelCanvas.tsx`

**Interfaces:**
- Consumes: `ITEMS: WheelItem[]` from `lib/config.ts`
- Produces: `WheelCanvas` — default export, props: `{ onResult: (item: WheelItem) => void }`; renders `<main id="screen-wheel">` with canvas and spin button

- [ ] **Step 1: Create components/WheelCanvas.tsx**

```tsx
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
        onResult(ITEMS[index])
      }
    }

    requestAnimationFrame(animate)
  }, [isSpinning, drawWheel, onResult])

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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/WheelCanvas.tsx
git commit -m "feat: WheelCanvas component with canvas drawing and spin animation"
```

---

### Task 7: app/page.tsx — wheel page

**Files:**
- Create: `app/page.tsx`

**Interfaces:**
- Consumes:
  - `WelcomePopup` — `{ onStart: () => void }`
  - `WheelCanvas` — `{ onResult: (item: WheelItem) => void }`
  - `ResultPopup` — `{ item: WheelItem; onAgain: () => void }`
  - `WheelItem` from `lib/config.ts`
- Produces: root route `/` — full interactive wheel page

- [ ] **Step 1: Create app/page.tsx**

```tsx
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
```

- [ ] **Step 2: Test full flow in browser**

```bash
npm run dev
```

Open `http://localhost:3000`:
1. Welcome popup appears with bounce emoji ✓
2. Click "Bắt đầu thôi!" — popup disappears, wheel canvas appears ✓
3. Click "✨ Quay!" — wheel spins 4-5 seconds with easing ✓
4. Wheel stops — result popup appears with item image, label, confetti ✓
5. Check MongoDB Atlas → spins collection → new document with correct fields ✓
6. Click "Quay lại!" — result popup closes, wheel visible again ✓

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: main wheel page orchestrating Welcome/Wheel/Result flow"
```

---

### Task 8: app/history/page.tsx — admin history page

**Files:**
- Create: `app/history/page.tsx`

**Interfaces:**
- Consumes: `getDb()` from `lib/mongodb.ts` (direct, server-side)
- Produces: server-rendered page at `/history` showing all spins sorted newest-first

- [ ] **Step 1: Create app/history/page.tsx**

```tsx
// app/history/page.tsx
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

interface SpinRecord {
  id: string
  label: string
  emoji: string
  image: string
  createdAt: string | null
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
```

- [ ] **Step 2: Test history page in browser**

Open `http://localhost:3000/history`:
1. Page loads without errors ✓
2. Stats bar shows total spin count ✓
3. Cards render with image, label, timestamp, emoji ✓
4. Cards ordered newest-first ✓
5. Spin a few more times on `/`, reload `/history` — new entries appear ✓

- [ ] **Step 3: Commit**

```bash
git add app/history/page.tsx
git commit -m "feat: server-rendered history page with MongoDB direct fetch"
```

---

### Task 9: Vercel deployment

**Files:**
- No new code — deploy existing repo

**Interfaces:**
- Consumes: all files at repo root
- Produces: live URL on Vercel; admin at `<project>.vercel.app/history`

- [ ] **Step 1: Push latest commits to GitHub**

```bash
git remote set-url origin https://github.com/thanhandp147/luckywheel.git
git push origin main
```

(Use a GitHub token if needed: `https://TOKEN@github.com/...`)

- [ ] **Step 2: Import to Vercel**

1. Go to https://vercel.com/new
2. Import `thanhandp147/luckywheel` from GitHub
3. Framework Preset: **Next.js** (auto-detected)
4. Root Directory: `.` (default)
5. Click **Deploy** — it will fail on first deploy because `MONGODB_URI` is not set yet. That's OK.

- [ ] **Step 3: Set MONGODB_URI env var in Vercel**

In Vercel project → Settings → Environment Variables:
- Key: `MONGODB_URI`
- Value: `mongodb+srv://REAL_USER:REAL_PASSWORD@REAL_CLUSTER.mongodb.net/luckywheel?retryWrites=true&w=majority`
- Environments: Production, Preview, Development

Click Save.

- [ ] **Step 4: Redeploy**

Vercel project → Deployments → click the latest deployment → **Redeploy**.

Wait ~60 seconds for build to finish.

- [ ] **Step 5: Verify live site**

Visit `https://<your-project>.vercel.app`:
1. Welcome popup appears ✓
2. Spin works ✓
3. Result saved — check MongoDB Atlas → spins collection ✓

Visit `https://<your-project>.vercel.app/history`:
1. Spin history shows ✓

- [ ] **Step 6: Disable GitHub Pages (optional)**

Old GitHub Pages URL now points to removed files. In GitHub repo → Settings → Pages → Source → **None** → Save.

---

## Summary

| Task | Deliverable |
|------|-------------|
| 1 | Old files removed, Next.js 14 scaffolded, mongodb installed |
| 2 | `lib/config.ts` (ITEMS) + `lib/mongodb.ts` (connection singleton) |
| 3 | Root layout with Nunito font + confetti + `globals.css` |
| 4 | `POST /api/spin` + `GET /api/history` API routes |
| 5 | `WelcomePopup` + `ResultPopup` client components |
| 6 | `WheelCanvas` client component with full spin logic |
| 7 | `app/page.tsx` — wheel page orchestrating all 3 components |
| 8 | `app/history/page.tsx` — server-rendered admin history |
| 9 | Deployed to Vercel with `MONGODB_URI` env var |

**Live URL:** `https://<project>.vercel.app/`
**Admin URL:** `https://<project>.vercel.app/history`
**Change items:** edit `lib/config.ts` → `git push` → Vercel auto-redeploys
