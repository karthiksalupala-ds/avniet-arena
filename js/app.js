// ==============================================================
// AVNIET ARENA — MAIN CONTROLLER & APPLICATION ROUTER
// Deep Linking & WhatsApp Focused Mode Support
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

// ==============================================================
// 🔗 DEEP LINKING ROUTER (Direct WhatsApp Game & Test Launch)
// ==============================================================
function initDeepLinkRouting() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  const game = params.get('game');
  const test = params.get('test');
  const roll = params.get('roll');

  // 1. If roll is supplied in URL, set student profile immediately
  if (roll && typeof currentStudent !== 'undefined') {
    currentStudent.roll = roll.trim().toUpperCase();
    if (typeof liveDetectStudentMeta === 'function') {
      const input = document.getElementById('inputModalRoll');
      if (input) input.value = currentStudent.roll;
      liveDetectStudentMeta();
      const bText = document.getElementById('metaBatchText');
      const dText = document.getElementById('metaBranchText');
      if (bText) currentStudent.batch = bText.innerText;
      if (dText) currentStudent.branch = dText.innerText;
    }
    localStorage.setItem('avnet_portal_student', JSON.stringify(currentStudent));
    if (typeof updateStudentUI === 'function') updateStudentUI();
  }

  // 2. Direct Game Launch (e.g. ?mode=game or ?game=deductive)
  if (mode === 'game' || game) {
    document.body.classList.add('standalone-focus-mode');
    const stripTitle = document.getElementById('standaloneStripTitle');
    if (stripTitle) stripTitle.innerText = "Capgemini Deductive Reasoning Challenge";
    showSection('games');
    if (typeof openDeductiveGame === 'function') openDeductiveGame();
    return;
  }

  // 3. Direct Test Launch (e.g. ?mode=test or ?test=mock01)
  if (mode === 'test' || test) {
    document.body.classList.add('standalone-focus-mode');
    const stripTitle = document.getElementById('standaloneStripTitle');
    if (stripTitle) stripTitle.innerText = "Sunday Placement Mock Assessment #01";
    showSection('exam');
    if (typeof startOfficialTest === 'function') startOfficialTest();
    return;
  }

  // 4. Direct Standings Launch (e.g. ?mode=leaderboard)
  if (mode === 'leaderboard') {
    showSection('leaderboard');
    return;
  }

  // Default: Open Dashboard
  showSection('dashboard');
}

function exitStandaloneMode() {
  document.body.classList.remove('standalone-focus-mode');
  // Clean URL without refresh
  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);
  showSection('dashboard');
}

// Copy WhatsApp Direct Share Links
function copyWhatsAppLink(type) {
  const baseUrl = window.location.origin + window.location.pathname;
  let targetUrl = baseUrl;
  let label = "Link";

  if (type === 'game') {
    targetUrl = `${baseUrl}?mode=game`;
    label = "Cognitive Game";
  } else if (type === 'test') {
    targetUrl = `${baseUrl}?mode=test`;
    label = "Placement Test";
  }

  navigator.clipboard.writeText(targetUrl).then(() => {
    alert(`✓ Direct WhatsApp ${label} Link Copied!\n\n${targetUrl}\n\nStudents clicking this link will open DIRECTLY into the challenge without any dashboard.`);
  }).catch(() => {
    prompt(`Copy this direct link for WhatsApp:`, targetUrl);
  });
}

// Application Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  if (typeof initStudent === 'function') initStudent();
  if (typeof renderLeaderboardTable === 'function') renderLeaderboardTable();
  initDeepLinkRouting();
});
