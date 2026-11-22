// ==============================================================
// COMPANY COGNITIVE REASONING CHALLENGE ENGINE
// ==============================================================

const COGNITIVE_SHAPES = [
  { id: 0, name: "circle", svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="#3b82f6"/></svg>' },
  { id: 1, name: "triangle", svg: '<svg viewBox="0 0 40 40"><polygon points="20,4 36,36 4,36" fill="#f59e0b"/></svg>' },
  { id: 2, name: "square", svg: '<svg viewBox="0 0 40 40"><rect x="6" y="6" width="28" height="28" rx="3" fill="#f43f5e"/></svg>' },
  { id: 3, name: "diamond", svg: '<svg viewBox="0 0 40 40"><polygon points="20,4 36,20 20,36 4,20" fill="#10b981"/></svg>' }
];

let missingShapeId = null;
let cogScore = 0;

function openDeductiveGame() {
  generateDeductivePuzzle();
}

function generateDeductivePuzzle() {
  const fb = document.getElementById('deductiveFeedbackMsg');
  if (fb) fb.innerText = '';
  
  const baseRow = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  const latinMatrix = [];
  for (let r = 0; r < 4; r++) {
    const row = [];
    for (let c = 0; c < 4; c++) {
      row.push(baseRow[(c + r) % 4]);
    }
    latinMatrix.push(row);
  }

  const targetR = Math.floor(Math.random() * 4);
  const targetC = Math.floor(Math.random() * 4);
  missingShapeId = latinMatrix[targetR][targetC];

  const container = document.getElementById('deductiveGridContainer');
  if (!container) return;
  container.innerHTML = '';

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cell = document.createElement('div');
      cell.className = 'matrix-cell';

      if (r === targetR && c === targetC) {
        cell.classList.add('missing-target');
      } else {
        const shId = latinMatrix[r][c];
        cell.innerHTML = `<div style="width: 36px; height: 36px;">${COGNITIVE_SHAPES[shId].svg}</div>`;
      }
      container.appendChild(cell);
    }
  }

  const candRow = document.getElementById('gameCandidateButtons');
  if (!candRow) return;
  candRow.innerHTML = '';

  COGNITIVE_SHAPES.forEach(shape => {
    const b = document.createElement('button');
    b.className = 'shape-candidate-btn';
    b.innerHTML = `<div style="width: 36px; height: 36px;">${shape.svg}</div>`;
    b.onclick = () => submitDeductiveAnswer(shape.id);
    candRow.appendChild(b);
  });
}

function submitDeductiveAnswer(chosenId) {
  const fb = document.getElementById('deductiveFeedbackMsg');
  if (chosenId === missingShapeId) {
    cogScore += 10;
    if (fb) {
      fb.style.color = "var(--accent-emerald)";
      fb.innerText = "✓ Correct Deductive Match! (+10 Pts)";
    }
    const scoreLbl = document.getElementById('gameScoreLabel');
    if (scoreLbl) scoreLbl.innerText = `Score: ${cogScore}`;
    setTimeout(generateDeductivePuzzle, 900);
  } else {
    if (fb) {
      fb.style.color = "var(--accent-rose)";
      fb.innerText = "✗ Incorrect! Check row and column shape uniqueness.";
    }
  }
}
