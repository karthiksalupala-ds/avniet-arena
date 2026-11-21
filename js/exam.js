// ==============================================================
// TCS iON / HACKERRANK STYLE ASSESSMENT ENGINE
// With Anti-WhatsApp Shuffling & Proctoring Hooks
// ==============================================================

let currentIdx = 0;
let examStates = {};
const EXAM_TOTAL_SECONDS = 15 * 60;
let timerRemaining = EXAM_TOTAL_SECONDS;
let examTimerInterval = null;
let activeQuestions = [];

// Randomized Question & Option Shuffling (Anti-WhatsApp group leaks)
function prepareShuffledContest() {
  const cloned = JSON.parse(JSON.stringify(EXAM_QUESTIONS));

  // 1. Shuffle Question Order (Fisher-Yates)
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }

  // 2. Permute Options for each Question
  cloned.forEach(q => {
    const correctText = q.options[q.correct];
    for (let i = q.options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
    }
    // Re-index correct answer to new shuffled position
    q.correct = q.options.indexOf(correctText);
  });

  activeQuestions = cloned;
}

function startOfficialTest() {
  if (typeof showSection === 'function') {
    showSection('exam');
  }

  // Prepare randomized instance of the contest
  prepareShuffledContest();

  // Reset exam question states
  examStates = {};
  for (let i = 0; i < activeQuestions.length; i++) {
    examStates[i] = {
      selected: null,
      isMarked: false,
      visited: false
    };
  }
  currentIdx = 0;
  timerRemaining = EXAM_TOTAL_SECONDS;

  examStates[0].visited = true;
  renderActiveQuestion();
  renderTCSQuestionPalette();
  startExamTimer();

  // Activate AI Proctoring & Lockdown Shield
  if (typeof ProctorEngine !== 'undefined') {
    ProctorEngine.startSession();
  }
}

function startExamTimer() {
  if (examTimerInterval) clearInterval(examTimerInterval);
  refreshTimerClockDisplay();

  examTimerInterval = setInterval(() => {
    timerRemaining--;
    refreshTimerClockDisplay();

    if (timerRemaining <= 0) {
      clearInterval(examTimerInterval);
      alert("Time is up! Submitting your test automatically.");
      executeFinalSubmit();
    }
  }, 1000);
}

function refreshTimerClockDisplay() {
  const mins = Math.floor(timerRemaining / 60);
  const secs = timerRemaining % 60;
  const str = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const disp = document.getElementById('examClockDisplay');
  if (disp) {
    disp.innerText = str;
    if (timerRemaining < 180) {
      disp.classList.add('danger');
    } else {
      disp.classList.remove('danger');
    }
  }
}

function renderActiveQuestion() {
  if (!activeQuestions || activeQuestions.length === 0) {
    prepareShuffledContest();
  }
  const q = activeQuestions[currentIdx];
  examStates[currentIdx].visited = true;

  const qNumTag = document.getElementById('currentQNumTag');
  const qTopicTag = document.getElementById('currentQTopicTag');
  const qStem = document.getElementById('currentQStem');

  if (qNumTag) qNumTag.innerText = `Question No. ${currentIdx + 1} of ${activeQuestions.length}`;
  if (qTopicTag) qTopicTag.innerText = q.topic;
  if (qStem) qStem.innerText = q.question;

  // Proctoring time logger
  if (typeof ProctorEngine !== 'undefined') {
    ProctorEngine.logQuestionStart(currentIdx);
  }

  // Toggle button label
  const btnMark = document.getElementById('btnToggleMarkReview');
  if (btnMark) {
    btnMark.innerText = examStates[currentIdx].isMarked ? "Unmark Review" : "Mark for Review & Next";
  }

  // Render options list
  const container = document.getElementById('currentOptionsList');
  if (!container) return;
  container.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];

  q.options.forEach((optText, optIdx) => {
    const row = document.createElement('div');
    row.className = 'option-select-row';
    if (examStates[currentIdx].selected === optIdx) {
      row.classList.add('selected');
    }

    row.innerHTML = `
      <div class="option-bullet">${letters[optIdx]}</div>
      <div class="option-label-text">${optText}</div>
    `;

    row.onclick = () => selectOptionForQuestion(optIdx);
    container.appendChild(row);
  });

  renderTCSQuestionPalette();
}

function selectOptionForQuestion(optIdx) {
  examStates[currentIdx].selected = optIdx;

  // Proctoring velocity check
  if (typeof ProctorEngine !== 'undefined') {
    ProctorEngine.logQuestionAnswered(currentIdx);
  }

  renderActiveQuestion();
}

function clearOptionChoice() {
  examStates[currentIdx].selected = null;
  renderActiveQuestion();
}

function toggleMarkReview() {
  examStates[currentIdx].isMarked = !examStates[currentIdx].isMarked;
  if (currentIdx < activeQuestions.length - 1) {
    currentIdx++;
  }
  renderActiveQuestion();
}

function stepSaveAndNext() {
  if (currentIdx < activeQuestions.length - 1) {
    currentIdx++;
    renderActiveQuestion();
  }
}

function stepPreviousQuestion() {
  if (currentIdx > 0) {
    currentIdx--;
    renderActiveQuestion();
  }
}

function jumpToQuestionIdx(idx) {
  currentIdx = idx;
  renderActiveQuestion();
}

function filterQuestionsSection(secKey) {
  document.querySelectorAll('.sec-pill-btn').forEach(btn => btn.classList.remove('active'));
  if (event && event.target) {
    event.target.classList.add('active');
  }

  if (secKey === 'ALL') {
    jumpToQuestionIdx(0);
    return;
  }
  const firstMatch = activeQuestions.findIndex(q => q.section === secKey);
  if (firstMatch !== -1) {
    jumpToQuestionIdx(firstMatch);
  }
}

function renderTCSQuestionPalette() {
  const grid = document.getElementById('tcsNumbersGrid');
  if (!grid) return;
  grid.innerHTML = '';

  let cAnswered = 0;
  let cNotAnswered = 0;
  let cMarked = 0;
  let cNotVisited = 0;

  activeQuestions.forEach((q, idx) => {
    const state = examStates[idx];
    const btn = document.createElement('button');
    btn.className = 'pal-num-btn';
    btn.innerText = idx + 1;

    if (idx === currentIdx) {
      btn.classList.add('current');
    }

    const isAnswered = state && state.selected !== null;
    const isMarked = state && state.isMarked;
    const isVisited = state && state.visited;

    if (!isVisited) {
      cNotVisited++;
      btn.classList.add('not-visited');
    } else if (isMarked && isAnswered) {
      cMarked++;
      btn.classList.add('marked-answered');
    } else if (isMarked) {
      cMarked++;
      btn.classList.add('marked');
    } else if (isAnswered) {
      cAnswered++;
      btn.classList.add('answered');
    } else {
      cNotAnswered++;
      btn.classList.add('not-answered');
    }

    btn.onclick = () => jumpToQuestionIdx(idx);
    grid.appendChild(btn);
  });

  const elA = document.getElementById('countAnswered');
  const elNA = document.getElementById('countNotAnswered');
  const elM = document.getElementById('countMarked');
  const elNV = document.getElementById('countNotVisited');
  const elAtt = document.getElementById('palAttemptedLabel');

  if (elA) elA.innerText = cAnswered;
  if (elNA) elNA.innerText = cNotAnswered;
  if (elM) elM.innerText = cMarked;
  if (elNV) elNV.innerText = cNotVisited;
  if (elAtt) elAtt.innerText = `${cAnswered}/${activeQuestions.length} Attempted`;
}

function showSubmitTestModal() {
  let answered = 0;
  let marked = 0;
  let notAnswered = 0;

  activeQuestions.forEach((q, idx) => {
    const st = examStates[idx];
    if (st && st.selected !== null) answered++;
    if (st && st.isMarked) marked++;
    if (!st || st.selected === null) notAnswered++;
  });

  document.getElementById('modalCountAnswered').innerText = answered;
  document.getElementById('modalCountReview').innerText = marked;
  document.getElementById('modalCountNotAnswered').innerText = notAnswered;

  document.getElementById('submitModal').style.display = 'flex';
}

function closeSubmitModal() {
  document.getElementById('submitModal').style.display = 'none';
}

function executeFinalSubmit(isDisqualified = false) {
  if (examTimerInterval) clearInterval(examTimerInterval);
  closeSubmitModal();

  // Get Proctoring Audit Report
  let auditReport = { trustScore: "100%", tabSwitches: 0, status: "VERIFIED" };
  if (typeof ProctorEngine !== 'undefined') {
    auditReport = ProctorEngine.getAuditReport();
    ProctorEngine.stopSession();
  }

  if (isDisqualified) {
    auditReport.status = "DISQUALIFIED (Malpractice)";
    auditReport.trustScore = "0%";
  }

  const timeSpentSec = EXAM_TOTAL_SECONDS - timerRemaining;
  const minsSpent = Math.floor(timeSpentSec / 60);
  const secsSpent = timeSpentSec % 60;
  const timeFormatted = `${minsSpent}m ${secsSpent}s`;

  let score = 0;
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;

  const solContainer = document.getElementById('solutionsCardList');
  if (solContainer) {
    solContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    activeQuestions.forEach((q, idx) => {
      const state = examStates[idx];
      const chosen = state ? state.selected : null;
      let cardClass = 'unanswered';
      let badgeHtml = '<span style="color: var(--text-tertiary); font-weight:700;">Unattempted (0 pts)</span>';

      if (chosen === null) {
        unanswered++;
      } else if (chosen === q.correct) {
        score += 3;
        correct++;
        cardClass = 'correct';
        badgeHtml = '<span style="color: var(--accent-emerald); font-weight:800;">✓ Correct (+3.0 pts)</span>';
      } else {
        score -= 1;
        wrong++;
        cardClass = 'wrong';
        badgeHtml = '<span style="color: var(--accent-rose); font-weight:800;">✗ Incorrect (-1.0 pt)</span>';
      }

      const chosenLabel = chosen !== null ? `${letters[chosen]}. ${q.options[chosen]}` : 'Not Attempted';
      const correctLabel = `${letters[q.correct]}. ${q.options[q.correct]}`;

      const card = document.createElement('div');
      card.className = `solution-accordion-item ${cardClass}`;
      card.innerHTML = `
        <div class="sol-item-top">
          <span style="font-weight: 700; color: #fff;">Q${idx + 1} — ${q.topic}</span>
          <div>${badgeHtml}</div>
        </div>
        <div class="sol-item-question">${q.question}</div>
        <div class="sol-item-answers">
          <div><span style="color: var(--text-tertiary);">Your Response:</span> <strong style="color: ${chosen === q.correct ? 'var(--accent-emerald)' : (chosen === null ? '#888' : 'var(--accent-rose)')};">${chosenLabel}</strong></div>
          <div><span style="color: var(--text-tertiary);">Correct Answer:</span> <strong style="color: var(--accent-emerald);">${correctLabel}</strong></div>
        </div>
        <div class="sol-explanation-well">
          <strong>Step-by-Step Solution:</strong><br>${q.solution.replace(/\n/g, '<br>')}
        </div>
      `;
      solContainer.appendChild(card);
    });
  }

  // If candidate was disqualified for malpractice, zero out marks
  if (isDisqualified) {
    score = 0;
  }

  const totalAttempted = correct + wrong;
  const accuracyPercent = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0;

  // Update Summary Indicators
  document.getElementById('finalScoreDisplay').innerText = score;
  document.getElementById('metricAccuracy').innerText = `${accuracyPercent}%`;
  document.getElementById('metricCorrect').innerText = correct;
  document.getElementById('metricWrong').innerText = wrong;
  document.getElementById('metricUnanswered').innerText = unanswered;
  document.getElementById('metricTime').innerText = timeFormatted;

  // Update Proctoring Integrity Card on Results Screen
  const elProctorTrust = document.getElementById('metricTrustScore');
  const elProctorStatus = document.getElementById('metricProctorStatus');
  if (elProctorTrust) elProctorTrust.innerText = auditReport.trustScore;
  if (elProctorStatus) elProctorStatus.innerText = auditReport.status;

  // Switch to Results
  if (typeof showSection === 'function') {
    showSection('results');
  }

  // Google Sheets & Local Sync with Anti-Cheat Audit
  if (typeof syncResultToGoogleSheets === 'function') {
    syncResultToGoogleSheets(score, `${accuracyPercent}%`, timeFormatted, auditReport);
  }
}
