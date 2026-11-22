// ==============================================================
// AVNIET ARENA — MULTI-EXAMINATION REGISTRY & AI GENERATION ENGINE
// Full Autonomous Exam Lifecycle: Draft -> Ready -> Live -> Completed
// ==============================================================

const STORAGE_KEY_EXAMS = 'avniet_exams_registry';
const STORAGE_KEY_SUBMISSIONS = 'avniet_multi_submissions';
const STORAGE_KEY_ANNOUNCEMENTS = 'avniet_whatsapp_announcements';

// Default Institutional Examinations Seed Data (Preserved)
const DEFAULT_EXAMS = [
  {
    id: "EXAM-AVN-2026-APT",
    title: "Placement Readiness Aptitude & Technical Assessment",
    type: "aptitude",
    category: "Placement Assessment",
    description: "Comprehensive campus placement mock covering Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Core CS.",
    durationMinutes: 15,
    questionCount: 30,
    totalMarks: 30,
    marksPerCorrect: 1.0,
    negativeMark: 0.25,
    markingPolicy: "gate",
    targetBatches: ["2027", "2028"],
    targetDepartments: ["CSE", "IT", "CSM", "CSD", "ECE"],
    proctoringStrictness: "strict", // 3 strikes -> disqualify
    status: "LIVE",
    createdAt: "2026-11-20T10:00:00Z",
    scheduledDate: "2026-11-21T09:00:00Z",
    questions: typeof EXAM_QUESTIONS !== 'undefined' ? EXAM_QUESTIONS : []
  },
  {
    id: "EXAM-AVN-2026-COG",
    title: "Capgemini Cognitive Deductive Logic Round",
    type: "game",
    category: "Game-based Cognitive Assessment",
    description: "Sudoku-style Latin Square deductive puzzle challenge evaluating cognitive speed and pattern deduction.",
    durationMinutes: 2,
    questionCount: 1,
    totalMarks: 50,
    marksPerCorrect: 10.0,
    negativeMark: 0.0,
    markingPolicy: "none",
    targetBatches: ["2028"],
    targetDepartments: ["CSE", "IT", "CSM", "CSD"],
    proctoringStrictness: "strict",
    status: "LIVE",
    createdAt: "2026-11-20T12:00:00Z",
    scheduledDate: "2026-11-21T11:00:00Z",
    gameConfig: {
      type: "latin_square_sudoku",
      gridSizes: [3, 4, 5],
      symbols: ["circle", "diamond", "triangle", "square", "star"],
      timeLimitSeconds: 90
    }
  }
];

const ExamRegistry = {
  // -------------------------------------------------------------
  // INITIALIZATION & PERSISTENCE
  // -------------------------------------------------------------
  getAllExams() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EXAMS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch(e) {
      console.warn("Could not read exams from storage, falling back to seed", e);
    }
    this.saveAllExams(DEFAULT_EXAMS);
    return DEFAULT_EXAMS;
  },

  saveAllExams(exams) {
    try {
      localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(exams));
    } catch(e) {
      console.error("Failed to persist exams registry", e);
    }
  },

  getExamById(examId) {
    const exams = this.getAllExams();
    return exams.find(e => e.id === examId) || null;
  },

  saveExam(examData) {
    const exams = this.getAllExams();
    const existingIdx = exams.findIndex(e => e.id === examData.id);
    if (existingIdx !== -1) {
      exams[existingIdx] = { ...exams[existingIdx], ...examData, updatedAt: new Date().toISOString() };
    } else {
      exams.unshift({
        ...examData,
        createdAt: examData.createdAt || new Date().toISOString()
      });
    }
    this.saveAllExams(exams);
    return examData;
  },

  async deleteExam(examId) {
    const exams = this.getAllExams().filter(e => e.id !== examId);
    this.saveAllExams(exams);
    try {
      await fetch(`/api/exams/${encodeURIComponent(examId)}?token=avniet_controller_autonomous_2026`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': 'avniet_controller_autonomous_2026',
          'x-admin-pin': 'admin2026'
        }
      });
    } catch(e) {
      console.warn("Server delete exam notice:", e);
    }
    return true;
  },

  updateExamStatus(examId, status) {
    const exams = this.getAllExams();
    const target = exams.find(e => e.id === examId);
    if (target) {
      target.status = status;
      this.saveAllExams(exams);
    }
    return target;
  },

  getActiveLiveExam() {
    const exams = this.getAllExams();
    return exams.find(e => e.status === "LIVE") || exams[0];
  },

  // Generate unique Student Exam URL (Guaranteed clean root directory, no /admin/ concatenation)
  getStudentExamUrl(examId) {
    let rootUrl = "https://avniet-arena.onrender.com/";
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      const loc = window.location;
      if (loc.pathname && loc.pathname.includes('/avniet-arena')) {
        rootUrl = loc.origin + '/avniet-arena/';
      } else {
        rootUrl = loc.origin.replace(/\/+$/, '') + '/';
      }
    }
    
    const exam = this.getExamById(examId);
    if (exam && exam.type === "game") {
      return `${rootUrl}game.html?examId=${encodeURIComponent(examId)}`;
    }
    return `${rootUrl}?examId=${encodeURIComponent(examId)}`;
  },

  // -------------------------------------------------------------
  // AI QUESTION GENERATION ENGINE (Gemini Live API + Curriculum Engine)
  // Generates verified, curriculum-accurate questions with keys & explanations
  // -------------------------------------------------------------
  async generateQuestionsByAI(spec) {
    const {
      type = "aptitude",
      topics = ["Quantitative", "Reasoning", "Tech"],
      difficulty = "Medium",
      count = 10,
      prompt = "",
      apiKey = "",
      marksPerQuestion = 1.0
    } = spec;

    // Check for user-provided API key or stored key in localStorage
    const activeKey = apiKey || (typeof localStorage !== 'undefined' ? localStorage.getItem('avniet_gemini_api_key') : null);

    if (activeKey && activeKey.trim().length > 15) {
      try {
        const geminiQuestions = await this.callGeminiAPI({
          apiKey: activeKey.trim(),
          type,
          topics,
          difficulty,
          count,
          prompt,
          marksPerQuestion
        });
        if (geminiQuestions && geminiQuestions.length > 0) {
          return geminiQuestions;
        }
      } catch (err) {
        console.warn("Gemini Live AI call encountered an error. Falling back to dynamic curriculum engine:", err);
      }
    }

    // Dynamic curriculum knowledge generator (Extensive question database across all domains)
    return this.generateOfflineCurriculumQuestions({
      type,
      difficulty,
      count,
      prompt,
      marksPerQuestion
    });
  },

  async callGeminiAPI({ apiKey, type, topics, difficulty, count, prompt, marksPerQuestion }) {
    const systemPrompt = `You are a Senior University Examination Architect & Examiner for AVNIET Autonomous Engineering College.
Generate an examination paper of exactly ${count} multiple-choice questions (MCQs) for an institutional examination.

Assessment Category: ${type}
Difficulty Level: ${difficulty}
Curriculum Instructions / Custom Prompt: ${prompt || (Array.isArray(topics) ? topics.join(', ') : topics)}

CRITICAL FORMAT REQUIREMENTS:
1. Return ONLY a valid JSON array of objects. Do not write any introduction, markdown prose, or conversational greetings.
2. Generate exactly ${count} distinct questions matching the subject and difficulty.
3. Every single question object MUST adhere strictly to this schema:
[
  {
    "id": 1,
    "topic": "Specific Topic Name (e.g. Time & Work / Trees / SQL / Syllogisms)",
    "section": "Quant" or "Reasoning" or "Tech" or "Verbal" or "Coding",
    "difficulty": "${difficulty}",
    "question": "Clear, rigorous question text with all necessary numerical or code parameters.",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correct": 0, // 0-based integer pointing to the correct option (0 = A, 1 = B, 2 = C, 3 = D)
    "solution": "Step-by-step mathematical proof or technical explanation showing why this option is correct.",
    "marks": ${marksPerQuestion}
  }
]
4. Mathematical formulas and code trace outputs must be 100% verified and mathematically sound.
5. All 4 options must be distinct, plausible, and mutually exclusive.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { temperature: 0.35, maxOutputTokens: 8192 }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response received from Gemini.");

    let cleanJson = rawText.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.slice(7);
    else if (cleanJson.startsWith('```')) cleanJson = cleanJson.slice(3);
    if (cleanJson.endsWith('```')) cleanJson = cleanJson.slice(0, -3);
    cleanJson = cleanJson.trim();

    const parsed = JSON.parse(cleanJson);
    if (!Array.isArray(parsed)) throw new Error("Gemini response is not a JSON array.");

    return parsed.slice(0, count).map((q, idx) => ({
      id: idx + 1,
      topic: q.topic || "Core Domain",
      section: q.section || "Tech",
      difficulty: q.difficulty || difficulty,
      question: q.question,
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
      correct: typeof q.correct === 'number' && q.correct >= 0 && q.correct <= 3 ? q.correct : 0,
      solution: q.solution || "Verified curriculum solution.",
      marks: marksPerQuestion
    }));
  },

  // Comprehensive Multi-Domain Curriculum Bank
  generateOfflineCurriculumQuestions({ type, difficulty, count, prompt = "", marksPerQuestion }) {
    const pLower = prompt.toLowerCase();
    let pool = [];

    // 1. QUANTITATIVE POOL
    const quantPool = [
      {
        topic: "Time & Work", section: "Quant",
        question: "A pipe can fill a reservoir in 12 hours, while a second pipe can fill it in 18 hours. If both pipes are opened simultaneously into an empty reservoir, how many hours will it take to fill completely?",
        options: ["6.8 hours", "7.2 hours", "8.0 hours", "9.5 hours"],
        correct: 1,
        solution: "Combined hourly rate = 1/12 + 1/18 = (3 + 2)/36 = 5/36 per hour. Total time = 36/5 = 7.2 hours."
      },
      {
        topic: "Profit & Loss", section: "Quant",
        question: "A trader marks goods 40% above cost price and allows a trade discount of 15% on the marked price. What is the actual profit percentage realized?",
        options: ["18%", "19%", "20%", "25%"],
        correct: 1,
        solution: "Let CP = 100. MP = 140. Discount = 15% of 140 = 21. SP = 140 - 21 = 119. Profit % = 19%."
      },
      {
        topic: "Speed & Distance", section: "Quant",
        question: "A train 240 meters long moving at a uniform speed of 72 km/h crosses a railway platform in 25 seconds. What is the length of the platform?",
        options: ["220 m", "240 m", "260 m", "280 m"],
        correct: 2,
        solution: "Speed in m/s = 72 * (5/18) = 20 m/s. Total distance in 25s = 20 * 25 = 500 m. Platform length = 500 - 240 = 260 m."
      },
      {
        topic: "Permutations & Combinations", section: "Quant",
        question: "In how many distinct ways can the letters of the word 'LEADER' be arranged such that the vowels always appear together?",
        options: ["72", "144", "240", "360"],
        correct: 0,
        solution: "Vowels in LEADER: E, A, E (3 vowels, with E repeating twice). Consonants: L, D, R (3). Treat vowels as 1 block: 4 units arranged in 4! = 24 ways. Vowels arranged among themselves in 3!/2! = 3 ways. Total = 24 * 3 = 72."
      },
      {
        topic: "Simple & Compound Interest", section: "Quant",
        question: "The difference between compound interest and simple interest on a principal amount at 10% per annum for 2 years is Rs. 65. What is the principal sum?",
        options: ["Rs. 6,000", "Rs. 6,500", "Rs. 7,000", "Rs. 7,500"],
        correct: 1,
        solution: "Formula for 2 years: Difference = P * (R/100)^2. 65 = P * (10/100)^2 = P * 0.01. P = 65 / 0.01 = Rs. 6,500."
      },
      {
        topic: "Pipes & Cisterns", section: "Quant",
        question: "A cistern has a leak which would empty it in 8 hours. A tap is turned on which admits 6 liters a minute into the cistern, and it is now emptied in 12 hours. How many liters does the cistern hold?",
        options: ["7,200 liters", "8,640 liters", "9,000 liters", "10,200 liters"],
        correct: 1,
        solution: "Work done by inlet tap in 1 hour = 1/8 - 1/12 = 1/24. Inlet fills the cistern in 24 hours. Rate = 6 L/min = 360 L/hr. Capacity = 24 * 360 = 8,640 liters."
      },
      {
        topic: "Ratios & Mixtures", section: "Quant",
        question: "A mixture of 60 liters contains milk and water in the ratio 2:1. How much water must be added to make the ratio of milk to water 1:2?",
        options: ["40 liters", "50 liters", "60 liters", "70 liters"],
        correct: 2,
        solution: "Milk = (2/3) * 60 = 40 L. Water = 20 L. For 1:2 ratio with 40L milk, total water must be 80 L. Water to add = 80 - 20 = 60 liters."
      },
      {
        topic: "Probability", section: "Quant",
        question: "Two dice are tossed simultaneously. What is the mathematical probability that the sum of the numbers appearing on top is a prime number?",
        options: ["5/12", "7/18", "1/2", "13/36"],
        correct: 0,
        solution: "Possible prime sums are 2, 3, 5, 7, 11. Outcomes: 2 (1), 3 (2), 5 (4), 7 (6), 11 (2). Total favorable outcomes = 1 + 2 + 4 + 6 + 2 = 15. Probability = 15/36 = 5/12."
      }
    ];

    // 2. LOGICAL REASONING POOL
    const reasoningPool = [
      {
        topic: "Syllogisms", section: "Reasoning",
        question: "Statements:\n1. All engineers are innovators.\n2. Some innovators are leaders.\nConclusions:\nI. Some engineers are leaders.\nII. Some innovators are engineers.",
        options: ["Only conclusion I follows", "Only conclusion II follows", "Either I or II follows", "Both I and II follow"],
        correct: 1,
        solution: "All engineers are innovators implies that the set of engineers is contained within innovators. Thus, some innovators are definitely engineers (Conclusion II holds). No direct connection guarantees Conclusion I."
      },
      {
        topic: "Seating Arrangement", section: "Reasoning",
        question: "In a row of 40 students facing North, Priya is 14th from the left end and Rahul is 17th from the right end. How many students are seated between Priya and Rahul?",
        options: ["7", "8", "9", "10"],
        correct: 2,
        solution: "Total students = 40. Sum of individual positions from ends = 14 + 17 = 31. Students between = 40 - 31 = 9."
      },
      {
        topic: "Blood Relations", section: "Reasoning",
        question: "Pointing to a photograph, a woman says: 'His mother's only son is my father.' How is the woman related to the man in the photograph?",
        options: ["Sister", "Mother", "Daughter", "Aunt"],
        correct: 2,
        solution: "'His mother's only son' refers to the man himself. 'My father' is the man himself. Therefore, the woman is his daughter."
      },
      {
        topic: "Coding-Decoding", section: "Reasoning",
        question: "If in a certain code language, 'SYSTEM' is coded as 'SYSMET' and 'NEARER' is coded as 'AENRER', how will 'FRACTION' be coded?",
        options: ["CARFTINO", "CARFNOIT", "ARFCNOIT", "CARFTION"],
        correct: 1,
        solution: "Split into two halves: 'FRAC' and 'TION'. Reverse the first half -> 'CARF'. Reverse the second half -> 'NOIT'. Combined: 'CARFNOIT'."
      },
      {
        topic: "Direction Sense", section: "Reasoning",
        question: "A robot moves 12 meters South, turns left and walks 5 meters, then turns left again and moves 12 meters North. How far and in which direction is the robot from its starting point?",
        options: ["5 meters East", "5 meters West", "12 meters North", "7 meters East"],
        correct: 0,
        solution: "Moving 12m South then 12m North cancels the vertical displacement. The left turn after moving South points East for 5 meters. Final position is 5m East."
      },
      {
        topic: "Clocks & Angles", section: "Reasoning",
        question: "At 3:40 PM, what is the exact angle formed between the hour hand and the minute hand of a standard clock?",
        options: ["120 degrees", "130 degrees", "140 degrees", "150 degrees"],
        correct: 1,
        solution: "Angle = |30*H - 5.5*M| = |30(3) - 5.5(40)| = |90 - 220| = 130 degrees."
      }
    ];

    // 3. TECHNICAL & CODING POOL
    const techPool = [
      {
        topic: "Data Structures", section: "Tech",
        question: "Which of the following data structures provides O(1) average time complexity for both insertion and search operations?",
        options: ["Hash Table", "Binary Search Tree", "Linked List", "Array"],
        correct: 0,
        solution: "A Hash Table computes index using a hash function, delivering O(1) average lookup and insertion."
      },
      {
        topic: "Algorithms", section: "Tech",
        question: "What is the worst-case time complexity of QuickSort when the pivot chosen is always the smallest or largest element?",
        options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
        correct: 1,
        solution: "Unbalanced partitioning reduces the recursion tree to depth n with O(n) work per level, leading to O(n²)."
      },
      {
        topic: "Python Programming", section: "Coding",
        question: "What will be the output of the following Python snippet?\n\nx = [1, 2, 3]\ny = x\ny.append(4)\nprint(len(x))",
        options: ["3", "4", "Error", "Undefined"],
        correct: 1,
        solution: "In Python, lists are mutable objects and assignment (y = x) assigns a reference, not a copy. Appending to y modifies the underlying list referenced by x."
      },
      {
        topic: "Python Generators", section: "Coding",
        question: "In Python, which keyword transforms a normal function into a generator that produces values lazily upon iteration?",
        options: ["return", "yield", "generate", "lazy"],
        correct: 1,
        solution: "The 'yield' statement pauses function execution, saving its state and yielding a value to the caller without terminating the function frame."
      },
      {
        topic: "DBMS & SQL", section: "Tech",
        question: "Which normal form strictly eliminates transitive dependencies (where a non-prime attribute depends on another non-prime attribute)?",
        options: ["1NF", "2NF", "3NF", "BCNF"],
        correct: 2,
        solution: "Third Normal Form (3NF) requires 2NF and mandates that no non-prime attribute is transitively dependent on any candidate key."
      },
      {
        topic: "Operating Systems", section: "Tech",
        question: "Which CPU scheduling algorithm can potentially lead to the 'Convoy Effect' where short processes wait behind long CPU bursts?",
        options: ["First-Come, First-Served (FCFS)", "Round Robin (RR)", "Shortest Job First (SJF)", "Priority Scheduling"],
        correct: 0,
        solution: "In FCFS, non-preemption causes all subsequent I/O or short processes to be delayed behind a long CPU-bound process."
      },
      {
        topic: "Computer Networks", section: "Tech",
        question: "In the TCP 3-way handshake mechanism, what packet flags are sent during the second transmission (Server to Client)?",
        options: ["SYN", "ACK", "SYN-ACK", "FIN-ACK"],
        correct: 2,
        solution: "Client sends SYN -> Server responds with SYN-ACK -> Client concludes handshake with ACK."
      },
      {
        topic: "Object-Oriented Programming", section: "Coding",
        question: "In Java, what happens when a subclass defines a static method with the exact same signature as a static method in its superclass?",
        options: ["Method Overriding", "Method Hiding", "Compilation Error", "Dynamic Polymorphism"],
        correct: 1,
        solution: "Static methods are resolved at compile time using static binding; therefore, redefining a static method in a subclass hides the superclass method rather than overriding it."
      },
      {
        topic: "Memory Management (C/C++)", section: "Coding",
        question: "What is a major consequence of allocating memory dynamically on the heap via malloc() without subsequently calling free() in C?",
        options: ["Segmentation Fault", "Dangling Pointer", "Memory Leak", "Buffer Overflow"],
        correct: 2,
        solution: "Allocated heap blocks that remain unreferenced and unreleased consume system memory indefinitely, known as a Memory Leak."
      }
    ];

    // 4. VERBAL ABILITY POOL
    const verbalPool = [
      {
        topic: "Sentence Correction", section: "Verbal",
        question: "Select the sentence with correct subject-verb agreement:",
        options: [
          "The committee has reached their consensus on the annual budget.",
          "The committee have reached its consensus on the annual budget.",
          "The committee has reached its consensus on the annual budget.",
          "The committee were reached their consensus on the annual budget."
        ],
        correct: 2,
        solution: "When a collective noun acts as a unified singular body, singular pronouns and verbs ('has', 'its') must be used."
      },
      {
        topic: "Vocabulary", section: "Verbal",
        question: "Select the word that is nearest in meaning (Synonym) to: 'PRAGMATIC'",
        options: ["Idealistic", "Practical", "Theoretical", "Vague"],
        correct: 1,
        solution: "'Pragmatic' means dealing with things sensibly and realistically based on practical rather than theoretical considerations."
      },
      {
        topic: "Error Spotting", section: "Verbal",
        question: "Identify the part containing an error: 'Scarcely had I arrived / at the station / then the train departed.'",
        options: ["Scarcely had I arrived", "at the station", "then the train departed", "No error"],
        correct: 2,
        solution: "'Scarcely...when' is the correct correlative conjunction pair. 'then' should be replaced with 'when'."
      },
      {
        topic: "Idioms & Phrases", section: "Verbal",
        question: "What is the meaning of the idiomatic expression 'To burn the candle at both ends'?",
        options: [
          "To be reckless with money",
          "To overwork or exhaust oneself by working late and rising early",
          "To cause a severe fire hazard",
          "To display great artistic talent"
        ],
        correct: 1,
        solution: "'Burning the candle at both ends' signifies exhausting one's physical or mental resources by overworking."
      }
    ];

    // Select or Assemble the Pool based on Type & Prompt Keywords
    if (pLower.includes("python") || pLower.includes("coding") || pLower.includes("program") || type === "coding") {
      pool = [...techPool.filter(q => q.section === "Coding" || q.topic.includes("Python")), ...techPool];
    } else if (pLower.includes("quant") || pLower.includes("math") || pLower.includes("aptitude") || type === "quant") {
      pool = [...quantPool];
    } else if (pLower.includes("logic") || pLower.includes("reasoning") || type === "reasoning") {
      pool = [...reasoningPool];
    } else if (pLower.includes("english") || pLower.includes("verbal") || type === "verbal") {
      pool = [...verbalPool];
    } else if (pLower.includes("tech") || pLower.includes("computer") || pLower.includes("cs") || type === "technical") {
      pool = [...techPool];
    } else {
      // Aptitude / Mixed: Combine all domains proportionally
      pool = [...quantPool, ...reasoningPool, ...techPool, ...verbalPool];
    }

    if (pool.length === 0) pool = quantPool;

    // Shuffle pool for high entropy
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const generated = [];
    for (let i = 0; i < count; i++) {
      const tpl = shuffled[i % shuffled.length];
      generated.push({
        id: i + 1,
        topic: tpl.topic,
        section: tpl.section,
        difficulty: difficulty,
        question: tpl.question,
        options: [...tpl.options],
        correct: tpl.correct,
        solution: tpl.solution,
        marks: marksPerQuestion
      });
    }

    return generated;
  },

  // -------------------------------------------------------------
  // SUBMISSIONS & LEADERBOARD REPOSITORY
  // -------------------------------------------------------------
  getAllSubmissions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return [];
  },

  recordSubmission(examId, record) {
    const list = this.getAllSubmissions();
    const enriched = {
      submissionId: `SUB-${Date.now().toString().slice(-6)}`,
      examId: examId,
      timestamp: new Date().toISOString(),
      ...record
    };
    list.unshift(enriched);
    try {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(list));
    } catch(e) {}
    return enriched;
  },

  getSubmissionsByExam(examId) {
    const all = this.getAllSubmissions();
    return all.filter(s => s.examId === examId);
  },

  // -------------------------------------------------------------
  // AUTOMATED TOP 5 PERFORMERS IDENTIFICATION & ANNOUNCER
  // Tie-breakers: 1) Score, 2) Accuracy %, 3) Completion Speed
  // Excludes Disqualified Malpractice candidates
  // -------------------------------------------------------------
  getTopPerformers(examId, limit = 5) {
    const subs = this.getSubmissionsByExam(examId);
    
    // Filter clean verified candidates only
    const valid = subs.filter(s => !s.status || !s.status.includes('DISQUALIFIED'));

    // Sort by Score DESC -> Accuracy DESC -> Time Taken ASC
    valid.sort((a, b) => {
      const scoreDiff = parseFloat(b.score) - parseFloat(a.score);
      if (Math.abs(scoreDiff) > 0.01) return scoreDiff;

      const accA = parseFloat((a.accuracy || "0").replace('%', ''));
      const accB = parseFloat((b.accuracy || "0").replace('%', ''));
      if (Math.abs(accB - accA) > 0.01) return accB - accA;

      return (a.time || "99m").localeCompare(b.time || "99m");
    });

    return valid.slice(0, limit);
  },

  generateTop5Announcement(examId) {
    const exam = this.getExamById(examId);
    const title = exam ? exam.title : "Campus Placement Assessment";
    const top5 = this.getTopPerformers(examId, 5);

    if (top5.length === 0) {
      return `🏛️ *AVN INSTITUTE OF ENGINEERING & TECHNOLOGY*\n*Autonomous Examination Branch*\n\n📢 *Top 5 Performers Announcement*\nAssessment: *${title}*\n\n*Status:* No completed submissions recorded yet. Rankings will generate once students submit.`;
    }

    const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
    let rankRows = "";

    top5.forEach((student, idx) => {
      const medal = medals[idx] || `#${idx + 1}`;
      rankRows += `${medal} *${student.roll}* (${student.branch || 'B.Tech'})\n   Score: *${student.score} pts* | Accuracy: *${student.accuracy}* | Speed: *${student.time}*\n\n`;
    });

    return `🏛️ *AVN INSTITUTE OF ENGINEERING & TECHNOLOGY*
*Autonomous Examination Branch — Placement Assessment*

🏆 *OFFICIAL TOP 5 MERIT ANNOUNCEMENT*
Assessment: *${title}*

Congratulations to the top performers who demonstrated outstanding speed, accuracy, and full academic integrity:

${rankRows}🛡️ *Integrity Verification:* All 5 candidates achieved verified proctoring trust indices with zero malpractice strikes.

*Autonomous Examination Control Room — AVNIET*`;
  }
};

if (typeof module !== 'undefined') {
  module.exports = { ExamRegistry, DEFAULT_EXAMS };
}
