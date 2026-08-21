/* =====================================================================
   PART 5: Preset Manager, Settings Panel & Transport Controls Wiring
   File Name Suggestion: 05-presets-ui.js (ya presetsAndUi.js)
   ===================================================================== */

/* ---------------------------------------------------------------
   16. Transport UI
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
   17. Theme, SettingsStorage & settings panel wiring
   --------------------------------------------------------------- */
const SETTINGS_STORE_KEY = 'waveformStudio.settings.v1';

const SettingsStorage = {
  save() {
    try {
      const data = {
        mode: state.mode,
        theme: state.theme,
        colorMode: state.colorMode,
        secondaryColor: state.secondaryColor,
        bgType: state.bgType,
        mirror: state.mirror,
        showTitle: state.showTitle,
        showArtist: state.showArtist,
        showLyrics: state.showLyrics,
        settings: state.settings,
        artwork: state.artwork,
        speed: speedSelect ? speedSelect.value : '1',
        volume: volumeSlider ? volumeSlider.value : '85',
        shuffle: state.shuffle,
        repeat: state.repeat,
      };
      localStorage.setItem(SETTINGS_STORE_KEY, JSON.stringify(data));
    } catch (e) {}
  },
  load() {
    try {
      const raw = localStorage.getItem(SETTINGS_STORE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  },
  applySaved() {
    const d = this.load();
    if (!d) return;
    if (d.mode) state.mode = d.mode;
    if (d.theme) applyTheme(d.theme.name, d.theme.a);
    if (d.colorMode) state.colorMode = d.colorMode;
    if (d.secondaryColor) state.secondaryColor = d.secondaryColor;
    if (d.bgType) state.bgType = d.bgType;
    if (typeof d.mirror === 'boolean') state.mirror = d.mirror;
    if (typeof d.showTitle === 'boolean') state.showTitle = d.showTitle;
    if (typeof d.showArtist === 'boolean') state.showArtist = d.showArtist;
    if (typeof d.showLyrics === 'boolean') state.showLyrics = d.showLyrics;
    if (d.settings) Object.assign(state.settings, d.settings);
    if (d.artwork) Object.assign(state.artwork, d.artwork);
    if (typeof d.shuffle === 'boolean') state.shuffle = d.shuffle;
    if (d.repeat) state.repeat = d.repeat;
  }
};

function applyTheme(name, customHex) {
  if (name === 'custom' && customHex) {
    state.theme = { name: 'custom', a: customHex, b: mixHex(customHex, '#000000', 0.35) };
  } else if (THEMES[name]) {
    state.theme = { name, a: THEMES[name].a, b: THEMES[name].b };
  }
  document.documentElement.style.setProperty('--accent', state.theme.a);
  document.documentElement.style.setProperty('--accent-2', state.theme.b);
  document.documentElement.style.setProperty('--accent-soft', rgba(state.theme.a, 0.35));
  if (themeRow) {
    [...themeRow.querySelectorAll('.theme-swatch[data-theme]')].forEach(el => {
      el.classList.toggle('active', el.dataset.theme === name);
    });
  }
  SettingsStorage.save();
  if (typeof saveCurrentSession === 'function') saveCurrentSession();
}

// Maps a slider DOM key like "artworkBorderWidth" to its matching
// state.artwork field name "borderWidth" (strips the "artwork" prefix).
function artStateKey(sliderKey) {
  const stripped = sliderKey.replace(/^artwork/, '');
  return stripped.charAt(0).toLowerCase() + stripped.slice(1);
}

function bindSlider(key, onInput) {
  const el = sliders[key];
  if (!el) return;
  el.value = state.settings[key];
  if (sliderVals[key]) sliderVals[key].textContent = DECIMAL_KEYS.has(key) ? Number(state.settings[key]).toFixed(2) : state.settings[key];
  el.addEventListener('input', () => {
    const v = parseFloat(el.value);
    state.settings[key] = v;
    if (sliderVals[key]) sliderVals[key].textContent = DECIMAL_KEYS.has(key) ? v.toFixed(2) : v;
    if (onInput) onInput(v);
    SettingsStorage.save();
    if (typeof saveCurrentSession === 'function') saveCurrentSession();
  });
}

function bindArtworkSlider(key) {
  const el = sliders[key];
  if (!el) return;
  const stateKey = artStateKey(key);
  el.value = state.artwork[stateKey];
  if (sliderVals[key]) sliderVals[key].textContent = state.artwork[stateKey];
  el.addEventListener('input', () => {
    const v = parseFloat(el.value);
    state.artwork[stateKey] = v;
    if (sliderVals[key]) sliderVals[key].textContent = v;
    SettingsStorage.save();
    if (typeof saveCurrentSession === 'function') saveCurrentSession();
  });
}

function refreshModeGrid() {
  const cats = ['All', ...VisualizerEngine.categories()];
  if (modeCategoryRow.children.length === 0) {
    cats.forEach((cat, i) => {
      const btn = document.createElement('button');
      btn.className = 'mode-chip' + (i === 0 ? ' active' : '');
      btn.dataset.cat = cat;
      btn.textContent = cat;
      modeCategoryRow.appendChild(btn);
    });
  }
  if (modeCount) modeCount.textContent = `(${VisualizerEngine.list().length})`;
  renderModeGrid('All');
}

function renderModeGrid(filterCat) {
  modeGrid.innerHTML = '';
  let lastCat = null;
  VisualizerEngine.list().forEach(vis => {
    if (filterCat !== 'All' && vis.category !== filterCat) return;
    if (filterCat === 'All' && vis.category !== lastCat) {
      lastCat = vis.category;
      const label = document.createElement('div');
      label.className = 'mode-chip cat-label';
      label.textContent = vis.category;
      modeGrid.appendChild(label);
    }
    const btn = document.createElement('button');
    btn.className = 'mode-chip' + (vis.id === state.mode ? ' active' : '');
    btn.dataset.mode = vis.id;
    btn.textContent = vis.name;
    modeGrid.appendChild(btn);
  });
}

function setMode(id) {
  state.mode = id;
  [...modeGrid.querySelectorAll('.mode-chip[data-mode]')].forEach(c => c.classList.toggle('active', c.dataset.mode === id));
  SettingsStorage.save();
  if (typeof saveCurrentSession === 'function') saveCurrentSession();
}

function buildChipRow(container, items, idKey, labelKey, activeVal, onSelect) {
  container.innerHTML = '';
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'mode-chip' + (item[idKey] === activeVal ? ' active' : '');
    btn.dataset.val = item[idKey];
    btn.textContent = item[labelKey];
    btn.addEventListener('click', () => {
      [...container.children].forEach(c => c.classList.toggle('active', c === btn));
      onSelect(item[idKey]);
      SettingsStorage.save();
      if (typeof saveCurrentSession === 'function') saveCurrentSession();
    });
    container.appendChild(btn);
  });
}

function initSettingsPanel() {
  // Apply saved localStorage settings if available
  SettingsStorage.applySaved();

  Object.keys(sliders).forEach(k => {
    if (k.startsWith('artwork')) bindArtworkSlider(k);
    else bindSlider(k);
  });

  // Visualizer mode grid (dynamic, built from the registry)
  refreshModeGrid();
  modeCategoryRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.mode-chip'); if (!btn) return;
    [...modeCategoryRow.children].forEach(c => c.classList.toggle('active', c === btn));
    renderModeGrid(btn.dataset.cat);
  });
  modeGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.mode-chip[data-mode]'); if (!btn) return;
    setMode(btn.dataset.mode);
  });

  // Themes / colors
  themeRow.addEventListener('click', (e) => {
    const sw = e.target.closest('.theme-swatch[data-theme]'); if (!sw) return;
    applyTheme(sw.dataset.theme);
  });
  customColorInput.addEventListener('input', () => {
    applyTheme('custom', customColorInput.value);
    themeRow.querySelectorAll('.theme-swatch[data-theme]').forEach(el => el.classList.remove('active'));
  });
  secondaryColorInput.addEventListener('input', () => {
    state.secondaryColor = secondaryColorInput.value;
    SettingsStorage.save();
    if (typeof saveCurrentSession === 'function') saveCurrentSession();
  });
  colorModeRow.addEventListener('click', (e) => {
    const btn = e.target.closest('.mode-chip[data-colormode]'); if (!btn) return;
    state.colorMode = btn.dataset.colormode;
    [...colorModeRow.children].forEach(c => c.classList.toggle('active', c === btn));
    secondaryColorGroup.style.display = state.colorMode === 'gradient' ? '' : 'none';
    SettingsStorage.save();
    if (typeof saveCurrentSession === 'function') saveCurrentSession();
  });
  secondaryColorGroup.style.display = state.colorMode === 'gradient' ? '' : 'none';

  // Artwork shape + toggles + Clear Artwork
  buildChipRow(artworkShapeRow, ARTWORK_SHAPES, 'id', 'label', state.artwork.shapeMode, (id) => { state.artwork.shapeMode = id; });
  artworkBorderToggle.addEventListener('change', () => { state.artwork.border = artworkBorderToggle.checked; SettingsStorage.save(); if (typeof saveCurrentSession === 'function') saveCurrentSession(); });
  artworkGlowToggle.addEventListener('change', () => { state.artwork.glow = artworkGlowToggle.checked; SettingsStorage.save(); if (typeof saveCurrentSession === 'function') saveCurrentSession(); });
  artworkShadowToggle.addEventListener('change', () => { state.artwork.shadow = artworkShadowToggle.checked; SettingsStorage.save(); if (typeof saveCurrentSession === 'function') saveCurrentSession(); });
  artworkPulseToggle.addEventListener('change', () => { state.artwork.pulse = artworkPulseToggle.checked; SettingsStorage.save(); if (typeof saveCurrentSession === 'function') saveCurrentSession(); });

  if (removeArtBtn) {
    removeArtBtn.addEventListener('click', () => {
      if (typeof clearArtworkForCurrentTrack === 'function') clearArtworkForCurrentTrack();
    });
  }


  // Background style
  buildChipRow(bgTypeRow, BG_TYPES, 'id', 'label', state.bgType, (id) => { state.bgType = id; });

  // Custom Video / GIF Background Handlers
  uploadBgMediaBtn.addEventListener('click', () => bgMediaInput.click());
  bgMediaInput.addEventListener('change', () => {
    const file = bgMediaInput.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (file.type.startsWith('video/')) {
      bgVideoEl.src = url;
      bgVideoEl.play();
      state.customBgMedia = bgVideoEl;
      state.customBgType = 'video';
    } else {
      const img = new Image();
      img.onload = () => {
        state.customBgMedia = img;
        state.customBgType = 'image';
      };
      img.src = url;
    }
    state.bgType = 'custom';
    removeBgMediaBtn.style.display = '';
    showToast('Custom background media loaded.');
    bgMediaInput.value = '';
    SettingsStorage.save();
    if (typeof saveCurrentSession === 'function') saveCurrentSession();
  });

  removeBgMediaBtn.addEventListener('click', () => {
    state.customBgMedia = null;
    state.bgType = 'nebula';
    bgVideoEl.pause();
    bgVideoEl.src = '';
    removeBgMediaBtn.style.display = 'none';
    showToast('Custom background removed.');
    SettingsStorage.save();
    if (typeof saveCurrentSession === 'function') saveCurrentSession();
  });

  // Synchronized LRC Lyrics Handlers
  uploadLrcBtn.addEventListener('click', () => lrcFileInput.click());
  lrcFileInput.addEventListener('change', async () => {
    const file = lrcFileInput.files?.[0];
    if (!file) return;
    const text = await file.text();
    state.lyrics = LyricsParser.parse(text);
    removeLrcBtn.style.display = '';
    showToast(`Loaded ${state.lyrics.length} synced lyric lines.`);
    lrcFileInput.value = '';
    if (typeof saveCurrentSession === 'function') saveCurrentSession();
  });

  removeLrcBtn.addEventListener('click', () => {
    state.lyrics = [];
    removeLrcBtn.style.display = 'none';
    showToast('Lyrics cleared.');
    if (typeof saveCurrentSession === 'function') saveCurrentSession();
  });

  if (showLyricsToggle) {
    showLyricsToggle.addEventListener('change', () => {
      state.showLyrics = showLyricsToggle.checked;
      SettingsStorage.save();
      if (typeof saveCurrentSession === 'function') saveCurrentSession();
    });
  }

  // Mirror + text toggles
  mirrorToggle.addEventListener('change', () => { state.mirror = mirrorToggle.checked; SettingsStorage.save(); if (typeof saveCurrentSession === 'function') saveCurrentSession(); });
  showTitleToggle.addEventListener('change', () => { state.showTitle = showTitleToggle.checked; SettingsStorage.save(); if (typeof saveCurrentSession === 'function') saveCurrentSession(); });
  showArtistToggle.addEventListener('change', () => { state.showArtist = showArtistToggle.checked; SettingsStorage.save(); if (typeof saveCurrentSession === 'function') saveCurrentSession(); });

  resetSettingsBtn.addEventListener('click', () => resetAllToDefaults());
}

function resetAllToDefaults() {
  Object.assign(state.settings, DEFAULT_SETTINGS);
  Object.assign(state.artwork, DEFAULT_ARTWORK);
  state.colorMode = 'theme';
  state.secondaryColor = '#7c6adf';
  state.mirror = false;
  state.bgType = 'nebula';
  state.customBgMedia = null;
  state.lyrics = [];
  state.showLyrics = true;
  state.showTitle = true;
  state.showArtist = true;
  state.activePreset = null;

  Object.keys(sliders).forEach(k => {
    if (!sliders[k]) return;
    const v = k.startsWith('artwork') ? state.artwork[artStateKey(k)] : state.settings[k];
    sliders[k].value = v;
    if (sliderVals[k]) sliderVals[k].textContent = DECIMAL_KEYS.has(k) ? Number(v).toFixed(2) : v;
  });
  artworkBorderToggle.checked = true; artworkGlowToggle.checked = true;
  artworkShadowToggle.checked = true; artworkPulseToggle.checked = true;
  mirrorToggle.checked = false; showTitleToggle.checked = true; showArtistToggle.checked = true;
  if (showLyricsToggle) showLyricsToggle.checked = true;
  colorModeRow.querySelectorAll('.mode-chip').forEach(c => c.classList.toggle('active', c.dataset.colormode === 'theme'));
  secondaryColorGroup.style.display = 'none';
  removeBgMediaBtn.style.display = 'none';
  removeLrcBtn.style.display = 'none';
  buildChipRow(artworkShapeRow, ARTWORK_SHAPES, 'id', 'label', 'auto', (id) => { state.artwork.shapeMode = id; });
  buildChipRow(bgTypeRow, BG_TYPES, 'id', 'label', 'nebula', (id) => { state.bgType = id; });

  applyTheme('purple');
  setMode('bars');
  renderModeGrid(modeCategoryRow.querySelector('.active')?.dataset.cat || 'All');
  renderPresetGrid();
  showToast('Settings reset to defaults.');
}

/* ---------------------------------------------------------------
   18. Preset Manager — save/load/delete, persisted to localStorage.
   A preset captures mode, colors, artwork config and settings.
   --------------------------------------------------------------- */
const PRESET_STORE_KEY = 'waveformStudio.presets.v1';

const BUILTIN_PRESETS = [
  { id: 'neon', name: 'Neon', swatch: '#22d3ee', data: { mode: 'circularSpectrum', theme: 'cyan', colorMode: 'theme', bgType: 'grid', settings: { glowIntensity: 85, sensitivity: 1.4, rotationSpeed: 55 } } },
  { id: 'galaxy', name: 'Galaxy', swatch: '#a78bfa', data: { mode: 'particleGalaxy', theme: 'purple', colorMode: 'theme', bgType: 'stars', settings: { particleAmount: 160, glowIntensity: 70 } } },
  { id: 'auroraPreset', name: 'Aurora', swatch: '#60a5fa', data: { mode: 'aurora', theme: 'blue', colorMode: 'gradient', secondaryColor: '#22d3ee', bgType: 'aurora', settings: { glowIntensity: 75, backgroundIntensity: 70 } } },
  { id: 'cyberpunk', name: 'Cyberpunk', swatch: '#fb7185', data: { mode: 'neonGrid', theme: 'red', colorMode: 'gradient', secondaryColor: '#22d3ee', bgType: 'grid', settings: { glowIntensity: 90, sensitivity: 1.5 } } },
  { id: 'energy', name: 'Energy', swatch: '#fbbf24', data: { mode: 'radialBars', theme: 'gold', colorMode: 'theme', bgType: 'nebula', settings: { rotationSpeed: 70, bassResponse: 1.8, glowIntensity: 80 } } },
  { id: 'purplePulse', name: 'Purple Pulse', swatch: '#a78bfa', data: { mode: 'pulseRing', theme: 'purple', colorMode: 'theme', bgType: 'nebula', settings: { beatIntensity: 1.6, glowIntensity: 80 } } },
  { id: 'rainbow', name: 'Rainbow', swatch: '#f472b6', data: { mode: 'ringSpectrum', theme: 'purple', colorMode: 'rainbow', bgType: 'nebula', settings: { glowIntensity: 75 } } },
  { id: 'cinematicPreset', name: 'Cinematic', swatch: '#7c6adf', data: { mode: 'plasma', theme: 'blue', colorMode: 'gradient', secondaryColor: '#a78bfa', bgType: 'gradient', settings: { glowIntensity: 65, backgroundIntensity: 70 } } },
  { id: 'minimalPreset', name: 'Minimal', swatch: '#9997a6', data: { mode: 'minimal', theme: 'purple', colorMode: 'theme', bgType: 'solid', settings: { glowIntensity: 35, backgroundIntensity: 25 } } },
  { id: 'cosmic', name: 'Cosmic', swatch: '#22d3ee', data: { mode: 'starfield', theme: 'cyan', colorMode: 'theme', bgType: 'stars', settings: { particleAmount: 180, glowIntensity: 60 } } },
  { id: 'fire', name: 'Fire', swatch: '#fb7185', data: { mode: 'liquidSpectrum', theme: 'red', colorMode: 'gradient', secondaryColor: '#fbbf24', bgType: 'solid', settings: { bassResponse: 2, glowIntensity: 80 } } },
  { id: 'ocean', name: 'Ocean', swatch: '#60a5fa', data: { mode: 'radialWave', theme: 'blue', colorMode: 'gradient', secondaryColor: '#22d3ee', bgType: 'aurora', settings: { glowIntensity: 60, backgroundIntensity: 60 } } },
];

const PresetManager = {
  loadCustom() {
    try { return JSON.parse(localStorage.getItem(PRESET_STORE_KEY) || '[]'); }
    catch (e) { return []; }
  },
  saveCustom(list) {
    try { localStorage.setItem(PRESET_STORE_KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ }
  },
  all() { return [...BUILTIN_PRESETS, ...this.loadCustom()]; },
  isCustom(id) { return this.loadCustom().some(p => p.id === id); },

  captureCurrent() {
    return {
      mode: state.mode,
      theme: state.theme.name === 'custom' ? undefined : state.theme.name,
      customColor: state.theme.name === 'custom' ? state.theme.a : undefined,
      colorMode: state.colorMode,
      secondaryColor: state.secondaryColor,
      bgType: state.bgType,
      mirror: state.mirror,
      settings: { ...state.settings },
      artwork: { ...state.artwork },
    };
  },

  save(name) {
    const list = this.loadCustom();
    const id = 'custom_' + Date.now();
    list.push({ id, name, swatch: state.theme.a, data: this.captureCurrent() });
    this.saveCustom(list);
    return id;
  },

  delete(id) {
    const list = this.loadCustom().filter(p => p.id !== id);
    this.saveCustom(list);
  },

  apply(preset) {
    const d = preset.data;
    if (d.theme) applyTheme(d.theme);
    else if (d.customColor) applyTheme('custom', d.customColor);
    if (d.colorMode) {
      state.colorMode = d.colorMode;
      colorModeRow.querySelectorAll('.mode-chip').forEach(c => c.classList.toggle('active', c.dataset.colormode === d.colorMode));
      secondaryColorGroup.style.display = d.colorMode === 'gradient' ? '' : 'none';
    }
    if (d.secondaryColor) { state.secondaryColor = d.secondaryColor; secondaryColorInput.value = d.secondaryColor; }
    if (d.bgType) { state.bgType = d.bgType; buildChipRow(bgTypeRow, BG_TYPES, 'id', 'label', d.bgType, (id) => { state.bgType = id; }); }
    if (typeof d.mirror === 'boolean') { state.mirror = d.mirror; mirrorToggle.checked = d.mirror; }
    if (d.settings) {
      Object.assign(state.settings, d.settings);
      Object.keys(sliders).forEach(k => {
        if (k.startsWith('artwork') || !sliders[k] || state.settings[k] === undefined) return;
        sliders[k].value = state.settings[k];
        if (sliderVals[k]) sliderVals[k].textContent = DECIMAL_KEYS.has(k) ? Number(state.settings[k]).toFixed(2) : state.settings[k];
      });
    }
    if (d.artwork) {
      Object.assign(state.artwork, d.artwork);
      Object.keys(sliders).forEach(k => {
        if (!k.startsWith('artwork') || !sliders[k]) return;
        const stateKey = artStateKey(k);
        if (state.artwork[stateKey] === undefined) return;
        sliders[k].value = state.artwork[stateKey];
        if (sliderVals[k]) sliderVals[k].textContent = state.artwork[stateKey];
      });
      buildChipRow(artworkShapeRow, ARTWORK_SHAPES, 'id', 'label', state.artwork.shapeMode, (id) => { state.artwork.shapeMode = id; });
    }
    if (d.mode) { setMode(d.mode); renderModeGrid(modeCategoryRow.querySelector('.active')?.dataset.cat || 'All'); }
    state.activePreset = preset.id;
    renderPresetGrid();
    showToast(`Applied "${preset.name}" preset.`);
  },
};

function renderPresetGrid() {
  presetGrid.innerHTML = '';
  PresetManager.all().forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'preset-chip' + (p.id === state.activePreset ? ' active' : '') + (PresetManager.isCustom(p.id) ? ' custom' : '');
    btn.innerHTML = `<span class="preset-swatch" style="background:${p.swatch || '#a78bfa'}"></span>${escapeHtml(p.name)}`;
    btn.addEventListener('click', () => PresetManager.apply(p));
    presetGrid.appendChild(btn);
  });
  deletePresetBtn.style.display = state.activePreset && PresetManager.isCustom(state.activePreset) ? '' : 'none';
}

savePresetBtn.addEventListener('click', () => {
  const name = (prompt('Name this preset:', 'My preset') || '').trim();
  if (!name) return;
  const id = PresetManager.save(name);
  state.activePreset = id;
  renderPresetGrid();
  showToast(`Saved preset "${name}".`);
});
deletePresetBtn.addEventListener('click', () => {
  if (!state.activePreset || !PresetManager.isCustom(state.activePreset)) return;
  PresetManager.delete(state.activePreset);
  state.activePreset = null;
  renderPresetGrid();
  showToast('Preset deleted.');
});

/* ---------------------------------------------------------------
   19. Randomize
   --------------------------------------------------------------- */
const RANDOM_THEME_NAMES = Object.keys(THEMES);
function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randRange(min, max, dp) {
  const v = min + Math.random() * (max - min);
  return dp ? Number(v.toFixed(dp)) : Math.round(v);
}

function randomizeAll() {
  const vis = randChoice(VisualizerEngine.list());
  setMode(vis.id);
  renderModeGrid(modeCategoryRow.querySelector('.active')?.dataset.cat || 'All');

  const colorMode = randChoice(['theme', 'theme', 'gradient', 'rainbow']);
  state.colorMode = colorMode;
  colorModeRow.querySelectorAll('.mode-chip').forEach(c => c.classList.toggle('active', c.dataset.colormode === colorMode));
  secondaryColorGroup.style.display = colorMode === 'gradient' ? '' : 'none';
  applyTheme(randChoice(RANDOM_THEME_NAMES));
  if (colorMode === 'gradient') {
    state.secondaryColor = hslHex(Math.random() * 360, 70, 60);
    secondaryColorInput.value = state.secondaryColor;
  }

  const bg = randChoice(BG_TYPES);
  state.bgType = bg.id;
  buildChipRow(bgTypeRow, BG_TYPES, 'id', 'label', bg.id, (id) => { state.bgType = id; });

  const shape = randChoice(ARTWORK_SHAPES.filter(s => s.id !== 'auto').concat(ARTWORK_SHAPES[0]));
  state.artwork.shapeMode = shape.id;
  buildChipRow(artworkShapeRow, ARTWORK_SHAPES, 'id', 'label', shape.id, (id) => { state.artwork.shapeMode = id; });

  const rnd = {
    sensitivity: randRange(0.9, 1.8, 2),
    smoothing: randRange(35, 75),
    glowIntensity: randRange(45, 90),
    particleAmount: randRange(60, 180),
    bassResponse: randRange(1.0, 2.0, 2),
    backgroundIntensity: randRange(35, 80),
    rotationSpeed: randRange(20, 75),
    midResponse: randRange(0.7, 1.6, 2),
    trebleResponse: randRange(0.7, 1.6, 2),
    beatIntensity: randRange(0.7, 1.6, 2),
    glowRadius: randRange(70, 150),
    motionSpeed: randRange(70, 150),
    bgSpeed: randRange(60, 150),
  };
  Object.assign(state.settings, rnd);
  Object.keys(sliders).forEach(k => {
    if (k.startsWith('artwork') || !sliders[k] || state.settings[k] === undefined) return;
    sliders[k].value = state.settings[k];
    if (sliderVals[k]) sliderVals[k].textContent = DECIMAL_KEYS.has(k) ? Number(state.settings[k]).toFixed(2) : state.settings[k];
  });

  state.artwork.size = randRange(85, 120);
  state.artwork.glowIntensity = randRange(70, 140);
  sliders.artworkSize.value = state.artwork.size; sliderVals.artworkSize.textContent = state.artwork.size;
  sliders.artworkGlowIntensity.value = state.artwork.glowIntensity; sliderVals.artworkGlowIntensity.textContent = state.artwork.glowIntensity;

  state.activePreset = null;
  renderPresetGrid();
  showToast(`Randomized — try "${vis.name}".`);
}
randomizeBtn.addEventListener('click', randomizeAll);

/* ---------------------------------------------------------------
   20. Panels, fullscreen, drag&drop, keyboard
   --------------------------------------------------------------- */
function openPanel(panel, btn) {
  closeAllPanels();
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  document.body.classList.add('panel-active');
  if (btn) btn.setAttribute('aria-expanded', 'true');
  if (typeof resizeStage === 'function') resizeStage();
}

function closeAllPanels() {
  [playlistPanel, settingsPanel].forEach(p => { 
    p.classList.remove('open'); 
    p.setAttribute('aria-hidden', 'true'); 
  });
  document.body.classList.remove('panel-active');
  playlistBtn.setAttribute('aria-expanded', 'false');
  settingsBtn.setAttribute('aria-expanded', 'false');
  if (typeof resizeStage === 'function') resizeStage();
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


// Drag & drop anywhere on the app (Audio, Images, BG Video, LRC)
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
window.addEventListener('drop', async (e) => {
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (!files || !files.length) return;
  const audio = [...files].filter(f => f.type.startsWith('audio/'));
  const images = [...files].filter(f => f.type.startsWith('image/'));
  const videos = [...files].filter(f => f.type.startsWith('video/'));
  const lrcs = [...files].filter(f => f.name.endsWith('.lrc') || f.name.endsWith('.txt'));

  if (audio.length) addFilesToPlaylist(audio);
  if (images.length) handleArtFile(images[0]);
  if (videos.length) {
    bgVideoEl.src = URL.createObjectURL(videos[0]);
    bgVideoEl.play();
    state.customBgMedia = bgVideoEl;
    state.customBgType = 'video';
    state.bgType = 'custom';
    removeBgMediaBtn.style.display = '';
    showToast('Background video loaded.');
  }
  if (lrcs.length) {
    const text = await lrcs[0].text();
    state.lyrics = LyricsParser.parse(text);
    removeLrcBtn.style.display = '';
    showToast(`Loaded ${state.lyrics.length} synced lyric lines.`);
  }
  if (!audio.length && !images.length && !videos.length && !lrcs.length) {
    showToast('Drop audio, image, background video or LRC file.', true);
  }
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
    case 'r': case 'R':
      if (e.shiftKey) { e.preventDefault(); randomizeAll(); }
      break;
  }
});

/* ---------------------------------------------------------------
   21. Wiring: uploads, transport controls
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
  if (ExportPipeline.active) return;
  if (state.repeat === 'one') { audioEl.currentTime = 0; audioEl.play(); return; }
  playNext(false);
});
audioEl.addEventListener('play', () => { state.isPlaying = true; updatePlayIcon(); });
audioEl.addEventListener('pause', () => { state.isPlaying = false; updatePlayIcon(); });
audioEl.addEventListener('error', () => {
  if (state.currentIndex !== -1) showToast('This audio file could not be played. Try a different format (MP3, WAV, OGG).', true);
});

titleInput.addEventListener('input', () => {
  songTitleTop.textContent = titleInput.value || 'Untitled';
  const t = state.playlist[state.currentIndex];
  if (t) { t.title = titleInput.value || 'Untitled'; t.titleSource = 'user'; renderPlaylist(); }
});
artistInput.addEventListener('input', () => {
  artistTop.textContent = artistInput.value || '—';
  const t = state.playlist[state.currentIndex];
  if (t) { t.artist = artistInput.value || 'Unknown artist'; t.artistSource = 'user'; renderPlaylist(); }
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

speedSelect.addEventListener('change', () => { audioEl.playbackRate = parseFloat(speedSelect.value); });

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