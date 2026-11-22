/**
 * ==============================================================
 * AVNIET ARENA — PLUGGABLE COGNITIVE GAME DRIVERS
 * Modular game rules, procedural puzzle generators & evaluators
 * ==============================================================
 */

(function(global) {
  'use strict';

  // -------------------------------------------------------------
  // SHARED GLYPH SET FOR LOGIC PUZZLES
  // -------------------------------------------------------------
  const GLYPHS = {
    circle: {
      key: 'circle',
      label: 'Circle',
      color: '#10b981',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><circle cx="12" cy="12" r="8" fill="rgba(16,185,129,0.15)"/></svg>`
    },
    diamond: {
      key: 'diamond',
      label: 'Diamond',
      color: '#0284c7',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.5"><polygon points="12,3 21,12 12,21 3,12" fill="rgba(2,132,199,0.15)"/></svg>`
    },
    triangle: {
      key: 'triangle',
      label: 'Triangle',
      color: '#ca8a04',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ca8a04" stroke-width="2.5"><polygon points="12,4 21,20 3,20" fill="rgba(234,179,8,0.15)"/></svg>`
    },
    square: {
      key: 'square',
      label: 'Square',
      color: '#db2777',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#db2777" stroke-width="2.5"><rect x="4" y="4" width="16" height="16" rx="3" fill="rgba(219,39,119,0.15)"/></svg>`
    },
    star: {
      key: 'star',
      label: 'Star',
      color: '#7c3aed',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="rgba(124,58,237,0.15)"/></svg>`
    }
  };

  const GLYPH_KEYS = ['circle', 'diamond', 'triangle', 'square', 'star'];

  // -------------------------------------------------------------
  // DRIVER 1: LATIN SQUARE DEDUCTIVE PUZZLE (Capgemini Style)
  // -------------------------------------------------------------
  const LatinSquareDriver = {
    code: 'latin_square',
    name: 'Deductive Sudoku Latin Square',
    category: 'Cognitive Logic',
    defaultDuration: 90,
    basePoints: 10,

    getMetadata() {
      return {
        name: this.name,
        code: this.code,
        category: this.category,
        description: 'Deduce the missing symbol in a Sudoku-style Latin square matrix where each row and column contains each symbol exactly once.',
        rules: [
          'Each row and column must contain each symbol exactly once.',
          'Deduce the missing symbol marked by the [ ? ] target cell.',
          'Adaptive grid complexity scales from 3x3 to 5x5 matrices.'
        ]
      };
    },

    generatePuzzle(tier, solvedCount) {
      const gridSize = tier >= 6 ? 5 : (tier >= 3 ? 4 : 3);
      const activeKeys = GLYPH_KEYS.slice(0, gridSize);

      const matrix = [];
      const offset = Math.floor(Math.random() * gridSize);

      for (let r = 0; r < gridSize; r++) {
        matrix[r] = [];
        for (let c = 0; c < gridSize; c++) {
          matrix[r][c] = activeKeys[(r + c + offset) % gridSize];
        }
      }

      // Permute rows for entropy
      for (let i = matrix.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [matrix[i], matrix[j]] = [matrix[j], matrix[i]];
      }

      const targetR = Math.floor(Math.random() * gridSize);
      const targetC = Math.floor(Math.random() * gridSize);
      const solution = matrix[targetR][targetC];

      const puzzleGrid = matrix.map(row => [...row]);
      puzzleGrid[targetR][targetC] = '?';

      // Hide additional cells for higher difficulty
      const holes = gridSize === 3 ? 1 : (gridSize === 4 ? 3 : 5);
      let placed = 0;
      while (placed < holes) {
        const hr = Math.floor(Math.random() * gridSize);
        const hc = Math.floor(Math.random() * gridSize);
        if ((hr !== targetR || hc !== targetC) && puzzleGrid[hr][hc] !== '') {
          puzzleGrid[hr][hc] = '';
          placed++;
        }
      }

      return {
        type: 'latin_square',
        gridSize,
        grid: puzzleGrid,
        targetPos: { r: targetR, c: targetC },
        solution,
        choices: activeKeys.map(k => ({ key: k, glyph: GLYPHS[k] }))
      };
    },

    evaluateAnswer(choiceKey, puzzle) {
      return choiceKey === puzzle.solution;
    },

    renderPuzzleHtml(puzzle) {
      const size = puzzle.gridSize;
      const tileSize = size === 5 ? '54px' : (size === 4 ? '64px' : '74px');
      let gridHtml = `<div class="puzzle-grid-board" style="display: grid; grid-template-columns: repeat(${size}, 1fr); gap: 6px; margin: 16px auto;">`;

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const val = puzzle.grid[r][c];
          if (val === '?') {
            gridHtml += `<div class="cell-tile target-cell" style="width: ${tileSize}; height: ${tileSize}; border: 2px solid #2563eb; background: #eff6ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.2);">?</div>`;
          } else if (val && GLYPHS[val]) {
            gridHtml += `<div class="cell-tile" style="width: ${tileSize}; height: ${tileSize}; border: 1px solid #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #ffffff;">${GLYPHS[val].svg}</div>`;
          } else {
            gridHtml += `<div class="cell-tile" style="width: ${tileSize}; height: ${tileSize}; border: 1px dashed #e2e8f0; border-radius: 8px; background: #f8fafc;"></div>`;
          }
        }
      }
      gridHtml += `</div>`;
      return gridHtml;
    }
  };

  // -------------------------------------------------------------
  // DRIVER 2: SWITCH CHALLENGE (Deloitte / Capgemini Permutation)
  // -------------------------------------------------------------
  const SwitchChallengeDriver = {
    code: 'switch_challenge',
    name: 'Switch Transformation Challenge',
    category: 'Inductive Logic',
    defaultDuration: 120,
    basePoints: 15,

    getMetadata() {
      return {
        name: this.name,
        code: this.code,
        category: this.category,
        description: 'Decipher how numerical switch operators (e.g. 4-2-1-3) permute an ordered sequence of input symbols to target positions.',
        rules: [
          'An input row of 4 symbols is re-arranged into a target output sequence.',
          'Identify which 4-digit switch operator code was applied.',
          'Each digit specifies where the symbol at that index moves.'
        ]
      };
    },

    generatePuzzle(tier, solvedCount) {
      const activeKeys = GLYPH_KEYS.slice(0, 4);
      const inputSeq = [...activeKeys];

      // Shuffle input sequence
      for (let i = inputSeq.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [inputSeq[i], inputSeq[j]] = [inputSeq[j], inputSeq[i]];
      }

      // Generate a permutation switch operator (1-based e.g. [2, 4, 1, 3])
      const validPerms = [
        [2, 4, 1, 3],
        [3, 1, 4, 2],
        [4, 2, 1, 3],
        [1, 4, 2, 3],
        [3, 2, 4, 1],
        [2, 1, 4, 3]
      ];
      const correctPerm = validPerms[Math.floor(Math.random() * validPerms.length)];

      // Apply transformation
      const outputSeq = correctPerm.map(idx => inputSeq[idx - 1]);
      const solution = correctPerm.join(' ');

      // Generate 3 plausible distractors
      const distractors = validPerms
        .filter(p => p.join(' ') !== solution)
        .slice(0, 3)
        .map(p => p.join(' '));

      const allChoices = [solution, ...distractors];
      for (let i = allChoices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allChoices[i], allChoices[j]] = [allChoices[j], allChoices[i]];
      }

      return {
        type: 'switch_challenge',
        inputSeq,
        outputSeq,
        solution,
        choices: allChoices.map(c => ({ key: c, label: c }))
      };
    },

    evaluateAnswer(choiceKey, puzzle) {
      return choiceKey === puzzle.solution;
    },

    renderPuzzleHtml(puzzle) {
      let html = `<div style="display: flex; flex-direction: column; align-items: center; gap: 14px; margin: 16px 0;">`;
      
      // Top Input Sequence
      html += `<div style="text-align: center;"><span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Input Sequence</span><div style="display: flex; gap: 8px; margin-top: 6px;">`;
      puzzle.inputSeq.forEach((k, idx) => {
        html += `<div style="width: 50px; height: 50px; border: 2px solid #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #ffffff; position: relative;"><span style="position: absolute; top: 2px; left: 4px; font-size: 10px; color: #94a3b8; font-weight: 800;">${idx + 1}</span>${GLYPHS[k].svg}</div>`;
      });
      html += `</div></div>`;

      // Middle Operator
      html += `<div style="background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 6px 20px; font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 800; color: #1d4ed8;">[ ?  ?  ?  ? ]</div>`;

      // Bottom Output Sequence
      html += `<div style="text-align: center;"><span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Target Output Sequence</span><div style="display: flex; gap: 8px; margin-top: 6px;">`;
      puzzle.outputSeq.forEach((k) => {
        html += `<div style="width: 50px; height: 50px; border: 2px solid #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #ecfdf5;">${GLYPHS[k].svg}</div>`;
      });
      html += `</div></div>`;

      html += `</div>`;
      return html;
    }
  };

  // -------------------------------------------------------------
  // DRIVER 3: NUMERICAL OPERATOR DEDUCTION (Speed Math Logic)
  // -------------------------------------------------------------
  const NumericalDeductionDriver = {
    code: 'numerical_deduction',
    name: 'Mental Operator Deduction',
    category: 'Quantitative Speed Logic',
    defaultDuration: 90,
    basePoints: 10,

    getMetadata() {
      return {
        name: this.name,
        code: this.code,
        category: this.category,
        description: 'Deduce the missing mathematical operator (+, −, ×, ÷) that satisfies the rapid equality equation.',
        rules: [
          'Observe the numerical terms and the evaluated result.',
          'Identify which mathematical operation belongs in the [ ? ] cell.',
          'Speed is critical: Solve as many equations as possible within the countdown.'
        ]
      };
    },

    generatePuzzle(tier, solvedCount) {
      const ops = ['+', '-', '×', '÷'];
      const chosenOp = ops[Math.floor(Math.random() * ops.length)];
      let a = 0, b = 0, res = 0;

      if (chosenOp === '+') {
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * 50) + 10;
        res = a + b;
      } else if (chosenOp === '-') {
        a = Math.floor(Math.random() * 60) + 30;
        b = Math.floor(Math.random() * (a - 10)) + 5;
        res = a - b;
      } else if (chosenOp === '×') {
        a = Math.floor(Math.random() * 12) + 3;
        b = Math.floor(Math.random() * 12) + 3;
        res = a * b;
      } else {
        b = Math.floor(Math.random() * 8) + 2;
        res = Math.floor(Math.random() * 12) + 3;
        a = b * res;
      }

      return {
        type: 'numerical_deduction',
        a, b, res,
        solution: chosenOp,
        choices: ops.map(op => ({ key: op, label: op }))
      };
    },

    evaluateAnswer(choiceKey, puzzle) {
      return choiceKey === puzzle.solution;
    },

    renderPuzzleHtml(puzzle) {
      return `
        <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin: 24px 0; font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 800; color: #0f172a;">
          <span style="background: #f1f5f9; padding: 10px 18px; border-radius: 8px;">${puzzle.a}</span>
          <span style="background: #eff6ff; border: 2px solid #2563eb; color: #2563eb; padding: 10px 18px; border-radius: 8px; box-shadow: 0 0 0 3px rgba(37,99,235,0.2);">?</span>
          <span style="background: #f1f5f9; padding: 10px 18px; border-radius: 8px;">${puzzle.b}</span>
          <span>=</span>
          <span style="background: #ecfdf5; border: 2px solid #10b981; color: #059669; padding: 10px 18px; border-radius: 8px;">${puzzle.res}</span>
        </div>
      `;
    }
  };

  // -------------------------------------------------------------
  // AUTO-REGISTER DRIVERS INTO GLOBAL ENGINE
  // -------------------------------------------------------------
  if (global.GameEngine) {
    global.GameEngine.registerDriver(LatinSquareDriver.code, LatinSquareDriver);
    global.GameEngine.registerDriver(SwitchChallengeDriver.code, SwitchChallengeDriver);
    global.GameEngine.registerDriver(NumericalDeductionDriver.code, NumericalDeductionDriver);
  }

  // Also expose drivers map
  global.CognitiveDrivers = {
    GLYPHS,
    LatinSquareDriver,
    SwitchChallengeDriver,
    NumericalDeductionDriver
  };

})(typeof window !== 'undefined' ? window : this);
