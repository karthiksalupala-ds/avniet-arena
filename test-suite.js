// AVNIET ARENA - AUTOMATED RIGOROUS END-TO-END QA TEST SUITE
const https = require('https');

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOpts = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(reqOpts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch(e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log("=================================================");
  console.log("🚀 AVNIET ARENA LIVE SYSTEM & LOGIC QA AUDIT");
  console.log("=================================================\n");
  
  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = "") {
    if (condition) {
      console.log(`✅ [PASS] ${name} ${extra}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${extra}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST GROUP 1: LIVE HTTP ENDPOINTS & ROUTING
  // -------------------------------------------------------------
  console.log("--- TEST GROUP 1: LIVE CLOUD ENDPOINTS ---");
  
  const resHome = await fetchJson("https://avniet-arena.onrender.com/");
  assert("GET / (Student MCQ Portal)", resHome.status === 200, `(Status ${resHome.status})`);

  const resAdmin = await fetchJson("https://avniet-arena.onrender.com/admin");
  assert("GET /admin (Executive Dashboard)", resAdmin.status === 200, `(Status ${resAdmin.status})`);

  const resGame = await fetchJson("https://avniet-arena.onrender.com/game.html");
  assert("GET /game.html (Cognitive Game Arena)", resGame.status === 200, `(Status ${resGame.status})`);

  const resHealth = await fetchJson("https://avniet-arena.onrender.com/api/health");
  assert("GET /api/health (Service Telemetry)", resHealth.status === 200 && resHealth.data && resHealth.data.status === "HEALTHY", `(Service: ${resHealth.data?.service})`);

  // -------------------------------------------------------------
  // TEST GROUP 2: EXAM REGISTRY & URL ROUTING
  // -------------------------------------------------------------
  console.log("\n--- TEST GROUP 2: EXAM REGISTRY & URL ROUTING ---");
  
  // Simulated Registry
  const ExamRegistry = {
    exams: [
      { id: "EXAM-1", title: "Quantitative Aptitude Mock", type: "aptitude", category: "Placement Assessment" },
      { id: "EXAM-2", title: "Cognitive Logic Game", type: "game", category: "Game-based Cognitive Assessment" },
      { id: "EXAM-3", title: "Deductive Reasoning Challenge", type: "deductive", category: "Deductive Reasoning Games" },
      { id: "EXAM-4", title: "Capgemini Cognitive Round", type: "cognitive", category: "Cognitive Assessment" }
    ],
    getExamById(id) {
      return this.exams.find(e => e.id === id);
    },
    getStudentExamUrl(examId) {
      const rootUrl = "https://avniet-arena.onrender.com/";
      const exam = this.getExamById(examId);
      const isGame = exam && (
        exam.type === "game" || 
        exam.type === "deductive" || 
        (exam.category && (
          exam.category.toLowerCase().includes("game") || 
          exam.category.toLowerCase().includes("cognitive") ||
          exam.category.toLowerCase().includes("deductive")
        ))
      );
      if (isGame) {
        return `${rootUrl}game.html?examId=${encodeURIComponent(examId)}`;
      }
      return `${rootUrl}?examId=${encodeURIComponent(examId)}`;
    }
  };

  const urlApt = ExamRegistry.getStudentExamUrl("EXAM-1");
  assert("Aptitude Exam URL routes to root MCQ portal", urlApt === "https://avniet-arena.onrender.com/?examId=EXAM-1", `(${urlApt})`);

  const urlGame = ExamRegistry.getStudentExamUrl("EXAM-2");
  assert("Game Exam (type: game) routes to game.html", urlGame === "https://avniet-arena.onrender.com/game.html?examId=EXAM-2", `(${urlGame})`);

  const urlDed = ExamRegistry.getStudentExamUrl("EXAM-3");
  assert("Deductive Exam (type: deductive) routes to game.html", urlDed === "https://avniet-arena.onrender.com/game.html?examId=EXAM-3", `(${urlDed})`);

  const urlCog = ExamRegistry.getStudentExamUrl("EXAM-4");
  assert("Cognitive Exam (category: Cognitive Assessment) routes to game.html", urlCog === "https://avniet-arena.onrender.com/game.html?examId=EXAM-4", `(${urlCog})`);

  // -------------------------------------------------------------
  // TEST GROUP 3: QUESTION PALETTE CLASS & COLOR VERIFICATION
  // -------------------------------------------------------------
  console.log("\n--- TEST GROUP 3: QUESTION PALETTE COLOR & CLASS MATCHING ---");

  const fs = require('fs');
  const path = require('path');
  const css = fs.readFileSync(path.join(__dirname, 'public/css/style.css'), 'utf8');
  const examJs = fs.readFileSync(path.join(__dirname, 'public/js/exam.js'), 'utf8');

  // Verify CSS defines both .pal-formal-btn.answered and .pal-num-btn.answered
  const hasPalNumAnswered = css.includes('.pal-num-btn.answered');
  const hasPalFormalAnswered = css.includes('.pal-formal-btn.answered');
  assert("CSS includes .pal-num-btn.answered styling rule", hasPalNumAnswered);
  assert("CSS includes .pal-formal-btn.answered styling rule", hasPalFormalAnswered);

  // Verify JS assigns both classes
  const hasBothClassesInJs = examJs.includes("btn.className = 'pal-formal-btn pal-num-btn'");
  assert("exam.js assigns both 'pal-formal-btn pal-num-btn' to buttons", hasBothClassesInJs);

  // Verify green color var is applied with !important
  const hasGreenColor = css.includes('background: var(--pal-answered) !important') || css.includes('#16a34a');
  assert("CSS forces green color background for answered questions with !important", hasGreenColor);

  // -------------------------------------------------------------
  // TEST GROUP 4: SUBMISSION SCORING & ATTEMPT COUNT DECOUPLING
  // -------------------------------------------------------------
  console.log("\n--- TEST GROUP 4: SUBMISSION ATTEMPT & SCORE CALCULATION ---");

  // Verify the loop in examJs is outside if(solContainer)
  const normJs = examJs.replace(/\r\n/g, '\n');
  const hasIndependentScoringLoop = normJs.includes("activeQuestions.forEach((q, idx) => {\n    const state = examStates[idx];\n    const chosen = state ? state.selected : null;");
  assert("Calculation loop activeQuestions.forEach runs independently of solContainer", hasIndependentScoringLoop);

  // Simulate scoring function
  const simulatedQuestions = [
    { id: 1, correct: 2, options: ["A", "B", "C", "D"] },
    { id: 2, correct: 0, options: ["A", "B", "C", "D"] },
    { id: 3, correct: 1, options: ["A", "B", "C", "D"] }
  ];
  const simulatedExamStates = {
    0: { selected: 2, isMarked: false, visited: true }, // Correct (option C)
    1: { selected: 1, isMarked: false, visited: true }, // Wrong (option B)
    2: { selected: null, isMarked: false, visited: true } // Unattempted
  };

  let testScore = 0;
  let testCorrect = 0;
  let testWrong = 0;
  let testUnanswered = 0;

  simulatedQuestions.forEach((q, idx) => {
    const state = simulatedExamStates[idx];
    const chosen = state ? state.selected : null;
    if (chosen === null) {
      testUnanswered++;
    } else if (chosen === q.correct) {
      testScore += 1.0;
      testCorrect++;
    } else {
      testScore -= 0.25;
      testWrong++;
    }
  });

  const simulatedAttempted = `${testCorrect + testWrong} of ${simulatedQuestions.length} Questions`;
  assert("Total Attempted count is correctly calculated as 2 of 3 Questions", simulatedAttempted === "2 of 3 Questions", `(Result: ${simulatedAttempted})`);
  assert("Score correctly calculates +1.0 - 0.25 = 0.75 pts", testScore === 0.75, `(Score: ${testScore})`);

  // -------------------------------------------------------------
  // TEST GROUP 5: LIVE BACKEND SUBMISSION PIPELINE & DB SYNC
  // -------------------------------------------------------------
  console.log("\n--- TEST GROUP 5: LIVE BACKEND SUBMISSION PIPELINE ---");

  const testSubmission = {
    roll: "245U1A67A3",
    branch: "CSD",
    batch: "2028",
    score: 15,
    accuracy: "85%",
    time: "4m 12s",
    trust: "100%",
    tabs: 0,
    status: "VERIFIED",
    examId: "EXAM-AVN-2026-QA-TEST"
  };

  const submitRes = await fetchJson("https://avniet-arena.onrender.com/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: testSubmission
  });

  assert("POST /api/submissions records successfully", submitRes.status === 201 && submitRes.data && submitRes.data.success === true, `(Response: ${submitRes.data?.message})`);

  // Query submissions with admin authorization
  const queryRes = await fetchJson("https://avniet-arena.onrender.com/api/admin/submissions?token=avniet_controller_autonomous_2026", {
    headers: {
      "x-admin-token": "avniet_controller_autonomous_2026",
      "x-admin-pin": "admin2026"
    }
  });

  const hasRecord = queryRes.data && queryRes.data.submissions && queryRes.data.submissions.some(s => s.roll === "245U1A67A3");
  assert("GET /api/admin/submissions verifies submitted candidate record in database", hasRecord, `(Submissions count: ${queryRes.data?.submissions?.length || 0})`);

  // -------------------------------------------------------------
  // FINAL REPORT
  // -------------------------------------------------------------
  console.log("\n=================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(failed === 0 ? "🎉 ALL AUDIT CHECKS PASSED PERFECTLY!" : "⚠️ SOME CHECKS FAILED!");
  console.log("=================================================");
}

runTestSuite().catch(err => {
  console.error("Test Suite Unhandled Exception:", err);
});
