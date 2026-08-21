/* =====================================================================
   PART 4: Visualizer Registry & All Visualizers (Modern, Unique & Retro)
   File Name Suggestion: 04-visualizers.js (ya visualizerEngine.js)
   ===================================================================== */

/* ---------------------------------------------------------------
   13. Visualizer Engine — Scalable Registry
   --------------------------------------------------------------- */
const VisualizerEngine = {
  registry: Object.create(null),
  order: [],
  register(def) {
    this.registry[def.id] = def;
    this.order.push(def.id);
  },
  get(id) { return this.registry[id] || this.registry.bars; },
  list() { return this.order.map(id => this.registry[id]); },
  categories() {
    const seen = [];
    this.order.forEach(id => { const c = this.registry[id].category; if (!seen.includes(c)) seen.push(c); });
    return seen;
  },
};

// ---- Shared Render Helpers -------------------------------------------------
let motionT = 0;   // continuous accumulator
let rotation = 0;  // continuous accumulator

function sampleBars(freq, len, count, power) {
  power = power || 1.6;
  const out = new Array(count);
  for (let i = 0; i < count; i++) {
    const t0 = i / count, t1 = (i + 1) / count;
    const i0 = Math.floor(Math.pow(t0, power) * len);
    const i1 = Math.max(i0 + 1, Math.floor(Math.pow(t1, power) * len));
    let sum = 0, n = 0;
    for (let k = i0; k < i1 && k < len; k++) { sum += freq[k]; n++; }
    out[i] = n ? (sum / n / 255) : 0;
  }
  return out;
}

function glowStroke(ctx, color, blur) { ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = blur; }
function glowFill(ctx, color, blur) { ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = blur; }

function emitBeatBurst(pool, cx, cy, spread, count) {
  if (bands.beat > 0.5 && Math.random() < 0.9) {
    for (let i = 0; i < count; i++) {
      const p = makeFxParticle(cx, cy, spread);
      p.speed = 1.2 + Math.random() * 1.4;
      p.life = 1;
      pool[Math.floor(Math.random() * pool.length)] = p;
    }
  }
}

function drawWaveformLine(api, opts) {
  const { ctx, region, art, pal, sens, glow } = api;
  const data = api.timeData;
  const len = data ? data.length : 0;
  const y = opts.aroundArt ? art.cy + art.h / 2 + region.h * opts.yOffset : region.y + region.h * opts.yOffset;
  const width = region.w * opts.widthRatio;
  const x0 = region.x + (region.w - width) / 2;
  const amp = region.h * opts.ampRatio * (0.4 + bands.volumeS * 1.4) * sens;
  ctx.save();
  if (opts.filled) {
    ctx.beginPath();
    ctx.moveTo(x0, y);
    for (let i = 0; i < len; i++) {
      const px = x0 + (i / (len - 1)) * width;
      const v = (data[i] - 128) / 128;
      ctx.lineTo(px, y + v * amp);
    }
    ctx.lineTo(x0 + width, y);
    ctx.closePath();
    const fillG = ctx.createLinearGradient(0, y - amp, 0, y + amp);
    fillG.addColorStop(0, rgba(pal.a, 0.28));
    fillG.addColorStop(1, rgba(pal.b, 0.02));
    ctx.fillStyle = fillG;
    ctx.fill();
  }
  if (opts.dotted) {
    const step = Math.max(1, Math.floor(len / 90));
    for (let i = 0; i < len; i += step) {
      const px = x0 + (i / (len - 1)) * width;
      const v = (data[i] - 128) / 128;
      const py = y + v * amp;
      glowFill(ctx, toneColor(pal, i / len), 8 * glow);
      ctx.beginPath(); ctx.arc(px, py, opts.dotSize || 2.2, 0, TAU); ctx.fill();
    }
    ctx.restore();
    return;
  }
  ctx.beginPath();
  for (let i = 0; i < len; i++) {
    const px = x0 + (i / (len - 1)) * width;
    const v = (data[i] - 128) / 128;
    const py = y + v * amp;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  const grad = ctx.createLinearGradient(x0, 0, x0 + width, 0);
  grad.addColorStop(0, pal.b);
  grad.addColorStop(1, pal.a);
  ctx.strokeStyle = grad;
  ctx.lineWidth = opts.lineWidth || 2.4;
  ctx.shadowColor = pal.a;
  ctx.shadowBlur = (opts.blur || 16) * glow;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  if (opts.doubleStroke) {
    ctx.globalAlpha = 0.25; ctx.lineWidth = (opts.lineWidth || 2.4) * 2.5; ctx.shadowBlur = 0; ctx.stroke();
  }
  ctx.restore();
}

/* =====================================================================
   Vinyl & ToneArm Helpers (Retro & Turntable Engines)
   ===================================================================== */
function drawVinylDisc(ctx, cx, cy, radius, rot, pal, artImage, glow) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);

  // Outer Vinyl Shadow & Disc Body
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, TAU);
  ctx.fillStyle = '#0f0f14';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Vinyl Grooves (Micro rings)
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let r = radius * 0.45; r < radius * 0.95; r += 4) {
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
  }

  // Light reflection on Vinyl
  const g = ctx.createLinearGradient(-radius, -radius, radius, radius);
  g.addColorStop(0, 'rgba(255,255,255,0.08)');
  g.addColorStop(0.5, 'rgba(0,0,0,0.4)');
  g.addColorStop(1, 'rgba(255,255,255,0.08)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, radius * 0.96, 0, TAU); ctx.fill();

  // Center Album Label / User Image
  const labelR = radius * 0.38;
  ctx.beginPath(); ctx.arc(0, 0, labelR, 0, TAU);
  ctx.fillStyle = pal.a; ctx.fill();

  if (artImage) {
    ctx.save();
    ctx.beginPath(); ctx.arc(0, 0, labelR, 0, TAU); ctx.clip();
    ctx.drawImage(artImage, -labelR, -labelR, labelR * 2, labelR * 2);
    ctx.restore();
  }

  // Center Spindle Hole
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fillStyle = '#050508'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
}

function drawToneArm(ctx, cx, cy, radius, isPlaying) {
  const armX = cx + radius * 0.78, armY = cy - radius * 0.85;
  const targetAngle = isPlaying ? 0.35 + (bands.bassS * 0.04) : -0.15;
  ctx.save();
  ctx.translate(armX, armY);
  ctx.rotate(targetAngle);

  // Pivot Base
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU);
  ctx.fillStyle = '#2a2836'; ctx.fill();
  ctx.strokeStyle = '#524f69'; ctx.lineWidth = 2; ctx.stroke();

  // Arm Stem
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-18, radius * 0.95);
  ctx.strokeStyle = '#e2e0ed'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.stroke();

  // Needle Head Cartridge
  ctx.save();
  ctx.translate(-18, radius * 0.95);
  ctx.rotate(0.2);
  ctx.fillStyle = '#ff4757';
  roundRect(ctx, -5, -4, 10, 18, 2); ctx.fill();
  ctx.restore();

  ctx.restore();
}

/* =====================================================================
   Ab yahan se aage saare VisualizerEngine.register shuru honge
   ===================================================================== */

/* =====================================================================
   1. BASIC FAMILY (1-10)
   ===================================================================== */

VisualizerEngine.register({
  id: 'bars', name: 'Bars', category: 'Basic',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.42, availH: 0.5, centerYRatio: 0.4, glowMul: 1 },
  layer: 'front',
  renderFront(api) {
    const { ctx, region, pal, sens, glow } = api;
    const bandCount = 56;
    const bottom = region.y + region.h * 0.94;
    const bandW = region.w * 0.82;
    const startX = region.x + (region.w - bandW) / 2;
    const maxH = region.h * 0.24;
    const gap = bandW / bandCount * 0.28;
    const barW = bandW / bandCount - gap;
    const vals = sampleBars(api.freq, api.len, bandCount);
    ctx.save();
    for (let i = 0; i < bandCount; i++) {
      const h = clamp(vals[i] * maxH * sens, 2, maxH);
      const xPos = startX + i * (barW + gap);
      const col = toneColor(pal, i / bandCount);
      glowFill(ctx, col, 14 * glow);
      roundRect(ctx, xPos, bottom - h, barW, h, Math.min(barW / 2, 4));
      ctx.fill();
      ctx.globalAlpha = 0.18;
      roundRect(ctx, xPos, bottom + 3, barW, h * 0.4, Math.min(barW / 2, 4));
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'spectrumBars', name: 'Spectrum Bars', category: 'Basic',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.36, availH: 0.42, centerYRatio: 0.34, glowMul: 0.9 },
  layer: 'front',
  renderFront(api) {
    const { ctx, region, pal, sens, glow } = api;
    const count = 80;
    const bottom = region.y + region.h * 0.95;
    const width = region.w * 0.94;
    const startX = region.x + (region.w - width) / 2;
    const maxH = region.h * 0.42;
    const gap = width / count * 0.18;
    const barW = width / count - gap;
    const vals = sampleBars(api.freq, api.len, count, 1.5);
    ctx.save();
    for (let i = 0; i < count; i++) {
      const idx = state.mirror ? Math.abs(i - count / 2) / (count / 2) * count | 0 : i;
      const v = vals[Math.min(count - 1, idx)];
      const h = clamp(v * maxH * sens, 2, maxH);
      const xPos = startX + i * (barW + gap);
      const col = toneColor(pal, i / count);
      glowFill(ctx, col, 10 * glow);
      ctx.fillRect(xPos, bottom - h, barW, h);
    }
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'mirrorBars', name: 'Mirror Bars', category: 'Basic',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.38, availH: 0.42, centerYRatio: 0.36, glowMul: 0.9 },
  layer: 'front',
  renderFront(api) {
    const { ctx, region, pal, sens, glow } = api;
    const count = 60;
    const midY = region.y + region.h * 0.7;
    const width = region.w * 0.84;
    const startX = region.x + (region.w - width) / 2;
    const maxH = region.h * 0.17;
    const gap = width / count * 0.3;
    const barW = width / count - gap;
    const vals = sampleBars(api.freq, api.len, count);
    ctx.save();
    for (let i = 0; i < count; i++) {
      const h = clamp(vals[i] * maxH * sens, 2, maxH);
      const xPos = startX + i * (barW + gap);
      const col = toneColor(pal, i / count);
      glowFill(ctx, col, 10 * glow);
      roundRect(ctx, xPos, midY - h, barW, h * 2, barW / 2);
      ctx.fill();
    }
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'dualBars', name: 'Dual Bars', category: 'Basic',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.36, availH: 0.4, centerYRatio: 0.33, glowMul: 0.9 },
  layer: 'front',
  renderFront(api) {
    const { ctx, region, pal, sens, glow } = api;
    const count = 40;
    const cy = region.y + region.h * 0.72;
    const width = region.w * 0.8;
    const startX = region.x + (region.w - width) / 2;
    const maxH = region.h * 0.16;
    const gap = width / count * 0.32;
    const barW = width / count - gap;
    const vals = sampleBars(api.freq, api.len, count);
    ctx.save();
    for (let i = 0; i < count; i++) {
      const h = clamp(vals[i] * maxH * sens, 2, maxH);
      const xPos = startX + i * (barW + gap);
      const col = toneColor(pal, i / count);
      glowFill(ctx, col, 12 * glow);
      roundRect(ctx, xPos, cy - h, barW, h, 3);
      ctx.fill();
      ctx.globalAlpha = 0.55;
      roundRect(ctx, xPos, cy, barW, h * 0.7, 3);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'waveform', name: 'Waveform', category: 'Basic',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.42, availH: 0.5, centerYRatio: 0.4, glowMul: 1 },
  layer: 'front',
  renderFront(api) { drawWaveformLine(api, { aroundArt: true, yOffset: 0.1, widthRatio: 0.82, ampRatio: 0.09, lineWidth: 2.4, blur: 16, doubleStroke: true }); },
});

VisualizerEngine.register({
  id: 'minimal', name: 'Minimal', category: 'Basic',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.34, availH: 0.44, centerYRatio: 0.4, glowMul: 0.6 },
  layer: 'front',
  renderFront(api) { drawWaveformLine(api, { aroundArt: true, yOffset: 0.14, widthRatio: 0.7, ampRatio: 0.05, lineWidth: 1.6, blur: 10 }); },
});

VisualizerEngine.register({
  id: 'oscilloscope', name: 'Oscilloscope', category: 'Basic',
  artwork: { shape: 'rectangle', aspect: 1.35, sizeRatio: 0.34, availH: 0.4, centerYRatio: 0.3, glowMul: 1 },
  layer: 'front',
  renderFront(api) { drawWaveformLine(api, { aroundArt: true, yOffset: 0.28, widthRatio: 0.9, ampRatio: 0.12, lineWidth: 2, blur: 24 }); },
});

VisualizerEngine.register({
  id: 'filledWave', name: 'Filled Wave', category: 'Basic',
  artwork: { shape: 'landscape', aspect: 1.6, sizeRatio: 0.34, availH: 0.36, centerYRatio: 0.28, glowMul: 0.8 },
  layer: 'front',
  renderFront(api) { drawWaveformLine(api, { aroundArt: true, yOffset: 0.3, widthRatio: 0.88, ampRatio: 0.13, lineWidth: 2, blur: 12, filled: true }); },
});

VisualizerEngine.register({
  id: 'dualWave', name: 'Dual Wave', category: 'Basic',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.4, availH: 0.46, centerYRatio: 0.36, glowMul: 0.9 },
  layer: 'front',
  renderFront(api) {
    drawWaveformLine(api, { aroundArt: true, yOffset: 0.12, widthRatio: 0.82, ampRatio: 0.08, lineWidth: 2, blur: 14 });
    const { ctx, region, art, pal, sens, glow } = api;
    const data = api.timeData; const len = data.length;
    const y = art.cy + art.h / 2 + region.h * 0.12;
    const width = region.w * 0.82; const x0 = region.x + (region.w - width) / 2;
    const amp = region.h * 0.08 * (0.4 + bands.volumeS * 1.4) * sens;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < len; i++) {
      const px = x0 + (i / (len - 1)) * width;
      const v = (data[len - 1 - i] - 128) / 128;
      const py = y - v * amp * 0.7;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = rgba(pal.b, 0.55); ctx.lineWidth = 1.6;
    ctx.shadowColor = pal.b; ctx.shadowBlur = 10 * glow;
    ctx.stroke();
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'dottedWave', name: 'Dotted Wave', category: 'Basic',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.38, availH: 0.44, centerYRatio: 0.38, glowMul: 0.8 },
  layer: 'front',
  renderFront(api) { drawWaveformLine(api, { aroundArt: true, yOffset: 0.14, widthRatio: 0.78, ampRatio: 0.08, dotted: true, dotSize: 2.4 }); },
});

/* =====================================================================
   2. CIRCULAR FAMILY (11-19)
   ===================================================================== */

VisualizerEngine.register({
  id: 'circular', name: 'Circular', category: 'Circular',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.34, availH: 0.62, centerYRatio: 0.42, glowMul: 1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, sens, glow, rotSpeed } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2 + 18;
    const bars = 96;
    rotation += 0.0022 * rotSpeed;
    const freq = api.freq, len = api.len;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    for (let i = 0; i < bars; i++) {
      const t = i / bars;
      const idx = Math.floor(Math.pow(t, 1.5) * len * 0.85);
      const v = len ? freq[idx] / 255 : 0;
      const isBass = t < 0.2;
      const amp = (isBass ? bands.bassS * 1.4 : bands.trebleS * 0.9) + v * 0.6;
      const barLen = clamp(14 + amp * 70 * sens, 6, 140);
      const ang = t * TAU;
      const x0 = Math.cos(ang) * baseR, y0 = Math.sin(ang) * baseR;
      const x1 = Math.cos(ang) * (baseR + barLen), y1 = Math.sin(ang) * (baseR + barLen);
      const col = toneColor(pal, t);
      glowStroke(ctx, col, 10 * glow);
      ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'circularSpectrum', name: 'Circular Spectrum', category: 'Circular',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.32, availH: 0.6, centerYRatio: 0.42, glowMul: 1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, sens, glow } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2 + 14;
    const points = 128;
    const vals = sampleBars(api.freq, api.len, points, 1.3);
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const t = (i % points) / points;
      const r = baseR + vals[i % points] * 90 * sens;
      const ang = t * TAU - Math.PI / 2;
      const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    const grad = ctx.createRadialGradient(cx, cy, baseR * 0.5, cx, cy, baseR + 100);
    grad.addColorStop(0, rgba(pal.a, 0.35));
    grad.addColorStop(1, rgba(pal.b, 0.02));
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = pal.a; ctx.lineWidth = 2;
    ctx.shadowColor = pal.a; ctx.shadowBlur = 16 * glow;
    ctx.stroke();
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'radialBars', name: 'Radial Bars', category: 'Circular',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.3, availH: 0.58, centerYRatio: 0.42, glowMul: 1.1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, sens, glow, rotSpeed } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2 + 10;
    const count = 140;
    rotation -= 0.0016 * rotSpeed;
    const vals = sampleBars(api.freq, api.len, count, 1.7);
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(rotation);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const barLen = clamp(vals[i] * 60 * sens, 3, 100);
      const ang = t * TAU;
      const x0 = Math.cos(ang) * baseR, y0 = Math.sin(ang) * baseR;
      const x1 = Math.cos(ang) * (baseR + barLen), y1 = Math.sin(ang) * (baseR + barLen);
      glowStroke(ctx, toneColor(pal, t), 8 * glow);
      ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'radialWave', name: 'Radial Wave', category: 'Circular',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.32, availH: 0.58, centerYRatio: 0.42, glowMul: 1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, sens, glow } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2 + 20;
    const data = api.timeData, len = data.length;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i <= len; i += 2) {
      const v = (data[i % len] - 128) / 128;
      const t = (i % len) / len;
      const r = baseR + v * 46 * sens * (0.5 + bands.volumeS);
      const ang = t * TAU - Math.PI / 2;
      const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    glowStroke(ctx, pal.a, 14 * glow);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'ringSpectrum', name: 'Ring Spectrum', category: 'Circular',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.3, availH: 0.56, centerYRatio: 0.42, glowMul: 1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, glow } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2 + 12;
    const rings = [
      { val: bands.bassS, r: baseR + 8, w: 10, col: pal.a },
      { val: bands.midS, r: baseR + 26, w: 7, col: mixHex(pal.a, pal.b, 0.5) },
      { val: bands.trebleS, r: baseR + 40, w: 4, col: pal.b },
    ];
    ctx.save();
    rings.forEach((ring) => {
      const segs = 48;
      for (let i = 0; i < segs; i++) {
        const t = i / segs;
        const active = t < clamp(ring.val, 0, 1);
        if (!active) return;
        const a0 = t * TAU - Math.PI / 2, a1 = a0 + (TAU / segs) * 0.7;
        glowStroke(ctx, ring.col, 8 * glow);
        ctx.lineWidth = ring.w; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx, cy, ring.r, a0, a1); ctx.stroke();
      }
    });
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'multiRing', name: 'Multi Ring', category: 'Circular',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.3, availH: 0.56, centerYRatio: 0.42, glowMul: 1.1 },
  layer: 'behind',
  ringPulses: [],
  renderBehind(api) {
    const { ctx, art, pal, glow } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2;
    if (bands.beat > 0.55) this.ringPulses.push({ r: baseR, a: 1 });
    this.ringPulses = this.ringPulses.filter(p => p.a > 0.02);
    ctx.save();
    this.ringPulses.forEach(p => {
      p.r += 2.4; p.a *= 0.965;
      ctx.beginPath();
      ctx.arc(cx, cy, p.r, 0, TAU);
      ctx.strokeStyle = rgba(pal.a, p.a * 0.6);
      ctx.lineWidth = 2;
      ctx.shadowColor = pal.a; ctx.shadowBlur = 12 * glow;
      ctx.stroke();
    });
    for (let i = 0; i < 3; i++) {
      const r = baseR + 14 + i * 16 + bands.midS * 10;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU);
      ctx.strokeStyle = rgba(i % 2 ? pal.b : pal.a, 0.18);
      ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'spiralSpectrum', name: 'Spiral Spectrum', category: 'Circular',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.28, availH: 0.54, centerYRatio: 0.42, glowMul: 1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, sens, glow, rotSpeed } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2;
    const count = 90;
    rotation += 0.003 * rotSpeed;
    const vals = sampleBars(api.freq, api.len, count, 1.4);
    ctx.save();
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const ang = t * TAU * 2.4 + rotation;
      const r = baseR + t * baseR * 1.6 + vals[i] * 30 * sens;
      const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
      const sz = 1.5 + vals[i] * 4;
      glowFill(ctx, toneColor(pal, t), 8 * glow);
      ctx.beginPath(); ctx.arc(x, y, sz, 0, TAU); ctx.fill();
    }
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'orbit', name: 'Orbit', category: 'Circular',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.34, availH: 0.58, centerYRatio: 0.42, glowMul: 1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, sens, glow, rotSpeed } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2 + 26;
    const count = 14;
    rotation += 0.0018 * rotSpeed;
    ctx.save();
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const ang = t * TAU + rotation * (1 + (i % 2) * 0.4);
      const r = baseR + Math.sin(rotation * 2 + i) * 8 + bands.midS * 30 * sens;
      const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
      const sz = 2.5 + bands.trebleS * 6 * sens;
      glowFill(ctx, toneColor(pal, t), 12 * glow);
      ctx.beginPath(); ctx.arc(x, y, sz, 0, TAU); ctx.fill();
    }
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'pulseRing', name: 'Pulse Ring', category: 'Circular',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.34, availH: 0.58, centerYRatio: 0.42, glowMul: 1.2 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, glow } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2 + 16;
    const pulse = baseR + bands.beat * 60 + bands.bassS * 14;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, pulse, 0, TAU);
    ctx.strokeStyle = rgba(pal.a, 0.5 + bands.beat * 0.4);
    ctx.lineWidth = 3 + bands.beat * 4;
    ctx.shadowColor = pal.a; ctx.shadowBlur = 22 * glow;
    ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, baseR + 6, 0, TAU);
    ctx.strokeStyle = rgba(pal.b, 0.25);
    ctx.lineWidth = 1; ctx.shadowBlur = 0; ctx.stroke();
    ctx.restore();
  },
});

/* =====================================================================
   3. PARTICLE FAMILY (20-25)
   ===================================================================== */

VisualizerEngine.register({
  id: 'particles', name: 'Particles', category: 'Particle',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.36, availH: 0.62, centerYRatio: 0.42, glowMul: 0.9 },
  layer: 'behind',
  pool: [],
  renderBehind(api) {
    const { ctx, region, art, pal, sens, glow } = api;
    const cx = art.cx, cy = art.cy;
    const target = Math.round(api.settings.particleAmount);
    const spread = Math.max(region.w, region.h) * 0.42;
    const pool = stepFxParticlePool(target, cx, cy, spread);
    emitBeatBurst(pool, cx, cy, Math.max(art.w, art.h) * 0.5, 6);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    pool.forEach((p) => {
      const speed = p.speed * (0.5 + bands.volumeS * 1.4 + bands.beat);
      p.x += Math.cos(p.ang) * speed;
      p.y += Math.sin(p.ang) * speed;
      p.life -= p.decay * (1 + bands.trebleS);
      if (p.life <= 0 || p.x < region.x - 40 || p.x > region.x + region.w + 40 || p.y < region.y - 40 || p.y > region.y + region.h + 40) {
        Object.assign(p, makeFxParticle(cx, cy, spread * 0.15));
      }
      const r = p.r * (1 + bands.bassS * 1.2) * sens;
      const col = toneColor(pal, p.life);
      glowFill(ctx, alphaOf(col, clamp(p.life * 0.9, 0, 0.9)), 12 * glow);
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.4, r), 0, TAU); ctx.fill();
    });
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'particleGalaxy', name: 'Particle Galaxy', category: 'Particle',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.3, availH: 0.56, centerYRatio: 0.42, glowMul: 0.9 },
  layer: 'behind',
  pool: [],
  renderBehind(api) {
    const { ctx, region, art, pal, glow, rotSpeed } = api;
    const cx = art.cx, cy = art.cy;
    const target = Math.round(api.settings.particleAmount * 1.3);
    while (this.pool.length < target) this.pool.push({ a: Math.random() * TAU, r: Math.random() * Math.max(region.w, region.h) * 0.4 + 20, arm: Math.floor(Math.random() * 3), sz: Math.random() * 2 + 0.6 });
    if (this.pool.length > target) this.pool.length = target;
    rotation += 0.0012 * rotSpeed;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    this.pool.forEach(p => {
      const ang = p.a + rotation * (1 - p.r / (Math.max(region.w, region.h) * 0.5)) * 2 + p.arm * (TAU / 3);
      const r = p.r * (0.7 + bands.midS * 0.4);
      const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r * 0.55;
      const t = clamp(p.r / (Math.max(region.w, region.h) * 0.5), 0, 1);
      glowFill(ctx, toneColor(pal, t), 6 * glow);
      ctx.beginPath(); ctx.arc(x, y, p.sz * (1 + bands.trebleS), 0, TAU); ctx.fill();
    });
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'vortex', name: 'Vortex', category: 'Particle',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.3, availH: 0.56, centerYRatio: 0.42, glowMul: 1 },
  layer: 'behind',
  pool: [],
  renderBehind(api) {
    const { ctx, region, art, pal, glow, rotSpeed } = api;
    const cx = art.cx, cy = art.cy;
    const target = Math.round(api.settings.particleAmount);
    while (this.pool.length < target) this.pool.push({ a: Math.random() * TAU, r: Math.random() * Math.max(region.w, region.h) * 0.45 + 30, sz: Math.random() * 2 + 0.8 });
    if (this.pool.length > target) this.pool.length = target;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    this.pool.forEach(p => {
      p.a += (0.01 + bands.trebleS * 0.05) * rotSpeed;
      p.r -= 0.6 + bands.bassS * 1.4;
      if (p.r < Math.max(art.w, art.h) / 2) { p.r = Math.max(region.w, region.h) * 0.45; p.a = Math.random() * TAU; }
      const x = cx + Math.cos(p.a) * p.r, y = cy + Math.sin(p.a) * p.r;
      glowFill(ctx, toneColor(pal, p.r / (Math.max(region.w, region.h) * 0.45)), 8 * glow);
      ctx.beginPath(); ctx.arc(x, y, p.sz, 0, TAU); ctx.fill();
    });
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'starfield', name: 'Starfield', category: 'Particle',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.32, availH: 0.58, centerYRatio: 0.42, glowMul: 0.8 },
  layer: 'behind',
  pool: [],
  renderBehind(api) {
    const { ctx, region, art, pal, glow } = api;
    const cx = art.cx, cy = art.cy;
    const target = Math.round(api.settings.particleAmount);
    while (this.pool.length < target) this.pool.push({ a: Math.random() * TAU, z: Math.random() });
    if (this.pool.length > target) this.pool.length = target;
    const maxR = Math.max(region.w, region.h) * 0.6;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    this.pool.forEach(p => {
      p.z -= 0.006 + bands.volumeS * 0.02;
      if (p.z <= 0) { p.z = 1; p.a = Math.random() * TAU; }
      const r = (1 - p.z) * maxR;
      const x = cx + Math.cos(p.a) * r, y = cy + Math.sin(p.a) * r;
      const sz = (1 - p.z) * 3.4 + 0.4;
      glowFill(ctx, toneColor(pal, 1 - p.z), 6 * glow);
      ctx.beginPath(); ctx.arc(x, y, sz, 0, TAU); ctx.fill();
    });
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'audioDust', name: 'Audio Dust', category: 'Particle',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.34, availH: 0.5, centerYRatio: 0.4, glowMul: 0.7 },
  layer: 'behind',
  pool: [],
  renderBehind(api) {
    const { ctx, region, pal, glow } = api;
    const target = Math.round(api.settings.particleAmount * 0.8);
    while (this.pool.length < target) this.pool.push({ x: region.x + Math.random() * region.w, y: region.y + Math.random() * region.h, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, sz: Math.random() * 1.6 + 0.4 });
    if (this.pool.length > target) this.pool.length = target;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    this.pool.forEach(p => {
      p.x += p.vx * (1 + bands.midS * 2); p.y += p.vy * (1 + bands.trebleS * 2);
      if (p.x < region.x) p.x = region.x + region.w; if (p.x > region.x + region.w) p.x = region.x;
      if (p.y < region.y) p.y = region.y + region.h; if (p.y > region.y + region.h) p.y = region.y;
      glowFill(ctx, rgba(Math.random() > 0.5 ? pal.a : pal.b, 0.35 + bands.volumeS * 0.3), 5 * glow);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.sz, 0, TAU); ctx.fill();
    });
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'particleExplosion', name: 'Particle Explosion', category: 'Particle',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.32, availH: 0.56, centerYRatio: 0.42, glowMul: 1 },
  layer: 'behind',
  pool: [],
  renderBehind(api) {
    const { ctx, art, pal, glow } = api;
    const cx = art.cx, cy = art.cy;
    if (bands.beat > 0.45) {
      for (let i = 0; i < 10; i++) this.pool.push(makeFxParticle(cx, cy, 6));
    }
    this.pool = this.pool.filter(p => p.life > 0.02).slice(-260);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    this.pool.forEach(p => {
      p.x += Math.cos(p.ang) * (p.speed * 3);
      p.y += Math.sin(p.ang) * (p.speed * 3);
      p.life -= p.decay * 1.5;
      glowFill(ctx, toneColor(pal, p.life), 10 * glow);
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.4, p.r * p.life), 0, TAU); ctx.fill();
    });
    ctx.restore();
  },
});

/* =====================================================================
   4. GEOMETRIC FAMILY (26-31)
   ===================================================================== */

VisualizerEngine.register({
  id: 'neonGrid', name: 'Neon Grid', category: 'Geometric',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.3, availH: 0.4, centerYRatio: 0.3, glowMul: 1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, region, pal, sens, glow } = api;
    const horizon = region.y + region.h * 0.62;
    const rows = 10;
    ctx.save();
    for (let i = 1; i <= rows; i++) {
      const t = i / rows;
      const y = horizon + t * t * (region.h * 0.34);
      const spread = region.w * (0.1 + t * 0.5);
      glowStroke(ctx, rgba(pal.a, (1 - t) * 0.5 + bands.bassS * 0.2), 10 * glow * (1 - t));
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(region.x + region.w / 2 - spread, y);
      ctx.lineTo(region.x + region.w / 2 + spread, y);
      ctx.stroke();
    }
    const cols = 9;
    for (let i = 0; i <= cols; i++) {
      const t = i / cols - 0.5;
      glowStroke(ctx, rgba(pal.b, 0.3), 8 * glow);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(region.x + region.w / 2 + t * region.w * 0.06, horizon);
      ctx.lineTo(region.x + region.w / 2 + t * region.w * 0.9, horizon + region.h * 0.34);
      ctx.stroke();
    }
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'waveGrid', name: 'Wave Grid', category: 'Geometric',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.32, availH: 0.42, centerYRatio: 0.32, glowMul: 0.9 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, region, pal, sens, glow } = api;
    const rows = 7, cols = 26;
    const vals = sampleBars(api.freq, api.len, cols, 1.4);
    const top = region.y + region.h * 0.6, bottom = region.y + region.h * 0.94;
    ctx.save();
    for (let r = 0; r < rows; r++) {
      const y0 = lerp(top, bottom, r / (rows - 1));
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const x = region.x + (c / cols) * region.w;
        const v = vals[Math.min(cols - 1, c)] * sens;
        const y = y0 - v * 26 * (1 - r / rows);
        if (c === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      glowStroke(ctx, rgba(pal.a, 0.35 - r * 0.03), 6 * glow);
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'hexagonPulse', name: 'Hexagon Pulse', category: 'Geometric',
  artwork: { shape: 'hexagon', aspect: 1, sizeRatio: 0.32, availH: 0.56, centerYRatio: 0.42, glowMul: 1.1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, glow, rotSpeed } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2;
    rotation += 0.0012 * rotSpeed;
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const r = baseR + 16 + i * 22 + bands.bassS * 16;
      polygonPath(ctx, cx, cy, r, 6, rotation + i * 0.1);
      ctx.strokeStyle = rgba(i % 2 ? pal.b : pal.a, 0.4 - i * 0.07 + bands.beat * 0.15);
      ctx.lineWidth = 2;
      ctx.shadowColor = pal.a; ctx.shadowBlur = 10 * glow;
      ctx.stroke();
    }
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'polygonPulse', name: 'Polygon Pulse', category: 'Geometric',
  artwork: { shape: 'diamond', aspect: 1, sizeRatio: 0.3, availH: 0.54, centerYRatio: 0.42, glowMul: 1.1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, glow, rotSpeed } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2 + 14;
    rotation -= 0.0018 * rotSpeed;
    const sides = 3 + Math.floor((bands.midS * 4) % 4);
    ctx.save();
    polygonPath(ctx, cx, cy, baseR + bands.bassS * 20, Math.max(3, sides), rotation);
    ctx.strokeStyle = rgba(pal.a, 0.5 + bands.beat * 0.3);
    ctx.lineWidth = 2.4;
    ctx.shadowColor = pal.a; ctx.shadowBlur = 14 * glow;
    ctx.stroke();
    polygonPath(ctx, cx, cy, baseR * 0.6, 6, -rotation * 1.4);
    ctx.strokeStyle = rgba(pal.b, 0.3);
    ctx.lineWidth = 1.4; ctx.stroke();
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'audioTunnel', name: 'Audio Tunnel', category: 'Geometric',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.26, availH: 0.5, centerYRatio: 0.42, glowMul: 1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, glow, rotSpeed } = api;
    const cx = art.cx, cy = art.cy;
    const rings = 9;
    rotation += 0.002 * rotSpeed;
    ctx.save();
    for (let i = rings; i >= 1; i--) {
      const t = i / rings;
      const r = (Math.max(art.w, art.h) / 2) * (0.5 + (1 - t) * 3.4) + bands.bassS * 30 * (1 - t);
      polygonPath(ctx, cx, cy, r, 8, rotation * (1 + t));
      ctx.strokeStyle = alphaOf(toneColor(pal, t), (1 - t) * 0.5);
      ctx.lineWidth = 1.6;
      ctx.shadowColor = pal.a; ctx.shadowBlur = 6 * glow;
      ctx.stroke();
    }
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'tunnelRings', name: 'Tunnel Rings', category: 'Geometric',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.26, availH: 0.5, centerYRatio: 0.42, glowMul: 1 },
  layer: 'behind',
  rings: [],
  renderBehind(api) {
    const { ctx, art, pal, glow } = api;
    const cx = art.cx, cy = art.cy;
    if (Math.random() < 0.05 + bands.trebleS * 0.1) this.rings.push({ r: Math.max(art.w, art.h) / 2, a: 1 });
    this.rings = this.rings.filter(r => r.a > 0.02);
    ctx.save();
    this.rings.forEach(r => {
      r.r += 3 + bands.volumeS * 4;
      r.a *= 0.98;
      ctx.beginPath(); ctx.arc(cx, cy, r.r, 0, TAU);
      ctx.strokeStyle = rgba(pal.b, r.a * 0.5);
      ctx.lineWidth = 2;
      ctx.shadowColor = pal.b; ctx.shadowBlur = 10 * glow;
      ctx.stroke();
    });
    ctx.restore();
  },
});

/* =====================================================================
   5. CINEMATIC FAMILY (32-36)
   ===================================================================== */

VisualizerEngine.register({
  id: 'plasma', name: 'Plasma', category: 'Cinematic',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.3, availH: 0.56, centerYRatio: 0.42, glowMul: 1.2 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, glow } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2 + 20;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const a = motionT * (0.6 + i * 0.15) + i * 1.7;
      const r = baseR + Math.sin(motionT * 0.8 + i) * 18 + bands.midS * 30;
      const x = cx + Math.cos(a) * r * 0.5;
      const y = cy + Math.sin(a) * r * 0.5;
      const rad = baseR * (0.7 + 0.3 * Math.sin(motionT + i));
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, rgba(i % 2 ? pal.b : pal.a, 0.16 * glow + bands.beat * 0.1));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.fill();
    }
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'aurora', name: 'Aurora', category: 'Cinematic',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.3, availH: 0.54, centerYRatio: 0.4, glowMul: 1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, region, pal, glow } = api;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let band = 0; band < 3; band++) {
      ctx.beginPath();
      const baseY = region.y + region.h * (0.2 + band * 0.1);
      for (let x = region.x; x <= region.x + region.w; x += region.w / 30) {
        const t = motionT * 0.6 + band * 2;
        const y = baseY + Math.sin((x - region.x) * 0.02 + t) * 22 * (1 + bands.midS);
        if (x === region.x) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgba(band % 2 ? pal.b : pal.a, 0.35 * glow);
      ctx.lineWidth = 6 - band;
      ctx.shadowColor = pal.a; ctx.shadowBlur = 16 * glow;
      ctx.stroke();
    }
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'liquidSpectrum', name: 'Liquid Spectrum', category: 'Cinematic',
  artwork: { shape: 'landscape', aspect: 1.5, sizeRatio: 0.32, availH: 0.36, centerYRatio: 0.28, glowMul: 0.9 },
  layer: 'front',
  renderFront(api) {
    const { ctx, region, pal, sens, glow } = api;
    const count = 40;
    const bottom = region.y + region.h * 0.92;
    const width = region.w * 0.86;
    const x0 = region.x + (region.w - width) / 2;
    const vals = sampleBars(api.freq, api.len, count, 1.5);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, bottom);
    for (let i = 0; i < count; i++) {
      const x = x0 + (i / (count - 1)) * width;
      const h = clamp(vals[i] * region.h * 0.3 * sens, 4, region.h * 0.34);
      const y = bottom - h;
      const prevX = x0 + Math.max(0, i - 1) / (count - 1) * width;
      ctx.quadraticCurveTo(prevX, y, x, y);
    }
    ctx.lineTo(x0 + width, bottom);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, bottom - region.h * 0.34, 0, bottom);
    g.addColorStop(0, rgba(pal.a, 0.55));
    g.addColorStop(1, rgba(pal.b, 0.08));
    ctx.fillStyle = g;
    ctx.shadowColor = pal.a; ctx.shadowBlur = 18 * glow;
    ctx.fill();
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'energySphere', name: 'Energy Sphere', category: 'Cinematic',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.28, availH: 0.54, centerYRatio: 0.42, glowMul: 1.2 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, glow, rotSpeed } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2 + 10;
    rotation += 0.0016 * rotSpeed;
    const lines = 24;
    ctx.save();
    for (let i = 0; i < lines; i++) {
      const phi = (i / lines) * Math.PI;
      const r = baseR * (1 + bands.bassS * 0.25);
      const x1 = cx + Math.cos(phi + rotation) * r;
      const y1 = cy + Math.sin(phi + rotation) * r * 0.4;
      const x2 = cx - Math.cos(phi + rotation) * r;
      const y2 = cy - Math.sin(phi + rotation) * r * 0.4;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = alphaOf(toneColor(pal, i / lines), 0.18 + bands.trebleS * 0.2);
      ctx.lineWidth = 1;
      ctx.shadowColor = pal.a; ctx.shadowBlur = 6 * glow;
      ctx.stroke();
    }
    ctx.restore();
  },
});

VisualizerEngine.register({
  id: 'electricWave', name: 'Electric Wave', category: 'Cinematic',
  artwork: { shape: 'rectangle', aspect: 1.35, sizeRatio: 0.32, availH: 0.4, centerYRatio: 0.3, glowMul: 1.1 },
  layer: 'front',
  renderFront(api) {
    const { ctx, region, art, pal, sens, glow } = api;
    const data = api.timeData, len = data.length;
    const y = art.cy + art.h / 2 + region.h * 0.16;
    const width = region.w * 0.86;
    const x0 = region.x + (region.w - width) / 2;
    const amp = region.h * 0.11 * (0.4 + bands.volumeS * 1.6) * sens;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < len; i++) {
      const jag = (Math.random() - 0.5) * 4 * bands.trebleS;
      const px = x0 + (i / (len - 1)) * width;
      const v = (data[i] - 128) / 128;
      const py = y + v * amp + jag;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = pal.a;
    ctx.lineWidth = 1.6;
    ctx.shadowColor = pal.a; ctx.shadowBlur = 20 * glow;
    ctx.stroke();
    ctx.globalAlpha = 0.4; ctx.lineWidth = 4; ctx.shadowBlur = 0; ctx.stroke();
    ctx.restore();
  },
});

/* =====================================================================
   6. MODERN & UNIQUE STYLES (37-50) [NEW!]
   ===================================================================== */

// 37. Cyberpunk Glitch Spectrum
VisualizerEngine.register({
  id: 'cyberGlitch', name: 'Cyber Glitch', category: 'Cinematic',
  artwork: { shape: 'square', aspect: 1, sizeRatio: 0.36, availH: 0.46, centerYRatio: 0.36, glowMul: 1.2 },
  layer: 'front',
  renderFront(api) {
    const { ctx, region, pal, sens, glow } = api;
    const count = 36;
    const bottom = region.y + region.h * 0.94;
    const width = region.w * 0.86;
    const startX = region.x + (region.w - width) / 2;
    const barW = width / count;
    const vals = sampleBars(api.freq, api.len, count);
    ctx.save();
    for (let i = 0; i < count; i++) {
      const glitch = Math.random() < 0.08 ? (Math.random() - 0.5) * 20 : 0;
      const h = clamp(vals[i] * region.h * 0.28 * sens + glitch, 4, region.h * 0.35);
      const x = startX + i * barW;
      glowFill(ctx, i % 2 === 0 ? pal.a : pal.b, 12 * glow);
      ctx.fillRect(x + 2, bottom - h, barW - 4, h);
      if (bands.beat > 0.5 && Math.random() < 0.2) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, bottom - h - 14, barW - 2, 4);
      }
    }
    ctx.restore();
  }
});

// 38. Neon Floating Caps Bars
VisualizerEngine.register({
  id: 'neonFloatBars', name: 'Floating Caps', category: 'Basic',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.38, availH: 0.45, centerYRatio: 0.35, glowMul: 1 },
  layer: 'front',
  renderFront(api) {
    const { ctx, region, pal, sens, glow } = api;
    const count = 44;
    const width = region.w * 0.86;
    const startX = region.x + (region.w - width) / 2;
    const bottomY = region.y + region.h * 0.92;
    const gap = width / count * 0.32;
    const barW = width / count - gap;
    const vals = sampleBars(api.freq, api.len, count);
    ctx.save();
    for (let i = 0; i < count; i++) {
      const h = clamp(vals[i] * region.h * 0.26 * sens, 4, region.h * 0.34);
      const xPos = startX + i * (barW + gap);
      const col = toneColor(pal, i / count);
      glowFill(ctx, col, 10 * glow);
      roundRect(ctx, xPos, bottomY - h, barW, h, barW / 2);
      ctx.fill();
      glowFill(ctx, '#ffffff', 8 * glow);
      roundRect(ctx, xPos, bottomY - h - 6 - bands.beat * 8, barW, 3.5, 2);
      ctx.fill();
    }
    ctx.restore();
  }
});

// 39. LED Dot Matrix Equalizer
VisualizerEngine.register({
  id: 'ledMatrix', name: 'LED Matrix', category: 'Basic',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.35, availH: 0.42, centerYRatio: 0.34, glowMul: 0.8 },
  layer: 'front',
  renderFront(api) {
    const { ctx, region, pal, sens, glow } = api;
    const cols = 32, rows = 14;
    const width = region.w * 0.84;
    const startX = region.x + (region.w - width) / 2;
    const bottomY = region.y + region.h * 0.92;
    const colW = width / cols;
    const vals = sampleBars(api.freq, api.len, cols);
    ctx.save();
    for (let c = 0; c < cols; c++) {
      const activeRows = Math.round(vals[c] * rows * sens * 1.2);
      const x = startX + c * colW + colW / 2;
      for (let r = 0; r < rows; r++) {
        const y = bottomY - r * 9;
        const isActive = r <= activeRows;
        const col = isActive ? toneColor(pal, r / rows) : 'rgba(255,255,255,0.06)';
        if (isActive) glowFill(ctx, col, 8 * glow);
        else ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
  }
});

// 40. DNA Double Helix Audio Wave
VisualizerEngine.register({
  id: 'dnaHelix', name: 'DNA Helix', category: 'Geometric',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.32, availH: 0.44, centerYRatio: 0.34, glowMul: 1 },
  layer: 'front',
  renderFront(api) {
    const { ctx, region, art, pal, sens, glow } = api;
    const count = 36;
    const width = region.w * 0.84;
    const startX = region.x + (region.w - width) / 2;
    const yCenter = art.cy + art.h / 2 + region.h * 0.16;
    const vals = sampleBars(api.freq, api.len, count);
    ctx.save();
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const x = startX + t * width;
      const angle = t * TAU * 2.5 + motionT * 2;
      const amp = (18 + vals[i] * 50 * sens) * (1 + bands.midS * 0.5);
      const y1 = yCenter + Math.sin(angle) * amp;
      const y2 = yCenter - Math.sin(angle) * amp;
      glowStroke(ctx, 'rgba(255,255,255,0.18)', 4 * glow);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
      glowFill(ctx, pal.a, 8 * glow);
      ctx.beginPath(); ctx.arc(x, y1, 3.5, 0, TAU); ctx.fill();
      glowFill(ctx, pal.b, 8 * glow);
      ctx.beginPath(); ctx.arc(x, y2, 3.5, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
});

// 41. Starlight Solar Flare (Radial Beams)
VisualizerEngine.register({
  id: 'solarFlare', name: 'Solar Flare', category: 'Circular',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.32, availH: 0.58, centerYRatio: 0.42, glowMul: 1.4 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, sens, glow } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2 + 8;
    const rays = 72;
    const vals = sampleBars(api.freq, api.len, rays);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < rays; i++) {
      const ang = (i / rays) * TAU + motionT * 0.3;
      const len = 20 + vals[i] * 120 * sens * (1 + bands.bassS);
      const x2 = cx + Math.cos(ang) * (baseR + len);
      const y2 = cy + Math.sin(ang) * (baseR + len);
      const g = ctx.createLinearGradient(cx, cy, x2, y2);
      g.addColorStop(0, rgba(pal.a, 0.7));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * baseR, cy + Math.sin(ang) * baseR); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.restore();
  }
});

// 42. Cyber Radar Scanner
VisualizerEngine.register({
  id: 'cyberRadar', name: 'Cyber Radar', category: 'Circular',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.3, availH: 0.56, centerYRatio: 0.42, glowMul: 1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, glow } = api;
    const cx = art.cx, cy = art.cy;
    const maxR = Math.max(art.w, art.h) * 0.85;
    const scanAng = (motionT * 2.2) % TAU;
    ctx.save();
    for (let r = maxR * 0.35; r <= maxR; r += maxR * 0.22) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU);
      ctx.strokeStyle = rgba(pal.b, 0.2); ctx.lineWidth = 1.2; ctx.stroke();
    }
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    grad.addColorStop(0, rgba(pal.a, 0.35));
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxR, scanAng - 0.5, scanAng);
    ctx.closePath(); ctx.fill();
    glowStroke(ctx, pal.a, 12 * glow);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(scanAng) * maxR, cy + Math.sin(scanAng) * maxR); ctx.stroke();
    ctx.restore();
  }
});

// 43. 3D Wireframe Audio Grid
VisualizerEngine.register({
  id: 'wireframe3D', name: '3D Wireframe', category: 'Geometric',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.3, availH: 0.4, centerYRatio: 0.3, glowMul: 1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, region, pal, sens, glow } = api;
    const gridCols = 18, gridRows = 12;
    const horizon = region.y + region.h * 0.62;
    const vals = sampleBars(api.freq, api.len, gridCols);
    ctx.save();
    for (let r = 0; r < gridRows; r++) {
      const z = (r + 1) / gridRows;
      const y = horizon + z * z * (region.h * 0.35);
      const spanW = region.w * (0.15 + z * 0.8);
      ctx.beginPath();
      for (let c = 0; c <= gridCols; c++) {
        const x = region.x + region.w / 2 - spanW / 2 + (c / gridCols) * spanW;
        const v = vals[Math.min(gridCols - 1, c)] * sens;
        const bumpY = y - v * 40 * (1 - z * 0.6);
        if (c === 0) ctx.moveTo(x, bumpY); else ctx.lineTo(x, bumpY);
      }
      glowStroke(ctx, rgba(pal.a, 0.4 * (1 - z * 0.4)), 6 * glow);
      ctx.lineWidth = 1.2; ctx.stroke();
    }
    ctx.restore();
  }
});

// 44. Hologram Scanning Rings
VisualizerEngine.register({
  id: 'hologramScan', name: 'Hologram Scan', category: 'Geometric',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.32, availH: 0.54, centerYRatio: 0.42, glowMul: 1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, glow } = api;
    const cx = art.cx, cy = art.cy;
    const count = 12;
    ctx.save();
    for (let i = 0; i < count; i++) {
      const progress = ((motionT * 0.4 + i / count) % 1);
      const r = progress * Math.max(art.w, art.h) * 1.1;
      const alpha = Math.sin(progress * Math.PI) * 0.5 * (1 + bands.beat * 0.5);
      glowStroke(ctx, rgba(pal.a, alpha), 10 * glow);
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.45, -0.2, 0, TAU); ctx.stroke();
    }
    ctx.restore();
  }
});

// 45. Firefly Nebula Swarm
VisualizerEngine.register({
  id: 'fireflySwarm', name: 'Fireflies', category: 'Particle',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.34, availH: 0.58, centerYRatio: 0.42, glowMul: 1 },
  layer: 'behind',
  flies: [],
  renderBehind(api) {
    const { ctx, region, art, pal, glow } = api;
    const cx = art.cx, cy = art.cy;
    const target = 48;
    while (this.flies.length < target) {
      this.flies.push({
        ang: Math.random() * TAU,
        dist: 40 + Math.random() * (Math.max(region.w, region.h) * 0.35),
        speed: (Math.random() - 0.5) * 0.02,
        r: 1.5 + Math.random() * 2,
        freqIdx: Math.floor(Math.random() * 64)
      });
    }
    const vals = sampleBars(api.freq, api.len, 64);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    this.flies.forEach(f => {
      f.ang += f.speed * (1 + bands.trebleS * 2);
      const v = vals[f.freqIdx] || 0;
      const curDist = f.dist + v * 30 + bands.bassS * 15;
      const x = cx + Math.cos(f.ang) * curDist;
      const y = cy + Math.sin(f.ang) * curDist;
      glowFill(ctx, toneColor(pal, f.ang / TAU), 10 * glow);
      ctx.beginPath(); ctx.arc(x, y, f.r * (1 + v * 1.5), 0, TAU); ctx.fill();
    });
    ctx.restore();
  }
});

// 46. Neon Equalizer Ribbons
VisualizerEngine.register({
  id: 'neonRibbons', name: 'Neon Ribbons', category: 'Cinematic',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.36, availH: 0.46, centerYRatio: 0.36, glowMul: 1 },
  layer: 'front',
  renderFront(api) {
    const { ctx, region, art, pal, sens, glow } = api;
    const points = 32;
    const width = region.w * 0.85;
    const x0 = region.x + (region.w - width) / 2;
    const y0 = art.cy + art.h / 2 + region.h * 0.14;
    const vals = sampleBars(api.freq, api.len, points);
    ctx.save();
    for (let layer = 0; layer < 3; layer++) {
      ctx.beginPath();
      for (let i = 0; i < points; i++) {
        const px = x0 + (i / (points - 1)) * width;
        const phase = i * 0.2 + motionT * 1.8 + layer * 1.2;
        const wave = Math.sin(phase) * 14;
        const amp = vals[i] * 45 * sens * (1 - layer * 0.25);
        const py = y0 + wave - amp + layer * 10;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      glowStroke(ctx, layer === 0 ? pal.a : layer === 1 ? pal.b : '#ffffff', (14 - layer * 3) * glow);
      ctx.lineWidth = 2.4 - layer * 0.5; ctx.stroke();
    }
    ctx.restore();
  }
});

// 47. Quantum Orbit Flux (Atom Style)
VisualizerEngine.register({
  id: 'quantumOrbit', name: 'Quantum Flux', category: 'Circular',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.3, availH: 0.56, centerYRatio: 0.42, glowMul: 1.2 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, glow } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2 + 20;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const rot = (i * Math.PI) / 3 + motionT * 0.8;
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(rot);
      glowStroke(ctx, i % 2 === 0 ? pal.a : pal.b, 12 * glow);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, baseR * 1.4 + bands.bassS * 20, baseR * 0.5, 0, 0, TAU);
      ctx.stroke();
      const electronAng = motionT * (2 + i) + i;
      const ex = Math.cos(electronAng) * (baseR * 1.4 + bands.bassS * 20);
      const ey = Math.sin(electronAng) * (baseR * 0.5);
      glowFill(ctx, '#ffffff', 10 * glow);
      ctx.beginPath(); ctx.arc(ex, ey, 4, 0, TAU); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
});

// 48. Sound Compass Ring
VisualizerEngine.register({
  id: 'soundCompass', name: 'Sound Compass', category: 'Circular',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.32, availH: 0.58, centerYRatio: 0.42, glowMul: 1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, glow } = api;
    const cx = art.cx, cy = art.cy;
    const r = Math.max(art.w, art.h) / 2 + 18;
    const ticks = 48;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(motionT * 0.2);
    for (let i = 0; i < ticks; i++) {
      const ang = (i / ticks) * TAU;
      const isMajor = i % 6 === 0;
      const tickLen = isMajor ? 16 + bands.bassS * 20 : 6 + bands.trebleS * 10;
      const x1 = Math.cos(ang) * r, y1 = Math.sin(ang) * r;
      const x2 = Math.cos(ang) * (r + tickLen), y2 = Math.sin(ang) * (r + tickLen);
      glowStroke(ctx, isMajor ? pal.a : rgba(pal.b, 0.4), 6 * glow);
      ctx.lineWidth = isMajor ? 2.5 : 1.2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.restore();
  }
});

// 49. Polygon Audio Shield (Morphing Shape)
VisualizerEngine.register({
  id: 'polyShield', name: 'Poly Shield', category: 'Geometric',
  artwork: { shape: 'hexagon', aspect: 1, sizeRatio: 0.3, availH: 0.54, centerYRatio: 0.42, glowMul: 1.1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, sens, glow } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2 + 10;
    const sides = 8;
    const vals = sampleBars(api.freq, api.len, sides);
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const t = (i % sides) / sides;
      const ang = t * TAU - Math.PI / 2 + motionT * 0.4;
      const r = baseR + vals[i % sides] * 40 * sens + bands.beat * 15;
      const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    glowStroke(ctx, pal.a, 16 * glow);
    ctx.lineWidth = 3; ctx.stroke();
    glowStroke(ctx, pal.b, 8 * glow);
    ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }
});

// 50. Supernova Audio Shockwave
VisualizerEngine.register({
  id: 'supernova', name: 'Supernova', category: 'Cinematic',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.3, availH: 0.56, centerYRatio: 0.42, glowMul: 1.4 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, glow } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2;
    const shockR = baseR + 20 + (bands.beat * 80) + (bands.bassS * 30);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createRadialGradient(cx, cy, baseR * 0.6, cx, cy, shockR);
    grad.addColorStop(0, rgba(pal.a, 0.6 * glow));
    grad.addColorStop(0.7, rgba(pal.b, 0.2 * glow));
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, shockR, 0, TAU); ctx.fill();
    glowStroke(ctx, '#ffffff', 14 * glow);
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx, cy, shockR * 0.9, 0, TAU); ctx.stroke();
    ctx.restore();
  }
});

/* =====================================================================
   7. RETRO & VINYL TURNTABLE FAMILY (51-60)
   ===================================================================== */

// 51. Classic Vinyl Turntable
VisualizerEngine.register({
  id: 'classicVinyl', name: 'Classic Vinyl', category: 'Retro',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.38, availH: 0.58, centerYRatio: 0.42, glowMul: 0.8 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, glow } = api;
    const r = Math.max(art.w, art.h) * 0.62;
    rotation += (state.isPlaying ? 0.025 : 0.001);
    drawVinylDisc(ctx, art.cx, art.cy, r, rotation, pal, state.artworkImage, glow);
    drawToneArm(ctx, art.cx, art.cy, r, state.isPlaying);
  }
});

// 52. Golden Turntable
VisualizerEngine.register({
  id: 'goldVinyl', name: 'Golden Vinyl', category: 'Retro',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.38, availH: 0.58, centerYRatio: 0.42, glowMul: 1.2 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, glow } = api;
    const r = Math.max(art.w, art.h) * 0.62;
    rotation += (state.isPlaying ? 0.028 : 0.001);
    const goldPal = { a: '#fbbf24', b: '#d97706' };
    drawVinylDisc(ctx, art.cx, art.cy, r, rotation, goldPal, state.artworkImage, glow);
    glowStroke(ctx, '#fbbf24', 12 * glow);
    ctx.beginPath(); ctx.arc(art.cx, art.cy, r + 4, 0, TAU); ctx.stroke();
    drawToneArm(ctx, art.cx, art.cy, r, state.isPlaying);
  }
});

// 53. Neon Cyber Turntable
VisualizerEngine.register({
  id: 'cyberTurntable', name: 'Cyber Turntable', category: 'Retro',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.36, availH: 0.58, centerYRatio: 0.42, glowMul: 1.3 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, sens, glow } = api;
    const r = Math.max(art.w, art.h) * 0.62;
    rotation += (state.isPlaying ? 0.03 : 0.002);
    drawVinylDisc(ctx, art.cx, art.cy, r, rotation, pal, state.artworkImage, glow);
    
    // Reactive Neon Ring around Vinyl
    const rings = 40;
    const vals = sampleBars(api.freq, api.len, rings);
    ctx.save();
    for (let i = 0; i < rings; i++) {
      const ang = (i / rings) * TAU + rotation;
      const h = vals[i] * 35 * sens + bands.beat * 8;
      const x1 = art.cx + Math.cos(ang) * (r + 4);
      const y1 = art.cy + Math.sin(ang) * (r + 4);
      const x2 = art.cx + Math.cos(ang) * (r + 4 + h);
      const y2 = art.cy + Math.sin(ang) * (r + 4 + h);
      glowStroke(ctx, pal.a, 8 * glow);
      ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.restore();
    drawToneArm(ctx, art.cx, art.cy, r, state.isPlaying);
  }
});

// 54. Vintage Cassette Tape Player
VisualizerEngine.register({
  id: 'cassetteTape', name: 'Cassette Tape', category: 'Retro',
  artwork: { shape: 'rectangle', aspect: 1.5, sizeRatio: 0.44, availH: 0.48, centerYRatio: 0.38, glowMul: 0.8 },
  layer: 'front',
  renderFront(api) {
    const { ctx, art, pal, glow } = api;
    const cx = art.cx, cy = art.cy;
    rotation += state.isPlaying ? 0.04 : 0;
    ctx.save();
    // Dual Spinning Spools
    [-45, 45].forEach(offsetX => {
      const sx = cx + offsetX, sy = cy + 10;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(rotation);
      ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU);
      ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.strokeStyle = '#12101a'; ctx.lineWidth = 3; ctx.stroke();
      for (let i = 0; i < 3; i++) {
        ctx.rotate(TAU / 3);
        ctx.fillStyle = '#12101a';
        ctx.fillRect(-2, -15, 4, 8);
      }
      ctx.restore();
    });
    ctx.restore();
  }
});

// 55. Dual Analog VU Needle Deck
VisualizerEngine.register({
  id: 'vuMeterDeck', name: 'Analog VU Deck', category: 'Retro',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.32, availH: 0.42, centerYRatio: 0.32, glowMul: 0.9 },
  layer: 'front',
  renderFront(api) {
    const { ctx, region, pal } = api;
    const meterW = region.w * 0.38, meterH = region.h * 0.16;
    const y = region.y + region.h * 0.74;
    [-1, 1].forEach((dir) => {
      const x = region.x + region.w / 2 + dir * (meterW / 2 + 10) - meterW / 2;
      ctx.save();
      ctx.fillStyle = '#181622';
      roundRect(ctx, x, y, meterW, meterH, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.stroke();

      // Dial Arc
      ctx.beginPath(); ctx.arc(x + meterW / 2, y + meterH * 0.9, meterW * 0.4, Math.PI * 1.2, Math.PI * 1.8);
      ctx.strokeStyle = '#ff7675'; ctx.lineWidth = 2; ctx.stroke();

      // Bouncing Needle
      const val = dir === -1 ? bands.bassS : bands.trebleS;
      const needleAng = Math.PI * 1.2 + clamp(val * 0.9, 0, 1) * (Math.PI * 0.6);
      ctx.beginPath();
      ctx.moveTo(x + meterW / 2, y + meterH * 0.9);
      ctx.lineTo(x + meterW / 2 + Math.cos(needleAng) * meterW * 0.42, y + meterH * 0.9 + Math.sin(needleAng) * meterW * 0.42);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    });
  }
});

// 56. Compact Disc (CD) Jewel Player
VisualizerEngine.register({
  id: 'compactDisc', name: 'Compact Disc (CD)', category: 'Retro',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.38, availH: 0.58, centerYRatio: 0.42, glowMul: 1.1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, glow } = api;
    const r = Math.max(art.w, art.h) * 0.6;
    rotation += state.isPlaying ? 0.035 : 0.002;
    ctx.save();
    ctx.translate(art.cx, art.cy);
    ctx.rotate(rotation);
    // Silver Rainbow CD Disc
    const grad = ctx.createConicGradient(0, 0, 0);
    grad.addColorStop(0, '#e4e7eb'); grad.addColorStop(0.25, '#74b9ff');
    grad.addColorStop(0.5, '#fab1a0'); grad.addColorStop(0.75, '#55efc4');
    grad.addColorStop(1, '#e4e7eb');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();

    // Center Transparent Ring & Hole
    ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, TAU);
    ctx.fillStyle = '#0a0a0f'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, TAU);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fill();
    ctx.restore();
  }
});

// 57. Neumorphic Clean Turntable
VisualizerEngine.register({
  id: 'neumorphicVinyl', name: 'Neumorph Vinyl', category: 'Retro',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.36, availH: 0.58, centerYRatio: 0.42, glowMul: 0.7 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal } = api;
    const r = Math.max(art.w, art.h) * 0.62;
    rotation += state.isPlaying ? 0.025 : 0.001;
    // Soft Clean Disc
    ctx.save();
    ctx.translate(art.cx, art.cy);
    ctx.beginPath(); ctx.arc(0, 0, r + 14, 0, TAU);
    ctx.fillStyle = '#1c1b26'; ctx.fill();
    ctx.restore();
    drawVinylDisc(ctx, art.cx, art.cy, r, rotation, pal, state.artworkImage, 0.4);
    drawToneArm(ctx, art.cx, art.cy, r, state.isPlaying);
  }
});

// 58. Reel-to-Reel Studio Deck
VisualizerEngine.register({
  id: 'reelDeck', name: 'Reel-To-Reel', category: 'Retro',
  artwork: { shape: 'rectangle', aspect: 1.4, sizeRatio: 0.38, availH: 0.45, centerYRatio: 0.34, glowMul: 0.9 },
  layer: 'front',
  renderFront(api) {
    const { ctx, art, pal } = api;
    rotation += state.isPlaying ? 0.03 : 0.001;
    [-60, 60].forEach((offset) => {
      const rx = art.cx + offset, ry = art.cy - 10;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(rotation);
      ctx.beginPath(); ctx.arc(0, 0, 28, 0, TAU);
      ctx.strokeStyle = '#dfe6e9'; ctx.lineWidth = 3; ctx.stroke();
      for (let i = 0; i < 3; i++) {
        ctx.rotate(TAU / 3);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 26);
        ctx.strokeStyle = pal.a; ctx.lineWidth = 2.5; ctx.stroke();
      }
      ctx.restore();
    });
  }
});

// 59. Gramophone Horn Audio Wave
VisualizerEngine.register({
  id: 'gramophoneHorn', name: 'Gramophone Horn', category: 'Retro',
  artwork: { shape: 'circle', aspect: 1, sizeRatio: 0.32, availH: 0.54, centerYRatio: 0.42, glowMul: 1 },
  layer: 'behind',
  renderBehind(api) {
    const { ctx, art, pal, glow } = api;
    const cx = art.cx, cy = art.cy;
    const baseR = Math.max(art.w, art.h) / 2 + 10;
    const petals = 12;
    ctx.save();
    for (let i = 0; i < petals; i++) {
      const ang = (i / petals) * TAU + motionT * 0.2;
      const hornR = baseR + 25 + bands.bassS * 40;
      const x = cx + Math.cos(ang) * hornR, y = cy + Math.sin(ang) * hornR;
      glowStroke(ctx, i % 2 === 0 ? pal.a : pal.b, 10 * glow);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 16 + bands.beat * 8, 0, TAU); ctx.stroke();
    }
    ctx.restore();
  }
});

// 60. Retro Stereo Equalizer Bars
VisualizerEngine.register({
  id: 'retroEqualizer', name: 'Retro EQ Stack', category: 'Retro',
  artwork: { shape: 'rounded', aspect: 1, sizeRatio: 0.36, availH: 0.46, centerYRatio: 0.36, glowMul: 0.9 },
  layer: 'front',
  renderFront(api) {
    const { ctx, region, pal, sens, glow } = api;
    const bandsCount = 20;
    const width = region.w * 0.82;
    const startX = region.x + (region.w - width) / 2;
    const bottom = region.y + region.h * 0.92;
    const bw = width / bandsCount - 6;
    const vals = sampleBars(api.freq, api.len, bandsCount);
    ctx.save();
    for (let i = 0; i < bandsCount; i++) {
      const blocks = Math.round(vals[i] * 12 * sens);
      const x = startX + i * (bw + 6);
      for (let b = 0; b < blocks; b++) {
        const y = bottom - b * 10;
        const color = b > 9 ? '#ff4757' : b > 6 ? '#ffa502' : '#2ed573';
        glowFill(ctx, color, 6 * glow);
        roundRect(ctx, x, y, bw, 7, 2); ctx.fill();
      }
    }
    ctx.restore();
  }
});