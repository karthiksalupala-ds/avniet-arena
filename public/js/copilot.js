/**
 * ==============================================================
 * AVNIET ARENA — FLOATING AI PLACEMENT COPILOT (WebMCP-Powered)
 * Real-time Conversational Controller for Students, Exams & Anti-Cheat
 * ==============================================================
 */

(function(global) {
  'use strict';

  class PlacementCopilotUI {
    constructor() {
      this.isOpen = false;
      this.history = [];
      this.isBusy = false;
    }

    init() {
      this.injectStyles();
      this.injectDOM();
      this.attachEvents();
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
          width: 420px;
          max-width: calc(100vw - 32px);
          height: 580px;
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
        }
        .copilot-drawer.open {
          transform: translateY(0) scale(1);
          opacity: 1;
          pointer-events: auto;
        }

        /* Drawer Header */
        .copilot-header {
          padding: 16px 18px;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          color: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .copilot-header-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .copilot-crest {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3px;
        }
        .copilot-crest img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .copilot-close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: color 0.15s;
        }
        .copilot-close-btn:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.1);
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
          max-width: 86%;
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
          transition: transform 0.15s, background 0.15s;
        }
        .copilot-send-btn:hover {
          background: #1d4ed8;
          transform: scale(1.05);
        }
        .copilot-send-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          transform: none;
        }

        /* Tool Result Cards */
        .copilot-card {
          margin-top: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px;
          font-size: 12px;
        }
        .copilot-card-header {
          font-weight: 800;
          color: #0f2b5c;
          margin-bottom: 6px;
          display: flex;
          justify-content: space-between;
        }
      `;
      document.head.appendChild(style);
    }

    injectDOM() {
      // 1. FAB Launcher
      const fab = document.createElement('button');
      fab.id = 'copilotLauncherBtn';
      fab.className = 'copilot-fab-btn';
      fab.innerHTML = `
        <span style="font-size: 16px;">✨</span>
        <span>AI Placement Copilot</span>
        <span class="copilot-fab-badge"></span>
      `;
      fab.onclick = () => this.toggleDrawer();
      document.body.appendChild(fab);

      // 2. Chat Drawer Window
      const drawer = document.createElement('div');
      drawer.id = 'copilotDrawer';
      drawer.className = 'copilot-drawer';
      drawer.innerHTML = `
        <div class="copilot-header">
          <div class="copilot-header-title">
            <div class="copilot-crest">
              <img src="assets/images/logo.png" alt="AVNIET">
            </div>
            <div>
              <div style="font-weight: 800; font-size: 14px;">AVNIET AI Placement Copilot</div>
              <div style="font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 4px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
                <span>WebMCP Database Connected</span>
              </div>
            </div>
          </div>
          <button class="copilot-close-btn" onclick="PlacementCopilot.toggleDrawer()">✕</button>
        </div>

        <div class="copilot-messages" id="copilotMsgContainer">
          <div class="copilot-bubble assistant">
            Hello Faculty! I am your <strong>Autonomous Placement AI Copilot</strong>.<br><br>
            You can ask me questions in plain English or Telugu/Tanglish, such as:
            <ul style="margin: 6px 0 0 16px; padding: 0;">
              <li><em>"245U1A67A3 student score & proctoring report ela undhi?"</em></li>
              <li><em>"Show today's top 5 performers"</em></li>
              <li><em>"Which branch has the highest accuracy?"</em></li>
              <li><em>"Create a 15-minute Python & SQL placement exam"</em></li>
            </ul>
          </div>
        </div>

        <div class="copilot-chips-row">
          <div class="copilot-chip" onclick="PlacementCopilot.sendQuickPrompt('Show me candidate 245U1A67A3 performance report')">👤 Student 245U1A67A3</div>
          <div class="copilot-chip" onclick="PlacementCopilot.sendQuickPrompt('Who are the top 5 performers across all tests?')">🏆 Top 5 Rankers</div>
          <div class="copilot-chip" onclick="PlacementCopilot.sendQuickPrompt('Show overall exam analytics & malpractice counts')">📊 Exam Overview</div>
          <div class="copilot-chip" onclick="PlacementCopilot.sendQuickPrompt('Create a 15 minute technical placement exam on DSA & DBMS')">⚡ Create Exam</div>
        </div>

        <form class="copilot-footer" id="copilotInputForm" onsubmit="event.preventDefault(); PlacementCopilot.handleSubmit();">
          <input type="text" id="copilotTextInput" class="copilot-input" placeholder="Ask AI Copilot about students, exams, or anti-cheat..." autocomplete="off">
          <button type="submit" id="copilotSendBtn" class="copilot-send-btn" title="Send Message">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
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
        const apiKey = localStorage.getItem('avniet_gemini_api_key') || "";
        const res = await fetch('/api/ai/copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            history: this.history.slice(-8),
            apiKey: apiKey
          })
        });

        const data = await res.json();
        this.removeLoadingIndicator(loadingId);

        if (data && data.success) {
          this.appendMessage('assistant', data.response, data.card);
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

    appendMessage(role, text, card = null) {
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
      bubble.style.cssText = 'display: flex; gap: 4px; align-items: center; padding: 10px 14px;';
      bubble.innerHTML = `
        <span style="font-size: 11px; color: #64748b; font-weight: 600;">AI Copilot querying WebMCP tools</span>
        <span style="display: inline-block; width: 4px; height: 4px; border-radius: 50%; background: #2563eb; animation: copilotPulse 1s infinite;"></span>
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
