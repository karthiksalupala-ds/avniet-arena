// ==============================================================
// AVNIET ARENA — MAIN CONTROLLER & APPLICATION ROUTER
// ==============================================================

const TITLE_MAP = {
  dashboard: "Overview Dashboard",
  exam: "Sunday Placement Mock #01",
  results: "Assessment Performance Scorecard",
  games: "Company Cognitive Games",
  leaderboard: "Campus Placement Standings"
};

function showSection(sectionKey) {
  // Hide all view panes
  document.querySelectorAll('.view-pane').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));

  // Update Breadcrumb
  const titleEl = document.getElementById('topbarCurrentTitle');
  if (titleEl && TITLE_MAP[sectionKey]) {
    titleEl.innerText = TITLE_MAP[sectionKey];
  }

  // Close mobile sidebar if open
  const sidebar = document.getElementById('appSidebar');
  if (sidebar) sidebar.classList.remove('mobile-open');

  if (sectionKey === 'dashboard') {
    const elView = document.getElementById('viewDashboard');
    const elBtn = document.getElementById('sideNavDashboard');
    if (elView) elView.classList.add('active');
    if (elBtn) elBtn.classList.add('active');
  } else if (sectionKey === 'exam') {
    const elView = document.getElementById('viewExam');
    const elBtn = document.getElementById('sideNavExam');
    if (elView) elView.classList.add('active');
    if (elBtn) elBtn.classList.add('active');
  } else if (sectionKey === 'results') {
    const elView = document.getElementById('viewResults');
    if (elView) elView.classList.add('active');
  } else if (sectionKey === 'games') {
    const elView = document.getElementById('viewGames');
    const elBtn = document.getElementById('sideNavGames');
    if (elView) elView.classList.add('active');
    if (elBtn) elBtn.classList.add('active');
    if (typeof openDeductiveGame === 'function') openDeductiveGame();
  } else if (sectionKey === 'leaderboard') {
    const elView = document.getElementById('viewLeaderboard');
    const elBtn = document.getElementById('sideNavLeaderboard');
    if (elView) elView.classList.add('active');
    if (elBtn) elBtn.classList.add('active');
    if (typeof renderLeaderboardTable === 'function') renderLeaderboardTable();
  }
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('appSidebar');
  if (sidebar) {
    sidebar.classList.toggle('mobile-open');
  }
}

// Application Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  if (typeof initStudent === 'function') initStudent();
  if (typeof renderLeaderboardTable === 'function') renderLeaderboardTable();
});
