/* =====================================================================
   PART 3: Artwork, Background & Text/Lyrics Renderers (Updated)
   File Name Suggestion: 03-renderers.js (ya renderers.js)
   ===================================================================== */

/* ---------------------------------------------------------------
   8. Color system — resolves the active palette for this frame.
   theme:    two theme colors
   gradient: user primary + secondary custom colors
   rainbow:  hue continuously cycling, modulated by audio
   --------------------------------------------------------------- */
let rainbowHue = 260;
function paletteColors(tNow) {
  if (state.colorMode === 'rainbow') {
    rainbowHue += 0.12 + bands.volumeS * 0.4;
    const a = hslHex(rainbowHue, 78, 68);
    const b = hslHex(rainbowHue + 55, 78, 55);
    return { a, b };
  }
  if (state.colorMode === 'gradient') {
    return { a: state.theme.a, b: state.secondaryColor };
  }
  return { a: state.theme.a, b: state.theme.b };
}
function toneColor(pal, t) { return mixHex(pal.a, pal.b, clamp(t, 0, 1)); }

/* ---------------------------------------------------------------
   9. Particle systems (shared by several visualizers)
   --------------------------------------------------------------- */
function makeBgParticle(W, H) {
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.8 + 0.6,
    baseA: Math.random() * 0.35 + 0.08,
    vx: (Math.random() - 0.5) * 0.06,
    vy: (Math.random() - 0.5) * 0.06,
    tw: Math.random() * TAU,
  };
}
let bgParticles = [];
function ensureBgParticles(W, H) {
  const target = 60;
  while (bgParticles.length < target) bgParticles.push(makeBgParticle(W, H));
  if (bgParticles.length > target) bgParticles.length = target;
}

function makeFxParticle(cx, cy, spread) {
  const ang = Math.random() * TAU;
  const dist = Math.random() * spread;
  return {
    x: cx + Math.cos(ang) * dist,
    y: cy + Math.sin(ang) * dist,
    ang,
    speed: Math.random() * 0.4 + 0.15,
    r: Math.random() * 2.4 + 1,
    life: Math.random(),
    decay: Math.random() * 0.004 + 0.0015,
  };
}
let fxParticles = [];
function stepFxParticlePool(target, cx, cy, spread) {
  while (fxParticles.length < target) fxParticles.push(makeFxParticle(cx, cy, spread));
  if (fxParticles.length > target) fxParticles.length = target;
  return fxParticles;
}

/* ---------------------------------------------------------------
   10. Artwork Renderer — visualizer-aware artwork box.
   --------------------------------------------------------------- */
const ArtworkRenderer = {
  getConfig(region) {
    const vis = VisualizerEngine.get(state.mode);
    const base = (vis && vis.artwork) || { shape: 'rounded', aspect: 1, sizeRatio: 0.42, glowMul: 1 };
    const uw = state.artwork;
    const shape = uw.shapeMode === 'auto' ? base.shape : uw.shapeMode;

    const availH = base.availH != null ? region.h * base.availH : region.h * 0.55;
    let baseSize = clamp(Math.min(region.w * (base.sizeRatio || 0.42), availH), 70, 460);
    baseSize *= (uw.size || 100) / 100;

    let aspect = base.aspect || 1;
    if (shape === 'landscape') aspect = 1.6;
    else if (shape === 'portrait') aspect = 0.68;
    else if (shape === 'rectangle') aspect = 1.35;
    else if (shape === 'square' || shape === 'circle' || shape === 'hexagon' || shape === 'diamond' || shape === 'rounded') aspect = 1;

    let w = baseSize * Math.sqrt(aspect) * ((uw.width || 100) / 100);
    let h = baseSize / Math.sqrt(aspect) * ((uw.height || 100) / 100);
    w = clamp(w, 50, region.w * 0.94);
    h = clamp(h, 50, region.h * 0.85);

    const cx = region.x + region.w / 2 + (uw.posX || 0) / 100 * region.w * 0.3;
    const centerYRatio = base.centerYRatio != null ? base.centerYRatio : 0.42;
    const y = (region.y + region.h * centerYRatio) - h / 2 + (uw.posY || 0) / 100 * region.h * 0.3;
    const x = cx - w / 2;

    const radiusFrac = (shape === 'square' || shape === 'rectangle') ? 0.02 : 0.14;
    const radius = Math.min(w, h) * radiusFrac * ((uw.radius != null ? uw.radius : 100) / 100);

    return {
      shape, x, y, w, h, radius,
      cx: x + w / 2, cy: y + h / 2,
      border: uw.border, borderWidth: uw.borderWidth,
      glow: uw.glow, glowIntensity: ((uw.glowIntensity != null ? uw.glowIntensity : 100) / 100) * (base.glowMul || 1),
      shadow: uw.shadow, opacity: (uw.opacity != null ? uw.opacity : 100) / 100,
      pulse: uw.pulse,
    };
  },

  shapePath(ctx, shape, x, y, w, h, radius) {
    const cx = x + w / 2, cy = y + h / 2;
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, TAU);
    } else if (shape === 'hexagon') {
      polygonPath(ctx, cx, cy, Math.min(w, h) / 2, 6, -Math.PI / 2);
    } else if (shape === 'diamond') {
      polygonPath(ctx, cx, cy, Math.min(w, h) / 2 * 1.12, 4, -Math.PI / 2);
    } else {
      roundRect(ctx, x, y, w, h, radius);
    }
  },

  drawDefaultArt(ctx, x, y, w, h, accentA, accentB) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, mixHex(accentA, '#12101a', 0.35));
    g.addColorStop(1, '#100e17');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = rgba(accentA, 0.85);
    ctx.lineWidth = Math.max(2, Math.min(w, h) * 0.02);
    ctx.lineCap = 'round';
    const bars = 9;
    const gap = w * 0.06;
    const bw = (w * 0.6 - gap * (bars - 1)) / bars;
    const baseX = x + w * 0.2;
    const midY = y + h * 0.52;
    for (let i = 0; i < bars; i++) {
      const barH = h * (0.10 + 0.28 * Math.abs(Math.sin(i * 1.4 + 0.6)));
      ctx.beginPath();
      ctx.moveTo(baseX + i * (bw + gap), midY - barH / 2);
      ctx.lineTo(baseX + i * (bw + gap), midY + barH / 2);
      ctx.stroke();
    }
  },

  draw(ctx, region, pal) {
    const cfg = this.getConfig(region);
    const glowAmt = (state.settings.glowIntensity / 100) * cfg.glowIntensity;
    const pulse = cfg.pulse ? (1 + bands.beat * 0.55 + bands.bassS * 0.06) : 1;
    const glowR = Math.max(cfg.w, cfg.h) * (0.55 + 0.4 * glowAmt) * pulse;

    if (cfg.glow) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(cfg.cx, cfg.cy, Math.min(cfg.w, cfg.h) * 0.2, cfg.cx, cfg.cy, glowR);
      g.addColorStop(0, rgba(pal.a, (0.35 * glowAmt + bands.beat * 0.25) * cfg.opacity));
      g.addColorStop(1, rgba(pal.a, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cfg.cx, cfg.cy, glowR, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    const scale = cfg.pulse ? (1 + bands.beat * 0.028 + bands.bassS * 0.01) : 1;
    const dw = cfg.w * scale, dh = cfg.h * scale;
    const dx = cfg.x - (dw - cfg.w) / 2, dy = cfg.y - (dh - cfg.h) / 2;

    ctx.save();
    if (cfg.shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = Math.min(dw, dh) * 0.12;
      ctx.shadowOffsetY = Math.min(dw, dh) * 0.03;
    }
    ctx.globalAlpha = cfg.opacity;
    this.shapePath(ctx, cfg.shape, dx, dy, dw, dh, cfg.radius);
    ctx.clip();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
    if (state.artworkImage) {
      const iw = state.artworkImage.width, ih = state.artworkImage.height;
      const boxRatio = dw / dh, imgRatio = iw / ih;
      let sx, sy, sw, sh;
      if (imgRatio > boxRatio) { sh = ih; sw = ih * boxRatio; sy = 0; sx = (iw - sw) / 2; }
      else { sw = iw; sh = iw / boxRatio; sx = 0; sy = (ih - sh) / 2; }
      ctx.drawImage(state.artworkImage, sx, sy, sw, sh, dx, dy, dw, dh);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(dx, dy, dw, dh);
    } else {
      this.drawDefaultArt(ctx, dx, dy, dw, dh, pal.a, pal.b);
    }
    ctx.restore();

    if (cfg.border && cfg.borderWidth > 0) {
      ctx.save();
      ctx.globalAlpha = cfg.opacity;
      this.shapePath(ctx, cfg.shape, dx, dy, dw, dh, cfg.radius);
      ctx.lineWidth = cfg.borderWidth;
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.stroke();
      ctx.restore();
    }

    return { x: dx, y: dy, w: dw, h: dh, cx: cfg.cx, cy: cfg.cy, shape: cfg.shape };
  },
};

/* ---------------------------------------------------------------
   11. Background Renderer — with Video / GIF loop support
   --------------------------------------------------------------- */
const BackgroundRenderer = {
  draw(ctx, W, H, tNow, pal) {
    if (state.customBgMedia && state.bgType === 'custom') {
      try {
        ctx.save();
        const media = state.customBgMedia;
        const mw = media.videoWidth || media.width || W;
        const mh = media.videoHeight || media.height || H;
        const scale = Math.max(W / mw, H / mh);
        const dw = mw * scale, dh = mh * scale;
        const dx = (W - dw) / 2, dy = (H - dh) / 2;
        ctx.drawImage(media, dx, dy, dw, dh);

        const bgAmt = state.settings.backgroundIntensity / 100;
        ctx.fillStyle = `rgba(5, 5, 8, ${clamp(1 - bgAmt * 0.7, 0.2, 0.9)})`;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      } catch (e) {
        this.draw_nebula(ctx, W, H, tNow, pal);
      }
    } else {
      const type = state.bgType;
      const fn = this[`draw_${type}`] || this.draw_nebula;
      fn.call(this, ctx, W, H, tNow, pal);
    }

    const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  },

  base(ctx, W, H) {
    const base = ctx.createLinearGradient(0, 0, 0, H);
    base.addColorStop(0, '#08070c');
    base.addColorStop(1, '#050508');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);
  },

  twinkle(ctx, W, H, bgAmt, energy) {
    ensureBgParticles(W, H);
    ctx.save();
    bgParticles.forEach((p) => {
      p.x += p.vx * (1 + energy); p.y += p.vy * (1 + energy);
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      p.tw += 0.02;
      const alpha = p.baseA * (0.5 + 0.5 * Math.sin(p.tw)) * (0.4 + bgAmt);
      ctx.fillStyle = rgba('#ffffff', alpha * 0.5);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, TAU);
      ctx.fill();
    });
    ctx.restore();
  },

  draw_nebula(ctx, W, H, tNow, pal) {
    this.base(ctx, W, H);
    const bgAmt = state.settings.backgroundIntensity / 100;
    const spd = state.settings.bgSpeed / 100;
    const c1 = state.artworkImage ? state.artworkColor : pal.a;
    const energy = bands.volumeS;
    const pulse = 1 + bands.beat * 0.35;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const blobs = [
      { cx: W * (0.28 + 0.03 * Math.sin(tNow * 0.00012 * spd)), cy: H * (0.32 + 0.02 * Math.cos(tNow * 0.00015 * spd)), col: c1, rr: Math.max(W, H) * 0.34 },
      { cx: W * (0.75 + 0.03 * Math.cos(tNow * 0.00010 * spd)), cy: H * (0.6 + 0.03 * Math.sin(tNow * 0.00013 * spd)), col: pal.b, rr: Math.max(W, H) * 0.30 },
      { cx: W * 0.5, cy: H * 0.46, col: pal.a, rr: Math.max(W, H) * 0.22 * pulse },
    ];
    blobs.forEach((bl) => {
      const rad = ctx.createRadialGradient(bl.cx, bl.cy, 0, bl.cx, bl.cy, bl.rr * (0.6 + energy * 0.6));
      rad.addColorStop(0, rgba(bl.col, 0.16 * bgAmt * (0.6 + energy)));
      rad.addColorStop(1, rgba(bl.col, 0));
      ctx.fillStyle = rad;
      ctx.beginPath(); ctx.arc(bl.cx, bl.cy, bl.rr * (0.6 + energy * 0.6), 0, TAU); ctx.fill();
    });
    ctx.restore();
    this.twinkle(ctx, W, H, bgAmt, energy);
  },

  draw_gradient(ctx, W, H, tNow, pal) {
    const bgAmt = state.settings.backgroundIntensity / 100;
    const spd = state.settings.bgSpeed / 100;
    const ang = (tNow * 0.00005 * spd) % TAU;
    const x1 = W / 2 + Math.cos(ang) * W * 0.6, y1 = H / 2 + Math.sin(ang) * H * 0.6;
    const x2 = W / 2 - Math.cos(ang) * W * 0.6, y2 = H / 2 - Math.sin(ang) * H * 0.6;
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    g.addColorStop(0, mixHex(pal.a, '#050508', 1 - 0.35 * bgAmt));
    g.addColorStop(0.5, '#08070c');
    g.addColorStop(1, mixHex(pal.b, '#050508', 1 - 0.35 * bgAmt));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    this.twinkle(ctx, W, H, bgAmt * 0.6, bands.volumeS);
  },

  draw_stars(ctx, W, H, tNow, pal) {
    this.base(ctx, W, H);
    const bgAmt = state.settings.backgroundIntensity / 100;
    this.twinkle(ctx, W, H, bgAmt * 1.4, bands.volumeS);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const x = W * (0.2 + i * 0.3), y = H * 0.2;
      const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(W, H) * 0.18);
      g.addColorStop(0, rgba(i % 2 ? pal.a : pal.b, 0.08 * bgAmt));
      g.addColorStop(1, rgba(pal.a, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  },

  draw_grid(ctx, W, H, tNow, pal) {
    this.base(ctx, W, H);
    const bgAmt = state.settings.backgroundIntensity / 100;
    const spd = state.settings.bgSpeed / 100;
    const spacing = Math.max(W, H) * 0.055;
    const offset = (tNow * 0.00006 * spd) % spacing;
    ctx.save();
    ctx.strokeStyle = rgba(pal.a, 0.08 * bgAmt + bands.bassS * 0.05);
    ctx.lineWidth = 1;
    for (let x = -spacing; x < W + spacing; x += spacing) {
      ctx.beginPath(); ctx.moveTo(x + offset, 0); ctx.lineTo(x + offset, H); ctx.stroke();
    }
    for (let y = -spacing; y < H + spacing; y += spacing) {
      ctx.beginPath(); ctx.moveTo(0, y + offset * 0.6); ctx.lineTo(W, y + offset * 0.6); ctx.stroke();
    }
    ctx.restore();
    const vig2 = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, Math.max(W, H) * 0.6);
    vig2.addColorStop(0, rgba(pal.b, 0.10 * bgAmt));
    vig2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = vig2; ctx.fillRect(0, 0, W, H);
  },

  draw_aurora(ctx, W, H, tNow, pal) {
    this.base(ctx, W, H);
    const bgAmt = state.settings.backgroundIntensity / 100;
    const spd = state.settings.bgSpeed / 100;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let band = 0; band < 3; band++) {
      ctx.beginPath();
      const baseY = H * (0.25 + band * 0.18);
      for (let x = 0; x <= W; x += W / 40) {
        const t = tNow * 0.0001 * spd + band * 2.1;
        const y = baseY + Math.sin(x * 0.006 + t) * H * 0.05 * (1 + bands.midS) + Math.sin(x * 0.002 - t * 1.3) * H * 0.03;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.lineTo(W, 0); ctx.lineTo(0, 0); ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, H * 0.5);
      g.addColorStop(0, rgba(band % 2 ? pal.b : pal.a, 0.12 * bgAmt));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fill();
    }
    ctx.restore();
    this.twinkle(ctx, W, H, bgAmt * 0.5, bands.volumeS);
  },

  draw_noise(ctx, W, H, tNow, pal) {
    this.base(ctx, W, H);
    const bgAmt = state.settings.backgroundIntensity / 100;
    ctx.save();
    ctx.globalAlpha = 0.05 * bgAmt + 0.02;
    const cell = 3;
    const cols = Math.ceil(W / (cell * 6)), rows = Math.ceil(H / (cell * 6));
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (Math.random() > 0.5) continue;
        ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : pal.a;
        ctx.fillRect(i * cell * 6 + Math.random() * 4, j * cell * 6 + Math.random() * 4, cell, cell);
      }
    }
    ctx.restore();
    this.twinkle(ctx, W, H, bgAmt * 0.3, bands.volumeS);
  },

  draw_solid(ctx, W, H, tNow, pal) {
    ctx.fillStyle = '#07060b';
    ctx.fillRect(0, 0, W, H);
    const bgAmt = state.settings.backgroundIntensity / 100;
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
    g.addColorStop(0, rgba(pal.a, 0.05 * bgAmt + bands.beat * 0.04));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
};

/* ---------------------------------------------------------------
   12. Text & Synchronized Lyrics Renderer
   --------------------------------------------------------------- */
const TextRenderer = {
  draw(ctx, region, titleText, artistText) {
    const cx = region.x + region.w / 2;
    const maxWidth = region.w * 0.75;
    let y = region.y + region.h * 0.055;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // Song Title
    if (state.showTitle) {
      const targetSize = clamp(region.h * 0.030, 12, 22);
      const minSize = Math.max(9, targetSize * 0.55);
      const { lines, fontSize } = TitleParser.wrapAndFit(
        ctx, titleText || 'No track loaded', maxWidth, targetSize, minSize, 2, "'Space Grotesk', sans-serif", 700
      );
      ctx.fillStyle = '#f5f4fa';
      ctx.font = `700 ${fontSize}px 'Space Grotesk', sans-serif`;
      const lineGap = fontSize * 1.18;
      lines.forEach((line, i) => {
        ctx.fillText(line, cx, y + fontSize + i * lineGap);
      });
      y += fontSize + (lines.length - 1) * lineGap + fontSize * 0.45;
    }

    // Artist
    if (state.showArtist && artistText) {
      const artistSize = clamp(region.h * 0.017, 9, 13);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = `500 ${artistSize}px 'Inter', sans-serif`;
      ctx.fillText(TitleParser.truncateForCanvas(ctx, artistText, maxWidth), cx, y + artistSize);
      y += artistSize + 10;
    }

    // Synchronized Karaoke Lyrics
    if (state.showLyrics && state.lyrics && state.lyrics.length > 0) {
      const curLyric = LyricsParser.getCurrentLine(state.lyrics, audioEl.currentTime);
      if (curLyric) {
        const lyricY = region.y + region.h * 0.88;
        const lyricSize = clamp(region.h * 0.024, 13, 20);
        ctx.font = `600 ${lyricSize}px 'Space Grotesk', sans-serif`;
        ctx.shadowColor = state.theme.a;
        ctx.shadowBlur = 14 + bands.beat * 8;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(TitleParser.truncateForCanvas(ctx, curLyric, region.w * 0.85), cx, lyricY);
      }
    }

    ctx.restore();
  },
};