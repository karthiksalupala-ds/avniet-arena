# Architecture Overview

The AVNIET Arena platform consists of three core components:

1. **Client-Side SPA (`index.html`, `css/`, `js/`)**:
   - Built with semantic HTML, vanilla CSS, and modular ES6 JavaScript.
   - Requires no build step or node runtime to run in the browser.
   - Student session data is cached in `localStorage` for offline persistence.

2. **Assessment & Question Bank**:
   - Stored in `js/questions.js`.
   - Each question includes category metadata, positive/negative marks, and complete step-by-step solutions.

3. **Data Logging (Google Apps Script Webhook)**:
   - When a student finishes their test, `js/api.js` makes a non-blocking `fetch` call to the Google Apps Script endpoint.
   - The script records candidate roll number, batch, branch, score, accuracy, and timestamp directly into the connected Google Sheet.
