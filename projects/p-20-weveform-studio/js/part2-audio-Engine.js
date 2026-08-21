/* =====================================================================
   PART 2: State, Themes, AudioEngine & Playlist Manager
   File Name Suggestion: 02-audio-playlist.js (ya audioEngine.js)
   ===================================================================== */

/* ---------------------------------------------------------------
   3. Themes, color system & global state
   --------------------------------------------------------------- */
const THEMES = {
  purple: { a: '#a78bfa', b: '#7c6adf' },
  blue:   { a: '#60a5fa', b: '#3b82f6' },
  red:    { a: '#fb7185', b: '#e11d48' },
  cyan:   { a: '#22d3ee', b: '#0891b2' },
  gold:   { a: '#fbbf24', b: '#d97706' },
};

const ARTWORK_SHAPES = [
  { id: 'auto', label: 'Auto' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'square', label: 'Square' },
  { id: 'circle', label: 'Circle' },
  { id: 'rectangle', label: 'Rectangle' },
  { id: 'landscape', label: 'Landscape' },
  { id: 'portrait', label: 'Portrait' },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'diamond', label: 'Diamond' },
];

const BG_TYPES = [
  { id: 'nebula', label: 'Nebula' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'stars', label: 'Stars' },
  { id: 'grid', label: 'Grid' },
  { id: 'aurora', label: 'Aurora' },
  { id: 'noise', label: 'Noise' },
  { id: 'solid', label: 'Solid' },
];

const DEFAULT_SETTINGS = {
  sensitivity: 1.2,
  smoothing: 55,
  glowIntensity: 65,
  particleAmount: 90,
  bassResponse: 1.3,
  backgroundIntensity: 55,
  rotationSpeed: 40,
  midResponse: 1.0,
  trebleResponse: 1.0,
  beatIntensity: 1.0,
  glowRadius: 100,
  motionSpeed: 100,
  bgSpeed: 100,
};

const DEFAULT_ARTWORK = {
  shapeMode: 'auto',
  size: 100, posX: 0, posY: 0, width: 100, height: 100, radius: 100,
  borderWidth: 1, glowIntensity: 100, opacity: 100,
  border: true, glow: true, shadow: true, pulse: true,
};

const state = {
  theme: { name: 'purple', a: THEMES.purple.a, b: THEMES.purple.b },
  colorMode: 'theme',      // theme | gradient | rainbow
  secondaryColor: '#7c6adf',
  mode: 'bars',
  settings: { ...DEFAULT_SETTINGS },
  artwork: { ...DEFAULT_ARTWORK },
  mirror: false,
  bgType: 'nebula',
  showTitle: true,
  showArtist: true,
  showLyrics: true,        // Synced lyrics visibility
  lyrics: [],              // [{ time: Float, text: String }]
  customBgMedia: null,     // HTMLVideoElement or HTMLImageElement
  customBgType: null,      // 'video' | 'image'
  playlist: [],            // { id, title, artist, url, objectUrl, artUrl, duration, file, originalFilename }
  currentIndex: -1,
  shuffle: false,
  repeat: 'off',           // off | one | all
  isPlaying: false,
  artworkImage: null,      // HTMLImageElement or null
  artworkColor: '#a78bfa',
  audioReady: false,
  dragCounter: 0,
  activePreset: null,
};

/* ---------------------------------------------------------------
   4. Audio engine
   --------------------------------------------------------------- */
const Audio1 = {
  ctx: null,
  sourceNode: null,
  gainNode: null,
  analyser: null,
  recordDest: null,       // MediaStreamAudioDestinationNode, always fed, used by exporter
  speakerGainNode: null,  // Controls physical speaker monitor output
  freqData: null,
  timeData: null,
  bufferLength: 0,
  speakerMuted: false,

  init() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();

      // Ensure audio element has CORS enabled for Web Audio API node creation
      if (typeof audioEl !== 'undefined' && audioEl) {
        audioEl.crossOrigin = 'anonymous';
        audioEl.preload = 'auto';
        this.sourceNode = this.ctx.createMediaElementSource(audioEl);
      }

      this.gainNode = this.ctx.createGain();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.75;
      this.recordDest = this.ctx.createMediaStreamDestination();
      this.speakerGainNode = this.ctx.createGain();

      if (this.sourceNode) {
        this.sourceNode.connect(this.gainNode);
      }
      this.gainNode.connect(this.analyser);
      
      // Full audio pipeline connections
      this.analyser.connect(this.recordDest);
      this.analyser.connect(this.speakerGainNode);
      this.speakerGainNode.connect(this.ctx.destination);

      this.bufferLength = this.analyser.frequencyBinCount;
      this.freqData = new Uint8Array(this.bufferLength);
      this.timeData = new Uint8Array(this.bufferLength);
    } catch (e) {
      console.error('Audio1 init error:', e);
    }
  },

  async resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      try { 
        await this.ctx.resume(); 
      } catch (e) { 
        console.warn('AudioContext resume error:', e); 
      }
    }
  },

  setVolume(v) { 
    if (this.gainNode && this.gainNode.gain) {
      this.gainNode.gain.value = v; 
    }
  },

  setSpeakerMute(muted) {
    this.speakerMuted = !!muted;
    if (this.speakerGainNode && this.speakerGainNode.gain) {
      this.speakerGainNode.gain.value = this.speakerMuted ? 0 : 1;
    }
  },
};

/* ---------------------------------------------------------------
   StudioDB — IndexedDB Session & Offline Persistence Engine
   --------------------------------------------------------------- */
const StudioDB = {
  dbName: 'WaveformStudioDB',
  dbVersion: 2, // Upgraded version to automatically ensure object store creation
  db: null,

  async open() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, this.dbVersion);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('session')) {
          db.createObjectStore('session');
        }
      };
      req.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      req.onerror = (e) => reject(e);
    });
  },

  async saveSession(data) {
    try {
      const db = await this.open();
      if (!db.objectStoreNames.contains('session')) return;
      return new Promise((resolve, reject) => {
        const tx = db.transaction('session', 'readwrite');
        const store = tx.objectStore('session');
        const req = store.put(data, 'currentSession');
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('StudioDB save error:', e);
    }
  },

  async getSession() {
    try {
      const db = await this.open();
      if (!db.objectStoreNames.contains('session')) return null;
      return new Promise((resolve, reject) => {
        const tx = db.transaction('session', 'readonly');
        const store = tx.objectStore('session');
        const req = store.get('currentSession');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return null;
    }
  },

  async clearSession() {
    try {
      const db = await this.open();
      if (!db.objectStoreNames.contains('session')) return;
      return new Promise((resolve, reject) => {
        const tx = db.transaction('session', 'readwrite');
        const store = tx.objectStore('session');
        const req = store.delete('currentSession');
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('StudioDB clear error:', e);
    }
  }
};

let autoSaveTimer = null;
let autoSaveEnabled = true;

async function saveCurrentSession() {
  if (!autoSaveEnabled) return;
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(async () => {
    try {
      const playlistData = [];
      for (const t of state.playlist) {
        let fileBlob = null;
        let artBlob = null;
        if (t.file && t.file instanceof Blob) {
          fileBlob = t.file;
        } else if (t.url && t.url.startsWith('blob:')) {
          try { fileBlob = await (await fetch(t.url)).blob(); } catch(e){}
        }
        if (t.artUrl && t.artUrl.startsWith('blob:')) {
          try { artBlob = await (await fetch(t.artUrl)).blob(); } catch(e){}
        }
        playlistData.push({
          id: t.id,
          title: t.title,
          artist: t.artist,
          originalFilename: t.originalFilename,
          titleSource: t.titleSource,
          artistSource: t.artistSource,
          url: t.url && t.url.startsWith('blob:') ? t.url : null,
          fileBlob,
          artBlob,
          artworkRemoved: !!t.artworkRemoved,
          duration: t.duration || 0,
        });
      }

      let customBgBlob = null;
      if (state.customBgMedia && state.customBgMedia.src && state.customBgMedia.src.startsWith('blob:')) {
        try { customBgBlob = await (await fetch(state.customBgMedia.src)).blob(); } catch(e){}
      }

      const sessionData = {
        timestamp: Date.now(),
        playlist: playlistData,
        currentIndex: state.currentIndex,
        currentTime: (typeof audioEl !== 'undefined' && audioEl) ? audioEl.currentTime : 0,
        lyrics: state.lyrics || [],
        showLyrics: state.showLyrics,
        showTitle: state.showTitle,
        showArtist: state.showArtist,
        mirror: state.mirror,
        bgType: state.bgType,
        customBgBlob,
        customBgType: state.customBgType,
        mode: state.mode,
        theme: state.theme,
        colorMode: state.colorMode,
        secondaryColor: state.secondaryColor,
        settings: state.settings,
        artwork: state.artwork,
        shuffle: state.shuffle,
        repeat: state.repeat,
        volume: typeof volumeSlider !== 'undefined' && volumeSlider ? volumeSlider.value : 85,
        speed: typeof speedSelect !== 'undefined' && speedSelect ? speedSelect.value : '1',
      };

      await StudioDB.saveSession(sessionData);
    } catch (e) {
      console.warn('Auto-save session error:', e);
    }
  }, 600);
}

async function restoreSavedSession(sessionData) {
  if (!sessionData || !sessionData.playlist) return;

  autoSaveEnabled = false;

  state.playlist = [];
  idCounter = 1;

  for (const item of sessionData.playlist) {
    let url = item.url;
    let file = null;
    if (item.fileBlob) {
      file = new File([item.fileBlob], item.originalFilename || 'track.mp3', { type: item.fileBlob.type || 'audio/mpeg' });
      url = URL.createObjectURL(file);
    }
    let artUrl = null;
    if (item.artBlob) {
      artUrl = URL.createObjectURL(item.artBlob);
    }

    const track = {
      id: idCounter++,
      title: item.title,
      artist: item.artist,
      originalFilename: item.originalFilename,
      titleSource: item.titleSource,
      artistSource: item.artistSource,
      url: url,
      file: file,
      artUrl: artUrl,
      artworkRemoved: !!item.artworkRemoved,
      duration: item.duration || 0,
    };
    state.playlist.push(track);
  }

  renderPlaylist();

  if (sessionData.lyrics) {
    state.lyrics = sessionData.lyrics;
    if (typeof removeLrcBtn !== 'undefined' && removeLrcBtn) {
      removeLrcBtn.style.display = state.lyrics.length ? '' : 'none';
    }
  }

  if (sessionData.customBgBlob) {
    const bgUrl = URL.createObjectURL(sessionData.customBgBlob);
    if (sessionData.customBgType === 'video' && typeof bgVideoEl !== 'undefined' && bgVideoEl) {
      bgVideoEl.src = bgUrl;
      bgVideoEl.play().catch(() => {});
      state.customBgMedia = bgVideoEl;
    } else {
      const img = new Image();
      img.onload = () => { state.customBgMedia = img; };
      img.src = bgUrl;
    }
    state.customBgType = sessionData.customBgType;
    if (typeof removeBgMediaBtn !== 'undefined' && removeBgMediaBtn) removeBgMediaBtn.style.display = '';
  }

  if (sessionData.bgType) state.bgType = sessionData.bgType;
  if (sessionData.mode && typeof setMode === 'function') setMode(sessionData.mode);
  if (sessionData.theme && typeof applyTheme === 'function') applyTheme(sessionData.theme.name, sessionData.theme.a);
  if (sessionData.colorMode) state.colorMode = sessionData.colorMode;
  if (sessionData.secondaryColor) state.secondaryColor = sessionData.secondaryColor;
  if (sessionData.settings) Object.assign(state.settings, sessionData.settings);
  if (sessionData.artwork) Object.assign(state.artwork, sessionData.artwork);

  state.showLyrics = sessionData.showLyrics !== false;
  state.showTitle = sessionData.showTitle !== false;
  state.showArtist = sessionData.showArtist !== false;
  state.mirror = !!sessionData.mirror;
  state.shuffle = !!sessionData.shuffle;
  state.repeat = sessionData.repeat || 'off';

  if (typeof shuffleBtn !== 'undefined' && shuffleBtn) {
    shuffleBtn.setAttribute('aria-pressed', String(state.shuffle));
    shuffleBtn.classList.toggle('active', state.shuffle);
  }
  if (typeof repeatBtn !== 'undefined' && repeatBtn) {
    repeatBtn.classList.toggle('active', state.repeat !== 'off');
    repeatBtn.setAttribute('aria-pressed', String(state.repeat !== 'off'));
  }
  if (typeof volumeSlider !== 'undefined' && volumeSlider && sessionData.volume != null) {
    volumeSlider.value = sessionData.volume;
    Audio1.setVolume(sessionData.volume / 100);
  }
  if (typeof speedSelect !== 'undefined' && speedSelect && sessionData.speed) {
    speedSelect.value = sessionData.speed;
  }

  // Restore track selection in paused state
  const targetIndex = (sessionData.currentIndex >= 0 && sessionData.currentIndex < state.playlist.length) 
    ? sessionData.currentIndex 
    : (state.playlist.length ? 0 : -1);

  if (targetIndex !== -1) {
    await loadTrack(targetIndex, false);
    if (sessionData.currentTime > 0 && typeof audioEl !== 'undefined' && audioEl) {
      audioEl.currentTime = sessionData.currentTime;
      if (typeof updateTransportUi === 'function') updateTransportUi();
    }
    if (typeof audioEl !== 'undefined' && audioEl) audioEl.pause();
    state.isPlaying = false;
    if (typeof updatePlayIcon === 'function') updatePlayIcon();
  }

  autoSaveEnabled = true;
  if (typeof showToast === 'function') showToast('Previous session restored.');
}

/* ---------------------------------------------------------------
   5. Playlist management
   --------------------------------------------------------------- */
let idCounter = 1;

function addFilesToPlaylist(files) {
  const arr = Array.from(files).filter(f => f.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(f.name));
  if (!arr.length) { 
    if (typeof showToast === 'function') showToast('Please choose an audio file (MP3, WAV, OGG, M4A).', true); 
    return; 
  }
  arr.forEach(file => {
    const url = URL.createObjectURL(file);
    const cleaned = (typeof TitleParser !== 'undefined' && TitleParser.cleanFilename) 
      ? TitleParser.cleanFilename(file.name) 
      : { title: file.name, artist: 'Unknown artist' };

    const track = {
      id: idCounter++,
      title: cleaned.title,
      artist: cleaned.artist || 'Unknown artist',
      titleSource: 'filename',
      artistSource: cleaned.artist ? 'filename' : 'fallback',
      originalFilename: file.name,
      url,
      file,
      artUrl: null,
      artworkRemoved: false,
      duration: 0,
    };
    state.playlist.push(track);

    const probe = new Audio();
    probe.preload = 'metadata';
    probe.src = url;
    probe.addEventListener('loadedmetadata', () => {
      track.duration = probe.duration;
      renderPlaylist();
    }, { once: true });

    if (typeof TitleParser !== 'undefined' && TitleParser.readId3) {
      TitleParser.readId3(file).then((tags) => {
        if (!tags) return;
        if (tags.title && track.titleSource !== 'user') {
          track.title = tags.title.slice(0, 70);
          track.titleSource = 'metadata';
        }
        if (tags.artist && track.artistSource !== 'user') {
          track.artist = tags.artist.slice(0, 60);
          track.artistSource = 'metadata';
        }
        if (state.playlist[state.currentIndex] === track) {
          if (typeof songTitleTop !== 'undefined' && songTitleTop) songTitleTop.textContent = track.title;
          if (typeof artistTop !== 'undefined' && artistTop) artistTop.textContent = track.artist;
          if (typeof titleInput !== 'undefined' && titleInput) titleInput.value = track.title;
          if (typeof artistInput !== 'undefined' && artistInput) artistInput.value = track.artist;
        }
        renderPlaylist();
      });
    }
  });

  renderPlaylist();
  if (state.currentIndex === -1) {
    loadTrack(state.playlist.length - arr.length, true);
  }
  saveCurrentSession();
}

function renderPlaylist() {
  if (typeof playlistItemsEl === 'undefined' || !playlistItemsEl) return;
  playlistItemsEl.innerHTML = '';
  if (typeof playlistEmptyHint !== 'undefined' && playlistEmptyHint) {
    playlistEmptyHint.style.display = state.playlist.length ? 'none' : 'block';
  }

  state.playlist.forEach((track, i) => {
    const li = document.createElement('li');
    li.className = 'pl-item' + (i === state.currentIndex ? ' playing' : '');
    li.setAttribute('role', 'button');
    li.tabIndex = 0;

    const cover = document.createElement('div');
    cover.className = 'pl-cover';
    const displayArt = (!track.artworkRemoved && track.artUrl)
      ? track.artUrl
      : null;

    if (displayArt) {
      const img = document.createElement('img');
      img.src = displayArt;
      img.className = 'pl-cover';
      img.alt = '';
      cover.replaceWith(img);
      li.appendChild(img);
    } else {
      li.appendChild(cover);
    }

    const info = document.createElement('div');
    info.className = 'pl-info';
    const safeTitle = typeof escapeHtml === 'function' ? escapeHtml(track.title) : track.title;
    const safeArtist = typeof escapeHtml === 'function' ? escapeHtml(track.artist) : track.artist;
    info.innerHTML = `<div class="pl-title">${safeTitle}</div><div class="pl-artist">${safeArtist}</div>`;
    li.appendChild(info);

    const dur = document.createElement('span');
    dur.className = 'pl-dur';
    dur.textContent = track.duration ? (typeof formatTime === 'function' ? formatTime(track.duration) : track.duration) : '--:--';
    li.appendChild(dur);

    const rm = document.createElement('button');
    rm.className = 'pl-remove';
    rm.setAttribute('aria-label', `Remove ${track.title}`);
    rm.textContent = '✕';
    rm.addEventListener('click', (e) => { e.stopPropagation(); removeTrack(i); });
    li.appendChild(rm);

    li.addEventListener('click', () => loadTrack(i, true));
    li.addEventListener('keydown', (e) => { 
      if (e.key === 'Enter' || e.key === ' ') { 
        e.preventDefault(); 
        loadTrack(i, true); 
      } 
    });

    playlistItemsEl.appendChild(li);
  });
}

function removeTrack(i) {
  const track = state.playlist[i];
  if (!track) return;
  if (track.url) URL.revokeObjectURL(track.url);
  if (track.artUrl) URL.revokeObjectURL(track.artUrl);
  state.playlist.splice(i, 1);

  if (i === state.currentIndex) {
    if (typeof audioEl !== 'undefined' && audioEl) audioEl.pause();
    state.currentIndex = -1;
    state.isPlaying = false;
    if (typeof updatePlayIcon === 'function') updatePlayIcon();
    if (state.playlist.length) {
      const nextIdx = typeof clamp === 'function' ? clamp(i, 0, state.playlist.length - 1) : 0;
      loadTrack(nextIdx, true);
    } else {
      resetNowPlaying();
    }
  } else if (i < state.currentIndex) {
    state.currentIndex--;
  }

  renderPlaylist();
  saveCurrentSession();
}

function resetNowPlaying() {
  if (typeof songTitleTop !== 'undefined' && songTitleTop) songTitleTop.textContent = 'No track loaded';
  if (typeof artistTop !== 'undefined' && artistTop) artistTop.textContent = '—';
  if (typeof titleInput !== 'undefined' && titleInput) titleInput.value = '';
  if (typeof artistInput !== 'undefined' && artistInput) artistInput.value = '';
  if (typeof durTimeEl !== 'undefined' && durTimeEl) durTimeEl.textContent = '00:00';
  if (typeof curTimeEl !== 'undefined' && curTimeEl) curTimeEl.textContent = '00:00';
  if (typeof seekBar !== 'undefined' && seekBar) seekBar.disabled = true;
  if (typeof seekFill !== 'undefined' && seekFill) seekFill.style.width = '0%';
  if (typeof uploadHintEl !== 'undefined' && uploadHintEl) uploadHintEl.classList.remove('hidden');
  state.artworkImage = null;
  if (typeof removeArtBtn !== 'undefined' && removeArtBtn) removeArtBtn.style.display = 'none';
}

async function loadTrack(index, autoplay = true) {
  const track = state.playlist[index];
  if (!track || typeof audioEl === 'undefined' || !audioEl) return;
  state.currentIndex = index;

  // Initialize and attach crossOrigin before setting source
  audioEl.crossOrigin = 'anonymous';
  audioEl.preload = 'auto';
  Audio1.init();

  audioEl.src = track.url;
  if (typeof speedSelect !== 'undefined' && speedSelect) {
    audioEl.playbackRate = parseFloat(speedSelect.value) || 1;
  }
  if (typeof songTitleTop !== 'undefined' && songTitleTop) songTitleTop.textContent = track.title;
  if (typeof artistTop !== 'undefined' && artistTop) artistTop.textContent = track.artist;
  if (typeof titleInput !== 'undefined' && titleInput) titleInput.value = track.title;
  if (typeof artistInput !== 'undefined' && artistInput) artistInput.value = track.artist;
  if (typeof uploadHintEl !== 'undefined' && uploadHintEl) uploadHintEl.classList.add('hidden');
  if (typeof seekBar !== 'undefined' && seekBar) seekBar.disabled = false;

  // Artwork Logic
  if (track.artworkRemoved) {
    state.artworkImage = null;
    if (typeof removeArtBtn !== 'undefined' && removeArtBtn) removeArtBtn.style.display = 'none';
  } else if (track.artUrl) {
    loadArtworkImage(track.artUrl);
    if (typeof removeArtBtn !== 'undefined' && removeArtBtn) removeArtBtn.style.display = '';
  } else {
    state.artworkImage = null;
    if (typeof removeArtBtn !== 'undefined' && removeArtBtn) removeArtBtn.style.display = 'none';
  }

  renderPlaylist();

  // Resume AudioContext
  await Audio1.resume();

  if (autoplay) {
    try {
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        await playPromise;
        state.isPlaying = true;
      }
    } catch (e) {
      console.warn('Playback autoplay promise prevented:', e);
      state.isPlaying = false;
    }
    if (typeof updatePlayIcon === 'function') updatePlayIcon();
  }

  saveCurrentSession();
}

function playNext(manual = false) {
  if (!state.playlist.length) return;
  if (state.shuffle) {
    let next = state.currentIndex;
    if (state.playlist.length > 1) {
      while (next === state.currentIndex) {
        next = Math.floor(Math.random() * state.playlist.length);
      }
    }
    loadTrack(next, true);
    return;
  }
  let next = state.currentIndex + 1;
  if (next >= state.playlist.length) {
    if (state.repeat === 'all' || manual) next = 0;
    else { 
      state.isPlaying = false; 
      if (typeof updatePlayIcon === 'function') updatePlayIcon(); 
      return; 
    }
  }
  loadTrack(next, true);
}

function playPrev() {
  if (!state.playlist.length || typeof audioEl === 'undefined' || !audioEl) return;
  if (audioEl.currentTime > 3) { 
    audioEl.currentTime = 0; 
    return; 
  }
  let prev = state.currentIndex - 1;
  if (prev < 0) prev = state.repeat === 'all' ? state.playlist.length - 1 : 0;
  loadTrack(prev, true);
}

/* ---------------------------------------------------------------
   6. Artwork image loading & Clear Artwork
   --------------------------------------------------------------- */
function loadArtworkImage(url) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    state.artworkImage = img;
    state.artworkColor = sampleDominantColor(img);
  };
  img.src = url;
}

function clearArtworkForCurrentTrack() {
  const track = state.playlist[state.currentIndex];
  if (track) {
    track.artworkRemoved = true;
    if (track.artUrl) {
      URL.revokeObjectURL(track.artUrl);
      track.artUrl = null;
    }
  }
  state.artworkImage = null;
  if (typeof removeArtBtn !== 'undefined' && removeArtBtn) removeArtBtn.style.display = 'none';
  renderPlaylist();
  if (typeof showToast === 'function') showToast('Artwork cleared.');
  saveCurrentSession();
}

function sampleDominantColor(img) {
  try {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const cx = c.getContext('2d');
    cx.drawImage(img, 0, 0, 16, 16);
    const data = cx.getImageData(0, 0, 16, 16).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < data.length; i += 4) { 
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; 
    }
    r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
    return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
  } catch (e) { 
    return state.theme.a; 
  }
}

function handleArtFile(file) {
  if (!file || !file.type.startsWith('image/')) { 
    if (typeof showToast === 'function') showToast('Please choose a JPG, PNG, or WEBP image.', true); 
    return; 
  }
  const url = URL.createObjectURL(file);
  const track = state.playlist[state.currentIndex];
  if (track) {
    if (track.artUrl) URL.revokeObjectURL(track.artUrl);
    track.artUrl = url;
    track.artworkRemoved = false;
    renderPlaylist();
  }
  if (typeof removeArtBtn !== 'undefined' && removeArtBtn) removeArtBtn.style.display = '';
  loadArtworkImage(url);
  saveCurrentSession();
}

/* ---------------------------------------------------------------
   7. Analysis: bands, smoothing, beat detection
   --------------------------------------------------------------- */
const bands = {
  bass: 0, mid: 0, treble: 0, volume: 0,
  bassS: 0, midS: 0, trebleS: 0, volumeS: 0, // smoothed
  beat: 0,                                   // decays 1 -> 0 after a hit
};
const bassHistory = [];
let lastBeatTime = 0;

function analyse(nowMs) {
  if (!Audio1.analyser || !Audio1.ctx) return;
  Audio1.analyser.getByteFrequencyData(Audio1.freqData);
  Audio1.analyser.getByteTimeDomainData(Audio1.timeData);

  const freq = Audio1.freqData;
  const len = freq.length;
  const nyquist = Audio1.ctx.sampleRate / 2;
  const binHz = nyquist / len;
  
  const clampFn = typeof clamp === 'function' ? clamp : (v, mn, mx) => Math.min(Math.max(v, mn), mx);
  const lerpFn = typeof lerp === 'function' ? lerp : (a, b, t) => a + (b - a) * t;

  const bassEnd = clampFn(Math.round(250 / binHz), 1, len - 1);
  const midEnd = clampFn(Math.round(4000 / binHz), bassEnd + 1, len - 1);
  const trebleEnd = clampFn(Math.round(14000 / binHz), midEnd + 1, len - 1);

  let bassSum = 0, midSum = 0, trebleSum = 0, totalSum = 0;
  for (let i = 0; i < bassEnd; i++) bassSum += freq[i];
  for (let i = bassEnd; i < midEnd; i++) midSum += freq[i];
  for (let i = midEnd; i < trebleEnd; i++) trebleSum += freq[i];
  for (let i = 0; i < len; i++) totalSum += freq[i];

  const sens = state.settings.sensitivity;
  const midR = state.settings.midResponse;
  const trebR = state.settings.trebleResponse;

  bands.bass = clampFn((bassSum / bassEnd / 255) * sens, 0, 1.6);
  bands.mid = clampFn((midSum / (midEnd - bassEnd) / 255) * sens * midR, 0, 1.6);
  bands.treble = clampFn((trebleSum / (trebleEnd - midEnd) / 255) * sens * trebR, 0, 1.6);
  bands.volume = clampFn((totalSum / len / 255) * sens, 0, 1.6);

  const alpha = clampFn(1 - (state.settings.smoothing / 100) * 0.9, 0.08, 0.9);
  bands.bassS = lerpFn(bands.bassS, bands.bass, alpha);
  bands.midS = lerpFn(bands.midS, bands.mid, alpha);
  bands.trebleS = lerpFn(bands.trebleS, bands.treble, alpha);
  bands.volumeS = lerpFn(bands.volumeS, bands.volume, alpha);

  // Beat / energy-spike detection on the bass band
  bassHistory.push(bands.bass);
  if (bassHistory.length > 43) bassHistory.shift();
  const avg = bassHistory.reduce((a, b) => a + b, 0) / bassHistory.length;
  const bassResp = state.settings.bassResponse;
  const beatI = state.settings.beatIntensity;
  
  if (bands.bass > avg * 1.35 * (1 / Math.max(bassResp, 0.6)) + 0.06 && bands.bass > 0.16 && nowMs - lastBeatTime > 160) {
    bands.beat = clampFn(bassResp * beatI, 0.6, 2.2);
    lastBeatTime = nowMs;
  }
  bands.beat = lerpFn(bands.beat, 0, 0.06);
}