/**
 * AI - Multi-tier Bot AI engine for Ludo and Snakes & Ladders.
 * Implements Easy (random), Normal (heuristic), and Hard (positional threat evaluation).
 */
const BotAI = (() => {
  function getDifficulty() {
    try {
      const s = Storage.get('settings');
      return s ? s.difficulty || 'normal' : 'normal';
    } catch (e) {
      return 'normal';
    }
  }

  function chooseLudoMove(playerIdx, validTokens) {
    if (!validTokens || validTokens.length === 0) return null;
    if (validTokens.length === 1) return validTokens[0];

    const difficulty = getDifficulty();

    if (difficulty === 'easy') {
      const randomIndex = Math.floor(Math.random() * validTokens.length);
      return validTokens[randomIndex];
    }

    if (difficulty === 'normal') {
      return evaluateLudoNormal(playerIdx, validTokens);
    }

    // Hard difficulty
    return evaluateLudoHard(playerIdx, validTokens);
  }

  function evaluateLudoNormal(playerIdx, validTokens) {
    const st = LudoEngine.getState();
    const roll = st.diceVal;
    const tokens = st.tokens[playerIdx];
    const maxSteps = LudoEngine.getMaxSteps();
    const trackLen = LudoEngine.getCommonTrackLength();
    const startTrack = LudoEngine.getStartTrackPos(playerIdx);
    const safeCells = LudoEngine.getSafeCells ? LudoEngine.getSafeCells() : [0, 8, 13, 21, 26, 34, 39, 47];

    let bestTokenId = validTokens[0];
    let highestScore = -1;

    validTokens.forEach((id) => {
      const tok = tokens.find((t) => t.id === id);
      if (!tok) return;

      let score = 0;

      // 1. Can finish token
      if (tok.step + roll === maxSteps) {
        score += 80;
      }

      // 2. Can bring token out of base
      if (tok.state === 'HOME' && roll === 6) {
        score += 50;
      }

      // 3. Can capture opponent
      if (tok.state === 'ON_BOARD') {
        const nextStep = tok.step + roll;
        if (nextStep < trackLen) {
          const nextPos = (startTrack + nextStep) % trackLen;
          if (!safeCells.includes(nextPos)) {
            let canCapture = false;
            Object.keys(st.tokens).forEach((otherPStr) => {
              const otherP = parseInt(otherPStr, 10);
              if (otherP !== playerIdx) {
                st.tokens[otherP].forEach((ot) => {
                  if (ot.state === 'ON_BOARD' && ot.pos === nextPos) {
                    canCapture = true;
                  }
                });
              }
            });
            if (canCapture) score += 100;
          }
        }
      }

      // 4. Land on safe cell
      if (tok.state === 'ON_BOARD') {
        const nextStep = tok.step + roll;
        if (nextStep < trackLen) {
          const nextPos = (startTrack + nextStep) % trackLen;
          if (safeCells.includes(nextPos)) score += 35;
        }
      }

      // 5. General advancement
      score += tok.step;

      if (score > highestScore) {
        highestScore = score;
        bestTokenId = id;
      }
    });

    return bestTokenId;
  }

  function evaluateLudoHard(playerIdx, validTokens) {
    const st = LudoEngine.getState();
    const roll = st.diceVal;
    const tokens = st.tokens[playerIdx];
    const maxSteps = LudoEngine.getMaxSteps();
    const trackLen = LudoEngine.getCommonTrackLength();
    const startTrack = LudoEngine.getStartTrackPos(playerIdx);
    const safeCells = LudoEngine.getSafeCells ? LudoEngine.getSafeCells() : [0, 8, 13, 21, 26, 34, 39, 47];

    let bestTokenId = validTokens[0];
    let highestScore = -Infinity;

    validTokens.forEach((id) => {
      const tok = tokens.find((t) => t.id === id);
      if (!tok) return;

      let score = 0;

      // 1. Direct Win / Home Finish
      if (tok.step + roll === maxSteps) {
        score += 120;
      }

      // 2. Direct Capture
      if (tok.state === 'ON_BOARD') {
        const nextStep = tok.step + roll;
        if (nextStep < trackLen) {
          const nextPos = (startTrack + nextStep) % trackLen;
          if (!safeCells.includes(nextPos)) {
            let capturedCount = 0;
            Object.keys(st.tokens).forEach((otherPStr) => {
              const otherP = parseInt(otherPStr, 10);
              if (otherP !== playerIdx) {
                st.tokens[otherP].forEach((ot) => {
                  if (ot.state === 'ON_BOARD' && ot.pos === nextPos) {
                    capturedCount++;
                  }
                });
              }
            });
            if (capturedCount > 0) score += 110 * capturedCount;
          }
        }
      }

      // 3. Bring Token Out of Base
      if (tok.state === 'HOME' && roll === 6) {
        // Count how many tokens are still in base
        const inBaseCount = tokens.filter((t) => t.state === 'HOME').length;
        score += 45 + inBaseCount * 10;
      }

      // 4. Escape Threat: Check if current token is in danger (opponent behind 1-6 cells on non-safe square)
      if (tok.state === 'ON_BOARD' && !safeCells.includes(tok.pos)) {
        let isUnderThreat = false;
        Object.keys(st.tokens).forEach((otherPStr) => {
          const otherP = parseInt(otherPStr, 10);
          if (otherP !== playerIdx) {
            st.tokens[otherP].forEach((ot) => {
              if (ot.state === 'ON_BOARD') {
                const distBehind = (tok.pos - ot.pos + trackLen) % trackLen;
                if (distBehind >= 1 && distBehind <= 6) {
                  isUnderThreat = true;
                }
              }
            });
          }
        });
        if (isUnderThreat) {
          score += 55; // High priority to rescue endangered token
        }
      }

      // 5. Landing on Safe Star/Cell
      if (tok.state === 'ON_BOARD') {
        const nextStep = tok.step + roll;
        if (nextStep < trackLen) {
          const nextPos = (startTrack + nextStep) % trackLen;
          if (safeCells.includes(nextPos)) score += 40;

          // Check if landing square is dangerous (opponent 1-6 behind target)
          let landingDanger = false;
          Object.keys(st.tokens).forEach((otherPStr) => {
            const otherP = parseInt(otherPStr, 10);
            if (otherP !== playerIdx) {
              st.tokens[otherP].forEach((ot) => {
                if (ot.state === 'ON_BOARD') {
                  const distBehind = (nextPos - ot.pos + trackLen) % trackLen;
                  if (distBehind >= 1 && distBehind <= 6 && !safeCells.includes(nextPos)) {
                    landingDanger = true;
                  }
                }
              });
            }
          });
          if (landingDanger) score -= 25;
        } else if (nextStep >= trackLen && nextStep < maxSteps) {
          // Inside safe home column
          score += 35;
        }
      }

      // 6. Advancement weight
      score += tok.step * 0.8;

      if (score > highestScore) {
        highestScore = score;
        bestTokenId = id;
      }
    });

    return bestTokenId;
  }

  return {
    chooseLudoMove,
    getDifficulty
  };
})();
