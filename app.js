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
  const displaySize = canvas.clientWidth || canvas.width;
  if (canvas.width !== displaySize) {
    canvas.width = displaySize;
    canvas.height = displaySize;
  }
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
