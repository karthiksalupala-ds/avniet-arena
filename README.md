# AVNIET Arena — Placement Assessment & Contest Portal

A responsive campus placement assessment platform built for engineering students at AVNIET. Features timed aptitude tests, company cognitive ability challenges, detailed solutions, and real-time leaderboard standings.

---

## Key Features

- **TCS iON / AMCAT Assessment Layout**:
  - Live countdown timer with auto-submit.
  - Interactive Question Palette with standard color indicators:
    - Green: Answered
    - Red: Not Answered
    - Purple: Marked for Review
    - Slate: Not Visited
  - Filter by section: Quantitative Aptitude, Logical Reasoning, Computer Science.
  - Full review modal and instant step-by-step mathematical explanations.

- **Company Cognitive Ability Games**:
  - Capgemini Deductive Reasoning Challenge (4x4 Latin Square shape matrix).
  - Practice modules mapped to top hiring patterns.

- **Campus Hall of Fame**:
  - Live ranking table filterable by Batch (2027, 2028, 2029) and Department (CSE, IT, CSM, CSD, ECE).

- **Automated Google Sheets Logging**:
  - Scores, accuracy, and test durations are logged asynchronously via Google Apps Script.

---

## Directory Structure

```text
avniet-arena/
├── assets/
│   └── icons/
│       └── favicon.svg         # Platform emblem
├── css/
│   └── style.css               # Typography and layout styling
├── js/
│   ├── config.js               # Global parameters and branch registry
│   ├── questions.js            # Aptitude question bank with solutions
│   ├── api.js                  # Roll number detection & webhook sync
│   ├── exam.js                 # Test engine and timer
│   ├── cognitive.js            # Deductive puzzle engine
│   ├── leaderboard.js          # Campus rankings and filters
│   └── app.js                  # Main controller
├── docs/
│   └── ARCHITECTURE.md         # System design overview
├── index.html                  # Main web application entry point
├── package.json                # Project configuration
├── serve.py                    # Local development runner
└── site.webmanifest            # Mobile PWA manifest
```

---

## Getting Started

To run the platform locally:

```bash
python serve.py
```

Then open `http://localhost:3000` in your browser.
