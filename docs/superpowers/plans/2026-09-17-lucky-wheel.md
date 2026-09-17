# Lucky Wheel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fun lucky wheel webpage for a girlfriend to spin and get random drink suggestions, with all results saved to Firebase Firestore and viewable on an admin history page.

**Architecture:** Single-page vanilla HTML/CSS/JS app with no build step. `config.js` holds all configurable items. Firebase SDK loaded via CDN. Wheel drawn on HTML5 Canvas. Admin page at `history.html` reads all Firestore records.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript (ES modules via CDN), Firebase Firestore v9 (CDN), canvas-confetti (CDN)

**Spec:** No separate spec file — design approved in chat on 2026-09-17.

## Global Constraints

- No build tools, no npm, no bundler — everything runs directly in browser
- Firebase SDK loaded from `https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js` and `firebase-firestore.js`
- canvas-confetti loaded from `https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js`
- All image URLs in `config.js` must be HTTPS remote links (no local files)
- Admin page URL: `history.html` — no password, security by obscurity
- GitHub Pages deployment: repo must be public, branch `main`, source `/` (root)

---

### Task 1: Git init + project scaffold

**Files:**
- Create: `index.html` (skeleton only)
- Create: `history.html` (skeleton only)
- Create: `style.css` (empty)
- Create: `app.js` (empty)
- Create: `history.js` (empty)
- Create: `config.js` (empty)
- Create: `firebase-config.js` (empty — user fills Firebase credentials here)
- Create: `.gitignore`

**Interfaces:**
- Consumes: nothing
- Produces: file structure all tasks build on

- [ ] **Step 1: Init git repo**

```bash
cd /Users/lethanhan/Documents/luckywheel
git init
```

- [ ] **Step 2: Create .gitignore**

```
.DS_Store
*.env
```

- [ ] **Step 3: Create index.html skeleton**

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vong Quay May Man</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <!-- Welcome popup -->
  <div id="popup-welcome" class="popup-overlay active">
    <div class="popup-box">
      <div class="popup-emoji">🎉</div>
      <h2 id="welcome-title">Chao mung em yeu!</h2>
      <p id="welcome-message">Quay de biet hom nay uong gi nha~</p>
      <button id="btn-start" class="btn-primary">Bat dau thoi!</button>
    </div>
  </div>

  <!-- Result popup -->
  <div id="popup-result" class="popup-overlay">
    <div class="popup-box">
      <div id="result-emoji" class="popup-emoji">🎊</div>
      <h2>Ket qua cua em!</h2>
      <img id="result-image" src="" alt="" />
      <p id="result-label"></p>
      <button id="btn-again" class="btn-secondary">Quay lai!</button>
    </div>
  </div>

  <!-- Main wheel screen -->
  <main id="screen-wheel" class="hidden">
    <h1 class="title">Vong Quay May Man</h1>
    <div class="wheel-container">
      <div class="wheel-pointer">▼</div>
      <canvas id="wheel-canvas" width="400" height="400"></canvas>
    </div>
    <button id="btn-spin" class="btn-primary">Quay!</button>
  </main>

  <script type="module" src="firebase-config.js"></script>
  <script type="module" src="config.js"></script>
  <script type="module" src="app.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create history.html skeleton**

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lich su quay</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main class="history-page">
    <h1 class="title">Lich su tat ca cac lan quay</h1>
    <div id="history-stats" class="stats-bar"></div>
    <div id="history-list" class="history-list">
      <p class="loading-text">Dang tai...</p>
    </div>
  </main>
  <script type="module" src="firebase-config.js"></script>
  <script type="module" src="history.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create empty placeholder files**

Create `style.css`, `app.js`, `history.js`, `config.js`, `firebase-config.js` — each as empty files.

- [ ] **Step 6: Open index.html in browser, verify it loads without errors**

Open `index.html` directly in browser (file:// URL). Check browser console — no JS errors expected at this stage.

- [ ] **Step 7: Commit**

```bash
git add index.html history.html style.css app.js history.js config.js firebase-config.js .gitignore
git commit -m "feat: project scaffold with HTML skeletons"
```

---

### Task 2: Firebase setup + firebase-config.js

**Files:**
- Modify: `firebase-config.js`

**Interfaces:**
- Consumes: nothing
- Produces: `window.__db` — Firestore database instance, available globally for `app.js` and `history.js`

**Manual steps (user must do these in Firebase Console):**

1. Go to https://console.firebase.google.com
2. Create new project (e.g. "luckywheel")
3. Add a Web app — get the `firebaseConfig` object
4. Go to Firestore Database → Create database → Start in **test mode** → choose region
5. Copy the config values into `firebase-config.js` below

- [ ] **Step 1: Write firebase-config.js**

```js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Replace these values with your Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

- [ ] **Step 2: Verify — open index.html via a local server (not file://)**

Firebase SDK requires HTTP, not file://. Use VS Code Live Server, or run:
```bash
npx serve . -p 3000
```
Open http://localhost:3000. Console should show no Firebase errors (may show "missing credentials" until real config is pasted).

- [ ] **Step 3: User fills in real Firebase credentials**

Replace all `YOUR_*` placeholders in `firebase-config.js` with values from Firebase Console.

- [ ] **Step 4: Verify connection — open browser console**

After pasting real config, reload page. No `Firebase: Error` messages = connection OK.

- [ ] **Step 5: Commit**

```bash
git add firebase-config.js
git commit -m "feat: Firebase Firestore connection setup"
```

---

### Task 3: config.js — configurable items

**Files:**
- Modify: `config.js`

**Interfaces:**
- Consumes: nothing
- Produces: `ITEMS` — exported array of `{ label: string, image: string, color: string, emoji: string }` used by `app.js` to draw wheel segments and display results

- [ ] **Step 1: Write config.js with sample drink items**

```js
// config.js
// To change items: edit this array and refresh the page.
// - label: ten hien thi tren vong quay va popup ket qua
// - image: URL anh cua mon do uong (HTTPS)
// - color: mau nen cua o tren vong quay (hex)
// - emoji: emoji hien thi trong popup ket qua

export const ITEMS = [
  {
    label: "Tra sua tran chau",
    image: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=400",
    color: "#FF6B9D",
    emoji: "🧋"
  },
  {
    label: "Matcha latte",
    image: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=400",
    color: "#7BC67E",
    emoji: "🍵"
  },
  {
    label: "Hong tra sua",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
    color: "#FFB347",
    emoji: "🫖"
  },
  {
    label: "Sinh to xoai",
    image: "https://images.unsplash.com/photo-1553177595-4de6a86bcd44?w=400",
    color: "#FFD700",
    emoji: "🥭"
  },
  {
    label: "Nuoc ep dua hau",
    image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400",
    color: "#FF4D6D",
    emoji: "🍉"
  },
  {
    label: "Ca phe sua da",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400",
    color: "#8B4513",
    emoji: "☕"
  },
  {
    label: "Soda chanh",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400",
    color: "#90EE90",
    emoji: "🍋"
  },
  {
    label: "Kem tra xanh",
    image: "https://images.unsplash.com/photo-1567206563114-c179706a56dc?w=400",
    color: "#98FB98",
    emoji: "🍦"
  }
];
```

- [ ] **Step 2: Verify in browser console**

Open browser console on index.html, type:
```js
import('./config.js').then(m => console.log(m.ITEMS))
```
Should log array of 8 items.

- [ ] **Step 3: Commit**

```bash
git add config.js
git commit -m "feat: configurable drink items in config.js"
```

---

### Task 4: style.css — full styles

**Files:**
- Modify: `style.css`

**Interfaces:**
- Consumes: HTML class names defined in Task 1
- Produces: complete visual styling for wheel page, popups, and history page

- [ ] **Step 1: Write style.css**

```css
/* ===== RESET & BASE ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  background: linear-gradient(135deg, #FFE0F0 0%, #FFF0E0 50%, #E0F0FF 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* ===== UTILITY ===== */
.hidden { display: none !important; }

/* ===== POPUP OVERLAY ===== */
.popup-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 100;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}
.popup-overlay.active { display: flex; }

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.popup-box {
  background: #fff;
  border-radius: 24px;
  padding: 40px 36px;
  max-width: 380px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popIn {
  from { transform: scale(0.7); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.popup-emoji {
  font-size: 56px;
  margin-bottom: 12px;
  line-height: 1;
}

.popup-box h2 {
  font-size: 1.6rem;
  color: #333;
  margin-bottom: 10px;
}

.popup-box p {
  font-size: 1rem;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

/* Result popup image */
#result-image {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 16px;
  margin: 12px auto;
  display: block;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

#result-label {
  font-size: 1.3rem;
  font-weight: 700;
  color: #e91e8c;
  margin-bottom: 24px !important;
}

/* ===== BUTTONS ===== */
.btn-primary, .btn-secondary {
  display: inline-block;
  padding: 14px 36px;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
  letter-spacing: 0.02em;
}

.btn-primary {
  background: linear-gradient(135deg, #FF6B9D, #FF9A3C);
  color: #fff;
  box-shadow: 0 6px 20px rgba(255,107,157,0.4);
}

.btn-primary:hover  { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,107,157,0.5); }
.btn-primary:active { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.btn-secondary {
  background: linear-gradient(135deg, #a78bfa, #60a5fa);
  color: #fff;
  box-shadow: 0 6px 20px rgba(167,139,250,0.4);
}

.btn-secondary:hover { transform: translateY(-2px); }

/* ===== MAIN WHEEL SCREEN ===== */
#screen-wheel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 20px;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #FF6B9D, #FF9A3C);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
}

/* ===== WHEEL CONTAINER ===== */
.wheel-container {
  position: relative;
  width: 400px;
  height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wheel-pointer {
  font-size: 36px;
  line-height: 1;
  z-index: 10;
  color: #FF6B9D;
  text-shadow: 0 2px 8px rgba(255,107,157,0.5);
  margin-bottom: -8px;
}

#wheel-canvas {
  border-radius: 50%;
  box-shadow: 0 8px 40px rgba(0,0,0,0.2), 0 0 0 6px #fff, 0 0 0 10px #FF6B9D;
}

/* ===== HISTORY PAGE ===== */
.history-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 20px;
  width: 100%;
}

.history-page .title {
  margin-bottom: 24px;
}

.stats-bar {
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label { font-size: 0.85rem; color: #999; }
.stat-value { font-size: 1.4rem; font-weight: 800; color: #333; }

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateX(-20px); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}

.history-card img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
}

.history-card-info { flex: 1; }
.history-card-label { font-size: 1.1rem; font-weight: 700; color: #333; }
.history-card-time  { font-size: 0.85rem; color: #999; margin-top: 2px; }
.history-card-emoji { font-size: 28px; }

.loading-text { text-align: center; color: #999; padding: 40px; }

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .wheel-container { width: 300px; height: 320px; }
  #wheel-canvas { width: 300px; height: 300px; }
  .title { font-size: 1.5rem; }
}
```

- [ ] **Step 2: Verify — reload index.html in browser**

Welcome popup should be visible with gradient background, white card, rounded button. No layout broken.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: full CSS styles for wheel, popups, and history page"
```

---

### Task 5: app.js — wheel drawing, spin logic, Firebase write

**Files:**
- Modify: `app.js`

**Interfaces:**
- Consumes: `ITEMS` from `config.js`, `db` from `firebase-config.js`
- Produces: complete interactive wheel functionality; writes `{ label, emoji, timestamp }` to Firestore collection `"spins"`

- [ ] **Step 1: Write app.js**

```js
import { ITEMS } from './config.js';
import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── DOM refs ──────────────────────────────────────────────
const popupWelcome = document.getElementById('popup-welcome');
const popupResult  = document.getElementById('popup-result');
const screenWheel  = document.getElementById('screen-wheel');
const btnStart     = document.getElementById('btn-start');
const btnSpin      = document.getElementById('btn-spin');
const btnAgain     = document.getElementById('btn-again');
const canvas       = document.getElementById('wheel-canvas');
const resultImage  = document.getElementById('result-image');
const resultLabel  = document.getElementById('result-label');
const resultEmoji  = document.getElementById('result-emoji');
const ctx          = canvas.getContext('2d');

// ── State ─────────────────────────────────────────────────
let currentAngle = 0;   // current rotation of wheel (radians)
let isSpinning   = false;

// ── Draw wheel ────────────────────────────────────────────
function drawWheel(rotationAngle) {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r  = cx - 4;
  const sliceAngle = (2 * Math.PI) / ITEMS.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ITEMS.forEach((item, i) => {
    const start = rotationAngle + i * sliceAngle;
    const end   = start + sliceAngle;

    // Slice fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label text
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Segoe UI, sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 3;

    // Wrap long labels
    const maxWidth = r - 30;
    const words = item.label.split(' ');
    let line = '';
    const lines = [];
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    lines.push(line);

    const lineHeight = 16;
    const startY = -(lines.length - 1) * lineHeight / 2;
    lines.forEach((l, li) => {
      ctx.fillText(l, r - 16, startY + li * lineHeight);
    });

    ctx.restore();
  });

  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#FF6B9D';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Center emoji
  ctx.font = '20px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🎡', cx, cy);
}

// ── Spin ──────────────────────────────────────────────────
function spin() {
  if (isSpinning) return;
  isSpinning = true;
  btnSpin.disabled = true;

  const extraSpins  = 5 + Math.floor(Math.random() * 5); // 5-9 full rotations
  const targetAngle = currentAngle + extraSpins * 2 * Math.PI + Math.random() * 2 * Math.PI;
  const duration    = 4000 + Math.random() * 1500; // 4-5.5 seconds
  const startTime   = performance.now();
  const startAngle  = currentAngle;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animate(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    currentAngle   = startAngle + (targetAngle - startAngle) * easeOut(progress);

    drawWheel(currentAngle);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      btnSpin.disabled = false;
      onSpinEnd();
    }
  }

  requestAnimationFrame(animate);
}

// ── Result ────────────────────────────────────────────────
function onSpinEnd() {
  const sliceAngle = (2 * Math.PI) / ITEMS.length;
  // Pointer is at top (270 degrees = -PI/2). Find which segment is at top.
  const normalized = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const pointerAngle = (2 * Math.PI - normalized + 3 * Math.PI / 2) % (2 * Math.PI);
  const index = Math.floor(pointerAngle / sliceAngle) % ITEMS.length;
  const item  = ITEMS[index];

  showResult(item);
  saveResult(item);
}

function showResult(item) {
  resultEmoji.textContent  = item.emoji;
  resultImage.src          = item.image;
  resultImage.alt          = item.label;
  resultLabel.textContent  = item.label;
  popupResult.classList.add('active');

  // Confetti
  confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
  setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.5 } }), 400);
}

async function saveResult(item) {
  try {
    await addDoc(collection(db, 'spins'), {
      label:     item.label,
      emoji:     item.emoji,
      image:     item.image,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error('Failed to save result:', e);
  }
}

// ── Event listeners ───────────────────────────────────────
btnStart.addEventListener('click', () => {
  popupWelcome.classList.remove('active');
  screenWheel.classList.remove('hidden');
  drawWheel(currentAngle);
});

btnSpin.addEventListener('click', spin);

btnAgain.addEventListener('click', () => {
  popupResult.classList.remove('active');
});

// ── Init ──────────────────────────────────────────────────
// confetti loaded via CDN script tag — add to index.html in next step
drawWheel(currentAngle);
```

- [ ] **Step 2: Add confetti CDN script to index.html**

In `index.html`, add before the closing `</body>` tag, BEFORE the module scripts:

```html
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
```

- [ ] **Step 3: Verify wheel renders**

Open browser, click "Bat dau thoi!" — wheel should appear drawn on canvas with colored segments and labels.

- [ ] **Step 4: Verify spin works**

Click "Quay!" — wheel should spin with easing animation (4-5 seconds), stop, show result popup with correct item image and label. Confetti should fire.

- [ ] **Step 5: Verify Firestore write**

After spinning, open Firebase Console → Firestore → `spins` collection. A new document should appear with `label`, `emoji`, `image`, `timestamp` fields.

- [ ] **Step 6: Commit**

```bash
git add app.js index.html
git commit -m "feat: wheel drawing, spin animation, result popup, Firestore save"
```

---

### Task 6: history.js — admin history page

**Files:**
- Modify: `history.js`

**Interfaces:**
- Consumes: `db` from `firebase-config.js`; reads Firestore collection `"spins"` ordered by `timestamp` descending
- Produces: rendered history cards + stats bar on `history.html`

- [ ] **Step 1: Write history.js**

```js
import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const historyList  = document.getElementById('history-list');
const historyStats = document.getElementById('history-stats');

function formatDate(ts) {
  if (!ts) return 'Chua ro thoi gian';
  const d = ts.toDate();
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function buildStatsBar(docs) {
  const total = docs.length;
  if (total === 0) return '';

  // Count by label
  const counts = {};
  docs.forEach(d => {
    const label = d.data().label || 'Unknown';
    counts[label] = (counts[label] || 0) + 1;
  });

  const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const topLabel = topEntry ? topEntry[0] : '-';

  return `
    <div class="stat-item">
      <span class="stat-label">Tong so lan quay</span>
      <span class="stat-value">${total}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Mon duoc chon nhieu nhat</span>
      <span class="stat-value">${topLabel} (${topEntry ? topEntry[1] : 0} lan)</span>
    </div>
  `;
}

function buildCard(doc) {
  const data = doc.data();
  const card = document.createElement('div');
  card.className = 'history-card';
  card.innerHTML = `
    <img src="${data.image || ''}" alt="${data.label}" onerror="this.style.display='none'" />
    <div class="history-card-info">
      <div class="history-card-label">${data.label || 'Unknown'}</div>
      <div class="history-card-time">${formatDate(data.timestamp)}</div>
    </div>
    <div class="history-card-emoji">${data.emoji || '🎡'}</div>
  `;
  return card;
}

async function loadHistory() {
  try {
    const q = query(collection(db, 'spins'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    historyStats.innerHTML = buildStatsBar(snapshot.docs);

    historyList.innerHTML = '';

    if (snapshot.empty) {
      historyList.innerHTML = '<p class="loading-text">Chua co lan quay nao.</p>';
      return;
    }

    snapshot.docs.forEach(doc => {
      historyList.appendChild(buildCard(doc));
    });
  } catch (e) {
    historyList.innerHTML = `<p class="loading-text">Loi tai du lieu: ${e.message}</p>`;
    console.error(e);
  }
}

loadHistory();
```

- [ ] **Step 2: Verify history page**

Open `history.html` in browser (via local server). After spinning at least once on index page, history page should show: stat bar with total count + most-picked item, and a card per spin with image, label, and timestamp.

- [ ] **Step 3: Commit**

```bash
git add history.js
git commit -m "feat: admin history page with stats and spin cards"
```

---

### Task 7: GitHub Pages deployment

**Files:**
- No new files — deploy existing root

**Interfaces:**
- Consumes: all files at repo root
- Produces: live public URL for girlfriend; admin URL at `<username>.github.io/<repo>/history.html`

- [ ] **Step 1: Create GitHub repo**

Go to https://github.com/new. Create a **public** repo named `luckywheel` (or any name). Do NOT initialize with README.

- [ ] **Step 2: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/luckywheel.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: Enable GitHub Pages**

In repo → Settings → Pages → Source: "Deploy from a branch" → Branch: `main` → Folder: `/ (root)` → Save.

- [ ] **Step 4: Wait ~60 seconds, then verify**

Visit `https://YOUR_USERNAME.github.io/luckywheel/`. Welcome popup should appear.

- [ ] **Step 5: Update Firebase authorized domains**

In Firebase Console → Authentication → Settings → Authorized domains → Add `YOUR_USERNAME.github.io`.

Also in Firestore Rules, confirm test mode allows reads/writes (for now):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

- [ ] **Step 6: Verify spin + save on live URL**

Open live GitHub Pages URL. Spin the wheel. Check Firebase Console — new document should appear in `spins` collection.

- [ ] **Step 7: Final commit (if any config changes needed)**

```bash
git add -A
git commit -m "feat: GitHub Pages deployment verified"
git push origin main
```

---

## Summary

| Task | Deliverable |
|------|-------------|
| 1 | Git repo + HTML skeletons for all pages |
| 2 | Firebase Firestore connection |
| 3 | Configurable drink items in `config.js` |
| 4 | Full CSS with animations, popups, history styles |
| 5 | Wheel canvas, spin animation, result popup, confetti, Firestore write |
| 6 | Admin history page with stats |
| 7 | Live on GitHub Pages |

**Send girlfriend:** `https://YOUR_USERNAME.github.io/luckywheel/`
**Admin (you only):** `https://YOUR_USERNAME.github.io/luckywheel/history.html`
