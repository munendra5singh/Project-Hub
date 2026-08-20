'use strict';
/* =====================================================================
   Waveform Studio
   A self-contained, audio-reactive music visualizer.
   No frameworks. No servers. Everything you see on screen is drawn to
   one <canvas>, which is exactly what makes the "Export Video" feature
   possible: the same draw function that paints your screen also feeds
   the recorder.
   ===================================================================== */

(() => {
  /* ---------------------------------------------------------------
     0. DOM references
     --------------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);

  const stageCanvas   = $('stage');
  const stageCtx      = stageCanvas.getContext('2d');
  const appEl         = $('app');
  const topbarEl      = $('topbar');
  const transportEl   = $('transport');
  const stageUiEl     = $('stageUi');
  const uploadHintEl  = $('uploadHint');

  const audioEl       = $('audioEl');
  const songFileInput = $('songFileInput');
  const artFileInput  = $('artFileInput');

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

  const playlistBtn      = $('playlistBtn');
  const playlistPanel    = $('playlistPanel');
  const closePlaylistBtn = $('closePlaylistBtn');
  const addSongBtn       = $('addSongBtn');
  const playlistItemsEl  = $('playlistItems');
  const playlistEmptyHint = $('playlistEmptyHint');

  const settingsBtn      = $('settingsBtn');
  const settingsPanel    = $('settingsPanel');
  const closeSettingsBtn = $('closeSettingsBtn');
  const modeGrid          = $('modeGrid');
  const themeRow           = $('themeRow');
  const customColorInput   = $('customColorInput');
  const resetSettingsBtn   = $('resetSettingsBtn');

  const fullscreenBtn = $('fullscreenBtn');
  const ytModeBtn      = $('ytModeBtn');

  const exportBtn        = $('exportBtn');
  const exportBackdrop   = $('exportBackdrop');
  const closeExportBtn   = $('closeExportBtn');
  const exportSetup      = $('exportSetup');
  const exportProgress   = $('exportProgress');
  const exportDone       = $('exportDone');
  const resOptions       = $('resOptions');
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

  const toastEl = $('toast');

  const sliders = {
    sensitivity: $('sensitivity'),
    smoothing: $('smoothing'),
    glowIntensity: $('glowIntensity'),
    particleAmount: $('particleAmount'),
    bassResponse: $('bassResponse'),
    backgroundIntensity: $('backgroundIntensity'),
    rotationSpeed: $('rotationSpeed'),
  };
  const sliderVals = {
    sensitivity: $('valSensitivity'),
    smoothing: $('valSmoothing'),
    glowIntensity: $('valGlow'),
    particleAmount: $('valParticles'),
    bassResponse: $('valBass'),
    backgroundIntensity: $('valBackground'),
    rotationSpeed: $('valRotation'),
  };

  /* ---------------------------------------------------------------
     1. Utilities
     --------------------------------------------------------------- */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp  = (a, b, t) => a + (b - a) * t;

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

  /* ---------------------------------------------------------------
     2. Global state
     --------------------------------------------------------------- */
  const THEMES = {
    purple: { a: '#a78bfa', b: '#7c6adf' },
    blue:   { a: '#60a5fa', b: '#3b82f6' },
    red:    { a: '#fb7185', b: '#e11d48' },
    cyan:   { a: '#22d3ee', b: '#0891b2' },
    gold:   { a: '#fbbf24', b: '#d97706' },
  };

  const state = {
    theme: { name: 'purple', a: THEMES.purple.a, b: THEMES.purple.b },
    mode: 'bars',
    settings: {
      sensitivity: 1.2,
      smoothing: 55,
      glowIntensity: 65,
      particleAmount: 90,
      bassResponse: 1.3,
      backgroundIntensity: 55,
      rotationSpeed: 40,
    },
    playlist: [],       // { id, title, artist, url, objectUrl, artUrl, duration, file }
    currentIndex: -1,
    shuffle: false,
    repeat: 'off',       // off | one | all
    isPlaying: false,
    artworkImage: null,  // HTMLImageElement or null
    artworkColor: '#a78bfa',
    audioReady: false,
    chromeless: false,
    dragCounter: 0,
  };

  /* ---------------------------------------------------------------
     3. Audio engine
     --------------------------------------------------------------- */
  const Audio1 = {
    ctx: null,
    sourceNode: null,
    gainNode: null,
    analyser: null,
    recordDest: null, // MediaStreamAudioDestinationNode, always fed, used by exporter
    freqData: null,
    timeData: null,
    bufferLength: 0,

    init() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.sourceNode = this.ctx.createMediaElementSource(audioEl);
      this.gainNode = this.ctx.createGain();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.75;
      this.recordDest = this.ctx.createMediaStreamDestination();

      this.sourceNode.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
      this.analyser.connect(this.recordDest);

      this.bufferLength = this.analyser.frequencyBinCount;
      this.freqData = new Uint8Array(this.bufferLength);
      this.timeData = new Uint8Array(this.bufferLength);
    },

    async resume() {
      this.init();
      if (this.ctx.state === 'suspended') {
        try { await this.ctx.resume(); } catch (e) { /* ignore */ }
      }
    },

    setVolume(v) { if (this.gainNode) this.gainNode.gain.value = v; },
  };

  /* ---------------------------------------------------------------
     4. Playlist management
     --------------------------------------------------------------- */
  let idCounter = 1;

  function addFilesToPlaylist(files) {
    const arr = Array.from(files).filter(f => f.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(f.name));
    if (!arr.length) { showToast('Please choose an audio file (MP3, WAV, OGG, M4A).', true); return; }
    arr.forEach(file => {
      const url = URL.createObjectURL(file);
      const track = {
        id: idCounter++,
        title: file.name.replace(/\.[^.]+$/, ''),
        artist: 'Unknown artist',
        url,
        file,
        artUrl: null,
        duration: 0,
      };
      state.playlist.push(track);
      // Probe duration quietly
      const probe = new Audio();
      probe.preload = 'metadata';
      probe.src = url;
      probe.addEventListener('loadedmetadata', () => {
        track.duration = probe.duration;
        renderPlaylist();
      }, { once: true });
    });
    renderPlaylist();
    if (state.currentIndex === -1) {
      loadTrack(state.playlist.length - arr.length);
    }
  }

  function renderPlaylist() {
    playlistItemsEl.innerHTML = '';
    playlistEmptyHint.style.display = state.playlist.length ? 'none' : 'block';
    state.playlist.forEach((track, i) => {
      const li = document.createElement('li');
      li.className = 'pl-item' + (i === state.currentIndex ? ' playing' : '');
      li.setAttribute('role', 'button');
      li.tabIndex = 0;

      const cover = document.createElement('div');
      cover.className = 'pl-cover';
      if (track.artUrl) {
        const img = document.createElement('img');
        img.src = track.artUrl;
        img.className = 'pl-cover';
        img.alt = '';
        cover.replaceWith(img);
        li.appendChild(img);
      } else {
        li.appendChild(cover);
      }

      const info = document.createElement('div');
      info.className = 'pl-info';
      info.innerHTML = `<div class="pl-title">${escapeHtml(track.title)}</div><div class="pl-artist">${escapeHtml(track.artist)}</div>`;
      li.appendChild(info);

      const dur = document.createElement('span');
      dur.className = 'pl-dur';
      dur.textContent = track.duration ? formatTime(track.duration) : '--:--';
      li.appendChild(dur);

      const rm = document.createElement('button');
      rm.className = 'pl-remove';
      rm.setAttribute('aria-label', `Remove ${track.title}`);
      rm.textContent = '✕';
      rm.addEventListener('click', (e) => { e.stopPropagation(); removeTrack(i); });
      li.appendChild(rm);

      li.addEventListener('click', () => loadTrack(i, true));
      li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadTrack(i, true); } });

      playlistItemsEl.appendChild(li);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function removeTrack(i) {
    const track = state.playlist[i];
    if (track.url) URL.revokeObjectURL(track.url);
    if (track.artUrl) URL.revokeObjectURL(track.artUrl);
    state.playlist.splice(i, 1);
    if (i === state.currentIndex) {
      audioEl.pause();
      state.currentIndex = -1;
      state.isPlaying = false;
      updatePlayIcon();
      if (state.playlist.length) loadTrack(clamp(i, 0, state.playlist.length - 1));
      else resetNowPlaying();
    } else if (i < state.currentIndex) {
      state.currentIndex--;
    }
    renderPlaylist();
  }

  function resetNowPlaying() {
    songTitleTop.textContent = 'No track loaded';
    artistTop.textContent = '—';
    titleInput.value = '';
    artistInput.value = '';
    durTimeEl.textContent = '00:00';
    curTimeEl.textContent = '00:00';
    seekBar.disabled = true;
    seekFill.style.width = '0%';
    uploadHintEl.classList.remove('hidden');
  }

  async function loadTrack(index, autoplay = true) {
    const track = state.playlist[index];
    if (!track) return;
    state.currentIndex = index;
    Audio1.init();

    audioEl.src = track.url;
    audioEl.playbackRate = parseFloat(speedSelect.value) || 1;
    songTitleTop.textContent = track.title;
    artistTop.textContent = track.artist;
    titleInput.value = track.title;
    artistInput.value = track.artist;
    uploadHintEl.classList.add('hidden');
    seekBar.disabled = false;

    if (track.artUrl) {
      loadArtworkImage(track.artUrl);
    } else {
      state.artworkImage = null;
    }

    renderPlaylist();

    await Audio1.resume();
    if (autoplay) {
      try { await audioEl.play(); state.isPlaying = true; }
      catch (e) { state.isPlaying = false; }
      updatePlayIcon();
    }
  }

  function playNext(manual = false) {
    if (!state.playlist.length) return;
    if (state.shuffle) {
      let next = state.currentIndex;
      if (state.playlist.length > 1) {
        while (next === state.currentIndex) next = Math.floor(Math.random() * state.playlist.length);
      }
      loadTrack(next);
      return;
    }
    let next = state.currentIndex + 1;
    if (next >= state.playlist.length) {
      if (state.repeat === 'all' || manual) next = 0;
      else { state.isPlaying = false; updatePlayIcon(); return; }
    }
    loadTrack(next);
  }

  function playPrev() {
    if (!state.playlist.length) return;
    if (audioEl.currentTime > 3) { audioEl.currentTime = 0; return; }
    let prev = state.currentIndex - 1;
    if (prev < 0) prev = state.repeat === 'all' ? state.playlist.length - 1 : 0;
    loadTrack(prev);
  }

  /* ---------------------------------------------------------------
     5. Artwork
     --------------------------------------------------------------- */
  function loadArtworkImage(url) {
    const img = new Image();
    img.onload = () => {
      state.artworkImage = img;
      state.artworkColor = sampleDominantColor(img);
    };
    img.src = url;
  }

  function sampleDominantColor(img) {
    try {
      const c = document.createElement('canvas');
      c.width = 16; c.height = 16;
      const cx = c.getContext('2d');
      cx.drawImage(img, 0, 0, 16, 16);
      const data = cx.getImageData(0, 0, 16, 16).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
      r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
      return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
    } catch (e) { return state.theme.a; }
  }

  function handleArtFile(file) {
    if (!file || !file.type.startsWith('image/')) { showToast('Please choose a JPG, PNG, or WEBP image.', true); return; }
    const url = URL.createObjectURL(file);
    const track = state.playlist[state.currentIndex];
    if (track) {
      if (track.artUrl) URL.revokeObjectURL(track.artUrl);
      track.artUrl = url;
      renderPlaylist();
    }
    loadArtworkImage(url);
  }

  /* ---------------------------------------------------------------
     6. Analysis: bands, smoothing, beat detection
     --------------------------------------------------------------- */
  const bands = {
    bass: 0, mid: 0, treble: 0, volume: 0,
    bassS: 0, midS: 0, trebleS: 0, volumeS: 0, // smoothed
    beat: 0, // decays 1 -> 0 after a hit
  };
  const bassHistory = [];
  let lastBeatTime = 0;

  function analyse(nowMs) {
    if (!Audio1.analyser) return;
    Audio1.analyser.getByteFrequencyData(Audio1.freqData);
    Audio1.analyser.getByteTimeDomainData(Audio1.timeData);

    const freq = Audio1.freqData;
    const len = freq.length;
    const nyquist = Audio1.ctx.sampleRate / 2;
    const binHz = nyquist / len;
    const bassEnd = clamp(Math.round(250 / binHz), 1, len - 1);
    const midEnd = clamp(Math.round(4000 / binHz), bassEnd + 1, len - 1);
    const trebleEnd = clamp(Math.round(14000 / binHz), midEnd + 1, len - 1);

    let bassSum = 0, midSum = 0, trebleSum = 0, totalSum = 0;
    for (let i = 0; i < bassEnd; i++) bassSum += freq[i];
    for (let i = bassEnd; i < midEnd; i++) midSum += freq[i];
    for (let i = midEnd; i < trebleEnd; i++) trebleSum += freq[i];
    for (let i = 0; i < len; i++) totalSum += freq[i];

    const sens = state.settings.sensitivity;
    bands.bass = clamp((bassSum / bassEnd / 255) * sens, 0, 1.6);
    bands.mid = clamp((midSum / (midEnd - bassEnd) / 255) * sens, 0, 1.6);
    bands.treble = clamp((trebleSum / (trebleEnd - midEnd) / 255) * sens, 0, 1.6);
    bands.volume = clamp((totalSum / len / 255) * sens, 0, 1.6);

    const alpha = clamp(1 - (state.settings.smoothing / 100) * 0.9, 0.08, 0.9);
    bands.bassS = lerp(bands.bassS, bands.bass, alpha);
    bands.midS = lerp(bands.midS, bands.mid, alpha);
    bands.trebleS = lerp(bands.trebleS, bands.treble, alpha);
    bands.volumeS = lerp(bands.volumeS, bands.volume, alpha);

    // Beat / energy-spike detection on the bass band
    bassHistory.push(bands.bass);
    if (bassHistory.length > 43) bassHistory.shift();
    const avg = bassHistory.reduce((a, b) => a + b, 0) / bassHistory.length;
    const bassResp = state.settings.bassResponse;
    if (bands.bass > avg * 1.35 * (1 / Math.max(bassResp, 0.6)) + 0.06 && bands.bass > 0.16 && nowMs - lastBeatTime > 160) {
      bands.beat = clamp(bassResp, 0.6, 1.8);
      lastBeatTime = nowMs;
    }
    bands.beat = lerp(bands.beat, 0, 0.06);
  }

  /* ---------------------------------------------------------------
     7. Particle systems
     --------------------------------------------------------------- */
  function makeBgParticle(W, H) {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.6,
      baseA: Math.random() * 0.35 + 0.08,
      vx: (Math.random() - 0.5) * 0.06,
      vy: (Math.random() - 0.5) * 0.06,
      tw: Math.random() * Math.PI * 2,
    };
  }
  let bgParticles = [];
  function ensureBgParticles(W, H) {
    const target = 60;
    while (bgParticles.length < target) bgParticles.push(makeBgParticle(W, H));
    if (bgParticles.length > target) bgParticles.length = target;
  }

  function makeFxParticle(cx, cy, spread) {
    const ang = Math.random() * Math.PI * 2;
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

  /* ---------------------------------------------------------------
     8. Layout + rendering
     --------------------------------------------------------------- */
  let rotation = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeStage() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    stageCanvas.width = Math.round(w * dpr);
    stageCanvas.height = Math.round(h * dpr);
    stageCanvas.style.width = w + 'px';
    stageCanvas.style.height = h + 'px';
  }
  window.addEventListener('resize', resizeStage);
  resizeStage();

  function getRegion(W, H) {
    const topH = topbarEl.offsetHeight || 64;
    const botH = transportEl.offsetHeight || 130;
    return { x: 0, y: topH, w: W, h: Math.max(60, H - topH - botH) };
  }

  function drawDefaultArt(ctx, x, y, size, accentA, accentB) {
    const r = size / 2;
    const g = ctx.createLinearGradient(x, y, x + size, y + size);
    g.addColorStop(0, mixHex(accentA, '#12101a', 0.35));
    g.addColorStop(1, '#100e17');
    ctx.save();
    roundRect(ctx, x, y, size, size, size * 0.06);
    ctx.clip();
    ctx.fillStyle = g;
    ctx.fillRect(x, y, size, size);
    // stylized waveform glyph
    ctx.strokeStyle = rgba(accentA, 0.85);
    ctx.lineWidth = Math.max(2, size * 0.02);
    ctx.lineCap = 'round';
    const bars = 9;
    const gap = size * 0.06;
    const bw = (size * 0.6 - gap * (bars - 1)) / bars;
    const baseX = x + size * 0.2;
    const midY = y + size * 0.52;
    for (let i = 0; i < bars; i++) {
      const h = size * (0.10 + 0.28 * Math.abs(Math.sin(i * 1.4 + 0.6)));
      ctx.beginPath();
      ctx.moveTo(baseX + i * (bw + gap), midY - h / 2);
      ctx.lineTo(baseX + i * (bw + gap), midY + h / 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawBackground(ctx, W, H, tNow) {
    const a = state.theme.a, b = state.theme.b;
    const bgAmt = state.settings.backgroundIntensity / 100;

    // base
    const base = ctx.createLinearGradient(0, 0, 0, H);
    base.addColorStop(0, '#08070c');
    base.addColorStop(1, '#050508');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    // color derived from artwork (or theme) — soft moving blobs
    const c1 = state.artworkImage ? state.artworkColor : a;
    const energy = bands.volumeS;
    const pulse = 1 + bands.beat * 0.35;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const blobs = [
      { cx: W * (0.28 + 0.03 * Math.sin(tNow * 0.00012)), cy: H * (0.32 + 0.02 * Math.cos(tNow * 0.00015)), col: c1, rr: Math.max(W, H) * 0.34 },
      { cx: W * (0.75 + 0.03 * Math.cos(tNow * 0.00010)), cy: H * (0.6 + 0.03 * Math.sin(tNow * 0.00013)), col: b, rr: Math.max(W, H) * 0.30 },
      { cx: W * 0.5, cy: H * 0.46, col: a, rr: Math.max(W, H) * 0.22 * pulse },
    ];
    blobs.forEach((bl) => {
      const rad = ctx.createRadialGradient(bl.cx, bl.cy, 0, bl.cx, bl.cy, bl.rr * (0.6 + energy * 0.6));
      rad.addColorStop(0, rgba(bl.col, 0.16 * bgAmt * (0.6 + energy)));
      rad.addColorStop(1, rgba(bl.col, 0));
      ctx.fillStyle = rad;
      ctx.beginPath();
      ctx.arc(bl.cx, bl.cy, bl.rr * (0.6 + energy * 0.6), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // twinkling light particles
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
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // vignette
    const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  function drawTitleBlock(ctx, region, titleText, artistText) {
    const cx = region.x + region.w / 2;
    const topY = region.y + region.h * 0.075;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = rgba(state.theme.a, 0.85);
    ctx.font = `600 ${Math.max(10, region.h * 0.022)}px ${'Inter, sans-serif'}`;
    ctx.textBaseline = 'alphabetic';
    ctx.letterSpacing = '3px';
    ctx.fillText('NOW PLAYING', cx, topY);

    ctx.letterSpacing = '0px';
    ctx.fillStyle = '#f5f4fa';
    const titleSize = clamp(region.h * 0.052, 16, 40);
    ctx.font = `700 ${titleSize}px 'Space Grotesk', sans-serif`;
    ctx.fillText(truncateForCanvas(ctx, titleText || 'No track loaded', region.w * 0.86), cx, topY + titleSize + 6);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    const artistSize = clamp(region.h * 0.028, 11, 18);
    ctx.font = `500 ${artistSize}px 'Inter', sans-serif`;
    ctx.fillText(truncateForCanvas(ctx, artistText || '', region.w * 0.8), cx, topY + titleSize + artistSize + 16);
    ctx.restore();
  }

  function truncateForCanvas(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
    return t + '…';
  }

  function drawArtwork(ctx, x, y, size) {
    const glowAmt = state.settings.glowIntensity / 100;
    const pulse = 1 + bands.beat * 0.55 + bands.bassS * 0.06;
    const glowR = size * (0.5 + 0.35 * glowAmt) * pulse;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x + size / 2, y + size / 2, size * 0.2, x + size / 2, y + size / 2, glowR);
    g.addColorStop(0, rgba(state.theme.a, 0.35 * glowAmt + bands.beat * 0.25));
    g.addColorStop(1, rgba(state.theme.a, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const scale = 1 + bands.beat * 0.028 + bands.bassS * 0.01;
    const dw = size * scale, dh = size * scale;
    const dx = x - (dw - size) / 2, dy = y - (dh - size) / 2;

    ctx.save();
    roundRect(ctx, dx, dy, dw, dh, size * 0.06);
    ctx.clip();
    if (state.artworkImage) {
      ctx.drawImage(state.artworkImage, dx, dy, dw, dh);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(dx, dy, dw, dh);
    } else {
      drawDefaultArt(ctx, dx, dy, dw, state.theme.a, state.theme.b);
    }
    ctx.restore();

    ctx.save();
    roundRect(ctx, dx, dy, dw, dh, size * 0.06);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.stroke();
    ctx.restore();
  }

  /* ---- Visualizer modes ---- */

  function drawBars(ctx, region, artRect) {
    const bandCount = 56;
    const freq = Audio1.freqData;
    const len = freq ? freq.length : 0;
    const bottom = region.y + region.h * 0.94;
    const bandW = region.w * 0.82;
    const startX = region.x + (region.w - bandW) / 2;
    const maxH = region.h * 0.24;
    const gap = bandW / bandCount * 0.28;
    const barW = bandW / bandCount - gap;
    const glow = state.settings.glowIntensity / 100;

    ctx.save();
    for (let i = 0; i < bandCount; i++) {
      // logarithmic mapping across spectrum for a natural look
      const t0 = i / bandCount, t1 = (i + 1) / bandCount;
      const i0 = Math.floor(Math.pow(t0, 1.6) * len);
      const i1 = Math.max(i0 + 1, Math.floor(Math.pow(t1, 1.6) * len));
      let sum = 0, n = 0;
      for (let k = i0; k < i1 && k < len; k++) { sum += freq[k]; n++; }
      const v = n ? (sum / n / 255) : 0;
      const h = clamp(v * maxH * state.settings.sensitivity, 2, maxH);

      const xPos = startX + i * (barW + gap);
      const tone = i / bandCount; // left→right = bass→treble, matches spec
      const col = mixHex(state.theme.a, state.theme.b, tone);

      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 14 * glow;
      roundRect(ctx, xPos, bottom - h, barW, h, Math.min(barW / 2, 4));
      ctx.fill();
      // mirrored reflection, faint
      ctx.globalAlpha = 0.18;
      roundRect(ctx, xPos, bottom + 3, barW, h * 0.4, Math.min(barW / 2, 4));
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawCircular(ctx, region, artRect) {
    const cx = artRect.x + artRect.size / 2;
    const cy = artRect.y + artRect.size / 2;
    const baseR = artRect.size / 2 + 18;
    const bars = 96;
    const glow = state.settings.glowIntensity / 100;
    const rotSpeed = state.settings.rotationSpeed / 100;
    rotation += 0.0022 * rotSpeed;

    const freq = Audio1.freqData;
    const len = freq ? freq.length : 0;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    for (let i = 0; i < bars; i++) {
      const t = i / bars;
      const idx = Math.floor(Math.pow(t, 1.5) * len * 0.85);
      const v = len ? freq[idx] / 255 : 0;
      const isBass = t < 0.2;
      const amp = (isBass ? bands.bassS * 1.4 : bands.trebleS * 0.9) + v * 0.6;
      const len2 = clamp(14 + amp * 70 * state.settings.sensitivity, 6, 140);
      const ang = t * Math.PI * 2;
      const x0 = Math.cos(ang) * baseR, y0 = Math.sin(ang) * baseR;
      const x1 = Math.cos(ang) * (baseR + len2), y1 = Math.sin(ang) * (baseR + len2);
      const col = mixHex(state.theme.a, state.theme.b, t);
      ctx.strokeStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = 10 * glow;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    ctx.restore();

    // slow outer ring, bass-reactive thickness
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, baseR + 150 + bands.bassS * 20, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(state.theme.a, 0.15 + bands.beat * 0.25);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawWaveform(ctx, region, artRect, minimalMode = false) {
    const data = Audio1.timeData;
    const len = data ? data.length : 0;
    const y = artRect ? artRect.y + artRect.size + region.h * (minimalMode ? 0.14 : 0.1) : region.y + region.h * 0.5;
    const width = region.w * (minimalMode ? 0.7 : 0.82);
    const x0 = region.x + (region.w - width) / 2;
    const amp = (minimalMode ? region.h * 0.05 : region.h * 0.09) * (0.4 + bands.volumeS * 1.4) * state.settings.sensitivity;
    const glow = state.settings.glowIntensity / 100;

    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < len; i++) {
      const px = x0 + (i / (len - 1)) * width;
      const v = len ? (data[i] - 128) / 128 : 0;
      const py = y + v * amp;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    const grad = ctx.createLinearGradient(x0, 0, x0 + width, 0);
    grad.addColorStop(0, state.theme.b);
    grad.addColorStop(1, state.theme.a);
    ctx.strokeStyle = grad;
    ctx.lineWidth = minimalMode ? 1.6 : 2.4;
    ctx.shadowColor = state.theme.a;
    ctx.shadowBlur = (minimalMode ? 10 : 16) * glow;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    if (!minimalMode) {
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 6;
      ctx.shadowBlur = 0;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawParticles(ctx, region, artRect) {
    const cx = artRect ? artRect.x + artRect.size / 2 : region.x + region.w / 2;
    const cy = artRect ? artRect.y + artRect.size / 2 : region.y + region.h / 2;
    const target = Math.round(state.settings.particleAmount);
    const glow = state.settings.glowIntensity / 100;
    const spread = Math.max(region.w, region.h) * 0.42;

    while (fxParticles.length < target) fxParticles.push(makeFxParticle(cx, cy, spread));
    if (fxParticles.length > target) fxParticles.length = target;

    if (bands.beat > 0.5 && Math.random() < 0.9) {
      for (let i = 0; i < 6; i++) {
        const p = makeFxParticle(cx, cy, artRect ? artRect.size * 0.5 : 40);
        p.speed = 1.2 + Math.random() * 1.4;
        p.life = 1;
        fxParticles[Math.floor(Math.random() * fxParticles.length)] = p;
      }
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    fxParticles.forEach((p) => {
      const speed = p.speed * (0.5 + bands.volumeS * 1.4 + bands.beat);
      p.x += Math.cos(p.ang) * speed;
      p.y += Math.sin(p.ang) * speed;
      p.life -= p.decay * (1 + bands.trebleS);
      if (p.life <= 0 || p.x < region.x - 40 || p.x > region.x + region.w + 40 || p.y < region.y - 40 || p.y > region.y + region.h + 40) {
        Object.assign(p, makeFxParticle(cx, cy, spread * 0.15));
      }
      const r = p.r * (1 + bands.bassS * 1.2) * state.settings.sensitivity;
      const col = mixHex(state.theme.a, state.theme.b, p.life);
      ctx.fillStyle = rgba('#ffffff', 0); // reset
      ctx.shadowColor = col;
      ctx.shadowBlur = 12 * glow;
      ctx.fillStyle = rgba(col.startsWith('rgb') ? rgbToHex(col) : col, clamp(p.life * 0.9, 0, 0.9));
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.4, r), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
  function rgbToHex(rgbStr) {
    const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(rgbStr);
    if (!m) return '#a78bfa';
    return '#' + [1, 2, 3].map(i => (+m[i]).toString(16).padStart(2, '0')).join('');
  }

  function renderFrame(ctx, W, H, tNow) {
    ctx.clearRect(0, 0, W, H);
    drawBackground(ctx, W, H, tNow);

    const region = getRegion(W, H);
    drawTitleBlock(ctx, region, titleInput.value, artistInput.value);

    const artTop = region.y + region.h * 0.2;
    const availForArt = state.mode === 'bars' || state.mode === 'waveform' || state.mode === 'minimal'
      ? region.h * 0.5 : region.h * 0.62;
    const artSize = clamp(Math.min(region.w * 0.42, availForArt), 90, 460);
    const artRect = { x: region.x + region.w / 2 - artSize / 2, y: artTop, size: artSize };

    // visualizer layer (some modes render behind artwork, some below)
    if (state.mode === 'particles') drawParticles(ctx, region, artRect);
    if (state.mode === 'circular') drawCircular(ctx, region, artRect);

    drawArtwork(ctx, artRect.x, artRect.y, artRect.size);

    if (state.mode === 'bars') drawBars(ctx, region, artRect);
    if (state.mode === 'waveform') drawWaveform(ctx, region, artRect, false);
    if (state.mode === 'minimal') drawWaveform(ctx, region, artRect, true);
  }

  /* ---------------------------------------------------------------
     9. Main loop
     --------------------------------------------------------------- */
  let rafId = null;
  let tabHidden = false;
  document.addEventListener('visibilitychange', () => { tabHidden = document.hidden; });

  // renderFrame draws in CSS-pixel space; apply the DPR transform once per frame for the
  // live preview canvas. The offscreen export canvas calls renderFrame directly at 1:1.
  function renderFrameScaled(ctx, W, H, tNow) {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderFrame(ctx, W, H, tNow);
    ctx.restore();
  }

  /* ---------------------------------------------------------------
     10. Transport UI
     --------------------------------------------------------------- */
  let seekDragging = false;

  function updateTransportUi() {
    if (!audioEl.duration || seekDragging) return;
    const pct = (audioEl.currentTime / audioEl.duration) * 1000;
    seekBar.value = isFinite(pct) ? pct : 0;
    seekFill.style.width = `${clamp(pct / 10, 0, 100)}%`;
    curTimeEl.textContent = formatTime(audioEl.currentTime);
    durTimeEl.textContent = formatTime(audioEl.duration);
  }

  function updatePlayIcon() {
    playIcon.style.display = state.isPlaying ? 'none' : '';
    pauseIcon.style.display = state.isPlaying ? '' : 'none';
    playBtn.setAttribute('aria-label', state.isPlaying ? 'Pause' : 'Play');
  }

  async function togglePlay() {
    if (state.currentIndex === -1) { songFileInput.click(); return; }
    await Audio1.resume();
    if (audioEl.paused) {
      try { await audioEl.play(); state.isPlaying = true; }
      catch (e) { showToast("Couldn't play this file — it may be unsupported by your browser.", true); }
    } else {
      audioEl.pause();
      state.isPlaying = false;
    }
    updatePlayIcon();
  }

  /* ---------------------------------------------------------------
     11. Theme + settings
     --------------------------------------------------------------- */
  function applyTheme(name, customHex) {
    if (name === 'custom' && customHex) {
      state.theme = { name: 'custom', a: customHex, b: mixHex(customHex, '#000000', 0.35) };
    } else if (THEMES[name]) {
      state.theme = { name, a: THEMES[name].a, b: THEMES[name].b };
    }
    document.documentElement.style.setProperty('--accent', state.theme.a);
    document.documentElement.style.setProperty('--accent-2', state.theme.b);
    document.documentElement.style.setProperty('--accent-soft', rgba(state.theme.a, 0.35));
    [...themeRow.querySelectorAll('.theme-swatch[data-theme]')].forEach(el => {
      el.classList.toggle('active', el.dataset.theme === name);
    });
  }

  function bindSlider(key, onInput) {
    const el = sliders[key];
    el.value = state.settings[key];
    sliderVals[key].textContent = state.settings[key];
    el.addEventListener('input', () => {
      const v = parseFloat(el.value);
      state.settings[key] = v;
      sliderVals[key].textContent = (key === 'sensitivity' || key === 'bassResponse') ? v.toFixed(2) : v;
      if (onInput) onInput(v);
    });
  }

  function initSettingsPanel() {
    Object.keys(sliders).forEach(k => bindSlider(k));

    modeGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.mode-chip');
      if (!btn) return;
      state.mode = btn.dataset.mode;
      [...modeGrid.querySelectorAll('.mode-chip')].forEach(c => c.classList.toggle('active', c === btn));
    });

    themeRow.addEventListener('click', (e) => {
      const sw = e.target.closest('.theme-swatch[data-theme]');
      if (!sw) return;
      applyTheme(sw.dataset.theme);
    });
    customColorInput.addEventListener('input', () => {
      applyTheme('custom', customColorInput.value);
      themeRow.querySelectorAll('.theme-swatch[data-theme]').forEach(el => el.classList.remove('active'));
    });

    resetSettingsBtn.addEventListener('click', () => {
      Object.assign(state.settings, {
        sensitivity: 1.2, smoothing: 55, glowIntensity: 65,
        particleAmount: 90, bassResponse: 1.3, backgroundIntensity: 55, rotationSpeed: 40,
      });
      Object.keys(sliders).forEach(k => {
        sliders[k].value = state.settings[k];
        sliderVals[k].textContent = (k === 'sensitivity' || k === 'bassResponse') ? state.settings[k].toFixed(2) : state.settings[k];
      });
      applyTheme('purple');
      state.mode = 'bars';
      [...modeGrid.querySelectorAll('.mode-chip')].forEach(c => c.classList.toggle('active', c.dataset.mode === 'bars'));
      showToast('Settings reset to defaults.');
    });
  }

  /* ---------------------------------------------------------------
     12. Panels, fullscreen, drag&drop, keyboard
     --------------------------------------------------------------- */
  function openPanel(panel, btn) {
    closeAllPanels();
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }
  function closeAllPanels() {
    [playlistPanel, settingsPanel].forEach(p => { p.classList.remove('open'); p.setAttribute('aria-hidden', 'true'); });
    playlistBtn.setAttribute('aria-expanded', 'false');
    settingsBtn.setAttribute('aria-expanded', 'false');
  }

  playlistBtn.addEventListener('click', () => playlistPanel.classList.contains('open') ? closeAllPanels() : openPanel(playlistPanel, playlistBtn));
  closePlaylistBtn.addEventListener('click', closeAllPanels);
  settingsBtn.addEventListener('click', () => settingsPanel.classList.contains('open') ? closeAllPanels() : openPanel(settingsPanel, settingsBtn));
  closeSettingsBtn.addEventListener('click', closeAllPanels);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      appEl.requestFullscreen?.().catch(() => showToast('Fullscreen is not available in this browser.', true));
    } else {
      document.exitFullscreen?.();
    }
  }
  fullscreenBtn.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', () => {
    appEl.classList.toggle('chromeless', !!document.fullscreenElement || state.chromeless);
  });

  ytModeBtn.addEventListener('click', () => {
    state.chromeless = !state.chromeless;
    appEl.classList.toggle('chromeless', state.chromeless || !!document.fullscreenElement);
    ytModeBtn.classList.toggle('active', state.chromeless);
    showToast(state.chromeless ? 'YouTube mode on — move your mouse to reveal controls.' : 'YouTube mode off.');
  });

  // Drag & drop anywhere on the app
  ['dragenter', 'dragover'].forEach(evt => {
    window.addEventListener(evt, (e) => {
      e.preventDefault();
      if (!e.dataTransfer?.types?.includes('Files')) return;
      dropOverlay.classList.add('show');
    });
  });
  ['dragleave', 'drop'].forEach(evt => {
    window.addEventListener(evt, (e) => {
      if (evt === 'dragleave' && e.target !== window && e.relatedTarget) return;
      dropOverlay.classList.remove('show');
    });
  });
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files || !files.length) return;
    const audio = [...files].filter(f => f.type.startsWith('audio/'));
    const images = [...files].filter(f => f.type.startsWith('image/'));
    if (audio.length) addFilesToPlaylist(audio);
    if (images.length) handleArtFile(images[0]);
    if (!audio.length && !images.length) showToast('Drop an audio file or an image.', true);
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
    switch (e.key) {
      case ' ':
        e.preventDefault(); togglePlay(); break;
      case 'ArrowLeft':
        if (audioEl.duration) audioEl.currentTime = clamp(audioEl.currentTime - 5, 0, audioEl.duration);
        break;
      case 'ArrowRight':
        if (audioEl.duration) audioEl.currentTime = clamp(audioEl.currentTime + 5, 0, audioEl.duration);
        break;
      case 'm': case 'M':
        toggleMute(); break;
      case 'f': case 'F':
        toggleFullscreen(); break;
    }
  });

  /* ---------------------------------------------------------------
     13. Wiring: uploads, transport controls
     --------------------------------------------------------------- */
  uploadSongBtn.addEventListener('click', () => songFileInput.click());
  uploadSongBtnCenter.addEventListener('click', () => songFileInput.click());
  addSongBtn.addEventListener('click', () => songFileInput.click());
  uploadArtBtn.addEventListener('click', () => artFileInput.click());

  songFileInput.addEventListener('change', () => {
    if (songFileInput.files?.length) addFilesToPlaylist(songFileInput.files);
    songFileInput.value = '';
  });
  artFileInput.addEventListener('change', () => {
    if (artFileInput.files?.[0]) handleArtFile(artFileInput.files[0]);
    artFileInput.value = '';
  });

  playBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', playPrev);
  nextBtn.addEventListener('click', () => playNext(true));

  shuffleBtn.addEventListener('click', () => {
    state.shuffle = !state.shuffle;
    shuffleBtn.setAttribute('aria-pressed', String(state.shuffle));
    shuffleBtn.classList.toggle('active', state.shuffle);
  });
  repeatBtn.addEventListener('click', () => {
    const order = ['off', 'all', 'one'];
    state.repeat = order[(order.indexOf(state.repeat) + 1) % order.length];
    repeatBtn.classList.toggle('active', state.repeat !== 'off');
    repeatBtn.setAttribute('aria-pressed', String(state.repeat !== 'off'));
    repeatBtn.title = state.repeat === 'one' ? 'Repeat one' : state.repeat === 'all' ? 'Repeat all' : 'Repeat';
  });

  audioEl.addEventListener('ended', () => {
    if (ExportPipeline.active) return; // let the exporter finalize on this track without skipping ahead
    if (state.repeat === 'one') { audioEl.currentTime = 0; audioEl.play(); return; }
    playNext(false);
  });
  audioEl.addEventListener('play', () => { state.isPlaying = true; updatePlayIcon(); });
  audioEl.addEventListener('pause', () => { state.isPlaying = false; updatePlayIcon(); });
  audioEl.addEventListener('error', () => {
    if (state.currentIndex !== -1) showToast('This audio file could not be played. Try a different format (MP3, WAV, OGG).', true);
  });

  seekBar.addEventListener('mousedown', () => seekDragging = true);
  seekBar.addEventListener('touchstart', () => seekDragging = true, { passive: true });
  seekBar.addEventListener('input', () => {
    seekFill.style.width = `${seekBar.value / 10}%`;
    if (audioEl.duration) curTimeEl.textContent = formatTime((seekBar.value / 1000) * audioEl.duration);
  });
  const commitSeek = () => {
    if (audioEl.duration) audioEl.currentTime = (seekBar.value / 1000) * audioEl.duration;
    seekDragging = false;
  };
  seekBar.addEventListener('change', commitSeek);
  seekBar.addEventListener('mouseup', () => setTimeout(() => seekDragging = false, 30));
  seekBar.addEventListener('touchend', () => setTimeout(() => seekDragging = false, 30));

  let lastVolume = 0.85;
  volumeSlider.addEventListener('input', () => {
    const v = volumeSlider.value / 100;
    Audio1.setVolume(v);
    lastVolume = v;
    setMuteIcon(v === 0);
  });
  function toggleMute() {
    if (Audio1.gainNode && Audio1.gainNode.gain.value > 0) {
      lastVolume = Audio1.gainNode.gain.value;
      Audio1.setVolume(0); volumeSlider.value = 0; setMuteIcon(true);
    } else {
      Audio1.setVolume(lastVolume || 0.85); volumeSlider.value = (lastVolume || 0.85) * 100; setMuteIcon(false);
    }
  }
  function setMuteIcon(muted) {
    volIconOn.style.display = muted ? 'none' : '';
    volIconOff.style.display = muted ? '' : 'none';
    muteBtn.setAttribute('aria-pressed', String(muted));
  }
  muteBtn.addEventListener('click', toggleMute);

  speedSelect.addEventListener('change', () => { audioEl.playbackRate = parseFloat(speedSelect.value); });

  titleInput.addEventListener('input', () => {
    songTitleTop.textContent = titleInput.value || 'Untitled';
    const t = state.playlist[state.currentIndex]; if (t) { t.title = titleInput.value || 'Untitled'; renderPlaylist(); }
  });
  artistInput.addEventListener('input', () => {
    artistTop.textContent = artistInput.value || '—';
    const t = state.playlist[state.currentIndex]; if (t) { t.artist = artistInput.value || 'Unknown artist'; renderPlaylist(); }
  });

  /* ---------------------------------------------------------------
     14. Export pipeline (WebM/MP4 via MediaRecorder)
     --------------------------------------------------------------- */
  const ExportPipeline = {
    active: false,
    cancelled: false,
    resolution: 1080,
    format: 'webm',
    recorder: null,
    chunks: [],
    exportCanvas: null,
    exportCtx: null,
    lastBlobUrl: null,
    wasPlayingBefore: false,

    open() {
      if (state.currentIndex === -1) { showToast('Upload a song before exporting.', true); return; }
      exportSetup.style.display = '';
      exportProgress.style.display = 'none';
      exportDone.style.display = 'none';
      exportBackdrop.classList.add('show');
      exportBackdrop.setAttribute('aria-hidden', 'false');

      // MP4 availability check
      const mp4Supported = window.MediaRecorder && MediaRecorder.isTypeSupported && (
        MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2') || MediaRecorder.isTypeSupported('video/mp4')
      );
      mp4Chip.disabled = !mp4Supported;
      mp4Chip.style.opacity = mp4Supported ? '1' : '0.4';
      formatHint.textContent = mp4Supported
        ? 'MP4 uses your browser\u2019s native encoder; WebM works everywhere.'
        : 'Your browser can only record WebM locally — it still uploads directly to YouTube.';
    },
    close() {
      exportBackdrop.classList.remove('show');
      exportBackdrop.setAttribute('aria-hidden', 'true');
      if (this.active) this.cancel();
    },

    async start() {
      if (!window.MediaRecorder) { showToast('Your browser does not support video recording.', true); return; }
      this.cancelled = false;
      this.active = true;
      this.chunks = [];

      const w = this.resolution === 1080 ? 1920 : 1280;
      const h = this.resolution === 1080 ? 1080 : 720;
      if (!this.exportCanvas) this.exportCanvas = document.createElement('canvas');
      this.exportCanvas = document.createElement('canvas');
      this.exportCanvas.width = w; this.exportCanvas.height = h;
      this.exportCtx = this.exportCanvas.getContext('2d');

      await Audio1.resume();
      this.wasPlayingBefore = !audioEl.paused;
      audioEl.currentTime = 0;

      const videoStream = this.exportCanvas.captureStream(30);
      const audioTrack = Audio1.recordDest.stream.getAudioTracks()[0];
      const combined = new MediaStream([...videoStream.getVideoTracks(), ...(audioTrack ? [audioTrack] : [])]);

      let mime = 'video/webm;codecs=vp9,opus';
      if (this.format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2')) {
        mime = 'video/mp4;codecs=avc1,mp4a.40.2';
      } else if (!MediaRecorder.isTypeSupported(mime)) {
        mime = 'video/webm';
      }

      try {
        this.recorder = new MediaRecorder(combined, { mimeType: mime, videoBitsPerSecond: this.resolution === 1080 ? 8_000_000 : 5_000_000 });
      } catch (e) {
        showToast('Could not start the recorder on this browser.', true);
        this.active = false;
        return;
      }
      this.recorder.ondataavailable = (e) => { if (e.data && e.data.size) this.chunks.push(e.data); };
      this.recorder.onstop = () => this.finish(mime);

      exportSetup.style.display = 'none';
      exportProgress.style.display = '';
      exportDone.style.display = 'none';
      progressStatus.textContent = 'Rendering your song in real time…';

      this.recorder.start(250);
      try { await audioEl.play(); } catch (e) { /* ignore */ }

      this.renderExportFrame();
    },

    renderExportFrame() {
      if (!this.active) return;
      if (this.cancelled || audioEl.ended) {
        this.stopRecording();
        return;
      }
      const W = this.exportCanvas.width, H = this.exportCanvas.height;
      this.exportCtx.save();
      this.exportCtx.setTransform(1, 0, 0, 1, 0, 0);
      renderFrame(this.exportCtx, W, H, performance.now());
      this.exportCtx.restore();

      const pct = audioEl.duration ? clamp((audioEl.currentTime / audioEl.duration) * 100, 0, 100) : 0;
      this.updateProgress(pct);

      requestAnimationFrame(() => this.renderExportFrame());
    },

    updateProgress(pct) {
      progressPct.textContent = `${Math.round(pct)}%`;
      const circumference = 276.5;
      ringFg.style.strokeDashoffset = String(circumference - (pct / 100) * circumference);
    },

    stopRecording() {
      this.active = false;
      if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop();
      if (!this.wasPlayingBefore) audioEl.pause();
    },

    cancel() {
      this.cancelled = true;
      progressStatus.textContent = 'Cancelling…';
      this.stopRecording();
    },

    finish(mime) {
      if (this.cancelled) {
        exportBackdrop.classList.remove('show');
        showToast('Export cancelled.');
        return;
      }
      const blob = new Blob(this.chunks, { type: mime.split(';')[0] });
      if (this.lastBlobUrl) URL.revokeObjectURL(this.lastBlobUrl);
      this.lastBlobUrl = URL.createObjectURL(blob);
      const ext = mime.includes('mp4') ? 'mp4' : 'webm';
      const track = state.playlist[state.currentIndex];
      const filename = `${(track?.title || 'visualizer').replace(/[^\w\- ]+/g, '')}.${ext}`;

      downloadVideoBtn.href = this.lastBlobUrl;
      downloadVideoBtn.download = filename;

      exportProgress.style.display = 'none';
      exportDone.style.display = '';
      showToast('Your video is ready to download.');
    },
  };

  exportBtn.addEventListener('click', () => ExportPipeline.open());
  closeExportBtn.addEventListener('click', () => ExportPipeline.close());
  exportBackdrop.addEventListener('click', (e) => { if (e.target === exportBackdrop) ExportPipeline.close(); });

  resOptions.addEventListener('click', (e) => {
    const chip = e.target.closest('.option-chip'); if (!chip) return;
    ExportPipeline.resolution = parseInt(chip.dataset.res, 10);
    [...resOptions.children].forEach(c => c.classList.toggle('active', c === chip));
  });
  formatOptions.addEventListener('click', (e) => {
    const chip = e.target.closest('.option-chip'); if (!chip || chip.disabled) return;
    ExportPipeline.format = chip.dataset.format;
    [...formatOptions.children].forEach(c => c.classList.toggle('active', c === chip));
  });
  startExportBtn.addEventListener('click', () => ExportPipeline.start());
  cancelExportBtn.addEventListener('click', () => ExportPipeline.cancel());
  exportAnotherBtn.addEventListener('click', () => ExportPipeline.open());

  downloadAudioBtn.addEventListener('click', () => {
    const track = state.playlist[state.currentIndex];
    if (!track) return;
    const a = document.createElement('a');
    a.href = track.url;
    a.download = track.file?.name || `${track.title}.mp3`;
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* ---------------------------------------------------------------
     15. Init
     --------------------------------------------------------------- */
  function init() {
    initSettingsPanel();
    applyTheme('purple');
    renderPlaylist();
    resetNowPlaying();
    updatePlayIcon();
    setMuteIcon(false);

    if (rafId) cancelAnimationFrame(rafId);
    const boundLoop = (tsMs) => {
      rafId = requestAnimationFrame(boundLoop);
      if (tabHidden && !ExportPipeline.active) return;
      analyse(tsMs);
      renderFrameScaled(stageCtx, stageCanvas.width / dpr, stageCanvas.height / dpr, tsMs);
      updateTransportUi();
    };
    rafId = requestAnimationFrame(boundLoop);
  }

  init();
})();
