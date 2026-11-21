// ==============================================================
// AVNIET ARENA — GLOBAL APPLICATION CONFIGURATION
// ==============================================================

const ARENA_CONFIG = {
  // Application Metadata
  APP_NAME: "AVNIET Placement & Assessment Arena",
  APP_VERSION: "1.0.0",
  COLLEGE: "AVN Institute of Engineering & Technology",

  // Google Sheets Integration
  SHEETS_WEBHOOK_URL: "https://script.google.com/macros/s/AKfycbw79r3kIApBVc4SKZnrVYu-mzoEF1YwCCiIUcCYzsQMGfmLKMhK-7niAtY_aNvpRQKw/exec",
  
  // Test Engine Parameters
  DEFAULT_TEST_DURATION_MINUTES: 15,
  POSITIVE_MARKS_PER_QUESTION: 3.0,
  NEGATIVE_MARKS_PER_QUESTION: 1.0,
  AUTO_SUBMIT_ON_EXPIRY: true,
  
  // Cognitive Round Config
  COGNITIVE_POINTS_PER_CORRECT: 10,
  
  // Academic Branch Registry
  BRANCH_REGISTRY: {
    "05": { name: "CSE", label: "Computer Science & Engineering" },
    "12": { name: "IT", label: "Information Technology" },
    "04": { name: "ECE", label: "Electronics & Communication" },
    "02": { name: "EEE", label: "Electrical & Electronics" },
    "03": { name: "MECH", label: "Mechanical Engineering" },
    "01": { name: "CIVIL", label: "Civil Engineering" },
    "66": { name: "CSM", label: "CSE (AI & Machine Learning)" },
    "67": { name: "CSD", label: "CSE (Data Science)" },
    "62": { name: "CSC", label: "CSE (Cyber Security)" }
  },

  // Batch Intake Years
  BATCH_YEARS: {
    "23": { year: "2027", stage: "Final Year" },
    "24": { year: "2028", stage: "Pre-Final" },
    "25": { year: "2029", stage: "Rising Tech" }
  }
};

// Freeze configuration to prevent accidental modification
Object.freeze(ARENA_CONFIG);
