// ==============================================================
// GOOGLE APPS SCRIPT WEBHOOK & STUDENT IDENTITY MODULE
// ==============================================================

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw79r3kIApBVc4SKZnrVYu-mzoEF1YwCCiIUcCYzsQMGfmLKMhK-7niAtY_aNvpRQKw/exec";

let currentStudent = {
  roll: "24xx1A0542",
  batch: "2028",
  branch: "CSE"
};

const BRANCH_CODES = {
  "05": "CSE", "12": "IT", "04": "ECE", "02": "EEE",
  "03": "MECH", "01": "CIVIL", "66": "CSM", "67": "CSD"
};

function initStudent() {
  const saved = localStorage.getItem('avnet_portal_student');
  if (saved) {
    try { currentStudent = JSON.parse(saved); } catch (e) {}
  }
  updateStudentUI();
}

function updateStudentUI() {
  const elNavRoll = document.getElementById('navRollText');
  const elNavDept = document.getElementById('navDeptText');
  const elDashRoll = document.getElementById('dashWelcomeRoll');
  const elPalRoll = document.getElementById('palStudentRoll');
  const elPalDept = document.getElementById('palStudentDept');
  const elResDetails = document.getElementById('resultCandidateDetails');
  const elStandRoll = document.getElementById('standaloneRollDisplay');

  if (elNavRoll) elNavRoll.innerText = currentStudent.roll;
  if (elNavDept) elNavDept.innerText = `${currentStudent.batch} ${currentStudent.branch}`;
  if (elDashRoll) elDashRoll.innerText = currentStudent.roll;
  if (elPalRoll) elPalRoll.innerText = currentStudent.roll;
  if (elPalDept) elPalDept.innerText = `Batch ${currentStudent.batch} • ${currentStudent.branch}`;
  if (elResDetails) elResDetails.innerText = `Candidate: ${currentStudent.roll} | Batch ${currentStudent.batch} ${currentStudent.branch}`;
  if (elStandRoll) elStandRoll.innerText = currentStudent.roll;
}

function openStudentDialog() {
  document.getElementById('inputModalRoll').value = currentStudent.roll;
  liveDetectStudentMeta();
  document.getElementById('studentModal').style.display = 'flex';
}

function liveDetectStudentMeta() {
  const val = document.getElementById('inputModalRoll').value.trim().toUpperCase();
  let bYear = "2028";
  let bDept = "CSE";

  if (val.length >= 2) {
    const yr = val.slice(0, 2);
    if (yr === "23") bYear = "2027";
    else if (yr === "24") bYear = "2028";
    else if (yr === "25") bYear = "2029";
  }

  if (val.length >= 8) {
    const code = val.slice(6, 8);
    if (BRANCH_CODES[code]) bDept = BRANCH_CODES[code];
  }

  document.getElementById('metaBatchText').innerText = bYear;
  document.getElementById('metaBranchText').innerText = bDept;
}

function confirmSaveStudent() {
  const val = document.getElementById('inputModalRoll').value.trim().toUpperCase();
  if (!val) {
    alert("Please enter a valid roll number");
    return;
  }

  currentStudent.roll = val;
  currentStudent.batch = document.getElementById('metaBatchText').innerText;
  currentStudent.branch = document.getElementById('metaBranchText').innerText;

  localStorage.setItem('avnet_portal_student', JSON.stringify(currentStudent));
  updateStudentUI();
  document.getElementById('studentModal').style.display = 'none';
}

function syncResultToGoogleSheets(score, accuracy, timeTaken, audit = {}) {
  const trustScore = audit.trustScore || "100%";
  const tabSwitches = audit.tabSwitches || 0;
  const proctorStatus = audit.status || "VERIFIED";

  // 1. Add locally to leaderboard & admin submissions cache
  if (typeof addLeaderboardEntry === 'function') {
    addLeaderboardEntry(currentStudent.roll, currentStudent.branch, currentStudent.batch, score, accuracy, timeTaken, proctorStatus, trustScore);
  }

  try {
    let existing = JSON.parse(localStorage.getItem('avniet_live_submissions') || '[]');
    existing.unshift({
      roll: currentStudent.roll,
      branch: currentStudent.branch,
      batch: currentStudent.batch,
      score: score,
      accuracy: accuracy,
      time: timeTaken,
      trust: trustScore,
      tabs: tabSwitches,
      status: proctorStatus
    });
    localStorage.setItem('avniet_live_submissions', JSON.stringify(existing));
  } catch(e) {}

  // 2. Asynchronous non-blocking POST to Google Apps Script
  const payload = {
    action: "submit_test_result",
    roll: currentStudent.roll,
    batch: currentStudent.batch,
    branch: currentStudent.branch,
    test_id: "placement_mock_01",
    score: score,
    accuracy: accuracy,
    time_taken: timeTaken,
    trust_score: trustScore,
    tab_switches: tabSwitches,
    proctor_status: proctorStatus,
    timestamp: new Date().toISOString()
  };

  try {
    fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(() => {
      console.log("Assessment synced to Google Sheets successfully.");
    }).catch(err => {
      console.warn("Background sheet sync notice:", err);
    });
  } catch (e) {}
}
