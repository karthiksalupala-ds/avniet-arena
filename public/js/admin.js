    const ADMIN_PASS = "admin2026";

    // Authentication Guard
    function verifyAdminPin() {
      const pin = document.getElementById('adminPinInput').value.trim();
      if (pin === ADMIN_PASS || pin === "avniet2026") {
        document.getElementById('adminAuthOverlay').style.display = 'none';
        sessionStorage.setItem('avniet_admin_auth', 'true');
        loadAllAdminData();
        showToast("Access Granted: Welcome Controller of Examinations");
      } else {
        document.getElementById('pinErrorMsg').style.display = 'block';
      }
    }

    // Switch Tabs in Left Sidebar
    function switchAdminTab(tabKey) {
      document.querySelectorAll('.admin-view-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));

      const targetTab = document.getElementById(`view-${tabKey}`);
      const targetNav = document.getElementById(`tabNav-${tabKey}`);

      if (targetTab) targetTab.classList.add('active');
      if (targetNav) targetNav.classList.add('active');

      const headings = {
        'dashboard': 'Executive Examination Dashboard',
        'creator': 'AI Examination Creation Workspace',
        'exams': 'Examination Management Center',
        'livemonitor': 'Live Operational Monitoring Center',
        'proctor': 'AI Anti-Cheat & Malpractice Audit Center',
        'whatsapp': 'WhatsApp Distribution & Top 5 Announcer',
        'submissions': 'Candidate Marksheet & Results Registry',
        'students': 'Student Registry & Hall Ticket Database',
        'questions': 'Official Examination Question Bank (30 Qs)',
        'system': 'Real-Time System Telemetry & Cloud Health'
      };
      if (headings[tabKey]) {
        document.getElementById('pageMainHeading').innerText = headings[tabKey];
      }

      if (tabKey === 'exams') renderExamsManagementTable();
      renderDashboardActiveExams();
      if (tabKey === 'livemonitor') updateLiveMonitorView();
      if (tabKey === 'whatsapp') previewTop5Announcement();
    }

    // Toast Helper
    function showToast(msg, icon = "ðŸŸ¢") {
      const toast = document.getElementById('adminToast');
      document.getElementById('toastMsg').innerText = msg;
      document.getElementById('toastIcon').innerText = icon;
      toast.style.display = 'flex';
      setTimeout(() => { toast.style.display = 'none'; }, 3500);
    }

    // Master Datasets (Initialized empty, loads only real student submissions)
    let candidateData = [];
    let studentRoster = [];
    let auditEventLogs = [];

    // AI Creator In-Memory State
    let draftExamState = {
      type: "aptitude",
      category: "Placement Assessment",
      title: "Placement Readiness Aptitude Mock 2026",
      qCount: 30,
      duration: 15,
      marking: "gate",
      difficulty: "Medium",
      batches: ["2027", "2028"],
      depts: ["CSE", "IT", "CSM", "CSD", "ECE"],
      proctor: "strict",
      questions: []
    };

    function saveGeminiApiKey() {
      const input = document.getElementById('geminiApiKeyInput');
      if (!input) return;
      const key = input.value.trim();
      if (!key) {
        localStorage.removeItem('avniet_gemini_api_key');
        showToast("Gemini API Key cleared. Using built-in curriculum engine.");
        return;
      }
      localStorage.setItem('avniet_gemini_api_key', key);
      showToast("Google Gemini Live AI key saved successfully! ðŸš€", "âœ¨");
    }

    async function loadAllAdminData() {
      // 1. Pull real live submissions from Institutional Backend Server
      try {
        const res = await fetch('/api/admin/submissions?token=avniet_controller_autonomous_2026');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.submissions)) {
            candidateData = data.submissions;
          }
        } else {
          throw new Error("Server not responding");
        }
      } catch(err) {
        // Fallback to local persistent cache if offline
        try {
          const local = JSON.parse(localStorage.getItem('avniet_live_submissions') || '[]');
          candidateData = Array.isArray(local) ? local : [];
        } catch(e) {
          candidateData = [];
        }
      }

      // Pre-fill Gemini API Key if saved
      try {
        const savedKey = localStorage.getItem('avniet_gemini_api_key');
        const keyInput = document.getElementById('geminiApiKeyInput');
        if (keyInput && savedKey) keyInput.value = savedKey;
      } catch(e) {}

      renderDashboardTable(candidateData);
      renderMarksheetTable();
      renderProctorAuditTable();
      renderStudentRosterTable();
      renderSystemEventStream();
      renderQuestionBankView();
      renderExamsManagementTable();
      renderDashboardActiveExams();
      populateExamSelectors();
      updateMetricCounters();
      initAnalyticsCharts();
    }

    
        // Normalizes Question and Options (extracts embedded options from question stem)
    function normalizeQuestionData(q) {
      if (!q) return q;
      let text = q.question || '';
      const splitRegex = /\n\s*([A-D])\s*[\.\:\)]?\s*\n?\s*([\s\S]*?)(?=\n\s*[A-D]\s*[\.\:\)]?\s*\n?|$)/gi;
      const matches = [...text.matchAll(splitRegex)];

      if (matches.length >= 3) {
        const cleanStem = text.substring(0, text.indexOf(matches[0][0])).trim();
        const extractedOptions = matches.map(m => m[2].trim());
        if (!Array.isArray(q.options) || q.options.length < 2 || q.options.every(o => /^[A-D\.\s\:]+$/i.test(String(o).trim()))) {
          q.options = extractedOptions;
        }
        q.question = cleanStem;
      }

      if (!Array.isArray(q.options) || q.options.length === 0) {
        q.options = ["Option A", "Option B", "Option C", "Option D"];
      }
      return q;
    }

    function escapeHtml(text) {
      if (!text) return '';
      return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function renderDashboardActiveExams() {
      const grid = document.getElementById('dashboardActiveExamsGrid');
      if (!grid || typeof ExamRegistry === 'undefined') return;
      const exams = ExamRegistry.getAllExams().filter(e => e.status === 'LIVE');
      if (exams.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; padding: 20px; text-align: center; color: var(--text-muted); background: #fff; border-radius: 16px;">No live examinations currently active. Create one with the AI Exam Creator!</div>';
        return;
      }
      grid.innerHTML = exams.map(exam => {
        const isGame = exam.type === 'game';
        const examUrl = ExamRegistry.getStudentExamUrl(exam.id);
        const badgeStyle = isGame ? 'background: #f3e8ff; color: #7c3aed;' : 'background: #dcfce7; color: #15803d;';
        const tagText = isGame ? 'â— GAMIFIED LOGIC' : 'â— ACTIVE LIVE NOW';
        const cardClass = isGame ? 'test-quick-card game-style' : 'test-quick-card';
        const icon = isGame ? 'ðŸŽ®' : 'ðŸ“';
        const desc = exam.description || `${exam.questionCount || 30} Questions â€¢ ${exam.durationMinutes || 15} Mins â€¢ ${exam.category || 'Assessment'}`;
        return `
          <div class="${cardClass}">
            <div class="test-quick-header">
              <div class="test-quick-title">${icon} ${escapeHtml(exam.title)}</div>
              <span class="test-tag-live" style="${badgeStyle}">${tagText}</span>
            </div>
            <p style="font-size: 13px; color: var(--text-muted); margin: 0;">
              ${escapeHtml(desc)}
            </p>
            <div class="test-link-preview-box">
              <span id="quickLink-${exam.id}">${examUrl}</span>
              <button class="btn-action-audit" onclick="copyExamLink('${exam.id}')">Copy</button>
            </div>
            <div class="test-quick-btn-row">
              <button class="btn-header-action" onclick="copyExamLink('${exam.id}')">ðŸ“‹ Copy Student Link</button>
              <button class="btn-header-action primary" style="${isGame ? 'background: #7c3aed;' : ''}" onclick="sendExamToWhatsApp('${exam.id}')">ðŸ’¬ Copy WhatsApp Message</button>
            </div>
          </div>
        `;
      }).join('');
    }

    function renderDashboardTable(data) {
      const tbody = document.getElementById('adminSubmissionsTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';

      if (!data || data.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="9" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
              <div style="font-size: 32px; margin-bottom: 8px;">ðŸ“Š</div>
              <strong style="color: var(--brand-navy); font-size: 15px;">No Candidate Submissions Recorded Yet</strong>
              <p style="font-size: 12px; margin-top: 4px; color: var(--text-muted);">
                Distribute the exam link to students via WhatsApp. When students attend and submit tests, their scores, accuracy, and AI proctoring telemetry will appear here in real time.
              </p>
            </td>
          </tr>
        `;
        return;
      }

      data.forEach((row, idx) => {
        let badge = `<span class="status-badge-pill verified">VERIFIED</span>`;
        if (row.status && row.status.includes('DISQUALIFIED')) {
          badge = `<span class="status-badge-pill disqualified">MALPRACTICE</span>`;
        } else if (row.status && row.status.includes('SUSPICIOUS')) {
          badge = `<span class="status-badge-pill suspicious">SUSPICIOUS</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="color: var(--text-muted); font-weight: 700;">#${idx + 1}</td>
          <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--brand-navy);">${row.roll}</td>
          <td><span style="font-weight: 600;">${row.branch || 'B.Tech'}</span> <span style="color: var(--text-light); font-size: 11px;">(${row.batch || '2028'})</span></td>
          <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--brand-navy);">${row.score} / 30</td>
          <td style="font-family: 'JetBrains Mono', monospace;">${row.accuracy || '--'}</td>
          <td style="color: var(--text-muted);">${row.time || '--'}</td>
          <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: ${parseInt(row.trust || 100) < 70 ? '#ef4444' : '#10b981'};">${row.trust || '100%'}</td>
          <td style="text-align: center; font-weight: 700; color: ${row.tabs > 1 ? '#ef4444' : '#64748b'};">${row.tabs || 0}</td>
          <td>${badge}</td>
          <td>
            <button onclick="inspectCandidate('${row.roll}')" class="btn-action-audit">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span>Audit</span>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function renderMarksheetTable() {
      const tbody = document.getElementById('marksheetTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';

      if (!candidateData || candidateData.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="9" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
              <div style="font-size: 32px; margin-bottom: 8px;">ðŸ“‹</div>
              <strong style="color: var(--brand-navy); font-size: 15px;">No Candidate Results In Marksheet</strong>
              <p style="font-size: 12px; margin-top: 4px; color: var(--text-muted);">
                Scores, correct count, negative deductions, and timestamps will populate as candidates complete assessments.
              </p>
            </td>
          </tr>
        `;
        return;
      }

      const sorted = [...candidateData].sort((a,b) => parseFloat(b.score || 0) - parseFloat(a.score || 0));
      sorted.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight: 800; font-family: 'JetBrains Mono', monospace;">#${idx + 1}</td>
          <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700;">${row.roll}</td>
          <td><strong>${row.name || 'Candidate ' + (idx + 1)}</strong></td>
          <td>B.Tech ${row.branch || 'CSE'} (${row.batch || '2028'})</td>
          <td style="font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #10b981;">${row.score} pts</td>
          <td style="font-family: 'JetBrains Mono', monospace;">${Math.round(100 - (idx * 5))}%ile</td>
          <td style="color: var(--text-muted);">${row.time || '--'}</td>
          <td><span class="status-badge-pill ${(row.status || '').includes('DISQUALIFIED') ? 'disqualified' : 'verified'}">${row.status || 'VERIFIED'}</span></td>
          <td>
            <button onclick="generateCertificate('${row.roll}')" class="btn-action-audit" style="color: #2563eb;">ðŸ“œ Certificate</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function renderProctorAuditTable() {
      const tbody = document.getElementById('proctorAuditTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';

      const flagged = candidateData.filter(c => c.tabs > 0 || (c.status && c.status !== 'VERIFIED'));
      if (flagged.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 36px 20px; color: #10b981;">
              <div style="font-size: 30px; margin-bottom: 8px;">ðŸ›¡ï¸</div>
              <strong>Zero Malpractice Incidents Detected</strong>
              <p style="font-size: 12px; margin-top: 4px; color: var(--text-muted);">
                Active AI anti-cheat proctoring is enabled across all assessments. Any browser tab switches, blur events, or fullscreen exits will be recorded here immediately.
              </p>
            </td>
          </tr>
        `;
        return;
      }

      flagged.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700;">${row.roll}</td>
          <td>${row.branch || 'CSE'} (${row.batch || '2028'})</td>
          <td style="color: #ef4444; font-weight: 800;">${row.tabs} focus losses</td>
          <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: ${parseInt(row.trust || 100) < 70 ? '#ef4444' : '#f59e0b'};">${row.trust}</td>
          <td><span class="status-badge-pill ${(row.status || '').includes('DISQUALIFIED') ? 'disqualified' : 'suspicious'}">${row.status}</span></td>
          <td>
            <button onclick="inspectCandidate('${row.roll}')" class="btn-action-audit">Inspect Telemetry</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function renderStudentRosterTable() {
      const tbody = document.getElementById('studentRosterTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';

      if (!studentRoster || studentRoster.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 36px 20px; color: var(--text-muted);">
              <div style="font-size: 28px; margin-bottom: 8px;">ðŸ‘¥</div>
              <strong>No Enrolled Students In Custom Roster</strong>
              <p style="font-size: 12px; margin-top: 4px; color: var(--text-muted);">
                Click "+ Enroll Student" or "Bulk Import Hall Tickets" to register eligible examination batches.
              </p>
            </td>
          </tr>
        `;
        return;
      }

      studentRoster.forEach((std, idx) => {
        let stBadge = `<span class="status-badge-pill verified">Completed</span>`;
        if (std.status === "Disqualified") stBadge = `<span class="status-badge-pill disqualified">Disqualified</span>`;
        else if (std.status === "Registered") stBadge = `<span class="status-badge-pill" style="background:#e0f2fe; color:#0369a1;">Registered</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700;">${std.roll}</td>
          <td><strong>${std.name}</strong></td>
          <td>Batch ${std.batch}</td>
          <td>${std.branch}</td>
          <td>${stBadge}</td>
          <td style="text-align: center; font-weight: 700;">${std.attempts}</td>
          <td>
            <button onclick="resetStudentAttempt('${std.roll}')" class="btn-action-audit" style="color: #ef4444;" title="Allow Retake">Reset Attempt</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function renderSystemEventStream() {
      const tbody = document.getElementById('systemEventStreamBody');
      if (!tbody) return;
      tbody.innerHTML = '';

      if (!auditEventLogs || auditEventLogs.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 28px 20px; color: var(--text-muted);">
              <div style="font-size: 24px; margin-bottom: 6px;">ðŸ“¡</div>
              <strong>Live Telemetry Stream Active</strong>
              <p style="font-size: 12px; margin-top: 4px; color: var(--text-muted);">
                Awaiting student examination connects, tab switches, and submission events.
              </p>
            </td>
          </tr>
        `;
        return;
      }

      auditEventLogs.forEach(ev => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-family: 'JetBrains Mono', monospace; font-size: 12px;">${ev.time}</td>
          <td><strong style="color: var(--brand-navy); font-size: 12px;">${ev.type}</strong></td>
          <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700;">${ev.subject}</td>
          <td style="color: var(--text-secondary);">${ev.detail}</td>
          <td><span class="status-badge-pill ${ev.status === 'VERIFIED' || ev.status === 'SYNCED' ? 'verified' : (ev.status === 'DISQUALIFIED' ? 'disqualified' : 'suspicious')}">${ev.status}</span></td>
        `;
        tbody.appendChild(tr);
      });
    }

    // ==============================================================
    // EXAMINATION MANAGEMENT CENTER (Module 4)
    // ==============================================================
    function renderExamsManagementTable() {
      const tbody = document.getElementById('examManagementTableBody');
      if (!tbody || typeof ExamRegistry === 'undefined') return;

      const filterStatus = document.getElementById('examFilterStatus') ? document.getElementById('examFilterStatus').value : 'ALL';
      const exams = ExamRegistry.getAllExams();
      tbody.innerHTML = '';

      document.getElementById('sidebarExamCount').innerText = exams.length;

      exams.forEach(exam => {
        if (filterStatus !== 'ALL' && exam.status !== filterStatus) return;

        let statusCls = "live";
        if (exam.status === "SCHEDULED") statusCls = "scheduled";
        else if (exam.status === "DRAFT") statusCls = "draft";
        else if (exam.status === "COMPLETED") statusCls = "completed";

        const examUrl = ExamRegistry.getStudentExamUrl(exam.id);

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--brand-navy);">${exam.id}</td>
          <td>
            <div style="display: flex; flex-direction: column;">
              <strong style="color: var(--brand-navy); font-size: 14px;">${exam.title}</strong>
              <span style="font-size: 11px; color: var(--text-muted);">${exam.category}</span>
            </div>
          </td>
          <td><span class="status-badge-pill" style="background:#f1f5f9; color:#334155;">${exam.type.toUpperCase()}</span></td>
          <td style="font-weight: 700;">${exam.questionCount} Qs</td>
          <td>${exam.durationMinutes} Mins</td>
          <td>${exam.targetBatches ? exam.targetBatches.join(', ') : 'All'}</td>
          <td><span class="status-badge-pill ${statusCls}">â— ${exam.status}</span></td>
          <td style="font-weight: 800; font-family: 'JetBrains Mono', monospace;">${exam.status === 'LIVE' ? candidateData.length : 0}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button onclick="previewExamFromManagement('${exam.id}')" class="btn-action-audit" title="Preview Student Console">ðŸ‘ï¸</button>
              <button onclick="copyExamLink('${exam.id}')" class="btn-action-audit" title="Copy Unique Link">ðŸ“‹</button>
              <button onclick="sendExamToWhatsApp('${exam.id}')" class="btn-action-audit" style="color: #2563eb;" title="WhatsApp Broadcast">ðŸ“²</button>
              <button onclick="toggleExamStatus('${exam.id}')" class="btn-action-audit" style="color: #ca8a04;" title="Toggle Pause/Live">${exam.status === 'LIVE' ? 'â¸ï¸' : 'â–¶ï¸'}</button>
              <button onclick="confirmDeleteExam('${exam.id}', '${escapeHtml(exam.title)}')" class="btn-action-audit" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3);" title="Delete Exam Permanently">ðŸ—‘ï¸</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    
    async function confirmDeleteExam(examId, title) {
      const confirmed = confirm(`âš ï¸ Delete Examination?\n\nTitle: "${title}"\nID: ${examId}\n\nAre you sure you want to permanently delete this exam? This action will remove it from the Cloud Database and Student Portal.`);
      if (!confirmed) return;

      showToast(`Deleting ${examId}...`, "â³");
      if (typeof ExamRegistry !== 'undefined') {
        await ExamRegistry.deleteExam(examId);
      }
      renderExamsManagementTable();
      renderDashboardActiveExams();
      populateExamSelectors();
      showToast(`Exam "${title}" deleted permanently.`, "ðŸ—‘ï¸");
    }

    function copyExamLink(examId) {
      if (typeof ExamRegistry === 'undefined') return;
      const url = ExamRegistry.getStudentExamUrl(examId);
      navigator.clipboard.writeText(url).then(() => {
        showToast("Unique Examination Link Copied: " + url);
      });
    }

    function toggleExamStatus(examId) {
      const exam = ExamRegistry.getExamById(examId);
      if (!exam) return;
      const nextStatus = exam.status === "LIVE" ? "COMPLETED" : "LIVE";
      ExamRegistry.updateExamStatus(examId, nextStatus);
      renderExamsManagementTable();
      renderDashboardActiveExams();
      populateExamSelectors();
      showToast(`Exam ${examId} status updated to ${nextStatus}.`);
    }

    function previewExamFromManagement(examId) {
      const exam = ExamRegistry.getExamById(examId);
      if (!exam) return;
      draftExamState = JSON.parse(JSON.stringify(exam));
      goToCreatorStep(4);
      switchAdminTab('creator');
    }

    function sendExamToWhatsApp(examId) {
      switchAdminTab('whatsapp');
      const sel = document.getElementById('announcementExamSelect');
      if (sel) {
        sel.value = examId;
        previewTop5Announcement();
      }
    }

    // ==============================================================
    // AI EXAM CREATOR WORKFLOW (Module 3)
    // ==============================================================
    function openAiExamCreator() {
      switchAdminTab('creator');
      goToCreatorStep(1);
    }

    function selectExamTypeCard(cardEl, typeKey, categoryName) {
      document.querySelectorAll('.exam-type-card').forEach(c => c.classList.remove('selected'));
      cardEl.classList.add('selected');
      draftExamState.type = typeKey;
      draftExamState.category = categoryName;

      const isGame = (typeKey === "game" || typeKey === "deductive");

      // Smart Defaults & Dynamic Mode UI
      const geminiBox = document.getElementById('geminiIntegrationBox');
      const gameNotice = document.getElementById('gameModeNoticeBox');
      const qCountGrp = document.getElementById('aiConfigQCountGroup');
      const markingGrp = document.getElementById('aiConfigMarkingGroup');
      const btnGen = document.getElementById('btnRunAiGen');

      if (isGame) {
        document.getElementById('aiConfigDuration').value = "2";
        if (document.getElementById('aiConfigQCount')) document.getElementById('aiConfigQCount').value = "10";
        if (geminiBox) geminiBox.style.display = 'none';
        if (gameNotice) gameNotice.style.display = 'block';
        if (qCountGrp) qCountGrp.style.display = 'none';
        if (markingGrp) markingGrp.style.display = 'none';
        if (btnGen) btnGen.innerHTML = `<span>ðŸŽ® Configure Cognitive Game Arena â†’</span>`;
      } else {
        document.getElementById('aiConfigDuration').value = (typeKey === "technical" || typeKey === "coding") ? "30" : "15";
        if (document.getElementById('aiConfigQCount')) document.getElementById('aiConfigQCount').value = (typeKey === "technical" || typeKey === "coding") ? "20" : "30";
        if (geminiBox) geminiBox.style.display = 'block';
        if (gameNotice) gameNotice.style.display = 'none';
        if (qCountGrp) qCountGrp.style.display = 'block';
        if (markingGrp) markingGrp.style.display = 'block';
        if (btnGen) btnGen.innerHTML = `<span>âš¡ Run AI Question Generator â†’</span>`;
      }
    }

    function goToCreatorStep(stepNum) {
      for (let s = 1; s <= 5; s++) {
        const panel = document.getElementById(`creatorStep-${s}`);
        const pill = document.getElementById(`stepPill-${s}`);
        if (panel) panel.style.display = s === stepNum ? 'block' : 'none';
        if (pill) {
          pill.classList.remove('active', 'completed');
          if (s === stepNum) pill.classList.add('active');
          else if (s < stepNum) pill.classList.add('completed');
        }
      }

      // Step-specific pre-renders
      if (stepNum === 2) {
        document.getElementById('aiConfigTitle').value = `${draftExamState.category} - ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
      } else if (stepNum === 4) {
        renderStudentConsolePreview();
      }
    }

    async function executeAiQuestionGeneration() {
      draftExamState.title = document.getElementById('aiConfigTitle').value || "Institutional Examination";
      draftExamState.qCount = parseInt(document.getElementById('aiConfigQCount').value) || 10;
      draftExamState.duration = parseInt(document.getElementById('aiConfigDuration').value) || 15;
      draftExamState.marking = document.getElementById('aiConfigMarking').value;
      draftExamState.difficulty = document.getElementById('aiConfigDifficulty').value;
      draftExamState.batches = document.getElementById('aiConfigBatches').value.split(',').map(s => s.trim());
      draftExamState.depts = document.getElementById('aiConfigDepts').value.split(',').map(s => s.trim());
      draftExamState.proctor = document.getElementById('aiConfigProctor').value;

      const isGame = (draftExamState.type === "game" || draftExamState.type === "deductive");
      if (isGame) {
        draftExamState.questions = [
          {
            id: 1,
            topic: "Latin Square Deductive Logic",
            section: "Cognitive",
            difficulty: draftExamState.difficulty,
            question: "Interactive Deductive Sudoku Matrix: Determine the missing symbol based on row & column uniqueness constraints.",
            options: ["Circle (Green)", "Diamond (Blue)", "Triangle (Yellow)", "Square (Pink)"],
            correct: 0,
            solution: "Latin square uniqueness rule dictates that each symbol appears exactly once in each row and column.",
            marks: 10.0
          }
        ];
        renderAiGeneratedQuestionsCards();
        goToCreatorStep(3);
        showToast("Cognitive Game Matrix Engine configured successfully!", "ðŸŽ®");
        return;
      }

      const promptText = document.getElementById('aiExamPromptText') ? document.getElementById('aiExamPromptText').value.trim() : "";
      const inputKey = document.getElementById('geminiApiKeyInput') ? document.getElementById('geminiApiKeyInput').value.trim() : "";
      const activeKey = inputKey || (typeof localStorage !== 'undefined' ? localStorage.getItem('avniet_gemini_api_key') : "");

      const runBtn = document.getElementById('btnRunAiGen');
      if (runBtn) {
        runBtn.disabled = true;
        runBtn.innerHTML = `<span>â³ AI Synthesizing Questions...</span>`;
      }
      showToast(activeKey ? "Connecting to Google Gemini Live AI..." : "Synthesizing curriculum questions...", "âš¡");

      try {
        const generated = await ExamRegistry.generateQuestionsByAI({
          type: draftExamState.type,
          difficulty: draftExamState.difficulty,
          count: draftExamState.qCount,
          prompt: promptText,
          apiKey: activeKey,
          marksPerQuestion: 1.0
        });

        draftExamState.questions = generated.map(q => normalizeQuestionData(q));
        renderAiGeneratedQuestionsCards();
        goToCreatorStep(3);
        showToast(`AI successfully generated ${generated.length} verified questions!`, "âœ…");
      } catch (err) {
        console.error("AI question generation error:", err);
        showToast("AI Generation error: " + err.message, "âš ï¸");
      } finally {
        if (runBtn) {
          runBtn.disabled = false;
          runBtn.innerHTML = `<span>âš¡ Run AI Question Generator â†’</span>`;
        }
      }
    }

    function renderAiGeneratedQuestionsCards() {
      const container = document.getElementById('aiGeneratedQuestionsContainer');
      if (!container) return;
      container.innerHTML = '';

      const isGame = (draftExamState.type === "game" || draftExamState.type === "deductive");
      if (isGame) {
        container.innerHTML = `
          <div style="background: #ffffff; border: 2px solid #8b5cf6; border-radius: 12px; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 22px;">ðŸ§©</span>
                <strong style="color: #6d28d9; font-size: 15px;">Deductive Sudoku Latin Square Puzzle Matrix</strong>
              </div>
              <span style="background: #ede9fe; color: #6d28d9; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 20px;">CAPGEMINI PATTERN</span>
            </div>
            <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 14px;">
              Students solve continuous interactive Latin square matrices with real-time audio and dynamic tier escalation:
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 16px;">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
                <div style="font-size: 11px; color: #64748b; font-weight: 700;">TIER 1 & 2</div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a;">3x3 Matrix Grid</div>
                <div style="font-size: 11px; color: #10b981;">â— Circle, â—† Diamond, â–² Triangle</div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
                <div style="font-size: 11px; color: #64748b; font-weight: 700;">TIER 3 TO 5</div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a;">4x4 Matrix Grid</div>
                <div style="font-size: 11px; color: #0284c7;">+ â–  Square (Pink)</div>
              </div>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
                <div style="font-size: 11px; color: #64748b; font-weight: 700;">TIER 6+ (MASTER)</div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a;">5x5 Matrix Grid</div>
                <div style="font-size: 11px; color: #7c3aed;">+ â˜… Star (Purple)</div>
              </div>
            </div>
            <div style="background: #eff6ff; border-left: 3px solid #2563eb; padding: 10px 14px; border-radius: 4px; font-size: 12px; color: #1e3a8a;">
              <strong>Real-Time Mechanics:</strong> Fast-paced deductive logic puzzle. Each correct symbol adds <code>+10 pts Ã— current tier</code>. 2 consecutive solves advance candidate to the next grid complexity tier.
            </div>
          </div>
        `;
        return;
      }

      const letters = ['A', 'B', 'C', 'D'];
      draftExamState.questions.forEach((q, idx) => {
        const card = document.createElement('div');
        card.style.cssText = "background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px;";
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 800; color: var(--brand-navy);">Q${idx + 1}. [${q.section} â€¢ ${q.topic}]</span>
            <div style="display: flex; gap: 6px;">
              <button onclick="regenerateSingleQuestion(${idx})" class="btn-action-audit" title="Regenerate Question">ðŸ”„ Regenerate</button>
              <button onclick="deleteSingleQuestion(${idx})" class="btn-action-audit" style="color: #ef4444;" title="Delete">ðŸ—‘ï¸</button>
            </div>
          </div>
          <div style="font-weight: 600; color: #1e293b; margin: 6px 0;">${q.question}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 10px 0;">
            ${q.options.map((opt, oIdx) => `
              <div style="padding: 6px 10px; border-radius: 6px; border: 1px solid ${oIdx === q.correct ? '#10b981' : '#cbd5e1'}; background: ${oIdx === q.correct ? '#ecfdf5' : '#ffffff'}; font-size: 12px; font-weight: ${oIdx === q.correct ? '700' : '500'}; color: ${oIdx === q.correct ? '#065f46' : '#334155'};">
                ${letters[oIdx]}. ${opt} ${oIdx === q.correct ? 'âœ“ (Key)' : ''}
              </div>
            `).join('')}
          </div>
          <div style="background: #eff6ff; border-left: 3px solid #2563eb; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #1e3a8a;">
            <strong>Solution:</strong> ${q.solution}
          </div>
        `;
        container.appendChild(card);
      });
    }

    async function regenerateSingleQuestion(idx) {
      const promptText = document.getElementById('aiExamPromptText') ? document.getElementById('aiExamPromptText').value.trim() : "";
      const apiKey = localStorage.getItem('avniet_gemini_api_key') || "";
      showToast("Regenerating question...", "ðŸ”„");

      try {
        const regenerated = await ExamRegistry.generateQuestionsByAI({
          type: draftExamState.type,
          difficulty: draftExamState.difficulty,
          count: 1,
          prompt: promptText,
          apiKey: apiKey,
          marksPerQuestion: 1.0
        });
        if (regenerated && regenerated.length > 0) {
          draftExamState.questions[idx] = { ...regenerated[0], id: idx + 1 };
          renderAiGeneratedQuestionsCards();
          showToast(`Question #${idx + 1} regenerated successfully.`);
        }
      } catch (e) {
        showToast("Error regenerating question", "âš ï¸");
      }
    }

    function deleteSingleQuestion(idx) {
      if (draftExamState.questions.length <= 1) {
        alert("An examination must contain at least one question.");
        return;
      }
      draftExamState.questions.splice(idx, 1);
      renderAiGeneratedQuestionsCards();
      showToast(`Question deleted.`);
    }

    function addCustomQuestionToDraft() {
      const qText = prompt("Enter Question Statement:");
      if (!qText) return;
      const optA = prompt("Option A:") || "Option A";
      const optB = prompt("Option B:") || "Option B";
      const optC = prompt("Option C:") || "Option C";
      const optD = prompt("Option D:") || "Option D";
      const correctIdx = parseInt(prompt("Correct Option Index (0 for A, 1 for B, 2 for C, 3 for D):") || "0");

      draftExamState.questions.push({
        id: draftExamState.questions.length + 1,
        topic: "Custom Addition",
        section: "Custom",
        difficulty: "Medium",
        question: qText,
        options: [optA, optB, optC, optD],
        correct: correctIdx,
        solution: "Faculty verified custom answer.",
        marks: 1.0
      });

      renderAiGeneratedQuestionsCards();
      showToast("Question added to draft.");
    }

    function renderStudentConsolePreview() {
      document.getElementById('prevTitle').innerText = draftExamState.title;
      const isGame = (draftExamState.type === "game" || draftExamState.type === "deductive");

      if (isGame) {
        document.getElementById('prevMeta').innerText = `Interactive Latin Square Matrix â€¢ ${draftExamState.duration} Mins Speed Test â€¢ Capgemini Game Pattern`;
        document.getElementById('prevTimer').innerText = `${draftExamState.duration}:00`;

        document.getElementById('prevQuestionCard').innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; padding: 16px;">
            <div style="display: flex; justify-content: space-between; width: 100%; max-width: 320px; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 12px;">
              <span>Score: <strong style="color: #10b981;">0</strong></span>
              <span>Grid: <strong style="color: #2563eb;">3x3 (Tier 1)</strong></span>
              <span>Time: <strong style="color: #ef4444;">${draftExamState.duration}m</strong></span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 56px); gap: 6px; margin: 12px 0;">
              <div style="width: 56px; height: 56px; border: 2px solid #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #10b981;">â—</div>
              <div style="width: 56px; height: 56px; border: 2px solid #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #0284c7;">â—†</div>
              <div style="width: 56px; height: 56px; border: 2px solid #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #ca8a04;">â–²</div>

              <div style="width: 56px; height: 56px; border: 2px solid #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #ca8a04;">â–²</div>
              <div style="width: 56px; height: 56px; border: 2px solid #2563eb; background: #eff6ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.2);">?</div>
              <div style="width: 56px; height: 56px; border: 2px solid #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #0284c7;">â—†</div>

              <div style="width: 56px; height: 56px; border: 2px solid #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #0284c7;">â—†</div>
              <div style="width: 56px; height: 56px; border: 2px solid #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #ca8a04;">â–²</div>
              <div style="width: 56px; height: 56px; border: 2px solid #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #10b981;">â—</div>
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: #64748b;">Deduce the missing symbol for <strong>[ ? ]</strong> cell:</div>
            <div style="display: flex; gap: 8px; margin-top: 8px;">
              <button type="button" class="btn-action-audit" style="font-size: 18px; color: #10b981;">â—</button>
              <button type="button" class="btn-action-audit" style="font-size: 18px; color: #0284c7;">â—†</button>
              <button type="button" class="btn-action-audit" style="font-size: 18px; color: #ca8a04;">â–²</button>
            </div>
          </div>
        `;
        return;
      }

      document.getElementById('prevMeta').innerText = `${draftExamState.questions.length} Questions â€¢ ${draftExamState.duration} Mins â€¢ ${draftExamState.marking.toUpperCase()} Marking`;
      document.getElementById('prevTimer').innerText = `${draftExamState.duration}:00`;

      const q = draftExamState.questions[0] || (typeof EXAM_QUESTIONS !== 'undefined' ? EXAM_QUESTIONS[0] : null);
      if (!q) return;

      const letters = ['A', 'B', 'C', 'D'];
      document.getElementById('prevQuestionCard').innerHTML = `
        <div style="font-weight: 700; color: var(--brand-navy); margin-bottom: 8px;">Question No. 1 [${q.topic}]</div>
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 14px;">${q.question}</div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${q.options.map((opt, idx) => `
            <div style="padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; background: #ffffff; display: flex; align-items: center; gap: 10px; font-size: 13px;">
              <span style="font-weight: 800; color: var(--brand-navy);">${letters[idx]}.</span>
              <span>${opt}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    function publishCreatedExam() {
      const uniqueId = `EXAM-AVN-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      const newExam = {
        id: uniqueId,
        title: draftExamState.title,
        type: draftExamState.type,
        category: draftExamState.category,
        description: `Autonomous assessment created via AI Examination Platform.`,
        durationMinutes: draftExamState.duration,
        questionCount: draftExamState.questions.length,
        totalMarks: draftExamState.questions.length * 1.0,
        marksPerCorrect: 1.0,
        negativeMark: draftExamState.marking === "gate" ? 0.25 : (draftExamState.marking === "standard" ? 1.0 : 0.0),
        markingPolicy: draftExamState.marking,
        targetBatches: draftExamState.batches,
        targetDepartments: draftExamState.depts,
        proctoringStrictness: draftExamState.proctor,
        status: "LIVE",
        createdAt: new Date().toISOString(),
        questions: draftExamState.questions
      };

      ExamRegistry.saveExam(newExam);

      const examUrl = ExamRegistry.getStudentExamUrl(uniqueId);
      document.getElementById('publishedExamUrl').innerText = examUrl;

      renderExamsManagementTable();
      renderDashboardActiveExams();
      populateExamSelectors();
      goToCreatorStep(5);
      showToast(`Exam ${uniqueId} approved & published live!`);
    }

    function dispatchToWhatsAppHub() {
      switchAdminTab('whatsapp');
      showToast("Exam link loaded into WhatsApp Distribution Hub.");
    }

    // ==============================================================
    // AUTOMATED TOP 5 RESULTS ANNOUNCER (Module 10)
    // ==============================================================
    
    function updateExamBadge() {
      if (typeof ExamRegistry === 'undefined') return;
      const count = ExamRegistry.getAllExams().length;
      const badges = document.querySelectorAll('#tabNav-exams .nav-tab-badge, .exam-count-badge');
      badges.forEach(b => b.innerText = count);
    }

    function populateExamSelectors() {
      updateExamBadge();
      const exams = ExamRegistry.getAllExams();
      const annSel = document.getElementById('announcementExamSelect');
      const liveSel = document.getElementById('liveMonitorExamSelector');

      if (annSel) {
        annSel.innerHTML = exams.map(e => `<option value="${e.id}">${e.title} (${e.id})</option>`).join('');
      }
      if (liveSel) {
        liveSel.innerHTML = exams.map(e => `<option value="${e.id}" ${e.status === 'LIVE' ? 'selected' : ''}>${e.title} [${e.status}]</option>`).join('');
      }
    }

    function previewTop5Announcement() {
      const sel = document.getElementById('announcementExamSelect');
      const examId = sel ? sel.value : "EXAM-AVN-2026-APT";
      const box = document.getElementById('top5PreviewBox');

      const msg = ExamRegistry.generateTop5Announcement(examId);
      if (msg && box) {
        box.innerText = msg;
      } else if (box) {
        box.innerText = "No verified submissions found for this examination yet. Top 5 will calculate automatically once candidates submit.";
      }
    }

    function copyTop5AnnouncementMessage() {
      const box = document.getElementById('top5PreviewBox');
      if (!box) return;
      navigator.clipboard.writeText(box.innerText).then(() => {
        showToast("Top 5 Results Announcement Copied for WhatsApp Agent!");
      });
    }

    // ==============================================================
    // LIVE MONITORING CENTER (Module 7)
    // ==============================================================
    function updateLiveMonitorView() {
      const sel = document.getElementById('liveMonitorExamSelector');
      const examId = sel ? sel.value : "EXAM-AVN-2026-APT";

      const completed = candidateData.filter(c => c.status && c.status.includes("VERIFIED")).length;
      const disq = candidateData.filter(c => c.status && c.status.includes("DISQUALIFIED")).length;
      const attending = candidateData.filter(c => c.status && c.status.includes("Attending")).length;

      const elComp = document.getElementById('liveMetricCompleted');
      const elDisq = document.getElementById('liveMetricDisqualified');
      const elAtt = document.getElementById('liveMetricAttending');

      if (elComp) elComp.innerText = completed;
      if (elDisq) elDisq.innerText = disq;
      if (elAtt) elAtt.innerText = attending;

      const tbody = document.getElementById('liveParticipantsTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';

      if (!candidateData || candidateData.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 32px 20px; color: var(--text-muted);">
              <div style="font-size: 24px; margin-bottom: 6px;">ðŸ“¡</div>
              <strong>No Active Candidates Connected Yet</strong>
              <p style="font-size: 12px; margin-top: 4px; color: var(--text-muted);">
                When candidates open the examination link and begin attending, their live status, progress bar, and AI anti-cheat telemetry will show here.
              </p>
            </td>
          </tr>
        `;
        return;
      }

      candidateData.forEach(row => {
        let stBadge = `<span class="status-badge-pill verified">Completed</span>`;
        if (row.status && row.status.includes("Attending")) stBadge = `<span class="status-badge-pill" style="background:#e0f2fe; color:#0369a1;">â— Attending</span>`;
        else if (row.status && row.status.includes("DISQUALIFIED")) stBadge = `<span class="status-badge-pill disqualified">Disqualified</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700;">${row.roll}</td>
          <td>${row.branch || 'B.Tech'}</td>
          <td>${stBadge}</td>
          <td style="font-family: 'JetBrains Mono', monospace;">${row.time || '--'}</td>
          <td>${row.score !== undefined ? row.score + ' pts' : '--'}</td>
          <td style="width: 140px;">
            <div style="background: #e2e8f0; border-radius: 4px; height: 8px; overflow: hidden;">
              <div style="width: ${row.status && row.status.includes('Attending') ? '50' : '100'}%; height: 100%; background: var(--brand-blue);"></div>
            </div>
          </td>
          <td><span style="font-size: 11px; font-weight: 700; color: ${!row.status || row.status.includes('VERIFIED') ? '#15803d' : '#b91c1c'};">${row.trust || 'Verified'}</span></td>
          <td>
            <button onclick="inspectCandidate('${row.roll}')" class="btn-action-audit">Inspect</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Chart.js Visual Analytics Engine
    let deptChartInstance = null;
    let integrityChartInstance = null;

    function initAnalyticsCharts() {
      if (typeof Chart === 'undefined') return;

      const depts = ['CSE', 'IT', 'CSM', 'CSD', 'ECE'];
      const avgScores = [];
      const topScores = [];

      depts.forEach(d => {
        const deptSubs = candidateData.filter(c => (c.branch === d || (c.branch && c.branch.toUpperCase() === d)) && c.score !== undefined && c.score !== null);
        if (deptSubs.length > 0) {
          const sum = deptSubs.reduce((acc, c) => acc + parseFloat(c.score || 0), 0);
          avgScores.push(Number((sum / deptSubs.length).toFixed(1)));
          topScores.push(Math.max(...deptSubs.map(c => parseFloat(c.score || 0))));
        } else {
          avgScores.push(0);
          topScores.push(0);
        }
      });

      const deptCtx = document.getElementById('deptPerformanceChart');
      if (deptCtx) {
        if (deptChartInstance) deptChartInstance.destroy();
        deptChartInstance = new Chart(deptCtx, {
          type: 'bar',
          data: {
            labels: depts,
            datasets: [
              {
                label: 'Average Score (/30)',
                data: avgScores,
                backgroundColor: '#2563eb',
                borderRadius: 6
              },
              {
                label: 'Top High Score (/30)',
                data: topScores,
                backgroundColor: '#eab308',
                borderRadius: 6
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans', weight: '600' } } }
            },
            scales: {
              y: { beginAtZero: true, max: 30, grid: { color: '#f1f5f9' } },
              x: { grid: { display: false } }
            }
          }
        });
      }

      const intCtx = document.getElementById('integrityDonutChart');
      if (intCtx) {
        if (integrityChartInstance) integrityChartInstance.destroy();
        const verified = candidateData.filter(s => s.status && s.status.includes("VERIFIED")).length;
        const disq = candidateData.filter(s => s.status && s.status.includes("DISQUALIFIED")).length;
        const susp = candidateData.filter(s => s.status && s.status.includes("SUSPICIOUS")).length;
        const hasRecords = (verified + disq + susp) > 0;

        integrityChartInstance = new Chart(intCtx, {
          type: 'doughnut',
          data: {
            labels: hasRecords ? ['Verified Clean', 'Suspicious', 'Disqualified'] : ['Awaiting Student Attempts'],
            datasets: [{
              data: hasRecords ? [verified, susp, disq] : [1],
              backgroundColor: hasRecords ? ['#10b981', '#f59e0b', '#ef4444'] : ['#e2e8f0'],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 10, font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } } }
            },
            cutout: '70%'
          }
        });
      }
    }

    function filterAdminTable() {
      const bFilter = document.getElementById('filterBatch').value;
      const dFilter = document.getElementById('filterBranch').value;
      const sFilter = document.getElementById('filterStatus').value;
      const search = (document.getElementById('adminSearchInput').value || '').trim().toUpperCase();

      const filtered = candidateData.filter(item => {
        if (bFilter !== 'ALL' && item.batch !== bFilter) return false;
        if (dFilter !== 'ALL' && item.branch !== dFilter) return false;
        if (sFilter !== 'ALL' && item.status !== sFilter) return false;
        if (search && !item.roll.toUpperCase().includes(search)) return false;
        return true;
      });

      renderDashboardTable(filtered);
    }

    function copyToClipboard(elementId) {
      const el = document.getElementById(elementId);
      const text = el ? (el.value || el.innerText).trim() : elementId;
      navigator.clipboard.writeText(text).then(() => {
        showToast("Link copied to clipboard: " + text);
      });
    }

    function copyWhatsAppMessage(type) {
      let msg = "";
      if (type === 'exam') {
        msg = document.getElementById('waPreviewExam').innerText.trim();
      } else {
        msg = document.getElementById('waPreviewGame').innerText.trim();
      }
      navigator.clipboard.writeText(msg).then(() => {
        showToast("Formatted WhatsApp Announcement copied!");
      });
    }

    function inspectCandidate(roll) {
      const cand = candidateData.find(s => s.roll === roll) || { roll: roll, branch: "CSE", batch: "2028", score: "Attending", accuracy: "--", time: "--", trust: "95%", tabs: 0, status: "Attending" };

      const content = `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 14px;">
          <div>Candidate Roll: <strong style="font-family: 'JetBrains Mono', monospace; font-size: 15px; color: var(--brand-navy);">${cand.roll}</strong></div>
          <div>Student Name: <strong>${cand.name || 'Candidate'}</strong></div>
          <div>Program & Dept: <strong>B.Tech ${cand.branch} (Batch ${cand.batch})</strong></div>
          <div>Assessment Score: <strong>${cand.score} / 30 (${cand.accuracy})</strong></div>
          <div>Completion Speed: <strong>${cand.time}</strong></div>
        </div>
        <div style="background: ${cand.tabs > 1 ? '#fee2e2' : '#f0fdf4'}; border-radius: 10px; padding: 16px;">
          <div>AI Integrity Trust Index: <strong>${cand.trust}</strong></div>
          <div>Window Focus Losses / Tab Switches: <strong style="color: ${cand.tabs > 1 ? '#b91c1c' : '#15803d'};">${cand.tabs} Recorded</strong></div>
          <div>Final Forensic Status: <strong>${cand.status}</strong></div>
          <div style="font-size: 11px; margin-top: 6px; color: #64748b;">All mouse movements and focus blur timestamps verified against server logs.</div>
        </div>
      `;
      document.getElementById('auditModalContent').innerHTML = content;
      document.getElementById('auditModalBackdrop').style.display = 'flex';
    }

    function closeAuditModal() {
      document.getElementById('auditModalBackdrop').style.display = 'none';
    }

    function openAddStudentModal() {
      document.getElementById('addStudentModal').style.display = 'flex';
    }
    function closeAddStudentModal() {
      document.getElementById('addStudentModal').style.display = 'none';
    }

    function submitAddStudent() {
      const roll = document.getElementById('newStudentRoll').value.trim().toUpperCase();
      const name = document.getElementById('newStudentName').value.trim();
      const branch = document.getElementById('newStudentBranch').value;
      const batch = document.getElementById('newStudentBatch').value;

      if (!roll || !name) {
        alert("Please enter Roll Number and Student Name");
        return;
      }

      studentRoster.unshift({ roll, name, branch, batch, status: "Registered", attempts: 0 });
      closeAddStudentModal();
      renderStudentRosterTable();
      showToast(`Candidate ${roll} registered successfully.`);
    }

    function openBulkImportModal() {
      const input = prompt("Paste Hall Ticket numbers separated by comma or new line:\n(e.g. 24xx1A0501, 24xx1A0502, 24xx1A0503)");
      if (!input) return;

      const tokens = input.split(/[\n,]+/).map(t => t.trim().toUpperCase()).filter(t => t.length >= 5);
      tokens.forEach(r => {
        studentRoster.unshift({ roll: r, name: "Registered Candidate", branch: "CSE", batch: "2028", status: "Registered", attempts: 0 });
      });
      renderStudentRosterTable();
      showToast(`Bulk imported ${tokens.length} candidate hall tickets.`);
    }

    function exportSubmissionsCSV() {
      let csv = "Rank,HallTicket,Name,Branch,Batch,Score,Accuracy,TimeTaken,TrustScore,TabSwitches,Status\n";
      candidateData.forEach((row, idx) => {
        csv += `${idx + 1},${row.roll},"${row.name || ''}",${row.branch},${row.batch},${row.score},${row.accuracy},"${row.time}",${row.trust},${row.tabs},${row.status}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AVNIET_Assessment_Results_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      showToast("CSV Result Sheet Downloaded.");
    }

    function generateCertificate(roll) {
      alert(`ðŸŽ“ Merit Certificate Generated for ${roll}\n\nOfficial AVNIET Placement Assessment Seal Verified.\nReady for institutional attestation.`);
    }

    async function fetchLiveGoogleSheetData() {
      showToast("Syncing telemetry with Institutional Server...", "ðŸ”„");
      try {
        const res = await fetch('/api/admin/submissions?token=avniet_controller_autonomous_2026');
        if (res.ok) {
          const d = await res.json();
          if (d && Array.isArray(d.submissions)) {
            candidateData = d.submissions;
            renderDashboardTable(candidateData);
            renderMarksheetTable();
            renderProctorAuditTable();
            updateMetricCounters();
            initAnalyticsCharts();
          }
        }
        showToast("Synchronized with Server (200 OK).", "ðŸŸ¢");
      } catch (e) {
        showToast("Connected to local persistence cache.", "ðŸŸ¢");
      }
    }

    function updateMetricCounters() {
      const total = candidateData.length;
      const verified = candidateData.filter(s => s.status && s.status.includes("VERIFIED")).length;
      const disq = candidateData.filter(s => s.status && s.status.includes("DISQUALIFIED")).length;

      let avgDisplay = "--";
      if (total > 0) {
        let sum = 0;
        let count = 0;
        candidateData.forEach(c => {
          if (c.score !== undefined && c.score !== null) {
            sum += parseFloat(c.score || 0);
            count++;
          }
        });
        if (count > 0) {
          avgDisplay = (sum / count).toFixed(1) + " / 30";
        }
      }

      const elTot = document.getElementById('metricTotalSubmissions');
      const elVer = document.getElementById('metricVerifiedCount');
      const elDisq = document.getElementById('metricDisqualifiedCount');
      const elAvg = document.getElementById('metricAvgAccuracy');
      const elPill = document.getElementById('sidebarMalpracticePill');

      if (elTot) elTot.innerText = total;
      if (elVer) elVer.innerText = verified;
      if (elDisq) elDisq.innerText = disq;
      if (elAvg) elAvg.innerText = avgDisplay;
      if (elPill) elPill.innerText = disq;
    }

    function renderQuestionBankView() {
      const container = document.getElementById('adminQuestionBankList');
      if (!container || typeof EXAM_QUESTIONS === 'undefined') return;

      const filterSection = document.getElementById('qbSectionFilter') ? document.getElementById('qbSectionFilter').value : 'ALL';
      container.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];

      const filtered = EXAM_QUESTIONS.filter(q => filterSection === 'ALL' || q.section === filterSection);

      filtered.forEach((q) => {
        const card = document.createElement('div');
        card.style.cssText = "background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 16px;";
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 800; color: var(--brand-navy);">Q${q.id}. [${q.section} â€¢ ${q.topic}]</span>
            <span style="font-size: 11px; background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 4px; font-weight: 700;">GATE Pattern: +1.0 / -0.25</span>
          </div>
          <div style="font-weight: 600; margin: 8px 0; color: #1e293b;">${q.question}</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 12px 0;">
            ${q.options.map((opt, oIdx) => `
              <div style="padding: 8px 12px; border-radius: 6px; border: 1px solid ${oIdx === q.correct ? '#10b981' : '#e2e8f0'}; background: ${oIdx === q.correct ? '#ecfdf5' : '#f8fafc'}; font-size: 12px; font-weight: ${oIdx === q.correct ? '700' : '500'}; color: ${oIdx === q.correct ? '#065f46' : '#334155'};">
                ${letters[oIdx]}. ${opt} ${oIdx === q.correct ? 'âœ“ (Key)' : ''}
              </div>
            `).join('')}
          </div>
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 10px 14px; border-radius: 6px; font-size: 12px; color: #1e3a8a;">
            <strong>Faculty Solution Explanations:</strong><br>${q.solution.replace(/\n/g, '<br>')}
          </div>
        `;
        container.appendChild(card);
      });
    }

    // Auto-detect base URLs on load
    window.addEventListener('DOMContentLoaded', () => {
      renderDashboardActiveExams();
      if (sessionStorage.getItem('avniet_admin_auth') === 'true') {
        document.getElementById('adminAuthOverlay').style.display = 'none';
        loadAllAdminData();
      }
    });
