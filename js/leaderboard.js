// ==============================================================
// CAMPUS LEADERBOARD / HALL OF FAME MODULE
// ==============================================================

let leaderboardData = [
  { roll: "23xx1A0512", branch: "CSE", batch: "2027", score: 28, accuracy: "93%", time: "11m 45s" },
  { roll: "24xx1A1208", branch: "IT", batch: "2028", score: 26, accuracy: "90%", time: "12m 10s" },
  { roll: "24xx1A6634", branch: "CSM", batch: "2028", score: 25, accuracy: "88%", time: "13m 05s" },
  { roll: "23xx1A0445", branch: "ECE", batch: "2027", score: 23, accuracy: "85%", time: "13m 50s" },
  { roll: "25xx1A6704", branch: "CSD", batch: "2029", score: 22, accuracy: "82%", time: "14m 12s" },
  { roll: "24xx1A0589", branch: "CSE", batch: "2028", score: 20, accuracy: "80%", time: "14m 30s" }
];

function addLeaderboardEntry(roll, branch, batch, score, accuracy, timeStr) {
  leaderboardData.push({
    roll: roll,
    branch: branch,
    batch: batch,
    score: score,
    accuracy: accuracy,
    time: timeStr
  });
  leaderboardData.sort((a, b) => b.score - a.score);
}

function renderLeaderboardTable() {
  const batchEl = document.getElementById('leaderboardBatchFilter');
  const deptEl = document.getElementById('leaderboardDeptFilter');
  const batchF = batchEl ? batchEl.value : 'ALL';
  const deptF = deptEl ? deptEl.value : 'ALL';

  const tbody = document.getElementById('leaderboardTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  let rank = 1;
  leaderboardData.forEach(row => {
    if (batchF !== 'ALL' && row.batch !== batchF) return;
    if (deptF !== 'ALL' && row.branch !== deptF) return;

    let rankCls = '';
    if (rank === 1) rankCls = 'gold';
    else if (rank === 2) rankCls = 'silver';
    else if (rank === 3) rankCls = 'bronze';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="rank-cell-badge ${rankCls}">#${rank}</span></td>
      <td>
        <div style="display: flex; flex-direction: column;">
          <span style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--text-primary);">${row.roll}</span>
          <span style="font-size: 11px; color: var(--text-tertiary);">Batch ${row.batch} • ${row.branch}</span>
        </div>
      </td>
      <td><span style="font-family: 'JetBrains Mono', monospace; font-weight: 800; color: var(--accent-emerald);">${row.score} pts</span></td>
      <td><span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--text-secondary);">${row.accuracy}</span></td>
      <td><span style="color: var(--text-tertiary); font-size: 13px;">${row.time}</span></td>
      <td><span style="background: rgba(16, 185, 129, 0.12); color: var(--accent-emerald); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px;">VERIFIED</span></td>
    `;
    tbody.appendChild(tr);
    rank++;
  });
}
