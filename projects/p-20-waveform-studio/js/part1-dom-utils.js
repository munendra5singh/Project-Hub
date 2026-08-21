/* =====================================================================
   PART 1: DOM Elements, Utilities, Title & LRC Parser
   ===================================================================== */
'use strict';

const $ = (id) => document.getElementById(id);

const stageCanvas   = $('stage');
const stageCtx      = stageCanvas.getContext('2d');
const appEl         = $('app');
const topbarEl      = $('topbar');
const transportEl   = $('transport');
const stageUiEl     = $('stageUi');
const uploadHintEl  = $('uploadHint');

const audioEl       = $('audioEl');
const bgVideoEl     = $('bgVideoEl'); // New: Video background element
const songFileInput = $('songFileInput');
const artFileInput  = $('artFileInput');
const bgMediaInput  = $('bgMediaInput'); // New: Custom BG Input
const lrcFileInput  = $('lrcFileInput'); // New: LRC Input

const dropOverlay   = $('dropOverlay');

const songTitleTop  = $('songTitleTop');
const artistTop     = $('artistTop');
const titleInput    = $('titleInput');
const artistInput   = $('artistInput');

const playBtn       = $('playBtn');
const playIcon      = $('playIcon');
const pauseIcon     = $('pauseIcon');
const prevBtn       = $('prevBtn');
const nextBtn       = $('nextBtn');
const shuffleBtn    = $('shuffleBtn');
const repeatBtn     = $('repeatBtn');

const seekBar        = $('seekBar');
const seekFill        = $('seekFill');
const curTimeEl       = $('curTime');
const durTimeEl       = $('durTime');

const volumeSlider   = $('volumeSlider');
const muteBtn        = $('muteBtn');
const volIconOn      = $('volIconOn');
const volIconOff     = $('volIconOff');
const speedSelect    = $('speedSelect');

const uploadSongBtn       = $('uploadSongBtn');
const uploadSongBtnCenter = $('uploadSongBtnCenter');
const uploadArtBtn        = $('uploadArtBtn');
const removeArtBtn        = $('removeArtBtn');     // New: Clear artwork
const uploadBgMediaBtn    = $('uploadBgMediaBtn'); // New
const removeBgMediaBtn    = $('removeBgMediaBtn'); // New
const uploadLrcBtn        = $('uploadLrcBtn');     // New
const removeLrcBtn        = $('removeLrcBtn');     // New

const playlistBtn      = $('playlistBtn');
const playlistPanel    = $('playlistPanel');
const closePlaylistBtn = $('closePlaylistBtn');
const addSongBtn       = $('addSongBtn');
const playlistItemsEl  = $('playlistItems');
const playlistEmptyHint = $('playlistEmptyHint');

const settingsBtn      = $('settingsBtn');
const settingsPanel    = $('settingsPanel');
const closeSettingsBtn = $('closeSettingsBtn');
const modeGrid           = $('modeGrid');
const modeCategoryRow    = $('modeCategoryRow');
const modeCount          = $('modeCount');
const themeRow           = $('themeRow');
const customColorInput   = $('customColorInput');
const secondaryColorInput = $('secondaryColorInput');
const secondaryColorGroup = $('secondaryColorGroup');
const colorModeRow       = $('colorModeRow');
const resetSettingsBtn   = $('resetSettingsBtn');

const artworkShapeRow        = $('artworkShapeRow');
const artworkBorderToggle    = $('artworkBorderToggle');
const artworkGlowToggle      = $('artworkGlowToggle');
const artworkShadowToggle    = $('artworkShadowToggle');
const artworkPulseToggle     = $('artworkPulseToggle');

const bgTypeRow        = $('bgTypeRow');
const mirrorToggle     = $('mirrorToggle');
const showLyricsToggle = $('showLyricsToggle'); // New
const showTitleToggle  = $('showTitleToggle');
const showArtistToggle = $('showArtistToggle');

const presetGrid      = $('presetGrid');
const savePresetBtn   = $('savePresetBtn');
const deletePresetBtn = $('deletePresetBtn');
const randomizeBtn    = $('randomizeBtn');

const fullscreenBtn = $('fullscreenBtn');

const exportBtn        = $('exportBtn');
const exportBackdrop   = $('exportBackdrop');
const closeExportBtn   = $('closeExportBtn');
const exportSetup      = $('exportSetup');
const exportProgress   = $('exportProgress');
const exportDone       = $('exportDone');
const resOptions       = $('resOptions');
const fpsOptions       = $('fpsOptions'); // New: 30 / 60 FPS
const aspectOptions    = $('aspectOptions');
const formatOptions    = $('formatOptions');
const mp4Chip          = $('mp4Chip');
const formatHint       = $('formatHint');
const startExportBtn   = $('startExportBtn');
const cancelExportBtn  = $('cancelExportBtn');
const ringFg           = $('ringFg');
const progressPct      = $('progressPct');
const progressStatus   = $('progressStatus');
const downloadVideoBtn = $('downloadVideoBtn');
const downloadAudioBtn = $('downloadAudioBtn');
const exportAnotherBtn = $('exportAnotherBtn');

const restoreBackdrop  = $('restoreBackdrop');
const restoreSessionBtn = $('restoreSessionBtn');
const startFreshBtn    = $('startFreshBtn');

const toastEl = $('toast');

const sliders = {
  sensitivity: $('sensitivity'),
  smoothing: $('smoothing'),
  glowIntensity: $('glowIntensity'),
  particleAmount: $('particleAmount'),
  bassResponse: $('bassResponse'),
  backgroundIntensity: $('backgroundIntensity'),
  rotationSpeed: $('rotationSpeed'),
  midResponse: $('midResponse'),
  trebleResponse: $('trebleResponse'),
  beatIntensity: $('beatIntensity'),
  glowRadius: $('glowRadius'),
  motionSpeed: $('motionSpeed'),
  bgSpeed: $('bgSpeed'),
  artworkSize: $('artworkSize'),
  artworkPosX: $('artworkPosX'),
  artworkPosY: $('artworkPosY'),
  artworkWidth: $('artworkWidth'),
  artworkHeight: $('artworkHeight'),
  artworkRadius: $('artworkRadius'),
  artworkBorderWidth: $('artworkBorderWidth'),
  artworkGlowIntensity: $('artworkGlowIntensity'),
  artworkOpacity: $('artworkOpacity'),
};

const sliderVals = {
  sensitivity: $('valSensitivity'),
  smoothing: $('valSmoothing'),
  glowIntensity: $('valGlow'),
  particleAmount: $('valParticles'),
  bassResponse: $('valBass'),
  backgroundIntensity: $('valBackground'),
  rotationSpeed: $('valRotation'),
  midResponse: $('valMidResponse'),
  trebleResponse: $('valTrebleResponse'),
  beatIntensity: $('valBeatIntensity'),
  glowRadius: $('valGlowRadius'),
  motionSpeed: $('valMotionSpeed'),
  bgSpeed: $('valBgSpeed'),
  artworkSize: $('valArtworkSize'),
  artworkPosX: $('valArtworkPosX'),
  artworkPosY: $('valArtworkPosY'),
  artworkWidth: $('valArtworkWidth'),
  artworkHeight: $('valArtworkHeight'),
  artworkRadius: $('valArtworkRadius'),
  artworkBorderWidth: $('valArtworkBorderWidth'),
  artworkGlowIntensity: $('valArtworkGlowIntensity'),
  artworkOpacity: $('valArtworkOpacity'),
};

const DECIMAL_KEYS = new Set(['sensitivity', 'bassResponse', 'midResponse', 'trebleResponse', 'beatIntensity']);

/* --- Math & Color Utilities --- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

let toastTimer = null;
function showToast(msg, isError = false) {
  toastEl.textContent = msg;
  toastEl.classList.toggle('error', !!isError);
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3800);
}

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 167, g: 139, b: 250 };
}
function rgba(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
function mixHex(hexA, hexB, t) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  const r = Math.round(lerp(a.r, b.r, t));
  const g = Math.round(lerp(a.g, b.g, t));
  const bb = Math.round(lerp(a.b, b.b, t));
  return `rgb(${r},${g},${bb})`;
}
function alphaOf(color, a) {
  if (color.startsWith('rgb(')) return `rgba(${color.slice(4, -1)},${a})`;
  return rgba(color, a);
}
function hslHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function roundRect(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function polygonPath(ctx, cx, cy, radius, sides, rotationRad) {
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const a = rotationRad + (i / sides) * TAU;
    const x = cx + Math.cos(a) * radius, y = cy + Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/* --- Smart Title & Metadata Parser --- */
const TitleParser = {
  PROMO_PHRASES: /\b(official\s+music\s+video|official\s+video|official\s+audio|official\s+lyric\s+video|lyrics?\s+video|full\s+song|new\s+song|full\s+video|original\s+mix)\b/gi,
  PROMO_TAGS: /\b(hd|4k|hq|mp3|ost)\b/gi,
  PROMO_ONLY: /^(official\s+music\s+video|official\s+video|official\s+audio|official\s+lyric\s+video|lyrics?\s+video|full\s+song|new\s+song|full\s+video|original\s+mix|hd|4k|hq|mp3|ost|official|lyrics?|audio|video)$/i,
  SEPARATORS: /\s*[|｜–—]\s*|\s+-\s+/,

  normalizeUnderscores(s) {
    s = s.replace(/_{2,}/g, ' | ');
    s = s.replace(/\s+_\s*|\s*_\s+/g, ' | ');
    s = s.replace(/_/g, ' ');
    return s;
  },

  cleanFilename(filename) {
    let base = String(filename || '').replace(/\.[a-z0-9]{2,5}$/i, '');
    base = base.replace(/\([^)]*\)|\[[^\]]*\]|\{[^}]*\}/g, ' ');
    base = this.normalizeUnderscores(base);
    base = base.replace(/\s+/g, ' ').trim();
    let chunks = base.split(this.SEPARATORS).map(s => s.trim()).filter(Boolean);
    chunks = chunks.map(c => c.replace(this.PROMO_PHRASES, ' ').replace(this.PROMO_TAGS, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
    if (chunks.length > 1 && /^\d{1,3}\.?$/.test(chunks[0])) chunks.shift();
    let title = (chunks[0] || base || 'Untitled').trim();
    let artist = '';
    if (chunks.length > 1 && chunks[1] && chunks[1].length <= 40 && !this.PROMO_ONLY.test(chunks[1])) {
      artist = chunks[1];
    }
    if (title.length > 70) title = title.slice(0, 70).trim();
    return { title: title || 'Untitled', artist };
  },

  async readId3(file) {
    try {
      const head = await file.slice(0, 200000).arrayBuffer();
      const bytes = new Uint8Array(head);
      if (bytes.length < 10 || bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) return null;
      const ver = bytes[3];
      const synchsafe = (b0, b1, b2, b3) => ((b0 & 0x7f) << 21) | ((b1 & 0x7f) << 14) | ((b2 & 0x7f) << 7) | (b3 & 0x7f);
      const tagSize = synchsafe(bytes[6], bytes[7], bytes[8], bytes[9]);
      let offset = 10;
      const end = Math.min(bytes.length, 10 + tagSize);
      const result = {};
      while (offset + 10 <= end) {
        const id = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
        if (!/^[A-Z0-9]{4}$/.test(id)) break;
        let size;
        if (ver >= 4) size = synchsafe(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
        else size = (bytes[offset + 4] << 24) | (bytes[offset + 5] << 16) | (bytes[offset + 6] << 8) | bytes[offset + 7];
        const frameStart = offset + 10;
        if (size <= 0 || frameStart + size > bytes.length) break;
        if (id === 'TIT2' || id === 'TPE1') {
          const enc = bytes[frameStart];
          let text = '';
          const textBytes = bytes.subarray(frameStart + 1, frameStart + size);
          if (enc === 1 || enc === 2) {
            const skip = (textBytes[0] === 0xff || textBytes[0] === 0xfe) ? 2 : 0;
            const arr = [];
            for (let i = skip; i + 1 < textBytes.length; i += 2) arr.push(textBytes[i] | (textBytes[i + 1] << 8));
            text = String.fromCharCode(...arr);
          } else {
            text = new TextDecoder('utf-8').decode(textBytes);
          }
          text = text.replace(/\u0000/g, '').trim();
          if (id === 'TIT2') result.title = text;
          if (id === 'TPE1') result.artist = text;
        }
        offset = frameStart + size;
      }
      return (result.title || result.artist) ? result : null;
    } catch (e) { return null; }
  },

  truncateForCanvas(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
    return t + '…';
  },

  wrapAndFit(ctx, text, maxWidth, startSize, minSize, maxLines, fontFamily, weight) {
    let size = startSize;
    let lines = [];
    while (size >= minSize) {
      ctx.font = `${weight} ${size}px ${fontFamily}`;
      const words = String(text || '').split(/\s+/).filter(Boolean);
      lines = [];
      let cur = '';
      for (const w of words) {
        const attempt = cur ? cur + ' ' + w : w;
        if (ctx.measureText(attempt).width <= maxWidth) { cur = attempt; }
        else {
          if (cur) lines.push(cur);
          cur = w;
        }
      }
      if (cur) lines.push(cur);
      if (lines.length <= maxLines) break;
      size -= 1;
    }
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      ctx.font = `${weight} ${size}px ${fontFamily}`;
      lines[maxLines - 1] = this.truncateForCanvas(ctx, lines[maxLines - 1], maxWidth);
    }
    return { lines, fontSize: size };
  },
};

/* --- Synchronized LRC Lyrics Parser (New) --- */
const LyricsParser = {
  parse(lrcText) {
    const lines = lrcText.split('\n');
    const timeReg = /\[(\d{2}):(\d{2})\.?(\d{2,3})?\]/g;
    const result = [];
    lines.forEach(line => {
      const matches = [...line.matchAll(timeReg)];
      const text = line.replace(timeReg, '').trim();
      if (!text) return;
      matches.forEach(m => {
        const min = parseInt(m[1], 10);
        const sec = parseInt(m[2], 10);
        const ms = m[3] ? parseInt(m[3].padEnd(3, '0').slice(0, 3), 10) : 0;
        const time = min * 60 + sec + ms / 1000;
        result.push({ time, text });
      });
    });
    return result.sort((a, b) => a.time - b.time);
  },
  getCurrentLine(lyrics, curTime) {
    if (!lyrics || !lyrics.length) return '';
    let cur = '';
    for (let i = 0; i < lyrics.length; i++) {
      if (curTime >= lyrics[i].time) cur = lyrics[i].text;
      else break;
    }
    return cur;
  }
};