/**
 * ==============================================================
 * AVNIET ARENA — FLOATING AI PLACEMENT COPILOT (WebMCP-Powered)
 * Real-time Multi-Provider Conversational AI Assistant
 * Supports: Google Gemini, Groq, OpenAI, OpenRouter, DeepSeek
 * ==============================================================
 */

(function(global) {
  'use strict';

  class PlacementCopilotUI {
    constructor() {
      this.isOpen = false;
      this.isSettingsOpen = false;
      this.history = [];
      this.isBusy = false;
      this.serverBrainInfo = { configured: false, providers: [], activeProvider: 'Offline' };
      this.storageKeysName = 'avniet_ai_brain_keys';
      this.storageProviderName = 'avniet_ai_provider';
      this.storageActiveKeyName = 'avniet_ai_brain_key';
    }

    async init() {
      this.injectStyles();
      this.injectDOM();
      this.attachEvents();
      await this.fetchServerBrainStatus();
      this.updateBrainBadge();
    }

    async fetchServerBrainStatus() {
      try {
        const res = await fetch('/api/ai/brain-status');
        if (res.ok) {
          this.serverBrainInfo = await res.json();
        }
      } catch (e) {
        console.warn("Brain status check failed:", e.message);
      }
    }

    injectStyles() {
      if (document.getElementById('copilotStyles')) return;
      const style = document.createElement('style');
      style.id = 'copilotStyles';
      style.innerHTML = `
        /* Floating Copilot Launcher Button */
        .copilot-fab-btn {
          position: fixed;
          bottom: 24px;
          right: 28px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 30px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: #ffffff;
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .copilot-fab-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 30px rgba(124, 58, 237, 0.45);
        }
        .copilot-fab-badge {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(255,255,255,0.4);
        }

        /* Slide-over Drawer Window */
        .copilot-drawer {
          position: fixed;
          bottom: 24px;
          right: 28px;
          width: 440px;
          max-width: calc(100vw - 32px);
          height: 600px;
          max-height: calc(100vh - 48px);
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          z-index: 10000;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          transform: translateY(20px) scale(0.96);
          opacity: 0;
          pointer-events: none;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .copilot-drawer.open {
          transform: translateY(0) scale(1);
          opacity: 1;
          pointer-events: auto;
        }

        /* Drawer Header */
        .copilot-header {
          padding: 14px 16px;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          color: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          user-select: none;
        }
        .copilot-header-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .copilot-crest {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
        }
        .copilot-crest img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .copilot-header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .copilot-brain-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          background: rgba(37, 99, 235, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.35);
          color: #93c5fd;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .copilot-brain-badge:hover {
          background: rgba(37, 99, 235, 0.35);
          border-color: #60a5fa;
          color: #ffffff;
        }
        .copilot-icon-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 5px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .copilot-icon-btn:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.1);
        }

        /* Brain Settings Panel (Slide-down) */
        .copilot-settings-panel {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 14px 16px;
          animation: copilotSlideDown 0.25s ease-out;
        }
        @keyframes copilotSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .copilot-settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 12px;
          color: #1e293b;
        }
        .copilot-security-box {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 11px;
          color: #1e40af;
          margin-bottom: 12px;
          line-height: 1.4;
        }
        .copilot-field {
          margin-bottom: 10px;
        }
        .copilot-field label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 4px;
        }
        .copilot-select {
          width: 100%;
          padding: 7px 10px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 12px;
          color: #1e293b;
          background: #ffffff;
          outline: none;
          box-sizing: border-box;
        }
        .copilot-key-input-wrap {
          display: flex;
          gap: 6px;
          position: relative;
        }
        .copilot-input-sub {
          flex: 1;
          padding: 7px 10px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 12px;
          font-family: monospace;
          background: #ffffff;
          outline: none;
          box-sizing: border-box;
        }
        .copilot-input-sub:focus {
          border-color: #2563eb;
        }
        .copilot-ghost-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0 10px;
          cursor: pointer;
          font-size: 13px;
        }
        .copilot-settings-actions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }
        .copilot-btn-primary {
          flex: 1;
          padding: 7px 12px;
          border-radius: 8px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .copilot-btn-primary:hover {
          background: #1d4ed8;
        }
        .copilot-btn-danger {
          padding: 7px 12px;
          border-radius: 8px;
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fca5a5;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .copilot-btn-danger:hover {
          background: #fecaca;
        }
        .copilot-status-note {
          margin-top: 8px;
          font-size: 11px;
          color: #64748b;
          line-height: 1.4;
        }

        /* Messages Area */
        .copilot-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: #f8fafc;
        }

        /* Bubbles */
        .copilot-bubble {
          max-width: 88%;
          padding: 11px 15px;
          font-size: 13px;
          line-height: 1.5;
          border-radius: 14px;
          word-break: break-word;
        }
        .copilot-bubble.user {
          align-self: flex-end;
          background: #2563eb;
          color: #ffffff;
          border-bottom-right-radius: 3px;
        }
        .copilot-bubble.assistant {
          align-self: flex-start;
          background: #ffffff;
          color: #1e293b;
          border: 1px solid #e2e8f0;
          border-bottom-left-radius: 3px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
        .copilot-attribution-tag {
          display: block;
          margin-top: 6px;
          font-size: 10px;
          font-weight: 600;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
          padding-top: 4px;
        }

        /* Prompt Quick Chips */
        .copilot-chips-row {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding: 8px 14px;
          background: #ffffff;
          border-top: 1px solid #f1f5f9;
        }
        .copilot-chip {
          padding: 5px 10px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }
        .copilot-chip:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          color: #1d4ed8;
        }

        /* Input Footer */
        .copilot-footer {
          padding: 12px 14px;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .copilot-input {
          flex: 1;
          padding: 9px 13px;
          border-radius: 20px;
          border: 1px solid #cbd5e1;
          font-family: inherit;
          font-size: 13px;
          outline: none;
          background: #f8fafc;
          transition: border-color 0.15s;
        }
        .copilot-input:focus {
          border-color: #2563eb;
          background: #ffffff;
        }
        .copilot-send-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: #2563eb;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .copilot-send-btn:hover {
          background: #1d4ed8;
          transform: scale(1.05);
        }
        .copilot-send-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          transform: none;
        }

        /* Card Widgets */
        .copilot-card {
          margin-top: 8px;
          padding: 10px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 12px;
        }
        .copilot-card-header {
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          margin-bottom: 4px;
        }

        @keyframes copilotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.4; }
        }
      `;
      document.body.appendChild(style);
    }

    injectDOM() {
      if (document.getElementById('copilotDrawer')) return;

      // Floating Action Button
      const fab = document.createElement('button');
      fab.id = 'copilotLauncherBtn';
      fab.className = 'copilot-fab-btn';
      fab.innerHTML = `
        <span class="copilot-fab-badge"></span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>AI Copilot</span>
      `;
      fab.onclick = () => this.toggleDrawer();
      document.body.appendChild(fab);

      // Slide-over Drawer Window
      const drawer = document.createElement('div');
      drawer.id = 'copilotDrawer';
      drawer.className = 'copilot-drawer';
      drawer.innerHTML = `
        <div class="copilot-header">
          <div class="copilot-header-title">
            <div class="copilot-crest">
              <img src="/logo.png" alt="AVNIET Logo" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\'><text y=\\'18\\' font-size=\\'18\\'>🎓</text></svg>'">
            </div>
            <div>
              <div style="font-weight: 700; font-size: 14px; line-height: 1.2;">AVNIET Copilot</div>
              <div style="font-size: 10px; color: #94a3b8;">Autonomous Placement Brain</div>
            </div>
          </div>
          <div class="copilot-header-actions">
            <span class="copilot-brain-badge" id="copilotBrainBadge" title="AI Brain Status">Checking Brain...</span>
            <button type="button" class="copilot-icon-btn" id="copilotSettingsBtn" title="AI Brain & Security Settings">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            <button type="button" class="copilot-icon-btn" id="copilotCloseBtn" title="Close">✕</button>
          </div>
        </div>

        <!-- Brain Settings Panel (Collapsible) -->
        <div class="copilot-settings-panel" id="copilotSettingsPanel" style="display: none;">
          <div class="copilot-settings-header">
            <strong>🔒 Multi-Provider AI Brain Configuration</strong>
            <span style="font-size: 11px; color: #10b981; font-weight: 600;">Server-Side Encrypted</span>
          </div>
          
          <div class="copilot-security-box">
            🛡️ <strong>Zero-Leakage Security:</strong> To keep API keys 100% private and protected from students, set them in your local <code>.env</code> file or <strong>Render Dashboard → Environment</strong>.
          </div>

          <div class="copilot-field">
            <label>Server-Configured AI Brains:</label>
            <div id="copilotServerBrainsList" style="font-size: 11px; color: #334155; padding: 6px 8px; background: #ffffff; border-radius: 6px; border: 1px solid #cbd5e1;">
              Loading server environment status...
            </div>
          </div>

          <div style="margin: 12px 0 6px 0; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
            <span style="font-size: 11px; font-weight: 600; color: #475569;">Optional Temporary Session Key (Browser):</span>
          </div>

          <div class="copilot-field">
            <label>AI Provider</label>
            <select id="copilotProviderSelect" class="copilot-select">
              <option value="auto">⚡ Auto-Detect by Key</option>
              <option value="groq">🦙 Groq (Llama-3.3-70B)</option>
              <option value="gemini">💎 Google Gemini (1.5 Flash)</option>
              <option value="openai">🧠 OpenAI (GPT-4o-mini / GPT-4o)</option>
              <option value="openrouter">🌐 OpenRouter</option>
              <option value="deepseek">🐋 DeepSeek (DeepSeek V3)</option>
            </select>
          </div>
          <div class="copilot-field">
            <label>Session Key</label>
            <div class="copilot-key-input-wrap">
              <input type="password" id="copilotKeyInput" class="copilot-input-sub" placeholder="Paste key: gsk_..., AIza..., sk-..." autocomplete="off">
              <button type="button" id="copilotToggleKeyVisibility" class="copilot-ghost-btn" title="Show/Hide">👁️</button>
            </div>
          </div>
          <div class="copilot-settings-actions">
            <button type="button" id="copilotSaveKeyBtn" class="copilot-btn-primary">Apply Session Key</button>
            <button type="button" id="copilotClearKeyBtn" class="copilot-btn-danger" title="Clear key">Clear</button>
          </div>
          <div class="copilot-status-note" id="copilotKeyStatusNote">
            Server keys in .env take priority and are completely invisible to student browsers.
          </div>
        </div>

        <div class="copilot-messages" id="copilotMsgContainer">
          <div class="copilot-bubble assistant">
            👋 <strong>Namaste!</strong> I am your <strong>AVNIET Placement AI Copilot</strong>.<br><br>
            I can inspect candidate performance, generate live leaderboards, and analyze institutional metrics across all departments.<br><br>
            🔒 <em>All AI queries run securely server-side. You can ask about students or rankings directly!</em>
          </div>
        </div>

        <div class="copilot-chips-row">
          <div class="copilot-chip" data-query="How did 245U1A67A3 perform?">📊 Check 245U1A67A3</div>
          <div class="copilot-chip" data-query="Show top 5 performers today">🏆 Top 5 Rankers</div>
          <div class="copilot-chip" data-query="Give me overall branch analytics">📈 Branch Stats</div>
          <div class="copilot-chip" data-query="Hi, what can you do?">👋 Capabilities</div>
        </div>

        <form class="copilot-footer" id="copilotChatForm" onsubmit="return false;">
          <input type="text" id="copilotTextInput" class="copilot-input" placeholder="Ask about students, exams, or scores..." autocomplete="off">
          <button type="submit" id="copilotSendBtn" class="copilot-send-btn" title="Send message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      `;
      document.body.appendChild(drawer);
    }

    attachEvents() {
      // Hotkey Alt + C to toggle copilot
      document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key.toLowerCase() === 'c') {
          e.preventDefault();
          this.toggleDrawer();
        }
      });

      // Close button
      const closeBtn = document.getElementById('copilotCloseBtn');
      if (closeBtn) closeBtn.onclick = () => this.toggleDrawer();

      // Brain badge and settings toggle
      const brainBadge = document.getElementById('copilotBrainBadge');
      if (brainBadge) brainBadge.onclick = () => this.toggleSettings();

      const settingsBtn = document.getElementById('copilotSettingsBtn');
      if (settingsBtn) settingsBtn.onclick = () => this.toggleSettings();

      // Save key
      const saveBtn = document.getElementById('copilotSaveKeyBtn');
      if (saveBtn) saveBtn.onclick = () => this.saveBrainSettings();

      // Clear key
      const clearBtn = document.getElementById('copilotClearKeyBtn');
      if (clearBtn) clearBtn.onclick = () => this.clearBrainSettings();

      // Toggle key visibility
      const toggleBtn = document.getElementById('copilotToggleKeyVisibility');
      if (toggleBtn) {
        toggleBtn.onclick = () => {
          const input = document.getElementById('copilotKeyInput');
          if (input) {
            input.type = input.type === 'password' ? 'text' : 'password';
          }
        };
      }

      // Quick Chips
      document.querySelectorAll('.copilot-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const q = chip.getAttribute('data-query');
          if (q) this.sendQuickPrompt(q);
        });
      });

      // Chat Form Submit
      const form = document.getElementById('copilotChatForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleSubmit();
        });
      }
    }

    toggleDrawer() {
      this.isOpen = !this.isOpen;
      const drawer = document.getElementById('copilotDrawer');
      const fab = document.getElementById('copilotLauncherBtn');
      if (drawer) {
        drawer.classList.toggle('open', this.isOpen);
      }
      if (fab) {
        fab.style.display = this.isOpen ? 'none' : 'flex';
      }
      if (this.isOpen) {
        setTimeout(() => {
          const input = document.getElementById('copilotTextInput');
          if (input) input.focus();
        }, 100);
      }
    }

    toggleSettings() {
      this.isSettingsOpen = !this.isSettingsOpen;
      const panel = document.getElementById('copilotSettingsPanel');
      if (panel) {
        panel.style.display = this.isSettingsOpen ? 'block' : 'none';
        if (this.isSettingsOpen) {
          this.loadBrainSettingsIntoUI();
        }
      }
    }

    loadBrainSettingsIntoUI() {
      const providerSelect = document.getElementById('copilotProviderSelect');
      const keyInput = document.getElementById('copilotKeyInput');
      const listEl = document.getElementById('copilotServerBrainsList');
      const savedProvider = localStorage.getItem(this.storageProviderName) || 'auto';
      const savedKey = localStorage.getItem(this.storageActiveKeyName) || '';

      if (providerSelect) providerSelect.value = savedProvider;
      if (keyInput) keyInput.value = savedKey;

      if (listEl) {
        if (this.serverBrainInfo && this.serverBrainInfo.configured && this.serverBrainInfo.providers.length > 0) {
          listEl.innerHTML = `🟢 <strong>Active Server Brain(s):</strong> ` + this.serverBrainInfo.providers.join(', ');
        } else {
          listEl.innerHTML = `<span style="color: #64748b;">No server keys set in <code>.env</code> or Render Dashboard yet. Set them server-side for maximum security.</span>`;
        }
      }
    }

    saveBrainSettings() {
      const providerSelect = document.getElementById('copilotProviderSelect');
      const keyInput = document.getElementById('copilotKeyInput');
      const note = document.getElementById('copilotKeyStatusNote');

      const provider = providerSelect ? providerSelect.value : 'auto';
      const key = keyInput ? keyInput.value.trim() : '';

      if (!key) {
        if (note) note.innerHTML = '⚠️ Please enter or paste an API key.';
        return;
      }

      localStorage.setItem(this.storageProviderName, provider);
      localStorage.setItem(this.storageActiveKeyName, key);

      let keysMap = {};
      try {
        keysMap = JSON.parse(localStorage.getItem(this.storageKeysName) || '{}');
      } catch(e) {}
      
      const detected = this.detectProvider(key, provider);
      keysMap[detected] = key;
      localStorage.setItem(this.storageKeysName, JSON.stringify(keysMap));

      if (note) {
        note.innerHTML = `<span style="color: #10b981; font-weight: 600;">✅ Session key active for ${detected.toUpperCase()}.</span>`;
      }

      this.updateBrainBadge();

      setTimeout(() => {
        this.toggleSettings();
      }, 1200);
    }

    clearBrainSettings() {
      localStorage.removeItem(this.storageActiveKeyName);
      localStorage.removeItem(this.storageProviderName);
      localStorage.removeItem(this.storageKeysName);
      localStorage.removeItem('avniet_gemini_api_key');

      const keyInput = document.getElementById('copilotKeyInput');
      const note = document.getElementById('copilotKeyStatusNote');
      if (keyInput) keyInput.value = '';
      if (note) note.innerHTML = 'Session key cleared. Using server environment configuration.';

      this.updateBrainBadge();
    }

    detectProvider(key, selected) {
      if (selected && selected !== 'auto') return selected;
      const k = (key || '').trim();
      if (k.startsWith('gsk_')) return 'groq';
      if (k.startsWith('sk-or-')) return 'openrouter';
      if (k.startsWith('AIza')) return 'gemini';
      if (k.startsWith('sk-')) return 'openai';
      return 'gemini';
    }

    updateBrainBadge() {
      const badge = document.getElementById('copilotBrainBadge');
      if (!badge) return;

      // Check server brain first (enterprise standard)
      if (this.serverBrainInfo && this.serverBrainInfo.configured && this.serverBrainInfo.providers.length > 0) {
        const topProvider = this.serverBrainInfo.providers[0];
        badge.innerHTML = `🟢 Server: ${topProvider.split(' ')[0]}`;
        badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        badge.style.color = '#34d399';
        return;
      }

      const activeKey = localStorage.getItem(this.storageActiveKeyName) || '';
      const selected = localStorage.getItem(this.storageProviderName) || 'auto';

      if (!activeKey) {
        badge.innerHTML = '⚪ Local Brain';
        badge.style.borderColor = 'rgba(148, 163, 184, 0.4)';
        badge.style.color = '#94a3b8';
        return;
      }

      const p = this.detectProvider(activeKey, selected);
      badge.innerHTML = `🟢 Session: ${p.toUpperCase()}`;
      badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      badge.style.color = '#34d399';
    }

    sendQuickPrompt(text) {
      const input = document.getElementById('copilotTextInput');
      if (input) {
        input.value = text;
        this.handleSubmit();
      }
    }

    async handleSubmit() {
      const input = document.getElementById('copilotTextInput');
      if (!input) return;
      const query = input.value.trim();
      if (!query || this.isBusy) return;

      input.value = '';
      this.appendMessage('user', query);
      this.isBusy = true;
      this.updateSendButton(true);

      const loadingId = this.appendLoadingIndicator();

      try {
        const apiKey = localStorage.getItem(this.storageActiveKeyName) || "";
        const provider = localStorage.getItem(this.storageProviderName) || "auto";

        const res = await fetch('/api/ai/copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            history: this.history.slice(-8),
            apiKey: apiKey,
            provider: provider
          })
        });

        const data = await res.json();
        this.removeLoadingIndicator(loadingId);

        if (data && data.success) {
          this.appendMessage('assistant', data.response, data.card, data.provider);
          this.history.push({ role: 'user', text: query });
          this.history.push({ role: 'assistant', text: data.response });
        } else {
          this.appendMessage('assistant', data.message || "I encountered an error querying the placement database. Please verify your connection.");
        }
      } catch (err) {
        console.error("Copilot query error:", err);
        this.removeLoadingIndicator(loadingId);
        this.appendMessage('assistant', "⚠️ Network connection interrupted. Please try again.");
      } finally {
        this.isBusy = false;
        this.updateSendButton(false);
      }
    }

    appendMessage(role, text, card = null, providerName = null) {
      const container = document.getElementById('copilotMsgContainer');
      if (!container) return;

      const bubble = document.createElement('div');
      bubble.className = `copilot-bubble ${role}`;
      bubble.innerHTML = this.formatMarkdown(text);

      if (card) {
        const cardEl = document.createElement('div');
        cardEl.className = 'copilot-card';
        cardEl.innerHTML = card.html || '';
        bubble.appendChild(cardEl);
      }

      if (role === 'assistant' && providerName) {
        const tag = document.createElement('span');
        tag.className = 'copilot-attribution-tag';
        tag.textContent = `⚡ via ${providerName} (Server-Side)`;
        bubble.appendChild(tag);
      }

      container.appendChild(bubble);
      container.scrollTop = container.scrollHeight;
    }

    appendLoadingIndicator() {
      const container = document.getElementById('copilotMsgContainer');
      if (!container) return null;

      const id = 'copilot_loading_' + Date.now();
      const bubble = document.createElement('div');
      bubble.id = id;
      bubble.className = 'copilot-bubble assistant';
      bubble.style.cssText = 'display: flex; gap: 6px; align-items: center; padding: 10px 14px;';
      bubble.innerHTML = `
        <span style="font-size: 11px; color: #64748b; font-weight: 600;">Copilot querying AVNIET tools</span>
        <span style="display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #2563eb; animation: copilotPulse 1s infinite;"></span>
      `;
      container.appendChild(bubble);
      container.scrollTop = container.scrollHeight;
      return id;
    }

    removeLoadingIndicator(id) {
      if (!id) return;
      const el = document.getElementById(id);
      if (el) el.remove();
    }

    updateSendButton(disabled) {
      const btn = document.getElementById('copilotSendBtn');
      if (btn) btn.disabled = disabled;
    }

    formatMarkdown(txt) {
      if (!txt) return '';
      return txt
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code style="background: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace;">$1</code>')
        .replace(/\n/g, '<br>');
    }
  }

  const copilotInstance = new PlacementCopilotUI();
  global.PlacementCopilot = copilotInstance;

  window.addEventListener('DOMContentLoaded', () => {
    copilotInstance.init();
  });

})(typeof window !== 'undefined' ? window : this);
