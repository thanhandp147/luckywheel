# Lucky Wheel — Next.js + MongoDB Migration Design

**Date:** 2026-09-17
**Status:** Approved

## Goal

Migrate the lucky wheel app from vanilla HTML/CSS/JS + Firebase Firestore to Next.js 14 (App Router) + MongoDB Atlas + Vercel. Preserve all existing features and UI; replace Firebase with MongoDB API routes.

## Architecture

Single Next.js app deployed to Vercel. API routes handle all database operations. MongoDB Atlas (free tier) stores spin results. No authentication layer — history page is security-by-obscurity at `/history`.

```
Browser → Next.js (Vercel)
            ├── app/page.tsx           (wheel UI — client components)
            ├── app/history/page.tsx   (admin — server component)
            ├── app/api/spin/route.ts  (POST — save spin to MongoDB)
            └── app/api/history/route.ts (GET — fetch spins)
                    ↓
            lib/mongodb.ts             (connection singleton)
                    ↓
            MongoDB Atlas — collection: spins
```

## Tech Stack

- **Next.js 14** — App Router, TypeScript
- **mongodb** npm package (native driver) — no Mongoose
- **Vercel** — deployment, env vars for `MONGODB_URI`
- **canvas-confetti** — CDN via Script tag in layout
- **Nunito** font via `next/font/google`

## Global Constraints

- Next.js 14.x, React 18.x
- TypeScript strict mode
- `mongodb` package version `^6.x`
- No Mongoose, no ORM
- `MONGODB_URI` env var — required in `.env.local` and Vercel dashboard
- MongoDB collection name: `spins`
- History URL: `/history` (no auth)
- Keep existing color palette, animations, UI feel from current `style.css`
- canvas-confetti loaded via `<Script>` in layout, available as `window.confetti`

## File Structure

Old files deleted first: `index.html`, `history.html`, `style.css`, `app.js`, `history.js`, `config.js`, `firebase-config.js`

```
luckywheel/                ← same repo, old files removed, Next.js scaffolded here
├── app/
│   ├── layout.tsx         ← root layout: Nunito font, confetti Script, global CSS
│   ├── globals.css        ← port of style.css — plain CSS, no Tailwind
│   ├── page.tsx           ← wheel page — manages step state, composes popups + wheel
│   ├── history/
│   │   └── page.tsx       ← server component — direct MongoDB fetch, renders cards
│   └── api/
│       ├── spin/
│       │   └── route.ts   ← POST /api/spin
│       └── history/
│           └── route.ts   ← GET /api/history
├── components/
│   ├── WelcomePopup.tsx   ← 'use client' — welcome modal
│   ├── WheelCanvas.tsx    ← 'use client' — canvas wheel + spin logic
│   └── ResultPopup.tsx    ← 'use client' — result modal + confetti trigger
├── lib/
│   ├── mongodb.ts         ← connection singleton (cached across hot reloads)
│   └── config.ts          ← ITEMS array + WheelItem type
├── .env.local             ← MONGODB_URI=mongodb+srv://...
├── next.config.js
├── tsconfig.json
└── package.json
```

## Data Model

### SpinRecord (MongoDB document)
```ts
interface SpinRecord {
  _id: ObjectId        // auto-generated
  label: string        // e.g. "Trà sữa trân châu"
  emoji: string        // e.g. "🧋"
  image: string        // HTTPS URL
  createdAt: Date      // new Date() at insert time
}
```

### WheelItem (config)
```ts
interface WheelItem {
  label: string
  image: string   // HTTPS URL
  color: string   // hex
  emoji: string
}
```

## API Routes

### POST /api/spin
- **Body:** `{ label: string, emoji: string, image: string }`
- **Action:** Insert one document into `spins` with `createdAt: new Date()`
- **Response:** `{ ok: true }` (200) or `{ error: string }` (500)
- **Validation:** All three fields must be non-empty strings

### GET /api/history
- **Action:** Find all from `spins`, sort `{ createdAt: -1 }`, limit 200
- **Response:** `SpinRecord[]` serialized as JSON (ObjectId → string)
- **Used by:** history page client fallback only; primary fetch is server-side

## Components

### `lib/mongodb.ts`
Connection singleton — reuses existing connection across Next.js hot reloads in dev and across serverless function invocations in prod (via module-level cache).

```ts
declare global { var _mongoClientPromise: Promise<MongoClient> | undefined }

const uri = process.env.MONGODB_URI!
const client = new MongoClient(uri)
const clientPromise: Promise<MongoClient> =
  global._mongoClientPromise ?? (global._mongoClientPromise = client.connect())

export default clientPromise
export async function getDb() {
  const c = await clientPromise
  return c.db('luckywheel')   // explicit db name; Atlas URI must include /luckywheel or use this override
}
```

### `lib/config.ts`
Port of existing `config.js`. TypeScript. ITEMS array unchanged (8 Vietnamese drink items with Unsplash image URLs).

### `app/layout.tsx`
- Root layout with `<html lang="vi">`
- Nunito via `next/font/google`
- canvas-confetti via `<Script src="..." strategy="beforeInteractive" />`
- Import `globals.css`

### `app/page.tsx`
Client component (`'use client'`). Manages step state: `'welcome' | 'wheel' | 'result'`. Holds `selectedItem: WheelItem | null`. Renders:
- `<WelcomePopup>` when step === 'welcome'
- `<WheelCanvas>` always (hidden when not 'wheel' step)
- `<ResultPopup>` when step === 'result'

On spin result: calls `POST /api/spin`, transitions to 'result' step.

### `components/WheelCanvas.tsx`
`'use client'`. Props: `onResult: (item: WheelItem) => void`. Contains:
- `useRef` for canvas
- `drawWheel(angle)` — port of existing canvas drawing logic
- `spin()` — easing animation, RAF loop
- `onSpinEnd()` — calculates segment at pointer, calls `onResult`

### `components/WelcomePopup.tsx`
`'use client'`. Props: `onStart: () => void`. Renders welcome modal with bounce emoji, greeting text, start button.

### `components/ResultPopup.tsx`
`'use client'`. Props: `item: WheelItem | null, onAgain: () => void`. Fires confetti on mount via `useEffect`. Renders result image, label, emoji, spin-again button.

### `app/history/page.tsx`
Server Component. Calls `getDb()` directly — no API round trip. Fetches all spins sorted by `createdAt` desc. Renders stats bar (total, most-picked) and history cards. No `'use client'`.

## Deployment

1. Push same `luckywheel/` repo to GitHub (already connected to `thanhandp147/luckywheel`)
2. Import repo to Vercel → set `MONGODB_URI` env var
3. Vercel auto-deploys on push to `main`

## Migration Notes

- Old vanilla HTML/JS/Firebase files deleted in Task 1
- Existing spin data in Firebase is NOT migrated (clean slate)
- GitHub Pages will break after old files removed — disable Pages in repo settings
- New URL: Vercel-assigned (e.g. `luckywheel.vercel.app`)
