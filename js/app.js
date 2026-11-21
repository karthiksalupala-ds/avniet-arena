// ==============================================================
// AVNIET ARENA — MAIN CONTROLLER & APPLICATION ROUTER
// ==============================================================

function showSection(sectionKey) {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));

  if (sectionKey === 'dashboard') {
    const elView = document.getElementById('viewDashboard');
    const elBtn = document.getElementById('tabNavDashboard');
    if (elView) elView.classList.add('active');
    if (elBtn) elBtn.classList.add('active');
  } else if (sectionKey === 'exam') {
    const elView = document.getElementById('viewExam');
    const elBtn = document.getElementById('tabNavExam');
    if (elView) elView.classList.add('active');
    if (elBtn) elBtn.classList.add('active');
  } else if (sectionKey === 'results') {
    const elView = document.getElementById('viewResults');
    if (elView) elView.classList.add('active');
  } else if (sectionKey === 'games') {
    const elView = document.getElementById('viewGames');
    const elBtn = document.getElementById('tabNavGames');
    if (elView) elView.classList.add('active');
    if (elBtn) elBtn.classList.add('active');
    if (typeof openDeductiveGame === 'function') openDeductiveGame();
  } else if (sectionKey === 'leaderboard') {
    const elView = document.getElementById('viewLeaderboard');
    const elBtn = document.getElementById('tabNavLeaderboard');
    if (elView) elView.classList.add('active');
    if (elBtn) elBtn.classList.add('active');
    if (typeof renderLeaderboardTable === 'function') renderLeaderboardTable();
  }
}

// Application Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  if (typeof initStudent === 'function') initStudent();
  if (typeof renderLeaderboardTable === 'function') renderLeaderboardTable();
});
