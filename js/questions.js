// ==============================================================
// AVNIET ARENA — OFFICIAL CAMPUS PLACEMENT QUESTION BANK (30 QUESTIONS)
// Pattern: TCS NQT / Cognizant / Capgemini / Hexaware / GATE
// ==============================================================

const EXAM_QUESTIONS = [
  // --- SECTION 1: QUANTITATIVE APTITUDE (10 QUESTIONS) ---
  {
    id: 1,
    topic: "Time & Work",
    section: "Quant",
    question: "A can do a piece of work in 10 days and B can do the same work in 15 days. In how many days can they finish the work if they work together?",
    options: ["4 days", "5 days", "6 days", "8 days"],
    correct: 2,
    solution: "A's 1-day work = 1/10.\nB's 1-day work = 1/15.\nCombined 1-day work = 1/10 + 1/15 = 5/30 = 1/6.\nTotal days together = 6 days."
  },
  {
    id: 2,
    topic: "Profit & Loss",
    section: "Quant",
    question: "If the cost price of 12 pens equals the selling price of 8 pens, what is the gain percentage?",
    options: ["25%", "40%", "50%", "60%"],
    correct: 2,
    solution: "Let CP of 1 pen = Rs. 1. CP of 8 pens = Rs. 8.\nSP of 8 pens = Rs. 12.\nGain = 12 - 8 = Rs. 4.\nGain % = (4 / 8) * 100 = 50%."
  },
  {
    id: 3,
    topic: "Speed & Distance",
    section: "Quant",
    question: "A train 150 m long passes a standing pole in 10 seconds. What is the speed of the train in km/h?",
    options: ["45 km/h", "54 km/h", "60 km/h", "72 km/h"],
    correct: 1,
    solution: "Speed in m/s = 150 / 10 = 15 m/s.\nConvert to km/h: 15 * (18 / 5) = 54 km/h."
  },
  {
    id: 4,
    topic: "Averages",
    section: "Quant",
    question: "A person travels from town A to town B at 40 km/h and returns at 60 km/h. What is the average speed for the entire round trip?",
    options: ["45 km/h", "48 km/h", "50 km/h", "52 km/h"],
    correct: 1,
    solution: "Harmonic average speed for equal distances = 2xy / (x + y).\nAvg Speed = 2(40)(60) / (40 + 60) = 4800 / 100 = 48 km/h."
  },
  {
    id: 5,
    topic: "Percentages",
    section: "Quant",
    question: "If A's salary is 25% more than B's salary, by what percentage is B's salary less than A's salary?",
    options: ["15%", "20%", "22.5%", "25%"],
    correct: 1,
    solution: "Let B = 100, then A = 125.\nDifference = 25.\nPercentage less than A = (25 / 125) * 100 = 20%."
  },
  {
    id: 6,
    topic: "Ratio & Proportion",
    section: "Quant",
    question: "The ratio of two numbers is 3 : 5. If 8 is added to both numbers, the ratio becomes 2 : 3. What is the sum of the two numbers?",
    options: ["56", "64", "72", "80"],
    correct: 1,
    solution: "Let numbers be 3x and 5x.\n(3x + 8) / (5x + 8) = 2 / 3.\n3(3x + 8) = 2(5x + 8) => 9x + 24 = 10x + 16 => x = 8.\nSum = 3(8) + 5(8) = 24 + 40 = 64."
  },
  {
    id: 7,
    topic: "Pipes & Cisterns",
    section: "Quant",
    question: "Pipe A can fill a tank in 12 hours and Pipe B can empty it in 18 hours. If both pipes are opened simultaneously, in how many hours will the tank be full?",
    options: ["24 hours", "30 hours", "36 hours", "42 hours"],
    correct: 2,
    solution: "Net filling rate per hour = 1/12 - 1/18 = (3 - 2)/36 = 1/36.\nTotal time to fill = 36 hours."
  },
  {
    id: 8,
    topic: "Probability",
    section: "Quant",
    question: "Two fair dice are thrown simultaneously. What is the probability of getting a sum of exactly 8?",
    options: ["5/36", "1/6", "7/36", "1/9"],
    correct: 0,
    solution: "Total outcomes = 6 * 6 = 36.\nFavorable outcomes for sum 8: (2,6), (3,5), (4,4), (5,3), (6,2) -> 5 outcomes.\nProbability = 5/36."
  },
  {
    id: 9,
    topic: "Simple & Compound Interest",
    section: "Quant",
    question: "A sum of money doubles itself in 5 years at simple interest. What is the rate of interest per annum?",
    options: ["15%", "18%", "20%", "25%"],
    correct: 2,
    solution: "Interest I = Principal P.\nI = (P * R * T) / 100 => P = (P * R * 5) / 100 => R = 100 / 5 = 20%."
  },
  {
    id: 10,
    topic: "Permutations & Combinations",
    section: "Quant",
    question: "In how many distinct ways can the letters of the word 'LEADER' be arranged?",
    options: ["180", "360", "720", "1440"],
    correct: 1,
    solution: "Word 'LEADER' has 6 letters with 'E' repeating 2 times.\nNumber of permutations = 6! / 2! = 720 / 2 = 360."
  },

  // --- SECTION 2: LOGICAL REASONING (8 QUESTIONS) ---
  {
    id: 11,
    topic: "Coding-Decoding",
    section: "Reasoning",
    question: "In a certain code, 'ROAD' is written as 'URDG'. How is 'SWAN' written in that same code?",
    options: ["VZDQ", "VZCQ", "UXDP", "VYDQ"],
    correct: 0,
    solution: "Each letter is shifted forward by +3 positions: R->U, O->R, A->D, D->G.\nApplying +3 to SWAN: S->V, W->Z, A->D, N->Q. Result = VZDQ."
  },
  {
    id: 12,
    topic: "Number Series",
    section: "Reasoning",
    question: "Find the missing number in the sequence: 2, 6, 12, 20, 30, ?, 56",
    options: ["40", "42", "44", "46"],
    correct: 1,
    solution: "Pattern: 1*2=2, 2*3=6, 3*4=12, 4*5=20, 5*6=30, 6*7=42, 7*8=56.\nMissing number = 42."
  },
  {
    id: 13,
    topic: "Blood Relations",
    section: "Reasoning",
    question: "Pointing to a photograph of a boy, Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
    options: ["Brother", "Uncle", "Father", "Cousin"],
    correct: 2,
    solution: "The 'only son of Suresh's mother' is Suresh himself.\nSo the boy is the son of Suresh. Suresh is his Father."
  },
  {
    id: 14,
    topic: "Direction Sense",
    section: "Reasoning",
    question: "Ravi walks 10 km towards North, turns right and walks 6 km, then turns right again and walks 10 km. How far is he from his starting point?",
    options: ["4 km", "6 km", "10 km", "16 km"],
    correct: 1,
    solution: "Walking 10 km North and then 10 km South brings him back to the horizontal baseline.\nThe horizontal displacement is 6 km East. Distance = 6 km."
  },
  {
    id: 15,
    topic: "Syllogisms",
    section: "Reasoning",
    question: "Statements: All cars are vehicles. All vehicles are machines.\nConclusion I: All cars are machines.\nConclusion II: Some machines are cars.",
    options: ["Only I follows", "Only II follows", "Neither follows", "Both I and II follow"],
    correct: 3,
    solution: "Since Cars ⊂ Vehicles ⊂ Machines, All cars are machines (I follows).\nAlso, because Cars ⊂ Machines, Some machines are cars (II follows). Both follow."
  },
  {
    id: 16,
    topic: "Seating Arrangement",
    section: "Reasoning",
    question: "Five persons A, B, C, D, and E are sitting in a row facing North. C is sitting in the middle. A is to the immediate left of C. D is to the right of E. B is at the extreme right. Who is sitting at the extreme left?",
    options: ["A", "D", "E", "C"],
    correct: 2,
    solution: "Positions 1 to 5: C is at 3. A is immediate left of C => A is at 2.\nB is at extreme right => B is at 5.\nD is to the right of E => E is at 1, D is at 4.\nOrder: E, A, C, D, B. Extreme left = E."
  },
  {
    id: 17,
    topic: "Clocks & Angles",
    section: "Reasoning",
    question: "What is the angle between the hour hand and the minute hand of a clock at 3:40?",
    options: ["120°", "130°", "140°", "150°"],
    correct: 1,
    solution: "Angle = |30H - (11/2)M| = |30(3) - (11/2)(40)| = |90 - 220| = |-130| = 130°."
  },
  {
    id: 18,
    topic: "Data Sufficiency",
    section: "Reasoning",
    question: "Is integer x even?\nStatement 1: 3x + 1 is odd.\nStatement 2: x² is a multiple of 4.",
    options: ["Statement 1 alone is sufficient", "Statement 2 alone is sufficient", "Both together are needed", "Either statement alone is sufficient"],
    correct: 3,
    solution: "From 1: 3x + 1 = odd => 3x = even => x must be even (Sufficient).\nFrom 2: x² = 4k => x must be even (Sufficient).\nHence, Either statement alone is sufficient."
  },

  // --- SECTION 3: VERBAL ABILITY & COMMUNICATION (4 QUESTIONS) ---
  {
    id: 19,
    topic: "Sentence Correction",
    section: "Verbal",
    question: "Identify the grammatically correct sentence from the following options:",
    options: [
      "Neither the manager nor the employees was present at the conference.",
      "Neither the manager nor the employees were present at the conference.",
      "Neither the manager nor the employees are been present at the conference.",
      "Neither the manager or the employees was present at the conference."
    ],
    correct: 1,
    solution: "Rule of proximity: In 'neither...nor', the verb agrees with the subject closest to it. 'employees' is plural, so 'were present' is grammatically correct."
  },
  {
    id: 20,
    topic: "Synonyms & Antonyms",
    section: "Verbal",
    question: "Choose the word most nearly opposite in meaning (Antonym) to: 'EPHEMERAL'",
    options: ["Transient", "Permanent", "Fleeting", "Fragile"],
    correct: 1,
    solution: "'Ephemeral' means lasting for a very short time (transient/fleeting). Its antonym is 'Permanent'."
  },
  {
    id: 21,
    topic: "Idioms & Phrases",
    section: "Verbal",
    question: "What is the meaning of the idiom: 'To burn the candle at both ends'?",
    options: [
      "To waste electricity recklessly",
      "To work exhaustingly hard from early morning to late night",
      "To cause an intentional fire outbreak",
      "To live a balanced, peaceful lifestyle"
    ],
    correct: 1,
    solution: "'To burn the candle at both ends' means to work excessively hard, exhausting one's energy by waking early and sleeping late."
  },
  {
    id: 22,
    topic: "Reading & Vocabulary",
    section: "Verbal",
    question: "Select the correctly spelled word:",
    options: ["Accomodation", "Accommodation", "Acommodation", "Accomadation"],
    correct: 1,
    solution: "The correct spelling is 'Accommodation' (double 'c' and double 'm')."
  },

  // --- SECTION 4: TECHNICAL & COMPUTER SCIENCE (8 QUESTIONS) ---
  {
    id: 23,
    topic: "Data Structures",
    section: "Tech",
    question: "Which data structure operates strictly on a Last-In-First-Out (LIFO) basis and is inherently used for managing recursion and function call stacks?",
    options: ["Queue", "Stack", "Binary Tree", "Linked List"],
    correct: 1,
    solution: "A Stack is a linear LIFO data structure. Function call execution frames are pushed and popped from the system call stack."
  },
  {
    id: 24,
    topic: "Algorithms",
    section: "Tech",
    question: "What is the worst-case time complexity of the Merge Sort algorithm for an array of size n?",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
    correct: 1,
    solution: "Merge Sort always divides the array into halves (log n depth) and merges linearly O(n) per level. Worst, average, and best cases are all O(n log n)."
  },
  {
    id: 25,
    topic: "DBMS & SQL",
    section: "Tech",
    question: "Which SQL clause is explicitly used to filter aggregated grouped records after a GROUP BY statement?",
    options: ["WHERE", "HAVING", "ORDER BY", "FILTER"],
    correct: 1,
    solution: "WHERE filters individual rows prior to grouping. HAVING is explicitly used to filter aggregates following a GROUP BY clause."
  },
  {
    id: 26,
    topic: "Operating Systems",
    section: "Tech",
    question: "Which of the following is NOT one of the four Coffman conditions necessary for a Deadlock to occur?",
    options: ["Mutual Exclusion", "Hold and Wait", "Preemption Allowed", "Circular Wait"],
    correct: 2,
    solution: "The four Coffman conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. 'Preemption Allowed' prevents deadlock."
  },
  {
    id: 27,
    topic: "Computer Networks",
    section: "Tech",
    question: "At which layer of the OSI model does the Transmission Control Protocol (TCP) operate?",
    options: ["Network Layer", "Transport Layer", "Data Link Layer", "Session Layer"],
    correct: 1,
    solution: "TCP and UDP are end-to-end transport protocols functioning at Layer 4 (Transport Layer) of the OSI Reference Model."
  },
  {
    id: 28,
    topic: "Object-Oriented Programming",
    section: "Tech",
    question: "In OOP, what is the mechanism called when a subclass provides a specific implementation of a method that is already provided by its superclass?",
    options: ["Method Overloading", "Method Overriding", "Data Encapsulation", "Multiple Inheritance"],
    correct: 1,
    solution: "Method Overriding occurs when a derived class defines the same signature as a parent class method to provide runtime polymorphism."
  },
  {
    id: 29,
    topic: "Python & Programming",
    section: "Tech",
    question: "What is the output of the following Python expression: `bool([0])`?",
    options: ["True", "False", "TypeError", "0"],
    correct: 0,
    solution: "In Python, any non-empty list evaluates to True in a boolean context, even if its single element is 0. An empty list `[]` evaluates to False."
  },
  {
    id: 30,
    topic: "Web Architecture",
    section: "Tech",
    question: "Which HTTP status code signifies that a client must authenticate itself to get the requested response?",
    options: ["200 OK", "401 Unauthorized", "403 Forbidden", "500 Internal Error"],
    correct: 1,
    solution: "HTTP 401 Unauthorized indicates that the request lacks valid authentication credentials. HTTP 403 Forbidden indicates the server understands the identity but refuses authorization."
  }
];

// Compatibility alias for both portals
const MOCK_QUESTIONS_BANK = EXAM_QUESTIONS;
