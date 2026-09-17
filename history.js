import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const historyList  = document.getElementById('history-list');
const historyStats = document.getElementById('history-stats');

function formatDate(ts) {
  if (!ts) return 'Chưa rõ thời gian';
  try {
    const d = ts.toDate();
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return 'Chưa rõ thời gian';
  }
}

function buildStatsBar(docs) {
  const total = docs.length;
  if (total === 0) return '';

  const counts = {};
  docs.forEach(d => {
    const label = d.data().label || 'Unknown';
    counts[label] = (counts[label] || 0) + 1;
  });

  const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  return `
    <div class="stat-item">
      <span class="stat-label">Tổng số lần quay</span>
      <span class="stat-value">${total} lần</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Món được chọn nhiều nhất</span>
      <span class="stat-value">${topEntry ? topEntry[0] : '-'} (${topEntry ? topEntry[1] : 0} lần)</span>
    </div>
  `;
}

function buildCard(data, index) {
  const card = document.createElement('div');
  card.className = 'history-card';
  card.style.animationDelay = `${index * 0.06}s`;

  const img = document.createElement('img');
  img.src = data.image || '';
  img.alt = data.label || '';
  img.onerror = () => { img.style.display = 'none'; };

  const info = document.createElement('div');
  info.className = 'history-card-info';

  const labelEl = document.createElement('div');
  labelEl.className = 'history-card-label';
  labelEl.textContent = data.label || 'Unknown';

  const timeEl = document.createElement('div');
  timeEl.className = 'history-card-time';
  timeEl.textContent = formatDate(data.timestamp);

  info.appendChild(labelEl);
  info.appendChild(timeEl);

  const emojiEl = document.createElement('div');
  emojiEl.className = 'history-card-emoji';
  emojiEl.textContent = data.emoji || '🎡';

  card.appendChild(img);
  card.appendChild(info);
  card.appendChild(emojiEl);
  return card;
}

async function loadHistory() {
  try {
    // Fetch all, sort client-side — avoids Firestore composite index requirement
    const snapshot = await getDocs(collection(db, 'spins'));

    const docs = snapshot.docs.sort((a, b) => {
      const ta = a.data().timestamp;
      const tb = b.data().timestamp;
      if (!ta && !tb) return 0;
      if (!ta) return 1;
      if (!tb) return -1;
      return tb.toMillis() - ta.toMillis();
    });

    historyStats.innerHTML = buildStatsBar(docs);
    historyList.innerHTML = '';

    if (docs.length === 0) {
      historyList.innerHTML = '<p class="loading-text">Chưa có lần quay nào. 🎡</p>';
      return;
    }

    docs.forEach((doc, i) => historyList.appendChild(buildCard(doc.data(), i)));
  } catch (e) {
    historyList.innerHTML = `<p class="loading-text">Lỗi tải dữ liệu: ${e.message}</p>`;
    console.error(e);
  }
}

loadHistory();
