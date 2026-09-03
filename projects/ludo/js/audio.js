/**
 * SoundFX - Procedural Web Audio API Sound Synthesizer & Tactile Vibration.
 * Generates all game sound effects dynamically without requiring any external audio files.
 * Handles audio context suspension/resumption policies safely.
 */
const SoundFX = (() => {
  let ctx = null;

  function getContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function isSoundEnabled() {
    try {
      const settings = Storage.get('settings');
      return settings ? settings.sound !== false : true;
    } catch (e) {
      return true;
    }
  }

  function isVibrationEnabled() {
    try {
      const settings = Storage.get('settings');
      return settings ? settings.vibration !== false : true;
    } catch (e) {
      return true;
    }
  }

  function vibrate(pattern) {
    if (isVibrationEnabled() && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // Noise generator for dice rattles
  function createNoiseBuffer(duration, audioCtx) {
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  return {
    init: () => {
      // Warm up on first user gesture
      const unlockAudio = () => {
        getContext();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });
    },

    // UI Click
    click: () => {
      if (!isSoundEnabled()) return;
      try {
        const c = getContext();
        if (!c) return;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, c.currentTime + 0.04);
        gain.gain.setValueAtTime(0.12, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 0.04);
      } catch (e) {}
    },

    // Dice Roll - Rich multi-rattle procedural sound
    roll: () => {
      vibrate(30);
      if (!isSoundEnabled()) return;
      try {
        const c = getContext();
        if (!c) return;
        
        // Rapid clatter pulses
        for (let i = 0; i < 4; i++) {
          const delay = i * 0.07;
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320 + Math.random() * 200, c.currentTime + delay);
          osc.frequency.exponentialRampToValueAtTime(140, c.currentTime + delay + 0.05);
          gain.gain.setValueAtTime(0.18, c.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + 0.05);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(c.currentTime + delay);
          osc.stop(c.currentTime + delay + 0.05);
        }
      } catch (e) {}
    },

    // Token Step / Hop
    move: () => {
      vibrate(15);
      if (!isSoundEnabled()) return;
      try {
        const c = getContext();
        if (!c) return;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, c.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 0.08);
      } catch (e) {}
    },

    // Token Capture
    capture: () => {
      vibrate([60, 40, 80]);
      if (!isSoundEnabled()) return;
      try {
        const c = getContext();
        if (!c) return;
        
        // Punchy low impact
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, c.currentTime + 0.22);
        gain.gain.setValueAtTime(0.3, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 0.22);

        // High strike sparkle
        const osc2 = c.createOscillator();
        const gain2 = c.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(900, c.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.15);
        gain2.gain.setValueAtTime(0.15, c.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
        osc2.connect(gain2);
        gain2.connect(c.destination);
        osc2.start(c.currentTime);
        osc2.stop(c.currentTime + 0.15);
      } catch (e) {}
    },

    // Ladder Climb - Ascending chime arpeggio
    ladder: () => {
      vibrate([30, 40, 30, 40, 50]);
      if (!isSoundEnabled()) return;
      try {
        const c = getContext();
        if (!c) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const delay = idx * 0.08;
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, c.currentTime + delay);
          gain.gain.setValueAtTime(0.16, c.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + 0.15);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(c.currentTime + delay);
          osc.stop(c.currentTime + delay + 0.15);
        });
      } catch (e) {}
    },

    // Snake Slide - Descending slide with filtered hiss
    snake: () => {
      vibrate([70, 50, 70]);
      if (!isSoundEnabled()) return;
      try {
        const c = getContext();
        if (!c) return;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(650, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(130, c.currentTime + 0.35);
        gain.gain.setValueAtTime(0.2, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 0.35);
      } catch (e) {}
    },

    // Victory Fanfare
    win: () => {
      vibrate([100, 50, 100, 50, 200]);
      if (!isSoundEnabled()) return;
      try {
        const c = getContext();
        if (!c) return;
        const fanfare = [
          { f: 523.25, d: 0.14, t: 0.00 }, // C5
          { f: 523.25, d: 0.14, t: 0.14 }, // C5
          { f: 523.25, d: 0.14, t: 0.28 }, // C5
          { f: 659.25, d: 0.28, t: 0.42 }, // E5
          { f: 783.99, d: 0.28, t: 0.70 }, // G5
          { f: 1046.50, d: 0.55, t: 0.98 } // C6
        ];
        fanfare.forEach((n) => {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.f, c.currentTime + n.t);
          gain.gain.setValueAtTime(0.22, c.currentTime + n.t);
          gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + n.t + n.d);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(c.currentTime + n.t);
          osc.stop(c.currentTime + n.t + n.d);
        });
      } catch (e) {}
    },

    // Invalid Move / Error Thud
    invalid: () => {
      vibrate(40);
      if (!isSoundEnabled()) return;
      try {
        const c = getContext();
        if (!c) return;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(70, c.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 0.1);
      } catch (e) {}
    },

    // Achievement / Level Up Sound
    achievement: () => {
      vibrate([50, 50, 100]);
      if (!isSoundEnabled()) return;
      try {
        const c = getContext();
        if (!c) return;
        const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        notes.forEach((freq, idx) => {
          const delay = idx * 0.09;
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, c.currentTime + delay);
          gain.gain.setValueAtTime(0.18, c.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + 0.2);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(c.currentTime + delay);
          osc.stop(c.currentTime + delay + 0.2);
        });
      } catch (e) {}
    }
  };
})();