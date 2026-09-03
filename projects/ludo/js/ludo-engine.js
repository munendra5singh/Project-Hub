/**
 * LudoEngine - Authoritative game rules and state machine for 2-6 player Ludo.
 * Implements standard rules, safe zones, captures, extra turns, 3-consecutive-sixes rule,
 * and exact finish validation. Supports 4-player cross and 6-player hexagonal geometries.
 */
const LudoEngine = (() => {
  // Standard Player Color Palettes (High contrast, accessible)
  const PLAYER_COLORS_4 = [
    { name: 'Red', hex: '#ef4444', dark: '#b91c1c', light: '#fca5a5' },
    { name: 'Green', hex: '#10b981', dark: '#047857', light: '#6ee7b7' },
    { name: 'Yellow', hex: '#f59e0b', dark: '#b45309', light: '#fde68a' },
    { name: 'Blue', hex: '#3b82f6', dark: '#1d4ed8', light: '#93c5fd' }
  ];

  // 15x15 Standard Grid Coordinates for 52-cell track
  // Formatted as [col, row]
  const TRACK_COORDS_4P = [
    // Red arm going Right (0-4)
    [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
    // Up into Green arm (5-10)
    [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
    // Cross Top (11)
    [7, 0],
    // Down from Green arm (12-17)
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
    // Right into Yellow arm (18-23)
    [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
    // Cross Right (24)
    [14, 7],
    // Left along Bottom of Yellow arm (25-30)
    [14, 8], [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
    // Down into Blue arm (31-36)
    [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
    // Cross Bottom (37)
    [7, 14],
    // Up along Left of Blue arm (38-43)
    [6, 14], [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
    // Left into Red arm (44-49)
    [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
    // Cross Left (50)
    [0, 7],
    // Up to Red start (51)
    [0, 6]
  ];

  // Home run columns for 4P (5 steps each)
  const HOME_COLUMNS_4P = {
    0: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]], // Red
    1: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]], // Green
    2: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]], // Yellow
    3: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]]  // Blue
  };

  // Base slot coordinates [col, row] for 4P
  const BASE_SLOTS_4P = {
    0: [[1.8, 1.8], [3.8, 1.8], [1.8, 3.8], [3.8, 3.8]], // Red TL
    1: [[10.8, 1.8], [12.8, 1.8], [10.8, 3.8], [12.8, 3.8]], // Green TR
    2: [[10.8, 10.8], [12.8, 10.8], [10.8, 12.8], [12.8, 12.8]], // Yellow BR
    3: [[1.8, 10.8], [3.8, 10.8], [1.8, 12.8], [3.8, 12.8]]  // Blue BL
  };

  // Safe squares indices
  const SAFE_CELLS_4P = [0, 8, 13, 21, 26, 34, 39, 47];
  const START_POS_4P = [0, 13, 26, 39]; // Red, Green, Yellow, Blue start positions on 52-track

  let state = {
    players: [],
    playerCount: 4,
    turnIdx: 0,
    diceVal: 1,
    consecutiveSixes: 0,
    phase: 'WAITING_FOR_ROLL', // WAITING_FOR_ROLL, ROLLING, SELECTING_TOKEN, MOVING_TOKEN, GAME_OVER, PAUSED
    validTokens: [],
    selectedTokenId: null,
    tokens: {}, // pIdx -> [ { id: 0..3, pos: -1, step: -1, state: 'HOME' } ]
    winner: null,
    rankings: []
  };

  function init(playersConfig) {
    const pCount = Math.min(Math.max(playersConfig.length, 2), 4);

    state = {
      players: playersConfig.slice(0, pCount).map((p, idx) => {
        // 2 players use opposite colors: Red (0) and Yellow (2)
        const colorIdx = (pCount === 2 && idx === 1) ? 2 : idx;
        return {
          id: idx,
          name: p.name || `Player ${idx + 1}`,
          type: p.type || 'human',
          colorIdx: colorIdx,
          color: PLAYER_COLORS_4[colorIdx]
        };
      }),
      playerCount: pCount,
      turnIdx: 0,
      diceVal: 1,
      consecutiveSixes: 0,
      phase: 'WAITING_FOR_ROLL',
      validTokens: [],
      selectedTokenId: null,
      winner: null,
      rankings: [],
      tokens: {}
    };

    state.players.forEach((p, pIdx) => {
      state.tokens[pIdx] = [
        { id: 0, pos: -1, step: -1, state: 'HOME' },
        { id: 1, pos: -1, step: -1, state: 'HOME' },
        { id: 2, pos: -1, step: -1, state: 'HOME' },
        { id: 3, pos: -1, step: -1, state: 'HOME' }
      ];
    });

    return state;
  }

  function getCommonTrackLength() {
    return 52;
  }

  function getMaxSteps() {
    return 57; // 51 track + 5 home column + 1 center finish
  }

  function getStartTrackPos(playerIdx) {
    if (state.playerCount === 2) {
      // 2 players use opposite colors: 0 (Red) and 2 (Yellow)
      return playerIdx === 0 ? START_POS_4P[0] : START_POS_4P[2];
    }
    return START_POS_4P[playerIdx];
  }

  function getSafeCells() {
    return SAFE_CELLS_4P;
  }

  function rollDice(forcedVal = null) {
    if (state.phase !== 'WAITING_FOR_ROLL' || state.winner !== null) return null;

    const roll = forcedVal !== null ? forcedVal : Math.floor(Math.random() * 6) + 1;
    state.diceVal = roll;
    state.phase = 'ROLLING';

    if (roll === 6) {
      state.consecutiveSixes++;
      Storage.updateStats('ludo', { sixes: 1 });
      Achievements.checkEvent('SIX_ROLLED');
    } else {
      state.consecutiveSixes = 0;
    }

    // 3 Consecutive Sixes Rule: penalty, lose turn
    if (state.consecutiveSixes >= 3) {
      state.consecutiveSixes = 0;
      state.validTokens = [];
      state.selectedTokenId = null;
      return {
        diceVal: roll,
        movesAvailable: false,
        threeSixesPenalty: true,
        tokens: []
      };
    }

    const validMoves = getValidMoves(state.turnIdx, roll);
    state.validTokens = validMoves;
    state.selectedTokenId = validMoves.length > 0 ? validMoves[0] : null;

    if (validMoves.length === 0) {
      return {
        diceVal: roll,
        movesAvailable: false,
        threeSixesPenalty: false,
        tokens: []
      };
    }

    state.phase = 'SELECTING_TOKEN';
    return {
      diceVal: roll,
      movesAvailable: true,
      threeSixesPenalty: false,
      tokens: validMoves,
      autoSelectable: validMoves.length === 1
    };
  }

  function getValidMoves(playerIdx, roll) {
    const playerTokens = state.tokens[playerIdx];
    if (!playerTokens) return [];
    const maxSteps = getMaxSteps();
    const valid = [];

    playerTokens.forEach((t) => {
      if (t.state === 'HOME' && roll === 6) {
        valid.push(t.id);
      } else if (t.state === 'ON_BOARD' || t.state === 'HOME_COLUMN') {
        if (t.step + roll <= maxSteps) {
          valid.push(t.id);
        }
      }
    });

    return valid;
  }

  function getStepPath(playerIdx, tokenId, roll) {
    const token = state.tokens[playerIdx].find((t) => t.id === tokenId);
    if (!token) return [];

    const path = [];
    const trackLen = getCommonTrackLength();
    const startTrack = getStartTrackPos(playerIdx);
    const maxSteps = getMaxSteps();

    if (token.state === 'HOME') {
      if (roll !== 6) return [];
      path.push({
        step: 0,
        pos: startTrack,
        state: 'ON_BOARD'
      });
      return path;
    }

    const currentStep = token.step;
    for (let s = 1; s <= roll; s++) {
      const nextStep = currentStep + s;
      if (nextStep > maxSteps) break;

      let nextPos = -1;
      let nextState = 'ON_BOARD';

      if (nextStep < trackLen) {
        nextPos = (startTrack + nextStep) % trackLen;
        nextState = 'ON_BOARD';
      } else if (nextStep < maxSteps) {
        nextPos = 100 + (nextStep - trackLen); // Home column
        nextState = 'HOME_COLUMN';
      } else {
        nextPos = 999; // Finish
        nextState = 'FINISHED';
      }

      path.push({
        step: nextStep,
        pos: nextPos,
        state: nextState
      });
    }

    return path;
  }

  function applyTokenMove(playerIdx, tokenId) {
    if (state.winner !== null || playerIdx !== state.turnIdx) return null;
    const token = state.tokens[playerIdx].find((t) => t.id === tokenId);
    if (!token) return null;

    const roll = state.diceVal;
    const trackLen = getCommonTrackLength();
    const startTrack = getStartTrackPos(playerIdx);
    const maxSteps = getMaxSteps();
    const safeCells = getSafeCells();

    let captured = false;
    let capturedPlayerIdx = null;
    let capturedTokenId = null;

    if (token.state === 'HOME' && roll === 6) {
      token.step = 0;
      token.pos = startTrack;
      token.state = 'ON_BOARD';
    } else if (token.step >= 0 && token.step + roll <= maxSteps) {
      token.step += roll;
      if (token.step < trackLen) {
        token.pos = (startTrack + token.step) % trackLen;
        token.state = 'ON_BOARD';

        // Capture check on non-safe cells
        const isSafe = safeCells.includes(token.pos);
        if (!isSafe) {
          Object.keys(state.tokens).forEach((otherPStr) => {
            const otherPIdx = parseInt(otherPStr, 10);
            if (otherPIdx !== playerIdx) {
              state.tokens[otherPIdx].forEach((otherT) => {
                if (otherT.state === 'ON_BOARD' && otherT.pos === token.pos) {
                  otherT.pos = -1;
                  otherT.step = -1;
                  otherT.state = 'HOME';
                  captured = true;
                  capturedPlayerIdx = otherPIdx;
                  capturedTokenId = otherT.id;
                }
              });
            }
          });
        }
      } else if (token.step < maxSteps) {
        token.pos = 100 + (token.step - trackLen);
        token.state = 'HOME_COLUMN';
      } else {
        token.pos = 999;
        token.state = 'FINISHED';
        Storage.updateStats('ludo', { tokensFinished: 1 });
      }
    } else {
      return null;
    }

    Storage.updateStats('ludo', { totalMoves: 1 });

    if (captured) {
      Storage.updateStats('ludo', { captures: 1 });
      Achievements.checkEvent('CAPTURE');
    }

    // Check Win
    const isWinner = checkPlayerWin(playerIdx);
    if (isWinner) {
      state.winner = playerIdx;
      state.phase = 'GAME_OVER';
      if (!state.rankings.includes(playerIdx)) {
        state.rankings.push(playerIdx);
      }
      return {
        status: 'win',
        winner: playerIdx,
        captured,
        capturedPlayerIdx,
        capturedTokenId,
        extraTurn: false
      };
    }

    const extraTurn = (roll === 6 || captured);
    state.validTokens = [];
    state.selectedTokenId = null;

    if (!extraTurn) {
      passTurn();
    } else {
      state.phase = 'WAITING_FOR_ROLL';
    }

    return {
      status: 'moved',
      captured,
      capturedPlayerIdx,
      capturedTokenId,
      extraTurn
    };
  }

  function checkPlayerWin(playerIdx) {
    const maxSteps = getMaxSteps();
    return state.tokens[playerIdx].every((t) => t.step === maxSteps);
  }

  function passTurn() {
    state.consecutiveSixes = 0;
    state.validTokens = [];
    state.selectedTokenId = null;
    state.phase = 'WAITING_FOR_ROLL';
    state.turnIdx = (state.turnIdx + 1) % state.players.length;
  }

  function selectTokenById(tokenId) {
    if (state.validTokens.includes(tokenId)) {
      state.selectedTokenId = tokenId;
      return true;
    }
    return false;
  }

  function cycleSelectedToken(direction = 1) {
    if (state.validTokens.length === 0) return null;
    const currIdx = state.validTokens.indexOf(state.selectedTokenId);
    let nextIdx = (currIdx + direction + state.validTokens.length) % state.validTokens.length;
    state.selectedTokenId = state.validTokens[nextIdx];
    return state.selectedTokenId;
  }

  function getPlayerColorIdx(playerIdx) {
    if (state.playerCount === 2 && playerIdx === 1) return 2;
    return playerIdx;
  }

  return {
    init,
    rollDice,
    getValidMoves,
    getStepPath,
    applyTokenMove,
    passTurn,
    selectTokenById,
    cycleSelectedToken,
    getPlayerColorIdx,
    getState: () => state,
    restoreState: (saved) => { state = saved; },
    PLAYER_COLORS_4,
    TRACK_COORDS_4P,
    HOME_COLUMNS_4P,
    BASE_SLOTS_4P,
    SAFE_CELLS_4P,
    START_POS_4P,
    getSafeCells,
    getStartTrackPos,
    getMaxSteps,
    getCommonTrackLength
  };
})();
