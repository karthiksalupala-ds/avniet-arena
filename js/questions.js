// ==============================================================
// AVNIET ARENA — PLACEMENT APTITUDE & TECHNICAL QUESTION BANK
// ==============================================================

const EXAM_QUESTIONS = [
  {
    id: 1,
    topic: "Time & Work",
    section: "Quant",
    question: "A can do a piece of work in 10 days and B can do the same work in 15 days. In how many days can they finish the work if they work together?",
    options: ["4 days", "5 days", "6 days", "8 days"],
    correct: 2,
    solution: "A's 1-day work = 1/10.\nB's 1-day work = 1/15.\nCombined 1-day work = 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6.\nTotal days together = 1 / (1/6) = 6 days."
  },
  {
    id: 2,
    topic: "Profit & Loss",
    section: "Quant",
    question: "If the cost price of 12 pens equals the selling price of 8 pens, what is the gain percentage?",
    options: ["25%", "40%", "50%", "60%"],
    correct: 2,
    solution: "Let Cost Price of 1 pen = Rs. 1.\nCP of 8 pens = Rs. 8.\nSP of 8 pens = CP of 12 pens = Rs. 12.\nGain = 12 - 8 = Rs. 4.\nGain % = (Gain / CP) * 100 = (4 / 8) * 100 = 50%."
  },
  {
    id: 3,
    topic: "Speed & Distance",
    section: "Quant",
    question: "A train 150 m long passes a standing pole in 10 seconds. What is the speed of the train in km/h?",
    options: ["45 km/h", "54 km/h", "60 km/h", "72 km/h"],
    correct: 1,
    solution: "Speed in m/s = Distance / Time = 150 / 10 = 15 m/s.\nConvert to km/h by multiplying with (18/5):\nSpeed = 15 * (18 / 5) = 3 * 18 = 54 km/h."
  },
  {
    id: 4,
    topic: "Speed & Distance",
    section: "Quant",
    question: "A person travels from town A to town B at 40 km/h and returns at 60 km/h. What is the average speed for the entire round trip?",
    options: ["45 km/h", "48 km/h", "50 km/h", "52 km/h"],
    correct: 1,
    solution: "Average speed for equal distances = 2xy / (x + y).\nAvg Speed = 2(40)(60) / (40 + 60) = 4800 / 100 = 48 km/h."
  },
  {
    id: 5,
    topic: "Percentages & Ratio",
    section: "Quant",
    question: "If A's salary is 25% more than B's salary, by what percentage is B's salary less than A's salary?",
    options: ["15%", "20%", "22.5%", "25%"],
    correct: 1,
    solution: "Let B's salary = 100. Then A's salary = 125.\nDifference = 25.\nPercentage less than A = (25 / 125) * 100 = 20%."
  },
  {
    id: 6,
    topic: "Coding-Decoding",
    section: "Reasoning",
    question: "In a certain code, 'ROAD' is written as 'URDG'. How is 'SWAN' written in that same code?",
    options: ["VZDQ", "VZCQ", "UXDP", "VYDQ"],
    correct: 0,
    solution: "Each letter is shifted forward by +3 positions:\nR (+3) = U, O (+3) = R, A (+3) = D, D (+3) = G.\nApplying +3 to SWAN:\nS (+3) = V, W (+3) = Z, A (+3) = D, N (+3) = Q.\nAnswer = VZDQ."
  },
  {
    id: 7,
    topic: "Number Series",
    section: "Reasoning",
    question: "Find the missing number in the series: 1, 4, 9, 16, 25, ?, 49",
    options: ["30", "36", "42", "48"],
    correct: 1,
    solution: "Consecutive squares: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25, 6²=36, 7²=49.\nMissing term is 36."
  },
  {
    id: 8,
    topic: "Data Structures",
    section: "Tech",
    question: "Which data structure operates strictly on a Last-In-First-Out (LIFO) basis and is inherently used for managing recursion and function call stacks?",
    options: ["Queue", "Stack", "Binary Tree", "Linked List"],
    correct: 1,
    solution: "A Stack is a linear data structure operating on the LIFO principle. Function call execution records are pushed and popped from the call stack."
  },
  {
    id: 9,
    topic: "Algorithms",
    section: "Tech",
    question: "What is the worst-case time complexity of the Merge Sort algorithm for an array of size n?",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
    correct: 1,
    solution: "Merge Sort always divides the array into two halves (log n recursion depth) and performs linear merging O(n) per level. Hence, worst, average, and best cases are all O(n log n)."
  },
  {
    id: 10,
    topic: "DBMS & SQL",
    section: "Tech",
    question: "Which SQL clause is explicitly used to filter aggregated grouped records after a GROUP BY statement?",
    options: ["WHERE", "HAVING", "ORDER BY", "FILTER"],
    correct: 1,
    solution: "The WHERE clause filters individual rows before aggregation. The HAVING clause is explicitly designed to filter grouped aggregates after GROUP BY."
  }
];
