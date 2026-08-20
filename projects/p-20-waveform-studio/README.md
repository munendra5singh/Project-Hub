# Waveform Studio — Audio Reactive Music Visualizer

A self-contained, single-page music visualizer built with plain HTML, CSS and
JavaScript — no frameworks, no build step, no server. Everything runs and
stays in your browser.

## Run it

Just open `index.html` in a modern desktop or mobile browser (Chrome, Edge,
Firefox, Safari). No install, no server required — double-click the file or
serve the folder with any static file server.

## Using it

1. **Upload a song** — click "Upload Your Song," use the upload icon in the
   transport bar, or drag an MP3/WAV/OGG/M4A file anywhere onto the window.
2. **Upload cover art** (optional) — click the image icon, or drag an image
   file in. Otherwise a generated default cover is shown.
3. Press **Play**. The visualizer is driven live by the Web Audio API
   `AnalyserNode` reading your actual playing audio — bass, mids, treble,
   overall volume and beat spikes all come from real frequency data, not a
   canned animation.
4. Open **Settings** (gear icon) to switch visualizer mode (Bars, Circular,
   Waveform, Particles, Minimal), pick a color theme, or tune sensitivity,
   smoothing, glow, particle count, bass response, background intensity and
   rotation speed.
5. Open **Playlist** (list icon) to queue multiple songs, shuffle, repeat,
   or jump to any track.
6. Click the **film-strip icon** for a clean, chrome-free "YouTube mode," or
   the **expand icon** for true browser fullscreen — both are built for
   screen recording.
7. Click the **export icon** to render an MP4/WebM video of the current
   song with the live visualizer baked in, right in your browser, then
   download it.

## How the audio graph works

```
<audio> element  →  MediaElementAudioSourceNode  →  GainNode  →  AnalyserNode
                                                                     │
                                              ┌──────────────────────┴───────────────────────┐
                                              ▼                                                ▼
                                     AudioContext.destination                    MediaStreamAudioDestinationNode
                                        (what you hear)                        (feeds the video exporter's audio track)
```

The analyser's `getByteFrequencyData()` and `getByteTimeDomainData()` are read
every animation frame; bass/mid/treble/volume bands are derived from real
frequency ranges (bass ≈ 20–250 Hz, mid ≈ 250–4000 Hz, treble ≈ 4000–14000 Hz),
smoothed with linear interpolation, and fed into a lightweight bass-driven
beat detector.

## How export works

Everything you see — background, cover art, title, artist, and the
visualizer — is drawn on one `<canvas>`. That's what makes export possible:
an offscreen canvas at your chosen resolution (1080p or 720p, 16:9) runs the
exact same draw function in real time while the song plays, `canvas.captureStream()`
supplies the video track, the `MediaStreamAudioDestinationNode` supplies the
real audio track, and `MediaRecorder` encodes both together to WebM (or MP4,
where your browser's encoder supports it) — entirely client-side. Nothing is
ever uploaded anywhere.

## File structure

```
index.html   Markup / layout
style.css    Design system, layout, responsive rules
script.js    Audio engine, visualizer rendering, UI, export pipeline
assets/      (empty — the app draws its default artwork procedurally)
```

## Notes

- Everything runs locally: no login, no database, no external API calls, and
  your audio/image files never leave the browser.
- MP4 export depends on your browser shipping a native MP4 encoder for
  `MediaRecorder` (e.g. recent Safari). Where it isn't available, the MP4
  option is disabled and WebM is used — WebM uploads to YouTube directly.
- Keyboard shortcuts: `Space` play/pause, `←/→` seek 5s, `M` mute, `F`
  fullscreen.
