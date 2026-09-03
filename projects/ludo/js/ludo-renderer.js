/**
 * LudoRenderer - Modern High-DPI Canvas Renderer for Ludo Boards.
 * Features 3D glossy tokens, pulsing movable affordances, golden safe stars,
 * directional track chevrons, particle celebration VFX, and touch-forgiving hit testing.
 */
const LudoRenderer = (() => {
  let canvas = null;
  let ctx = null;
  let animState = {
    isMoving: false,
    movingPlayerIdx: null,
    movingTokenId: null,
    path: [],
    pathIndex: 0,
    progress: 0, // 0 to 1 between steps
    onComplete: null,
    lastTime: 0
  };

  // VFX Particles for Captures and Wins
  const particles = [];

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
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function getLogicalSize() {
    if (!canvas || !canvas.parentElement) return 500;
    return canvas.parentElement.clientWidth || 500;
  }

  function render(timestamp = performance.now()) {
    if (!ctx || !canvas) return;
    const size = getLogicalSize();
    if (size <= 0) return;

    ctx.clearRect(0, 0, size, size);

    const st = LudoEngine.getState();
    renderStandard4PBoard(size);

    renderTokens(size, timestamp);
    renderParticles();

    if (animState.isMoving) {
      updateAnimation(timestamp);
    }

    // Keep animation loop active if tokens are pulsing/movable or particles/movement active
    const hasActiveMovable = st.phase === 'SELECTING_TOKEN' && st.validTokens && st.validTokens.length > 0;
    if (hasActiveMovable || particles.length > 0 || animState.isMoving) {
      requestNextFrame();
    }
  }

  // --- 4-PLAYER STANDARD BOARD RENDERING ---
  function renderStandard4PBoard(s) {
    const cell = s / 15;
    const colors = LudoEngine.PLAYER_COLORS_4;

    ctx.save();

    // Rounded Board Outer Frame
    roundRect(ctx, 0, 0, s, s, s * 0.035);
    ctx.clip();

    // Board Surface Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, s, s);

    // 4 Corner Home Bases (6x6 cells each)
    // Red: Top-Left (0, 0)
    drawBaseBox(0, 0, cell * 6, colors[0]);
    // Green: Top-Right (cell * 9, 0)
    drawBaseBox(cell * 9, 0, cell * 6, colors[1]);
    // Yellow: Bottom-Right (cell * 9, cell * 9)
    drawBaseBox(cell * 9, cell * 9, cell * 6, colors[2]);
    // Blue: Bottom-Left (0, cell * 9)
    drawBaseBox(0, cell * 9, cell * 6, colors[3]);

    // Center Home Box (3x3 cells) with 4 colored triangles & central gold medallion
    drawCenterTriangles(cell * 6, cell * 6, cell * 3, colors);

    // Draw all 52 perimeter track cells
    LudoEngine.TRACK_COORDS_4P.forEach(([col, row], idx) => {
      let fillColor = '#ffffff';
      let isStart = false;

      // Start positions: vibrant solid player colors with white star
      if (idx === 0) {
        fillColor = colors[0].hex;
        isStart = true;
      } else if (idx === 13) {
        fillColor = colors[1].hex;
        isStart = true;
      } else if (idx === 26) {
        fillColor = colors[2].hex;
        isStart = true;
      } else if (idx === 39) {
        fillColor = colors[3].hex;
        isStart = true;
      }

      const isSafe = LudoEngine.SAFE_CELLS_4P.includes(idx);
      drawTrackCell(col * cell, row * cell, cell, fillColor, false, isSafe && !isStart);

      if (isStart) {
        // Crisp White Star on colored start square (Exact match to screenshot)
        drawStarShape(col * cell + cell / 2, row * cell + cell / 2, cell * 0.32, cell * 0.14, '#ffffff');
      } else if (isSafe) {
        // Golden Star badge on safe cell
        drawSafeStarBadge(col * cell + cell / 2, row * cell + cell / 2, cell * 0.34);
      }
    });

    // Home run columns (5 cells each with chevrons toward center)
    // Red: left arm, row 7 (cols 1 to 5), pointing Right
    for (let c = 1; c <= 5; c++) {
      drawTrackCell(c * cell, 7 * cell, cell, colors[0].hex, true);
      drawChevron(c * cell + cell / 2, 7 * cell + cell / 2, cell * 0.22, 'R', 'rgba(255, 255, 255, 0.75)');
    }
    // Green: top arm, col 7 (rows 1 to 5), pointing Down
    for (let r = 1; r <= 5; r++) {
      drawTrackCell(7 * cell, r * cell, cell, colors[1].hex, true);
      drawChevron(7 * cell + cell / 2, r * cell + cell / 2, cell * 0.22, 'D', 'rgba(255, 255, 255, 0.75)');
    }
    // Yellow: right arm, row 7 (cols 9 to 13), pointing Left
    for (let c = 9; c <= 13; c++) {
      drawTrackCell(c * cell, 7 * cell, cell, colors[2].hex, true);
      drawChevron(c * cell + cell / 2, 7 * cell + cell / 2, cell * 0.22, 'L', 'rgba(255, 255, 255, 0.75)');
    }
    // Blue: bottom arm, col 7 (rows 9 to 13), pointing Up
    for (let r = 9; r <= 13; r++) {
      drawTrackCell(7 * cell, r * cell, cell, colors[3].hex, true);
      drawChevron(7 * cell + cell / 2, r * cell + cell / 2, cell * 0.22, 'U', 'rgba(255, 255, 255, 0.75)');
    }

    // Outer Board Bevel Stroke
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    roundRect(ctx, 1, 1, s - 2, s - 2, s * 0.035);
    ctx.stroke();

    ctx.restore();
  }

  function drawBaseBox(x, y, sz, colorObj) {
    ctx.save();

    // Base background gradient
    const bgGrad = ctx.createLinearGradient(x, y, x + sz, y + sz);
    bgGrad.addColorStop(0, colorObj.hex);
    bgGrad.addColorStop(1, colorObj.dark || colorObj.hex);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(x, y, sz, sz);

    // Inner rounded white card
    const margin = sz * 0.13;
    const innerSz = sz - margin * 2;
    const innerX = x + margin;
    const innerY = y + margin;
    const innerRadius = sz * 0.09;

    // Card shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
    ctx.shadowBlur = sz * 0.04;
    ctx.shadowOffsetY = sz * 0.015;

    ctx.fillStyle = '#ffffff';
    roundRect(ctx, innerX, innerY, innerSz, innerSz, innerRadius);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Inner card border
    ctx.strokeStyle = colorObj.light || '#e2e8f0';
    ctx.lineWidth = 1.5;
    roundRect(ctx, innerX, innerY, innerSz, innerSz, innerRadius);
    ctx.stroke();

    // Decorative watermark circle in center of inner card
    const cx = innerX + innerSz / 2;
    const cy = innerY + innerSz / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, innerSz * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = colorObj.light;
    ctx.globalAlpha = 0.35;
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 4 Token circles inside
    const radius = sz * 0.095;
    const offset1 = sz * 0.28;
    const offset2 = sz * 0.72;

    const slots = [
      [x + offset1, y + offset1],
      [x + offset2, y + offset1],
      [x + offset1, y + offset2],
      [x + offset2, y + offset2]
    ];

    slots.forEach(([px, py]) => {
      // Soft radial gradient for token nest
      const nestGrad = ctx.createRadialGradient(px, py, radius * 0.2, px, py, radius);
      nestGrad.addColorStop(0, '#ffffff');
      nestGrad.addColorStop(0.7, colorObj.light);
      nestGrad.addColorStop(1, '#ffffff');

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = nestGrad;
      ctx.fill();

      ctx.strokeStyle = colorObj.hex;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner ring
      ctx.beginPath();
      ctx.arc(px, py, radius * 0.45, 0, Math.PI * 2);
      ctx.strokeStyle = colorObj.light;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    ctx.restore();
  }

  function drawCenterTriangles(x, y, sz, colors) {
    const cx = x + sz / 2;
    const cy = y + sz / 2;

    // Left Triangle (Red)
    const redGrad = ctx.createLinearGradient(x, cy, cx, cy);
    redGrad.addColorStop(0, colors[0].dark || colors[0].hex);
    redGrad.addColorStop(1, colors[0].hex);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + sz);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = redGrad;
    ctx.fill();

    // Top Triangle (Green)
    const greenGrad = ctx.createLinearGradient(cx, y, cx, cy);
    greenGrad.addColorStop(0, colors[1].dark || colors[1].hex);
    greenGrad.addColorStop(1, colors[1].hex);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + sz, y);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = greenGrad;
    ctx.fill();

    // Right Triangle (Yellow)
    const yellowGrad = ctx.createLinearGradient(x + sz, cy, cx, cy);
    yellowGrad.addColorStop(0, colors[2].dark || colors[2].hex);
    yellowGrad.addColorStop(1, colors[2].hex);
    ctx.beginPath();
    ctx.moveTo(x + sz, y);
    ctx.lineTo(x + sz, y + sz);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = yellowGrad;
    ctx.fill();

    // Bottom Triangle (Blue)
    const blueGrad = ctx.createLinearGradient(cx, y + sz, cx, cy);
    blueGrad.addColorStop(0, colors[3].dark || colors[3].hex);
    blueGrad.addColorStop(1, colors[3].hex);
    ctx.beginPath();
    ctx.moveTo(x, y + sz);
    ctx.lineTo(x + sz, y + sz);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = blueGrad;
    ctx.fill();

    // Divider diagonal lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + sz, y + sz);
    ctx.moveTo(x + sz, y);
    ctx.lineTo(x, y + sz);
    ctx.stroke();

    // Central Victory Medallion
    const medRadius = sz * 0.22;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 6;

    // Outer gold ring
    const goldGrad = ctx.createRadialGradient(cx - medRadius * 0.3, cy - medRadius * 0.3, medRadius * 0.1, cx, cy, medRadius);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.5, '#f59e0b');
    goldGrad.addColorStop(1, '#b45309');

    ctx.beginPath();
    ctx.arc(cx, cy, medRadius, 0, Math.PI * 2);
    ctx.fillStyle = goldGrad;
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Center victory 3D Golden Crown inside medallion (Exact match to screenshot)
    drawGoldenCrown(cx, cy, medRadius * 0.72);

    ctx.restore();
  }

  function drawGoldenCrown(cx, cy, r) {
    ctx.save();
    ctx.translate(cx, cy);
    const s = r;

    // 5-point Crown with royal gold gradient
    const cGrad = ctx.createLinearGradient(-s * 0.5, -s * 0.4, s * 0.5, s * 0.4);
    cGrad.addColorStop(0, '#fef08a');
    cGrad.addColorStop(0.5, '#f59e0b');
    cGrad.addColorStop(1, '#b45309');

    ctx.beginPath();
    ctx.moveTo(-s * 0.52, s * 0.3);
    ctx.lineTo(-s * 0.62, -s * 0.12); // Left spike
    ctx.lineTo(-s * 0.28, s * 0.08);
    ctx.lineTo(0, -s * 0.46);          // Center peak
    ctx.lineTo(s * 0.28, s * 0.08);
    ctx.lineTo(s * 0.62, -s * 0.12);  // Right spike
    ctx.lineTo(s * 0.52, s * 0.3);
    ctx.closePath();
    ctx.fillStyle = cGrad;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // Crown base rim band
    ctx.beginPath();
    ctx.ellipse(0, s * 0.3, s * 0.54, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#92400e';
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Jewels on 3 main tips
    [[-s * 0.62, -s * 0.12], [0, -s * 0.46], [s * 0.62, -s * 0.12]].forEach(([jx, jy]) => {
      ctx.beginPath();
      ctx.arc(jx, jy, s * 0.085, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.9;
      ctx.stroke();
    });

    // Central blue jewel on band
    ctx.beginPath();
    ctx.arc(0, s * 0.3, s * 0.065, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  function drawTrackCell(x, y, sz, fillColor, isHomeCol = false, isSafe = false) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, sz, sz);

    ctx.strokeStyle = isHomeCol ? 'rgba(255, 255, 255, 0.55)' : (isSafe ? '#f59e0b' : '#cbd5e1');
    ctx.lineWidth = isSafe ? 1.5 : 1;
    ctx.strokeRect(x, y, sz, sz);
  }

  function drawSafeStarBadge(cx, cy, radius) {
    ctx.save();
    // Shield / ring outline
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.05, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Embossed golden star
    drawStarShape(cx, cy, radius * 0.82, radius * 0.38, '#d97706');
    ctx.restore();
  }

  function drawStarShape(cx, cy, outerR, innerR, color) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(cx, cy);
    ctx.fillStyle = color;
    const spikes = 5;
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.moveTo(0, -outerR);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
      rot += step;
      ctx.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR);
      rot += step;
    }
    ctx.lineTo(0, -outerR);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawStarIcon(cx, cy, radius, color = '#d97706') {
    drawStarShape(cx, cy, radius, radius * 0.45, color);
  }

  function drawDirectionArrow(cx, cy, size, dir, color) {
    ctx.save();
    ctx.translate(cx, cy);
    let rot = 0;
    if (dir === 'D') rot = Math.PI / 2;
    else if (dir === 'L') rot = Math.PI;
    else if (dir === 'U') rot = (Math.PI * 3) / 2;
    ctx.rotate(rot);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(size * 0.6, 0);
    ctx.lineTo(-size * 0.4, -size * 0.45);
    ctx.lineTo(-size * 0.15, 0);
    ctx.lineTo(-size * 0.4, size * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawChevron(cx, cy, size, dir, color) {
    ctx.save();
    ctx.translate(cx, cy);
    let rot = 0;
    if (dir === 'D') rot = Math.PI / 2;
    else if (dir === 'L') rot = Math.PI;
    else if (dir === 'U') rot = (Math.PI * 3) / 2;
    ctx.rotate(rot);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-size * 0.4, -size * 0.4);
    ctx.lineTo(size * 0.3, 0);
    ctx.lineTo(-size * 0.4, size * 0.4);
    ctx.stroke();
    ctx.restore();
  }

  // --- TOKEN RENDERING & MULTI-TOKEN CLUSTER OFFSETS ---
  function getTokenCoord(playerIdx, token, s) {
    const cell = s / 15;

    // Moving token with active parabolic hop interpolation
    if (animState.isMoving && animState.movingPlayerIdx === playerIdx && animState.movingTokenId === token.id) {
      const path = animState.path;
      if (path && path.length > 0) {
        const curr = animState.pathIndex < path.length ? path[animState.pathIndex] : path[path.length - 1];
        const prev = animState.pathIndex > 0 ? path[animState.pathIndex - 1] : { pos: token.pos, step: token.step, state: token.state };

        const c1 = resolveStaticCoord(playerIdx, prev.pos, prev.step, prev.state, s, token.id);
        const c2 = resolveStaticCoord(playerIdx, curr.pos, curr.step, curr.state, s, token.id);

        const t = animState.progress;
        // Parabolic hop
        const hop = Math.sin(t * Math.PI) * (cell * 0.42);

        return {
          x: c1.x + (c2.x - c1.x) * t,
          y: c1.y + (c2.y - c1.y) * t - hop,
          isAirborne: true,
          hopScale: 1 + Math.sin(t * Math.PI) * 0.15
        };
      }
    }

    return resolveStaticCoord(playerIdx, token.pos, token.step, token.state, s, token.id);
  }

  function resolveStaticCoord(playerIdx, pos, step, state, s, tokenId = 0) {
    const cell = s / 15;
    const colorIdx = LudoEngine.getPlayerColorIdx ? LudoEngine.getPlayerColorIdx(playerIdx) : playerIdx;

    // 4-Player coordinate mapping
    if (state === 'HOME' || pos === -1) {
      const baseCoord = LudoEngine.BASE_SLOTS_4P[colorIdx] || LudoEngine.BASE_SLOTS_4P[0];
      const slot = baseCoord[tokenId] || baseCoord[0];
      return {
        x: (slot[0] + 0.5) * cell,
        y: (slot[1] + 0.5) * cell
      };
    }

    if (state === 'FINISHED' || pos === 999) {
      // Center triangle finish offsets
      const centerOffsets = [
        [6.8, 7.5], // Red Left
        [7.5, 6.8], // Green Top
        [8.2, 7.5], // Yellow Right
        [7.5, 8.2]  // Blue Bottom
      ];
      const co = centerOffsets[colorIdx] || [7.5, 7.5];
      return { x: co[0] * cell, y: co[1] * cell };
    }

    if (state === 'HOME_COLUMN' || pos >= 100) {
      const colIdx = Math.min(pos - 100, 4);
      const homeCol = LudoEngine.HOME_COLUMNS_4P[colorIdx] || LudoEngine.HOME_COLUMNS_4P[0];
      const grid = homeCol[colIdx];
      return {
        x: (grid[0] + 0.5) * cell,
        y: (grid[1] + 0.5) * cell
      };
    }

    // Common track
    if (pos >= 0 && pos < LudoEngine.TRACK_COORDS_4P.length) {
      const grid = LudoEngine.TRACK_COORDS_4P[pos];
      return {
        x: (grid[0] + 0.5) * cell,
        y: (grid[1] + 0.5) * cell
      };
    }

    return { x: s * 0.5, y: s * 0.5 };
  }

  function renderTokens(s, timestamp) {
    const st = LudoEngine.getState();
    const cell = s / 15;
    const tokenRadius = st.is6Player ? s * 0.024 : cell * 0.38;

    const occupancyMap = new Map();

    Object.keys(st.tokens).forEach((pStr) => {
      const pIdx = parseInt(pStr, 10);
      st.tokens[pIdx].forEach((t) => {
        const locKey = t.state === 'HOME' ? `home_${pIdx}_${t.id}` : `${t.state}_${t.pos}`;
        if (!occupancyMap.has(locKey)) occupancyMap.set(locKey, []);
        occupancyMap.get(locKey).push({ playerIdx: pIdx, token: t });
      });
    });

    occupancyMap.forEach((tokensAtCell) => {
      const count = tokensAtCell.length;
      tokensAtCell.forEach((item, idx) => {
        const { playerIdx, token } = item;
        const colorIdx = LudoEngine.getPlayerColorIdx ? LudoEngine.getPlayerColorIdx(playerIdx) : playerIdx;
        const baseCoord = getTokenCoord(playerIdx, token, s);
        let offsetX = 0, offsetY = 0;

        if (token.state === 'HOME') {
          if (!st.is6Player) {
            const slots = LudoEngine.BASE_SLOTS_4P[colorIdx];
            if (slots && slots[token.id]) {
              baseCoord.x = (slots[token.id][0] + 0.5) * cell;
              baseCoord.y = (slots[token.id][1] + 0.5) * cell;
            }
          } else {
            const slots = hexTrackCache.bases[playerIdx];
            if (slots && slots[token.id]) {
              baseCoord.x = slots[token.id].x * s;
              baseCoord.y = slots[token.id].y * s;
            }
          }
        } else if (count > 1 && !animState.isMoving) {
          const spread = tokenRadius * 0.55;
          if (count === 2) {
            offsetX = idx === 0 ? -spread : spread;
          } else if (count === 3) {
            const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
            offsetX = Math.cos(angles[idx]) * spread;
            offsetY = Math.sin(angles[idx]) * spread;
          } else {
            offsetX = (idx % 2 === 0 ? -1 : 1) * spread;
            offsetY = (idx < 2 ? -1 : 1) * spread;
          }
        }

        const finalX = baseCoord.x + offsetX;
        let finalY = baseCoord.y + offsetY;

        const isPlayerTurn = st.turnIdx === playerIdx;
        const isValid = isPlayerTurn && st.validTokens.includes(token.id);
        const isSelected = isPlayerTurn && st.selectedTokenId === token.id;

        // Idle bounce for selectable valid token
        if (isValid && !animState.isMoving) {
          const hopBounce = Math.sin(timestamp / 90) * 3.5;
          finalY -= Math.max(0, hopBounce);
        }

        // Store visual coordinates for touch hit testing
        token._vx = finalX;
        token._vy = finalY;
        token._vr = tokenRadius;

        drawTokenDisc(
          finalX,
          finalY,
          tokenRadius,
          st.players[playerIdx].color,
          token.id,
          isValid,
          isSelected,
          timestamp,
          baseCoord.hopScale || 1.0
        );
      });
    });
  }

  function drawTokenDisc(x, y, radius, colorObj, tokenId, isValid, isSelected, timestamp, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    if (scale !== 1.0) ctx.scale(scale, scale);

    const r = radius;

    // --- Movable Token Pulsing Aura Ring ---
    if (isValid) {
      const pulsePeriod = (timestamp % 1000) / 1000;
      const rippleRadius = r + 4 + pulsePeriod * 9;
      const rippleAlpha = Math.max(0, 0.7 - pulsePeriod * 0.7);

      ctx.beginPath();
      ctx.arc(0, 0, rippleRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(234, 179, 8, ${rippleAlpha})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Soft glow backing
      ctx.beginPath();
      ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? 'rgba(234, 179, 8, 0.45)' : 'rgba(99, 102, 241, 0.35)';
      ctx.fill();
    }

    // --- Realistic Drop Shadow ---
    ctx.beginPath();
    ctx.ellipse(1, r * 0.55, r * 0.95, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.42)';
    ctx.fill();

    // --- Flanged Base Ring (3D Pawn Skirt) ---
    const baseGrad = ctx.createLinearGradient(0, r * 0.2, 0, r * 0.95);
    baseGrad.addColorStop(0, colorObj.light || '#ffffff');
    baseGrad.addColorStop(0.35, colorObj.hex);
    baseGrad.addColorStop(1, colorObj.dark || colorObj.hex);

    ctx.beginPath();
    ctx.ellipse(0, r * 0.48, r * 0.90, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = baseGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // --- Pawn Neck / Body ---
    const bodyGrad = ctx.createLinearGradient(0, -r * 0.5, 0, r * 0.4);
    bodyGrad.addColorStop(0, colorObj.light || '#ffffff');
    bodyGrad.addColorStop(0.5, colorObj.hex);
    bodyGrad.addColorStop(1, colorObj.dark || colorObj.hex);

    ctx.beginPath();
    ctx.moveTo(-r * 0.42, r * 0.35);
    ctx.quadraticCurveTo(-r * 0.24, -r * 0.1, -r * 0.44, -r * 0.42);
    ctx.lineTo(r * 0.44, -r * 0.42);
    ctx.quadraticCurveTo(r * 0.24, -r * 0.1, r * 0.42, r * 0.35);
    ctx.closePath();
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // --- Spherical Head with 3D Specular Shine ---
    const headRadius = r * 0.62;
    const headGrad = ctx.createRadialGradient(
      -headRadius * 0.35,
      -r * 0.45 - headRadius * 0.35,
      headRadius * 0.08,
      0,
      -r * 0.45,
      headRadius
    );
    headGrad.addColorStop(0, '#ffffff'); // bright highlight
    headGrad.addColorStop(0.25, colorObj.light || '#ffffff');
    headGrad.addColorStop(0.7, colorObj.hex);
    headGrad.addColorStop(1, colorObj.dark || colorObj.hex);

    ctx.beginPath();
    ctx.arc(0, -r * 0.45, headRadius, 0, Math.PI * 2);
    ctx.fillStyle = headGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // --- White Circular Numeral Badge inside the flanged base ---
    const badgeR = r * 0.44;
    ctx.beginPath();
    ctx.arc(0, r * 0.48, badgeR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = colorObj.hex;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Bold Black Numeral (1, 2, 3, 4)
    ctx.fillStyle = '#0f172a';
    ctx.font = `900 ${Math.round(badgeR * 1.35)}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((tokenId + 1).toString(), 0, r * 0.49);

    // Movable / Selected Crown Indicator on top of head
    if (isSelected) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.3);
      ctx.lineTo(-r * 0.35, -r * 1.6);
      ctx.lineTo(r * 0.35, -r * 1.6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (isValid) {
      const bounce = Math.sin(timestamp / 100) * 2;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.25 + bounce);
      ctx.lineTo(-r * 0.28, -r * 1.55 + bounce);
      ctx.lineTo(r * 0.28, -r * 1.55 + bounce);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // --- STEP-BY-STEP ANIMATION LOOP ---
  function startTokenAnimation(playerIdx, tokenId, path, onComplete) {
    const reducedMotion = Storage.get('settings').reducedMotion;

    if (reducedMotion || !path || path.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    animState.isMoving = true;
    animState.movingPlayerIdx = playerIdx;
    animState.movingTokenId = tokenId;
    animState.path = path;
    animState.pathIndex = 0;
    animState.progress = 0;
    animState.onComplete = onComplete;
    animState.lastTime = performance.now();

    SoundFX.move();
    requestNextFrame();
  }

  function updateAnimation(timestamp) {
    if (!animState.isMoving) return;

    const dt = timestamp - (animState.lastTime || timestamp);
    animState.lastTime = timestamp;

    const stepDuration = 135; // ms per cell hop
    animState.progress += Math.min(dt / stepDuration, 0.4);

    if (animState.progress >= 1) {
      animState.progress = 0;
      animState.pathIndex++;

      if (animState.pathIndex < animState.path.length) {
        SoundFX.move();
      } else {
        animState.isMoving = false;
        const cb = animState.onComplete;
        animState.onComplete = null;
        if (cb) cb();
      }
    }
  }

  function requestNextFrame() {
    TimerManager.requestAnimationFrame((time) => {
      render(time);
    });
  }

  // --- PARTICLE SYSTEM (Captures & Wins) ---
  function spawnCaptureEffect(x, y, color = '#ef4444') {
    const count = 22;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 4.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 3,
        color: i % 2 === 0 ? color : '#ffffff',
        alpha: 1.0,
        decay: 0.028 + Math.random() * 0.02
      });
    }
    requestNextFrame();
  }

  function spawnFinishEffect(x, y, color = '#f59e0b') {
    const count = 28;
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
      const speed = 3 + Math.random() * 6;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.5 + Math.random() * 3.5,
        color: ['#f59e0b', '#fef08a', '#ffffff', color][i % 4],
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.018
      });
    }
    requestNextFrame();
  }

  function renderParticles() {
    if (particles.length === 0) return;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // gravity
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- HIT TESTING FOR TOUCH & MOUSE ---
  function hitTestToken(clientX, clientY) {
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const logicalSize = getLogicalSize();
    const scale = logicalSize / rect.width;

    const touchX = (clientX - rect.left) * scale;
    const touchY = (clientY - rect.top) * scale;

    const st = LudoEngine.getState();
    const validIds = st.validTokens || [];
    const currentPIdx = st.turnIdx;

    if (!st.tokens[currentPIdx]) return null;

    // Prioritize active valid selectable tokens with generous margin
    let hitToken = null;
    let minDistance = Infinity;

    st.tokens[currentPIdx].forEach((t) => {
      if (t._vx !== undefined && t._vy !== undefined) {
        const dx = touchX - t._vx;
        const dy = touchY - t._vy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const hitRadius = (t._vr || 20) * 1.6; // Forgiving touch margin

        if (dist <= hitRadius && dist < minDistance) {
          minDistance = dist;
          hitToken = t;
        }
      }
    });

    return hitToken;
  }

  return {
    init,
    resize,
    render,
    startTokenAnimation,
    hitTestToken,
    spawnCaptureEffect,
    spawnFinishEffect,
    isAnimating: () => animState.isMoving
  };
})();
