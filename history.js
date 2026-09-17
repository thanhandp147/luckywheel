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
