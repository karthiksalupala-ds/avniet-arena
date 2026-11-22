/**
 * ==============================================================
 * AVNIET ARENA — MODULAR COGNITIVE GAME ENGINE
 * Universal Game Lifecycle, Audio Synthesis, Anti-Cheat & Telemetry
 * ==============================================================
 */

(function(global) {
  'use strict';

  // -------------------------------------------------------------
  // AUDIO SYNTHESIS SUBSYSTEM (Web Audio API)
  // -------------------------------------------------------------
  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    playTone(freq, type = 'sine', duration = 0.12, vol = 0.18) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Fallback for browsers with strict audio autoplay
      }
    }

    playCorrect() {
      this.playTone(523.25, 'sine', 0.08); // C5
      setTimeout(() => this.playTone(659.25, 'sine', 0.14), 70); // E5
    }

    playWrong() {
      this.playTone(220.00, 'triangle', 0.18, 0.22); // A3 Low buzz
      setTimeout(() => this.playTone(196.00, 'triangle', 0.20, 0.20), 80); // G3
    }

    playTierUp() {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.12), idx * 60);
      });
    }

    playTick() {
      this.playTone(880, 'sine', 0.02, 0.05);
    }
  }

  // -------------------------------------------------------------
  // CORE UNIVERSAL GAME ENGINE
  // -------------------------------------------------------------
  class CognitiveGameEngine {
    constructor() {
      this.audio = new AudioEngine();
      this.drivers = new Map();
      this.currentDriver = null;
      this.exam = null;
      this.student = { roll: '', batch: '2028', branch: 'CSE' };
      
      this.score = 0;
      this.streak = 0;
      this.tier = 1;
      this.totalSolved = 0;
      this.totalAttempts = 0;
      this.initialDuration = 90;
      this.remainingSeconds = 90;
      this.timerInterval = null;
      this.isRunning = false;
      this.currentPuzzle = null;
      this.onStateChangeCallbacks = [];
    }

    // Register a game driver plugin
    registerDriver(id, driver) {
      if (!driver.name || typeof driver.generatePuzzle !== 'function') {
        throw new Error(`Game driver ${id} does not implement the required driver contract.`);
      }
      this.drivers.set(id, driver);
      return this;
    }

    getDriver(id) {
      return this.drivers.get(id);
    }

    getAllDrivers() {
      const list = [];
      this.drivers.forEach((driver, id) => {
        list.push({ id, ...driver.getMetadata() });
      });
      return list;
    }

    // Initialize an assessment session
    initSession({ exam, student, driverId = 'latin_square' }) {
      this.exam = exam || null;
      this.student = student || { roll: '24xx1A0542', batch: '2028', branch: 'CSE' };
      
      // Resolve driver from exam type/category or fallback
      let resolvedId = driverId;
      if (exam) {
        if (exam.gameDriver && this.drivers.has(exam.gameDriver)) {
          resolvedId = exam.gameDriver;
        } else if (exam.type === 'switch' || (exam.category && exam.category.toLowerCase().includes('switch'))) {
          resolvedId = 'switch_challenge';
        } else if (exam.type === 'memory' || (exam.category && exam.category.toLowerCase().includes('memory'))) {
          resolvedId = 'spatial_memory';
        } else {
          resolvedId = 'latin_square';
        }
      }

      this.currentDriver = this.drivers.get(resolvedId) || this.drivers.get('latin_square');
      if (!this.currentDriver) {
        throw new Error(`No compatible game driver found for id '${resolvedId}'`);
      }

      // Configure time duration
      if (this.exam && this.exam.durationMinutes) {
        this.initialDuration = Math.max(60, this.exam.durationMinutes * 60);
      } else {
        this.initialDuration = this.currentDriver.defaultDuration || 90;
      }
      this.remainingSeconds = this.initialDuration;

      this.score = 0;
      this.streak = 0;
      this.tier = 1;
      this.totalSolved = 0;
      this.totalAttempts = 0;
      this.isRunning = false;
      clearInterval(this.timerInterval);

      return this;
    }

    // Start assessment
    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.audio.init();

      if (typeof global.ProctorEngine !== 'undefined') {
        global.ProctorEngine.startSession();
      }

      this.notifyState();
      this.nextRound();

      clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        this.remainingSeconds--;
        if (this.remainingSeconds <= 10 && this.remainingSeconds > 0) {
          this.audio.playTick();
        }
        this.notifyState();

        if (this.remainingSeconds <= 0) {
          this.finish();
        }
      }, 1000);
    }

    // Generate next game round
    nextRound() {
      if (!this.isRunning || !this.currentDriver) return;
      this.currentPuzzle = this.currentDriver.generatePuzzle(this.tier, this.totalSolved);
      this.notifyState();
    }

    // Submit candidate choice
    submitChoice(choice) {
      if (!this.isRunning || !this.currentPuzzle) return;

      this.totalAttempts++;
      const isCorrect = this.currentDriver.evaluateAnswer(choice, this.currentPuzzle);

      if (isCorrect) {
        this.audio.playCorrect();
        this.totalSolved++;
        this.streak++;
        const pointsAdded = (this.currentDriver.basePoints || 10) * this.tier;
        this.score += pointsAdded;

        // Adaptive Tier Escalation (every 2 consecutive clean solves)
        if (this.streak > 0 && this.streak % 2 === 0) {
          this.tier++;
          this.audio.playTierUp();
        }
      } else {
        this.audio.playWrong();
        this.streak = 0;
      }

      this.notifyState();
      this.nextRound();
    }

    // Complete assessment and generate verifiable audit
    finish() {
      if (!this.isRunning) return;
      this.isRunning = false;
      clearInterval(this.timerInterval);

      let audit = { trustScore: '100%', status: 'VERIFIED', tabSwitches: 0 };
      if (typeof global.ProctorEngine !== 'undefined') {
        audit = global.ProctorEngine.generateAuditReport();
        global.ProctorEngine.stopSession();
      }

      const timeSpentSec = Math.max(1, this.initialDuration - this.remainingSeconds);
      const minsSpent = Math.floor(timeSpentSec / 60);
      const secsSpent = timeSpentSec % 60;
      const formattedTime = `${minsSpent}m ${secsSpent}s`;
      const examId = this.exam ? this.exam.id : 'EXAM-AVN-2026-GAME';
      const accuracyPct = this.totalAttempts > 0 
        ? `${Math.round((this.totalSolved / this.totalAttempts) * 100)}%` 
        : '0%';

      const receipt = {
        roll: this.student.roll,
        branch: this.student.branch,
        batch: this.student.batch,
        examId: examId,
        examTitle: this.exam ? this.exam.title : (this.currentDriver.name || 'Cognitive Challenge'),
        score: this.score,
        totalSolved: this.totalSolved,
        totalAttempts: this.totalAttempts,
        accuracy: accuracyPct,
        tierReached: this.tier,
        timeSpent: formattedTime,
        status: audit.status,
        trustScore: audit.trustScore,
        tabSwitches: audit.tabSwitches,
        timestamp: new Date().toISOString()
      };

      // Telemetry Sync
      this.dispatchTelemetry(receipt, audit);

      if (typeof this.onFinishCallback === 'function') {
        this.onFinishCallback(receipt);
      }

      return receipt;
    }

    // Sync results across LocalStorage, Express API, and Sheets
    dispatchTelemetry(receipt, audit) {
      if (typeof global.syncResultToGoogleSheets === 'function') {
        global.currentStudent = this.student;
        global.syncResultToGoogleSheets(this.score, receipt.accuracy, receipt.timeSpent, audit);
      }

      try {
        let existing = JSON.parse(localStorage.getItem('avniet_live_submissions') || '[]');
        existing.unshift(receipt);
        localStorage.setItem('avniet_live_submissions', JSON.stringify(existing));
      } catch (e) {}

      try {
        fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roll: receipt.roll,
            branch: receipt.branch,
            batch: receipt.batch,
            score: receipt.score,
            accuracy: receipt.accuracy,
            time: receipt.timeSpent,
            trust: receipt.trustScore,
            tabs: receipt.tabSwitches,
            status: receipt.status,
            examId: receipt.examId
          })
        }).catch(() => {});
      } catch (e) {}
    }

    onStateChange(cb) {
      if (typeof cb === 'function') this.onStateChangeCallbacks.push(cb);
    }

    notifyState() {
      const state = {
        isRunning: this.isRunning,
        score: this.score,
        streak: this.streak,
        tier: this.tier,
        totalSolved: this.totalSolved,
        remainingSeconds: this.remainingSeconds,
        initialDuration: this.initialDuration,
        progressPercent: (this.remainingSeconds / this.initialDuration) * 100,
        currentPuzzle: this.currentPuzzle,
        driverName: this.currentDriver ? this.currentDriver.name : ''
      };

      this.onStateChangeCallbacks.forEach(cb => {
        try { cb(state); } catch(e) {}
      });
    }

    onFinish(cb) {
      this.onFinishCallback = cb;
    }
  }

  // Export singleton engine instance
  const engineInstance = new CognitiveGameEngine();
  global.GameEngine = engineInstance;

})(typeof window !== 'undefined' ? window : this);
