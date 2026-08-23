/* =====================================================================
   PART 6: Frame Pipeline, Universal Mobile/Desktop Export & Init
   ===================================================================== */

/* ---------------------------------------------------------------
   14. Composition & Dynamic Responsive Canvas
   --------------------------------------------------------------- */
let dpr = Math.min(window.devicePixelRatio || 1, 2);

function resizeStage() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const isMobilePanel = document.body.classList.contains('panel-active') && window.innerWidth <= 720;
  const h = isMobilePanel ? Math.round(window.innerHeight * 0.48) : window.innerHeight;

  stageCanvas.width = Math.round(w * dpr);
  stageCanvas.height = Math.round(h * dpr);
  stageCanvas.style.width = w + 'px';
  stageCanvas.style.height = h + 'px';
}
window.addEventListener('resize', resizeStage);
resizeStage();

function getRegion(W, H) {
  const isMobilePanel = document.body.classList.contains('panel-active') && window.innerWidth <= 720;
  const topH = isMobilePanel ? 50 : (topbarEl.offsetHeight || 64);
  const botH = isMobilePanel ? 0 : (transportEl.offsetHeight || 130);
  return { x: 0, y: topH, w: W, h: Math.max(60, H - topH - botH) };
}

function renderFrame(ctx, W, H, tNow) {
  ctx.clearRect(0, 0, W, H);
  const pal = paletteColors(tNow);
  BackgroundRenderer.draw(ctx, W, H, tNow, pal);

  const region = getRegion(W, H);
  if (state.showTitle || state.showArtist || (state.showLyrics && state.lyrics && state.lyrics.length)) {
    TextRenderer.draw(ctx, region, titleInput.value, artistInput.value);
  }

  const vis = VisualizerEngine.get(state.mode);
  const artCfg = ArtworkRenderer.getConfig(region);
  const api = {
    ctx, region, art: artCfg, pal, tNow,
    freq: Audio1.freqData || new Uint8Array(0),
    timeData: Audio1.timeData || new Uint8Array(0),
    len: Audio1.freqData ? Audio1.freqData.length : 0,
    settings: state.settings,
    sens: state.settings.sensitivity,
    glow: state.settings.glowIntensity / 100,
    glowR: state.settings.glowRadius / 100,
    rotSpeed: state.settings.rotationSpeed / 100 * (state.settings.motionSpeed / 100),
  };

  if (vis.layer === 'behind' && vis.renderBehind) vis.renderBehind(api);
  ArtworkRenderer.draw(ctx, region, pal);
  if (vis.layer === 'front' && vis.renderFront) vis.renderFront(api);
  if (vis.layer !== 'behind' && vis.layer !== 'front') {
    if (vis.renderBehind) vis.renderBehind(api);
    if (vis.renderFront) vis.renderFront(api);
  }
}

/* ---------------------------------------------------------------
   15. Main loop
   --------------------------------------------------------------- */
let rafId = null;
let tabHidden = false;
let lastFrameTs = 0;
document.addEventListener('visibilitychange', () => { tabHidden = document.hidden; });

function renderFrameScaled(ctx, W, H, tNow) {
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  renderFrame(ctx, W, H, tNow);
  ctx.restore();
}

function advanceMotion(tsMs) {
  const dt = lastFrameTs ? clamp(tsMs - lastFrameTs, 0, 64) : 16;
  lastFrameTs = tsMs;
  const spd = state.settings.motionSpeed / 100;
  motionT += (dt / 1000) * spd;
}

/* ---------------------------------------------------------------
   22. Universal Mobile & Desktop Export Pipeline
   --------------------------------------------------------------- */
const RES_DIMENSIONS = {
  '16:9': { 2160: [3840, 2160], 1080: [1920, 1080], 720: [1280, 720] },
  '1:1':  { 2160: [2160, 2160], 1080: [1080, 1080], 720: [720, 720] },
  '9:16': { 2160: [2160, 3840], 1080: [1080, 1920], 720: [720, 1280] },
};

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const exportMuteBtn   = $('exportMuteBtn');
const exportVolIconOn  = $('exportVolIconOn');
const exportVolIconOff = $('exportVolIconOff');
const exportMuteLabel  = $('exportMuteLabel');

function updateExportMuteUi(muted) {
  if (exportVolIconOn) exportVolIconOn.style.display = muted ? 'none' : '';
  if (exportVolIconOff) exportVolIconOff.style.display = muted ? '' : 'none';
  if (exportMuteLabel) exportMuteLabel.textContent = muted ? 'Unmute Speaker' : 'Mute Speaker Sound';
  if (typeof Audio1 !== 'undefined' && Audio1.setSpeakerMute) {
    Audio1.setSpeakerMute(muted);
  }
}

if (exportMuteBtn) {
  exportMuteBtn.addEventListener('click', () => {
    ExportPipeline.speakerMuted = !ExportPipeline.speakerMuted;
    updateExportMuteUi(ExportPipeline.speakerMuted);
  });
}

const ExportPipeline = {
  active: false,
  cancelled: false,
  speakerMuted: false,
  autoDownloadTimerId: null,
  autoDownloadSec: 10,
  downloaded: false,
  resolution: 1080,
  fps: 30,
  format: 'webm',
  aspect: '16:9',
  recorder: null,
  chunks: [],
  exportCanvas: null,
  exportCtx: null,
  lastBlobUrl: null,
  lastBlob: null,
  wasPlayingBefore: false,
  wakeLock: null,

  getSupportedMimeType() {
    const candidates = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4'
    ];
    if (this.format === 'mp4') {
      for (const c of candidates) {
        if (c.startsWith('video/mp4') && MediaRecorder.isTypeSupported(c)) return c;
      }
    }
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c)) return c;
    }
    return '';
  },

  async requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
      }
    } catch (e) {}
  },

  releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
  },

  open() {
    if (state.currentIndex === -1) { showToast('Upload a song before exporting.', true); return; }
    exportSetup.style.display = '';
    exportProgress.style.display = 'none';
    exportDone.style.display = 'none';
    exportBackdrop.classList.add('show');
    exportBackdrop.setAttribute('aria-hidden', 'false');

    const mp4Supported = MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('video/mp4');
    mp4Chip.disabled = !mp4Supported;
    mp4Chip.style.opacity = mp4Supported ? '1' : '0.4';
    formatHint.textContent = mp4Supported
      ? 'MP4 uses native hardware encoder; WebM works everywhere.'
      : 'Your browser uses standard WebM format.';
  },

  close() {
    if (this.autoDownloadTimerId) {
      clearInterval(this.autoDownloadTimerId);
      this.autoDownloadTimerId = null;
    }
    this.speakerMuted = false;
    updateExportMuteUi(false);
    exportBackdrop.classList.remove('show');
    exportBackdrop.setAttribute('aria-hidden', 'true');
    if (this.active) this.cancel();
  },

  async start() {
    if (!window.MediaRecorder) { showToast('Your browser does not support video recording.', true); return; }
    const mime = this.getSupportedMimeType();
    
    this.cancelled = false;
    this.active = true;
    this.chunks = [];
    this.speakerMuted = false;
    updateExportMuteUi(false);
    await this.requestWakeLock();

    // Resolution setup
    const dims = (RES_DIMENSIONS[this.aspect] || RES_DIMENSIONS['16:9'])[this.resolution] || [1920, 1080];
    const [w, h] = dims;
    this.exportCanvas = document.createElement('canvas');
    this.exportCanvas.width = w;
    this.exportCanvas.height = h;
    this.exportCtx = this.exportCanvas.getContext('2d', { alpha: false });

    // Ensure Audio Context is active on phone
    await Audio1.resume();
    this.wasPlayingBefore = !audioEl.paused;
    
    // Reset track position
    audioEl.currentTime = 0;

    const fps = isMobile && this.resolution === 2160 ? 30 : (this.fps || 30);
    const videoStream = this.exportCanvas.captureStream(fps);
    
    // Audio track verification
    let combinedTracks = [...videoStream.getVideoTracks()];
    if (Audio1.recordDest && Audio1.recordDest.stream) {
      const audioTracks = Audio1.recordDest.stream.getAudioTracks();
      if (audioTracks.length > 0) combinedTracks.push(audioTracks[0]);
    }
    const combined = new MediaStream(combinedTracks);

    // Dynamic bitrate calculation for 4K / Mobile stability
    let bitrate = 6_000_000;
    if (this.resolution === 2160) {
      bitrate = isMobile ? 12_000_000 : 25_000_000;
    } else if (this.resolution === 1080) {
      bitrate = isMobile ? 5_000_000 : 10_000_000;
    }

    const options = mime ? { mimeType: mime, videoBitsPerSecond: bitrate } : {};

    try {
      this.recorder = new MediaRecorder(combined, options);
    } catch (e) {
      try {
        this.recorder = new MediaRecorder(combined);
      } catch (err) {
        showToast('Video recorder setup failed on this device.', true);
        this.active = false;
        this.releaseWakeLock();
        return;
      }
    }

    this.recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.chunks.push(e.data);
    };
    
    this.recorder.onstop = () => this.finish(mime);

    exportSetup.style.display = 'none';
    exportProgress.style.display = '';
    exportDone.style.display = 'none';
    progressStatus.textContent = `Rendering (${this.resolution}p @ ${fps} FPS)…`;

    // 1000ms timeslice phone ke buffer ko crash hone se bachata hai
    this.recorder.start(1000);

    try {
      await audioEl.play();
    } catch (e) {
      console.warn('Audio play triggered with user interaction fallback');
    }

    // Export render loop start
    this.renderExportFrame();
  },

  renderExportFrame() {
    if (!this.active) return;
    
    // Phone par early stop guard (minimum 0.5s check)
    if (this.cancelled || (audioEl.ended && audioEl.currentTime > 0.5)) {
      this.stopRecording();
      return;
    }

    const W = this.exportCanvas.width;
    const H = this.exportCanvas.height;
    const tsMs = performance.now();
    
    advanceMotion(tsMs);
    analyse(tsMs);

    this.exportCtx.save();
    renderFrame(this.exportCtx, W, H, tsMs);
    this.exportCtx.restore();

    if (audioEl.duration) {
      const pct = clamp((audioEl.currentTime / audioEl.duration) * 100, 0, 100);
      this.updateProgress(pct);
    }

    requestAnimationFrame(() => this.renderExportFrame());
  },

  updateProgress(pct) {
    progressPct.textContent = `${Math.round(pct)}%`;
    const circumference = 276.5;
    ringFg.style.strokeDashoffset = String(circumference - (pct / 100) * circumference);
  },

  stopRecording() {
    if (!this.active) return;
    this.active = false;
    this.releaseWakeLock();
    this.speakerMuted = false;
    updateExportMuteUi(false);

    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }
    if (!this.wasPlayingBefore) audioEl.pause();
  },

  cancel() {
    if (this.autoDownloadTimerId) {
      clearInterval(this.autoDownloadTimerId);
      this.autoDownloadTimerId = null;
    }
    this.cancelled = true;
    progressStatus.textContent = 'Cancelling…';
    this.stopRecording();
  },

  finish(mime) {
    this.releaseWakeLock();
    this.speakerMuted = false;
    updateExportMuteUi(false);

    if (this.cancelled) {
      exportBackdrop.classList.remove('show');
      showToast('Export cancelled.');
      return;
    }

    const outputType = (this.chunks[0] && this.chunks[0].type) || mime || 'video/webm';
    this.lastBlob = new Blob(this.chunks, { type: outputType });
    
    if (this.lastBlobUrl) URL.revokeObjectURL(this.lastBlobUrl);
    this.lastBlobUrl = URL.createObjectURL(this.lastBlob);

    const isMp4 = outputType.includes('mp4');
    const ext = isMp4 ? 'mp4' : 'webm';
    const track = state.playlist[state.currentIndex];
    const cleanTitle = (track?.title || 'visualizer').replace(/[^\w\- ]+/g, '').trim();
    const filename = `${cleanTitle}_${this.resolution}p.${ext}`;

    downloadVideoBtn.href = this.lastBlobUrl;
    downloadVideoBtn.download = filename;

    exportProgress.style.display = 'none';
    exportDone.style.display = '';
    showToast('✓ Render complete');

    // Auto download timer
    this.autoDownloadSec = 10;
    this.downloaded = false;
    if (this.autoDownloadTimerId) clearInterval(this.autoDownloadTimerId);

    const timerEl = $('autoDownloadTimer');
    const countSpan = $('countdownSec');
    if (timerEl) timerEl.style.display = '';
    if (countSpan) countSpan.textContent = '10';
    downloadVideoBtn.textContent = 'Download Video (10s)';

    const triggerDownload = (isManual = false) => {
      if (this.downloaded) return;
      this.downloaded = true;
      if (this.autoDownloadTimerId) {
        clearInterval(this.autoDownloadTimerId);
        this.autoDownloadTimerId = null;
      }
      if (timerEl) timerEl.style.display = 'none';
      downloadVideoBtn.textContent = 'Download Video';

      if (!isManual) {
        const a = document.createElement('a');
        a.href = this.lastBlobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      setTimeout(() => {
        showToast('✓ Video download completed');
      }, 400);
    };

    this.autoDownloadTimerId = setInterval(() => {
      this.autoDownloadSec--;
      if (this.autoDownloadSec > 0) {
        if ($('countdownSec')) $('countdownSec').textContent = this.autoDownloadSec;
        downloadVideoBtn.textContent = `Download Video (${this.autoDownloadSec}s)`;
      } else {
        triggerDownload(false);
      }
    }, 1000);

    downloadVideoBtn.onclick = async (e) => {
      if (!this.downloaded) {
        if (isMobile && navigator.canShare) {
          try {
            const testFile = new File([this.lastBlob], filename, { type: outputType });
            if (navigator.canShare({ files: [testFile] })) {
              e.preventDefault();
              await navigator.share({
                files: [testFile],
                title: filename,
                text: 'Rendered with Waveform Studio'
              });
              triggerDownload(true);
              return;
            }
          } catch (shareErr) {
            if (shareErr.name !== 'AbortError') {
              window.location.href = this.lastBlobUrl;
            }
          }
        }
        triggerDownload(true);
      }
    };
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
fpsOptions.addEventListener('click', (e) => {
  const chip = e.target.closest('.option-chip'); if (!chip) return;
  ExportPipeline.fps = parseInt(chip.dataset.fps, 10);
  [...fpsOptions.children].forEach(c => c.classList.toggle('active', c === chip));
});
aspectOptions.addEventListener('click', (e) => {
  const chip = e.target.closest('.option-chip'); if (!chip) return;
  ExportPipeline.aspect = chip.dataset.aspect;
  [...aspectOptions.children].forEach(c => c.classList.toggle('active', c === chip));
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
   23. Init
   --------------------------------------------------------------- */
function init() {
  initSettingsPanel();
  applyTheme('purple');
  renderPresetGrid();
  renderPlaylist();
  resetNowPlaying();
  updatePlayIcon();
  setMuteIcon(false);

  if (typeof StudioDB !== 'undefined') {
    StudioDB.getSession().then((saved) => {
      if (saved && saved.playlist && saved.playlist.length > 0) {
        if (restoreBackdrop) {
          restoreBackdrop.classList.add('show');
          restoreBackdrop.setAttribute('aria-hidden', 'false');
        }
        if (restoreSessionBtn) {
          restoreSessionBtn.onclick = async () => {
            if (restoreBackdrop) {
              restoreBackdrop.classList.remove('show');
              restoreBackdrop.setAttribute('aria-hidden', 'true');
            }
            await restoreSavedSession(saved);
          };
        }
        if (startFreshBtn) {
          startFreshBtn.onclick = async () => {
            if (restoreBackdrop) {
              restoreBackdrop.classList.remove('show');
              restoreBackdrop.setAttribute('aria-hidden', 'true');
            }
            await StudioDB.clearSession();
            showToast('Started fresh Studio session.');
          };
        }
      }
    });
  }

  if (rafId) cancelAnimationFrame(rafId);
  const boundLoop = (tsMs) => {
    rafId = requestAnimationFrame(boundLoop);
    if (tabHidden && !ExportPipeline.active) return;
    advanceMotion(tsMs);
    analyse(tsMs);
    renderFrameScaled(stageCtx, stageCanvas.width / dpr, stageCanvas.height / dpr, tsMs);
    updateTransportUi();
  };
  rafId = requestAnimationFrame(boundLoop);
}

init();
