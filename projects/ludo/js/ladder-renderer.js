/**
 * LadderRenderer - High-DPI Canvas Renderer for Snakes & Ladders.
 * Renders 10x10 serpentine grid, realistic 3D ladders, curved gradient snakes,
 * multi-token cluster offsets, and step-by-step walking/climbing animations.
 */
const LadderRenderer = (() => {
  let canvas = null;
  let ctx = null;

  let animState = {
    isMoving: false,
    playerIdx: null,
    walkPath: [],
    pathIndex: 0,
    walkProgress: 0,
    effect: 'none', // none, ladder, snake
    effectFrom: null,
    effectTo: null,
    effectProgress: 0,
    onComplete: null,
    lastTime: 0
  };

  function init(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
  }

  function resize() {
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const size = Math.min(parent.clientWidth, parent.clientHeight || parent.clientWidth);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function getLogicalSize() {
    if (!canvas || !canvas.parentElement) return 500;
    return canvas.parentElement.clientWidth || 500;
  }

  function getTileCoord(num, s) {
    if (num <= 0) return { x: s * 0.05, y: s * 0.95 };
    const zero = Math.min(Math.max(num - 1, 0), 99);
    const row = Math.floor(zero / 10);
    const col = (row % 2 === 0) ? (zero % 10) : (9 - (zero % 10));
    const cell = s / 10;

    return {
      x: col * cell + cell / 2,
      y: (9 - row) * cell + cell / 2,
      cellX: col * cell,
      cellY: (9 - row) * cell,
      cellSize: cell
    };
  }

  function render(timestamp = 0) {
    if (!ctx || !canvas) return;
    const size = getLogicalSize();
    if (size <= 0) return;

    ctx.clearRect(0, 0, size, size);

    renderBoardTiles(size);
    renderLadders(size);
    renderSnakes(size);
    renderPlayers(size, timestamp);

    if (animState.isMoving) {
      updateAnimation(timestamp);
    }
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function renderBoardTiles(s) {
    const cell = s / 10;
    const ladders = LadderEngine.LADDERS;
    const snakes = LadderEngine.SNAKES;

    ctx.save();
    // Rounded Board Outer Frame (exact match to Ludo)
    roundRect(ctx, 0, 0, s, s, s * 0.035);
    ctx.clip();

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const num = (9 - r) % 2 === 1 ? (9 - r) * 10 + (10 - c) : (9 - r) * 10 + (c + 1);
        const isEven = (r + c) % 2 === 0;

        // Rich modern tile colors
        if (num === 100) {
          const goldGrad = ctx.createLinearGradient(c * cell, r * cell, (c + 1) * cell, (r + 1) * cell);
          goldGrad.addColorStop(0, '#fef08a');
          goldGrad.addColorStop(1, '#fde047');
          ctx.fillStyle = goldGrad;
        } else if (num === 1) {
          const greenGrad = ctx.createLinearGradient(c * cell, r * cell, (c + 1) * cell, (r + 1) * cell);
          greenGrad.addColorStop(0, '#bbf7d0');
          greenGrad.addColorStop(1, '#86efac');
          ctx.fillStyle = greenGrad;
        } else if (ladders[num]) {
          ctx.fillStyle = isEven ? '#fef9c3' : '#fef08a';
        } else if (snakes[num]) {
          ctx.fillStyle = isEven ? '#fee2e2' : '#fecaca';
        } else {
          ctx.fillStyle = isEven ? '#ffffff' : '#f8fafc';
        }
        ctx.fillRect(c * cell, r * cell, cell, cell);

        // Subtle tile border
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.65)';
        ctx.lineWidth = 1;
        ctx.strokeRect(c * cell, r * cell, cell, cell);

        // Tile number
        ctx.fillStyle = num === 100 ? '#b45309' : (snakes[num] ? '#dc2626' : (ladders[num] ? '#15803d' : '#64748b'));
        ctx.font = `bold ${Math.max(Math.round(cell * 0.22), 10)}px system-ui, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(num.toString(), c * cell + 5, r * cell + 5);

        if (num === 100) {
          ctx.font = `${Math.round(cell * 0.38)}px system-ui`;
          ctx.textAlign = 'center';
          ctx.fillText('🏆', c * cell + cell / 2, r * cell + cell * 0.52);
        } else if (num === 1) {
          ctx.font = `bold ${Math.round(cell * 0.17)}px system-ui, sans-serif`;
          ctx.fillStyle = '#15803d';
          ctx.textAlign = 'center';
          ctx.fillText('START', c * cell + cell / 2, r * cell + cell * 0.65);
        }
      }
    }

    // Outer border frame
    ctx.strokeStyle = '#38436e';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, s, s);
    ctx.restore();
  }

  function renderLadders(s) {
    const ladders = LadderEngine.LADDERS;
    ctx.save();

    Object.keys(ladders).forEach((startStr) => {
      const startNum = parseInt(startStr, 10);
      const endNum = ladders[startNum];

      const p1 = getTileCoord(startNum, s);
      const p2 = getTileCoord(endNum, s);

      draw3DLadder(p1.x, p1.y, p2.x, p2.y, s);
    });

    ctx.restore();
  }

  function draw3DLadder(x1, y1, x2, y2, s) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const ladderWidth = (s / 10) * 0.28;

    const perpX = Math.cos(angle + Math.PI / 2) * (ladderWidth / 2);
    const perpY = Math.sin(angle + Math.PI / 2) * (ladderWidth / 2);

    // Drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;

    // Left Rail
    ctx.beginPath();
    ctx.moveTo(x1 - perpX, y1 - perpY);
    ctx.lineTo(x2 - perpX, y2 - perpY);
    ctx.strokeStyle = '#d97706'; // Golden wood
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Right Rail
    ctx.beginPath();
    ctx.moveTo(x1 + perpX, y1 + perpY);
    ctx.lineTo(x2 + perpX, y2 + perpY);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Rungs
    const numRungs = Math.max(Math.floor(dist / ((s / 10) * 0.35)), 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;

    for (let i = 1; i <= numRungs; i++) {
      const t = i / (numRungs + 1);
      const rx = x1 + dx * t;
      const ry = y1 + dy * t;
      ctx.beginPath();
      ctx.moveTo(rx - perpX, ry - perpY);
      ctx.lineTo(rx + perpX, ry + perpY);
      ctx.stroke();
    }

    ctx.restore();
  }

  function renderSnakes(s) {
    const snakes = LadderEngine.SNAKES;
    ctx.save();

    const snakeColors = [
      { head: '#dc2626', body: '#ef4444', alt: '#b91c1c' }, // Red viper
      { head: '#16a34a', body: '#22c55e', alt: '#15803d' }, // Green python
      { head: '#9333ea', body: '#a855f7', alt: '#7e22ce' }, // Purple cobra
      { head: '#ea580c', body: '#f97316', alt: '#c2410c' }  // Orange adder
    ];

    let colorIdx = 0;
    Object.keys(snakes).forEach((headStr) => {
      const headNum = parseInt(headStr, 10);
      const tailNum = snakes[headNum];

      const pHead = getTileCoord(headNum, s);
      const pTail = getTileCoord(tailNum, s);
      const colScheme = snakeColors[colorIdx % snakeColors.length];
      colorIdx++;

      drawCurvedSnake(pHead.x, pHead.y, pTail.x, pTail.y, s, colScheme);
    });

    ctx.restore();
  }

  function drawCurvedSnake(hx, hy, tx, ty, s, colors) {
    const dx = tx - hx;
    const dy = ty - hy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const curveAmount = (s / 10) * 0.45;

    // Control points for S-curve
    const cp1x = hx + dx * 0.35 + Math.cos(angle + Math.PI / 2) * curveAmount;
    const cp1y = hy + dy * 0.35 + Math.sin(angle + Math.PI / 2) * curveAmount;

    const cp2x = hx + dx * 0.70 + Math.cos(angle - Math.PI / 2) * curveAmount;
    const cp2y = hy + dy * 0.70 + Math.sin(angle - Math.PI / 2) * curveAmount;

    ctx.save();
    // Snake Shadow
    ctx.beginPath();
    ctx.moveTo(hx + 3, hy + 4);
    ctx.bezierCurveTo(cp1x + 3, cp1y + 4, cp2x + 3, cp2y + 4, tx + 3, ty + 4);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = (s / 10) * 0.16;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Snake Body Gradient
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tx, ty);
    ctx.strokeStyle = colors.body;
    ctx.lineWidth = (s / 10) * 0.16;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Snake Belly Pattern Stripe
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tx, ty);
    ctx.strokeStyle = colors.alt;
    ctx.lineWidth = (s / 10) * 0.06;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Snake Head
    const headRadius = (s / 10) * 0.18;
    ctx.beginPath();
    ctx.arc(hx, hy, headRadius, 0, Math.PI * 2);
    ctx.fillStyle = colors.head;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Eyes
    const eyeDist = headRadius * 0.45;
    const eyeR = headRadius * 0.28;
    [-eyeDist, eyeDist].forEach((ex) => {
      ctx.beginPath();
      ctx.arc(hx + ex, hy - headRadius * 0.2, eyeR, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx + ex, hy - headRadius * 0.2, eyeR * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#111827';
      ctx.fill();
    });

    // Forked Tongue
    ctx.beginPath();
    ctx.moveTo(hx, hy + headRadius * 0.6);
    ctx.lineTo(hx, hy + headRadius + 6);
    ctx.lineTo(hx - 3, hy + headRadius + 9);
    ctx.moveTo(hx, hy + headRadius + 6);
    ctx.lineTo(hx + 3, hy + headRadius + 9);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  function renderPlayers(s, timestamp) {
    const st = LadderEngine.getState();
    const cell = s / 10;
    const tokenRadius = cell * 0.24;

    // Group players by position
    const posGroups = new Map();
    st.players.forEach((p, idx) => {
      let currentVisualPos = st.positions[idx];

      // Interpolate if currently moving
      if (animState.isMoving && animState.playerIdx === idx) {
        if (animState.effect === 'none' && animState.walkPath.length > 0) {
          const curr = animState.pathIndex < animState.walkPath.length ? animState.walkPath[animState.pathIndex] : animState.walkPath[animState.walkPath.length - 1];
          currentVisualPos = curr;
        }
      }

      if (!posGroups.has(currentVisualPos)) posGroups.set(currentVisualPos, []);
      posGroups.get(currentVisualPos).push({ playerIdx: idx, player: p });
    });

    posGroups.forEach((playersAtTile, tileNum) => {
      const count = playersAtTile.length;
      const baseCoord = getTileCoord(tileNum, s);

      playersAtTile.forEach((item, idx) => {
        const { playerIdx, player } = item;
        let px = baseCoord.x;
        let py = baseCoord.y;

        // Check if currently interpolating transition (ladder or snake)
        if (animState.isMoving && animState.playerIdx === playerIdx) {
          if (animState.effect === 'ladder' || animState.effect === 'snake') {
            const p1 = getTileCoord(animState.effectFrom, s);
            const p2 = getTileCoord(animState.effectTo, s);
            const t = animState.effectProgress;
            px = p1.x + (p2.x - p1.x) * t;
            py = p1.y + (p2.y - p1.y) * t;
          } else if (animState.walkPath.length > 0) {
            // Walking hop
            const currTile = animState.walkPath[animState.pathIndex] || tileNum;
            const prevTile = animState.pathIndex > 0 ? animState.walkPath[animState.pathIndex - 1] : (st.positions[playerIdx] || 0);
            const c1 = getTileCoord(prevTile, s);
            const c2 = getTileCoord(currTile, s);
            const t = animState.walkProgress;
            const hop = Math.sin(t * Math.PI) * (cell * 0.3);
            px = c1.x + (c2.x - c1.x) * t;
            py = c1.y + (c2.y - c1.y) * t - hop;
          }
        } else if (count > 1 && tileNum > 0) {
          // Multi-token arrangement within tile
          const offset = tokenRadius * 0.7;
          if (count === 2) {
            px += idx === 0 ? -offset : offset;
          } else if (count === 3) {
            const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
            px += Math.cos(angles[idx]) * offset;
            py += Math.sin(angles[idx]) * offset;
          } else {
            px += (idx % 2 === 0 ? -1 : 1) * offset;
            py += (idx < 2 ? -1 : 1) * offset;
          }
        }

        const isTurn = st.turnIdx === playerIdx;

        // Draw Player Token Disc
        ctx.save();
        // Shadow
        ctx.beginPath();
        ctx.arc(px + 1.5, py + 2.5, tokenRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();

        // Turn halo
        if (isTurn) {
          const pulse = Math.sin(timestamp / 120) * 3 + 4;
          ctx.beginPath();
          ctx.arc(px, py, tokenRadius + pulse, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
          ctx.fill();
        }

        // Token gradient body
        const grad = ctx.createRadialGradient(
          px - tokenRadius * 0.3,
          py - tokenRadius * 0.3,
          tokenRadius * 0.1,
          px,
          py,
          tokenRadius
        );
        grad.addColorStop(0, player.color.light || '#ffffff');
        grad.addColorStop(0.5, player.color.hex);
        grad.addColorStop(1, player.color.dark || player.color.hex);

        ctx.beginPath();
        ctx.arc(px, py, tokenRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Center Player Number / Crown
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(tokenRadius * 0.85)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((playerIdx + 1).toString(), px, py + 0.5);

        // 3D Glass Specular Highlight (matching Ludo pawns)
        ctx.beginPath();
        ctx.arc(px - tokenRadius * 0.32, py - tokenRadius * 0.32, tokenRadius * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fill();

        ctx.restore();
      });
    });
  }

  function startMovementAnimation(playerIdx, walkPath, effect, effectTarget, onComplete) {
    const reducedMotion = Storage.get('settings').reducedMotion;

    if (reducedMotion || (!walkPath || walkPath.length === 0)) {
      if (onComplete) onComplete();
      return;
    }

    animState.isMoving = true;
    animState.playerIdx = playerIdx;
    animState.walkPath = walkPath;
    animState.pathIndex = 0;
    animState.walkProgress = 0;
    animState.effect = 'none'; // starts walking
    animState.pendingEffect = effect;
    animState.effectFrom = walkPath[walkPath.length - 1];
    animState.effectTo = effectTarget;
    animState.effectProgress = 0;
    animState.onComplete = onComplete;
    animState.lastTime = performance.now();

    SoundFX.move();
    requestNextFrame();
  }

  function updateAnimation(timestamp) {
    if (!animState.isMoving) return;

    const dt = timestamp - (animState.lastTime || timestamp);
    animState.lastTime = timestamp;

    if (animState.effect === 'none') {
      // Walking phase
      const stepDuration = 130; // ms per step
      animState.walkProgress += Math.min(dt / stepDuration, 0.5);

      if (animState.walkProgress >= 1) {
        animState.walkProgress = 0;
        animState.pathIndex++;

        if (animState.pathIndex < animState.walkPath.length) {
          SoundFX.move();
        } else {
          // Finished walking: check ladder or snake effect
          if (animState.pendingEffect && animState.pendingEffect !== 'none') {
            animState.effect = animState.pendingEffect;
            animState.effectProgress = 0;
            if (animState.effect === 'ladder') SoundFX.ladder();
            else if (animState.effect === 'snake') SoundFX.snake();
          } else {
            // Done completely
            animState.isMoving = false;
            const cb = animState.onComplete;
            animState.onComplete = null;
            if (cb) cb();
          }
        }
      }
    } else {
      // Transition phase (Climbing ladder or sliding snake)
      const transitionDuration = 550; // ms
      animState.effectProgress += Math.min(dt / transitionDuration, 0.3);

      if (animState.effectProgress >= 1) {
        animState.isMoving = false;
        const cb = animState.onComplete;
        animState.onComplete = null;
        if (cb) cb();
      }
    }

    requestNextFrame();
  }

  function requestNextFrame() {
    TimerManager.requestAnimationFrame((time) => {
      render(time);
    });
  }

  return {
    init,
    resize,
    render,
    startMovementAnimation,
    isAnimating: () => animState.isMoving
  };
})();
