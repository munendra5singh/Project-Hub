# Waveform Studio — Professional Audio Visualizer

A self-contained, single-page music visualizer built with plain HTML, CSS
and JavaScript — no frameworks, no build step, no server. Everything runs
and stays in your browser.

## Run it

Just open `index.html` in a modern desktop or mobile browser (Chrome, Edge,
Firefox, Safari). No install, no server required.

## Using it

1. **Upload a song** — click "Upload Your Song," the upload icon in the
   transport bar, or drag an MP3/WAV/OGG/M4A file anywhere onto the window.
   Title and artist are set automatically (see "Smart titles" below) and can
   be edited any time in the top bar.
2. **Upload cover art** (optional) — click the image icon, or drag an image
   in. Otherwise a generated default cover is shown.
3. Press **Play**. Every visualizer is driven live by the Web Audio API
   `AnalyserNode` reading your actual playing audio.
4. Open **Settings** (gear icon) for collapsible sections: Visualizer,
   Colors, Artwork, Audio response, Glow & motion, Background, Particles,
   Text and Presets.
5. Open **Playlist** (list icon) to queue multiple songs, shuffle, repeat,
   or jump to any track.
   **expand icon** for true browser fullscreen — both are built for screen
   recording.
7. Click the **export icon** to render a video of the current song with the
   live visualizer baked in — 720p or 1080p, in 16:9, 1:1 or 9:16 — right in
   your browser, then download it.

## Smart titles (no more giant filenames)

Exported and on-screen titles never show a raw filename. Priority order:

- **Title:** your typed input → embedded ID3 tag (`TIT2`) if the file has
  one → a cleaned-up version of the filename (strips separators like `_`
  `|` `-`, bracketed tags like `(Official Video)`, and noise words like
  "lyrics", "official audio", "full song").
- **Artist:** your typed input → embedded ID3 tag (`TPE1`) → the second
  clean chunk of the filename → "Unknown artist".

So `Danda Deniya _ Masoom Sharma _ Mukesh Jaji _ Pinna Music _ New Haryanvi
Song.mp3` becomes title **"Danda Deniya"**, artist **"Masoom Sharma"** — never
a giant banner of the whole filename. The rendered title is always small,
centered, wraps to at most two lines, and shrinks automatically rather than
overflowing the canvas.

## Visualizer Engine

Visualizers are registered in a single scalable registry
(`VisualizerEngine.register({...})`) instead of a big if/else chain. There
are **36 visualizers** across six categories — all of them audio-reactive,
none of them randomly-animated eye candy:

- **Basic:** Bars, Spectrum Bars, Mirror Bars, Dual Bars, Waveform, Minimal,
  Oscilloscope, Filled Wave, Dual Wave, Dotted Wave
- **Circular:** Circular, Circular Spectrum, Radial Bars, Radial Wave, Ring
  Spectrum, Multi Ring, Spiral Spectrum, Orbit, Pulse Ring
- **Particle:** Particles, Particle Galaxy, Vortex, Starfield, Audio Dust,
  Particle Explosion
- **Geometric:** Neon Grid, Wave Grid, Hexagon Pulse, Polygon Pulse, Audio
  Tunnel, Tunnel Rings
- **Cinematic:** Plasma, Aurora, Liquid Spectrum, Energy Sphere, Electric
  Wave

Every entry defines a render function plus a *preferred artwork shape* —
e.g. circular visualizers wrap a circular cover, waveform-style modes prefer
a wide rectangle — used automatically by the Artwork Renderer below unless
you override it.

## Artwork Renderer

Cover art is no longer a fixed square. `ArtworkRenderer` resolves a shape,
size, position and glow configuration per visualizer (`Auto` mode), or you
can override any of it from the Artwork settings panel: shape (Rounded,
Square, Circle, Rectangle, Landscape, Portrait, Hexagon, Diamond), size,
position, corner radius, border, glow, shadow, opacity and beat-synced
pulse. The same configuration is used for the live preview and for export.

## Customization

- **Audio response:** sensitivity, smoothing, bass/mid/treble response, beat
  intensity.
- **Glow & motion:** glow intensity, glow radius, rotation speed, motion
  speed, mirror.
- **Colors:** five built-in themes plus a custom color picker, and a color
  *mode* — Theme, Gradient (primary + secondary), or Rainbow (continuously
  cycling hue, audio-modulated).
- **Background:** seven styles (Nebula, Gradient, Stars, Grid, Aurora,
  Noise, Solid) with intensity and speed controls.
- **Presets:** twelve built-in presets (Neon, Galaxy, Aurora, Cyberpunk,
  Energy, Purple Pulse, Rainbow, Cinematic, Minimal, Cosmic, Fire, Ocean)
  plus save/delete for your own, persisted with `localStorage`.
- **Randomize:** the dice button randomizes visualizer, colors, artwork and
  effect settings within tasteful ranges — never bass response of 500%.

## How the audio graph works

```
<audio> element  →  MediaElementAudioSourceNode  →  GainNode  →  AnalyserNode
                                                                     │
                                              ┌──────────────────────┴───────────────────────┐
                                              ▼                                                ▼
                                     AudioContext.destination                    MediaStreamAudioDestinationNode
                                        (what you hear)                        (feeds the video exporter's audio track)
```

`getByteFrequencyData()` / `getByteTimeDomainData()` are read every frame;
bass/mid/treble/volume bands are derived from real frequency ranges (bass ≈
20–250 Hz, mid ≈ 250–4000 Hz, treble ≈ 4000–14000 Hz), smoothed, and fed
into a bass-driven beat detector that every visualizer can react to.

## How export works

Everything on screen — background, artwork, title/artist, and the active
visualizer — is drawn by one function, `renderFrame()`. **The exact same
function renders both the live preview and the export canvas**, so exported
video always matches what you saw while designing it. An offscreen canvas at
your chosen resolution/aspect runs `renderFrame()` in real time while the
song plays; `canvas.captureStream()` supplies the video track, the
`MediaStreamAudioDestinationNode` supplies the real audio track, and
`MediaRecorder` encodes both to WebM (or MP4, where your browser's encoder
supports it) — entirely client-side.

## Architecture

```
AudioEngine (Audio1)   Web Audio graph, analyser, recording destination
TitleParser             Filename cleanup + minimal ID3v2 tag reader
PlaylistManager          addFilesToPlaylist / loadTrack / playNext / playPrev
ArtworkRenderer          Visualizer-aware artwork shape/size/glow config
BackgroundRenderer        Swappable background styles (nebula, grid, aurora…)
TextRenderer               Small, safe, auto-wrapping title/artist overlay
VisualizerEngine             Registry of 36 audio-reactive visualizers
PresetManager                 Built-in + custom presets (localStorage)
ExportPipeline                  MediaRecorder-based WebM/MP4 export
```

## File structure

```
index.html   Markup / layout
style.css    Design system, layout, responsive rules
script.js    Everything above, in one file (documented sections)
assets/      (empty — the app draws its default artwork procedurally)
```

## Notes

- Everything runs locally: no login, no database, no external API calls,
  your audio/image files never leave the browser.
- MP4 export depends on your browser shipping a native MP4 encoder for
  `MediaRecorder`. Where it isn't available, the MP4 option is disabled and
  WebM is used for broad browser compatibility.
- Keyboard shortcuts: `Space` play/pause, `←/→` seek 5s, `M` mute, `F`
  fullscreen, `Shift+R` randomize.
