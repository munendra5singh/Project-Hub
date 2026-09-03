/**
 * LadderEngine - Authoritative Snakes & Ladders game engine for 2-6 players.
 * Supports exact win at 100, extra turn on six, snakes/ladders resolution,
 * and step-by-step path generation.
 */
const LadderEngine = (() => {
  const SNAKES = {
    16: 6,
    47: 26,
    49: 11,
    56: 53,
    62: 19,
    64: 60,
    87: 24,
    93: 73,
    95: 75,
    98: 78
  };

  const LADDERS = {
    1: 38,
    4: 14,
    9: 31,
    21: 42,
    28: 84,
    36: 44,
    51: 67,
    71: 91,
    80: 100
  };

  const PLAYER_COLORS = [
    { name: 'Red', hex: '#ef4444', dark: '#b91c1c', light: '#fca5a5' },
    { name: 'Green', hex: '#10b981', dark: '#047857', light: '#6ee7b7' },
    { name: 'Yellow', hex: '#f59e0b', dark: '#b45309', light: '#fde68a' },
    { name: 'Blue', hex: '#3b82f6', dark: '#1d4ed8', light: '#93c5fd' },
    { name: 'Purple', hex: '#8b5cf6', dark: '#6d28d9', light: '#c4b5fd' },
    { name: 'Cyan', hex: '#06b6d4', dark: '#0e7490', light: '#67e8f9' }
  ];

  let state = {
    players: [],
    turnIdx: 0,
    diceVal: 1,
    positions: {}, // pIdx -> 0..100
    winner: null,
    phase: 'WAITING_FOR_ROLL'
  };

  function init(playersConfig) {
    state = {
      players: playersConfig.map((p, idx) => ({
        id: idx,
        name: p.name || `Player ${idx + 1}`,
        type: p.type || 'human',
        color: PLAYER_COLORS[idx % PLAYER_COLORS.length]
      })),
      turnIdx: 0,
      diceVal: 1,
      positions: {},
      winner: null,
      phase: 'WAITING_FOR_ROLL'
    };

    state.players.forEach((_, idx) => {
      state.positions[idx] = 0; // Off-board
    });

    return state;
  }

  function rollDice(forcedVal = null) {
    if (state.phase !== 'WAITING_FOR_ROLL' || state.winner !== null) return null;

    const roll = forcedVal !== null ? forcedVal : Math.floor(Math.random() * 6) + 1;
    state.diceVal = roll;
    state.phase = 'ROLLING';

    Storage.updateStats('ladder', { rolls: 1 });
    if (roll === 6) {
      Storage.updateStats('ladder', { sixes: 1 });
      Achievements.checkEvent('SIX_ROLLED');
    }

    const currentPos = state.positions[state.turnIdx];
    let targetPos = currentPos + roll;
    let stepPath = [];

    // Exact landing check at 100
    if (targetPos > 100) {
      // Overshoot: Cannot move
      targetPos = currentPos;
      return {
        roll,
        walkPath: [],
        finalPos: currentPos,
        effect: 'none',
        extraTurn: roll === 6,
        canMove: false
      };
    }

    // Build step-by-step forward walking path
    for (let p = currentPos + 1; p <= targetPos; p++) {
      stepPath.push(p);
    }

    let effect = 'none';
    let effectTarget = targetPos;

    if (LADDERS[targetPos]) {
      effect = 'ladder';
      effectTarget = LADDERS[targetPos];
      Storage.updateStats('ladder', { ladders: 1 });
      Achievements.checkEvent('LADDER_CLIMBED');
    } else if (SNAKES[targetPos]) {
      effect = 'snake';
      effectTarget = SNAKES[targetPos];
      Storage.updateStats('ladder', { snakes: 1 });
      Achievements.checkEvent('SNAKE_ENCOUNTERED');
    }

    return {
      roll,
      walkPath: stepPath,
      landPos: targetPos,
      effect,
      effectTarget,
      finalPos: effectTarget,
      extraTurn: roll === 6,
      canMove: true
    };
  }

  function applyMove(playerIdx, finalPos) {
    state.positions[playerIdx] = finalPos;

    if (finalPos === 100) {
      state.winner = playerIdx;
      state.phase = 'GAME_OVER';
      return { status: 'win', winner: playerIdx };
    }

    const extraTurn = (state.diceVal === 6);
    if (!extraTurn) {
      passTurn();
    } else {
      state.phase = 'WAITING_FOR_ROLL';
    }

    return { status: 'moved', extraTurn };
  }

  function passTurn() {
    state.phase = 'WAITING_FOR_ROLL';
    state.turnIdx = (state.turnIdx + 1) % state.players.length;
  }

  return {
    init,
    rollDice,
    applyMove,
    passTurn,
    getState: () => state,
    restoreState: (saved) => { state = saved; },
    SNAKES,
    LADDERS,
    PLAYER_COLORS
  };
})();
