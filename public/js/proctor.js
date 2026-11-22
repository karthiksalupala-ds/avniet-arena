// ==============================================================
// AVNIET ARENA — AI PROCTORING & ANTI-CHEATING SHIELD
// Client-side Lockdown, Focus Tracking, Integrity Scoring
// ==============================================================

const ProctorEngine = {
  isActive: false,
  maxWarnings: 3,
  warningsCount: 0,
  tabSwitches: 0,
  copyAttempts: 0,
  anomaliesDetected: [],
  questionTimestamps: {},
  trustScore: 100,

  // Initialize Proctoring Shield
  startSession() {
    this.isActive = true;
    this.warningsCount = 0;
    this.tabSwitches = 0;
    this.copyAttempts = 0;
    this.anomaliesDetected = [];
    this.questionTimestamps = {};
    this.trustScore = 100;

    this.attachProtectionListeners();
    this.updateProctorBadge();
    this.requestFullscreenMode();
  },

  // Stop Proctoring Session
  stopSession() {
    this.isActive = false;
    this.removeProtectionListeners();
    this.exitFullscreenMode();
  },

  // Event Listeners for Lockdown
  attachProtectionListeners() {
    // 1. Tab Switch / Window Blur Detection
    this._visibilityHandler = () => {
      if (!this.isActive) return;
      if (document.hidden) {
        this.handleViolation("Tab switch / application minimized");
      }
    };
    document.addEventListener("visibilitychange", this._visibilityHandler);

    this._blurHandler = () => {
      if (!this.isActive) return;
      this.handleViolation("Window focus lost / application minimized");
    };
    window.addEventListener("blur", this._blurHandler);

    // 2. Prevent Copy / Cut / Paste / Context Menu
    this._copyBlocker = (e) => {
      if (!this.isActive) return;
      e.preventDefault();
      this.copyAttempts++;
      this.showToastNotification("⚠️ Copy-paste is disabled during proctored assessment.");
      return false;
    };
    document.addEventListener("copy", this._copyBlocker);
    document.addEventListener("cut", this._copyBlocker);
    document.addEventListener("paste", this._copyBlocker);
    document.addEventListener("contextmenu", this._copyBlocker);

    // 3. Block DevTools Shortcuts (F12, Ctrl+Shift+I, Ctrl+U, etc.)
    this._keyBlocker = (e) => {
      if (!this.isActive) return;

      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        this.showToastNotification("⚠️ Developer tools are disabled.");
        return false;
      }
      // Ctrl+Shift+I or Ctrl+Shift+J or Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        this.showToastNotification("⚠️ Developer inspect is blocked.");
        return false;
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        this.showToastNotification("⚠️ View source is blocked.");
        return false;
      }
    };
    document.addEventListener("keydown", this._keyBlocker);

    // 4. Fullscreen Exit Detection
    this._fullscreenHandler = () => {
      if (!this.isActive) return;
      if (!document.fullscreenElement) {
        this.handleViolation("Exited fullscreen mode");
      }
    };
    document.addEventListener("fullscreenchange", this._fullscreenHandler);
  },

  removeProtectionListeners() {
    document.removeEventListener("visibilitychange", this._visibilityHandler);
    window.removeEventListener("blur", this._blurHandler);
    document.removeEventListener("copy", this._copyBlocker);
    document.removeEventListener("cut", this._copyBlocker);
    document.removeEventListener("paste", this._copyBlocker);
    document.removeEventListener("contextmenu", this._copyBlocker);
    document.removeEventListener("keydown", this._keyBlocker);
    document.removeEventListener("fullscreenchange", this._fullscreenHandler);
  },

  // Violation Handler (Strike System)
  handleViolation(reason) {
    this.warningsCount++;
    this.tabSwitches++;
    this.anomaliesDetected.push({
      type: reason,
      time: new Date().toLocaleTimeString(),
      warningIndex: this.warningsCount
    });

    // Deduct trust score
    this.trustScore = Math.max(0, this.trustScore - 25);
    this.updateProctorBadge();

    if (this.warningsCount >= this.maxWarnings) {
      this.triggerDisqualification(reason);
    } else {
      this.showWarningModal(reason);
    }
  },

  showWarningModal(reason) {
    const modal = document.getElementById('proctorWarningModal');
    const reasonText = document.getElementById('proctorWarningReason');
    const strikeText = document.getElementById('proctorStrikeCount');

    if (reasonText) reasonText.innerText = reason;
    if (strikeText) strikeText.innerText = `${this.warningsCount} of ${this.maxWarnings}`;
    if (modal) modal.style.display = 'flex';
  },

  dismissWarningModal() {
    const modal = document.getElementById('proctorWarningModal');
    if (modal) modal.style.display = 'none';
    this.requestFullscreenMode();
  },

  triggerDisqualification(reason) {
    const modal = document.getElementById('proctorWarningModal');
    if (modal) modal.style.display = 'none';

    alert(`🚨 MALPRACTICE DETECTED — ASSESSMENT TERMINATED!\n\nYou have accumulated ${this.maxWarnings} proctoring violations (${reason}). Your assessment is submitting immediately with a flagged malpractice status.`);

    if (typeof executeFinalSubmit === 'function') {
      executeFinalSubmit(true); // true = disqualified
    }
  },

  // Track Answer Speed Anomaly
  logQuestionStart(qIndex) {
    this.questionTimestamps[qIndex] = Date.now();
  },

  logQuestionAnswered(qIndex) {
    if (this.questionTimestamps[qIndex]) {
      const timeSpentSec = (Date.now() - this.questionTimestamps[qIndex]) / 1000;
      // Anomaly: Solving a complex math question in under 2.5 seconds
      if (timeSpentSec < 2.5) {
        this.anomaliesDetected.push({
          type: `Suspicious Answer Velocity (Q${qIndex + 1} answered in ${timeSpentSec.toFixed(1)}s)`,
          time: new Date().toLocaleTimeString()
        });
        this.trustScore = Math.max(0, this.trustScore - 15);
        this.updateProctorBadge();
      }
    }
  },

  updateProctorBadge() {
    const badge = document.getElementById('proctorLiveBadge');
    if (!badge) return;

    if (this.warningsCount === 0) {
      badge.innerHTML = `<span class="dot-live"></span> AI PROCTOR: CLEAN`;
      badge.className = "proctor-badge clean";
    } else if (this.warningsCount === 1) {
      badge.innerHTML = `⚠️ 1 WARNING`;
      badge.className = "proctor-badge warning";
    } else if (this.warningsCount === 2) {
      badge.innerHTML = `🚨 2 WARNINGS (FINAL)`;
      badge.className = "proctor-badge danger";
    } else {
      badge.innerHTML = `⛔ DISQUALIFIED`;
      badge.className = "proctor-badge disqualified";
    }
  },

  showToastNotification(message) {
    const toast = document.getElementById('proctorToast');
    if (!toast) return;
    toast.innerText = message;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 2800);
  },

  requestFullscreenMode() {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
  },

  exitFullscreenMode() {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
  },

  getAuditReport() {
    let status = "VERIFIED";
    if (this.warningsCount >= this.maxWarnings) {
      status = "DISQUALIFIED (Malpractice)";
    } else if (this.warningsCount > 0 || this.trustScore < 80) {
      status = "SUSPICIOUS (Tab-switches logged)";
    }

    return {
      trustScore: `${this.trustScore}%`,
      tabSwitches: this.tabSwitches,
      anomalies: this.anomaliesDetected,
      status: status
    };
  }
};
