/**
 * save.meow — Play with Mel
 * Audio System: Studio-Grade Procedural Web Audio API Music & SFX Engine
 *
 * Features:
 * - Precision Web Audio lookahead scheduler (drift-free, seamless looping)
 * - Original multi-instrument arrangements:
 *     1. 'menu'      – Calm, cozy pastel storybook waltz-lilt (F Major, 108 BPM)
 *     2. 'adventure' – Energetic, bouncy 2D platformer melody (G Major, 138 BPM, 16 bars)
 *     3. 'victory'   – Joyful triumphant fanfare + celebratory sparkle underscore
 * - Synthesized instruments: Marimba, strummed Ukulele, Pizzicato bass/strings,
 *   Soft Felt Piano / Celesta, and playful light Percussion + warm echo bus
 * - Persistent mute & volume controls via localStorage
 * - Zero external audio assets; 100% original & offline-safe
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.volume = 0.8;

    // Music scheduler state
    this.bgmPlaying = false;
    this.currentTrack = 'none';   // 'menu' | 'adventure' | 'victory' | 'none'
    this.desiredTrack = 'menu';   // Track to resume once AudioContext unlocks
    this.schedulerId = null;
    this.nextNoteTime = 0;
    this.stepIndex = 0;
    this.noiseBuffer = null;

    // Audio routing nodes
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.bgmTrackGain = null;
    this.bgmBus = null;

    // Load saved mute & volume from localStorage
    try {
      const savedMute = localStorage.getItem('boncuk_muezza_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      const savedVol = localStorage.getItem('save_meow_volume');
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!Number.isNaN(parsed)) {
          this.volume = Math.max(0, Math.min(1, parsed));
        }
      }
    } catch (e) {}

    // Bind first-gesture unlock so menu music can start naturally on first click/tap/key
    this._bindAutoUnlock();
  }

  _bindAutoUnlock() {
    if (typeof document === 'undefined') return;
    const unlock = () => {
      this.ensureContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      if (!this.bgmPlaying && this.desiredTrack && this.desiredTrack !== 'none') {
        this.setMusicMode(this.desiredTrack);
      }
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('pointerdown', unlock, { passive: true });
    document.addEventListener('keydown', unlock, { passive: true });
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX Bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.76, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // BGM Master + Crossfade Track Gain
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.42, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.bgmTrackGain = this.ctx.createGain();
      this.bgmTrackGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.bgmTrackGain.connect(this.bgmGain);

      // Warm Storybook Echo Bus (subtle airy depth on marimba/ukulele/celesta)
      this.bgmBus = this.ctx.createGain();
      this.bgmBus.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.bgmBus.connect(this.bgmTrackGain);

      const delay = this.ctx.createDelay(0.5);
      delay.delayTime.setValueAtTime(0.185, this.ctx.currentTime);

      const delayFilter = this.ctx.createBiquadFilter();
      delayFilter.type = 'lowpass';
      delayFilter.frequency.setValueAtTime(2100, this.ctx.currentTime);

      const delayFeedback = this.ctx.createGain();
      delayFeedback.gain.setValueAtTime(0.22, this.ctx.currentTime);

      const delayWet = this.ctx.createGain();
      delayWet.gain.setValueAtTime(0.18, this.ctx.currentTime);

      this.bgmBus.connect(delay);
      delay.connect(delayFilter);
      delayFilter.connect(delayFeedback);
      delayFeedback.connect(delay);
      delayFilter.connect(delayWet);
      delayWet.connect(this.bgmTrackGain);

      // Shared white-noise buffer for shaker / brush percussion
      const len = Math.floor(this.ctx.sampleRate * 0.5);
      this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  getVolume() {
    return this.volume;
  }

  setVolume(val) {
    const v = Math.max(0, Math.min(1, Number(val)));
    if (Number.isNaN(v)) return this.volume;
    this.volume = v;

    if (v > 0 && this.isMuted) {
      this.isMuted = false;
      try { localStorage.setItem('boncuk_muezza_muted', 'false'); } catch (e) {}
    } else if (v === 0 && !this.isMuted) {
      this.isMuted = true;
      try { localStorage.setItem('boncuk_muezza_muted', 'true'); } catch (e) {}
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.03);
    }
    try {
      localStorage.setItem('save_meow_volume', String(this.volume));
    } catch (e) {}
    return this.volume;
  }

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    if (!this.isMuted && this.volume === 0) {
      this.volume = 0.65;
      try { localStorage.setItem('save_meow_volume', String(this.volume)); } catch (e) {}
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.04);
    }
    try {
      localStorage.setItem('boncuk_muezza_muted', String(this.isMuted));
    } catch (e) {}
    return this.isMuted;
  }

  // =========================================================================
  // INSTRUMENT SYNTHESIZERS (Warm Acoustic-Style Procedural Voices)
  // =========================================================================

  _midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Wooden Marimba / Xylophone (fundamental + 4th harmonic mallet overtone)
   */
  _playMarimba(midi, time, dur = 0.28, vol = 0.24, dest = null) {
    if (!this.ctx || midi == null) return;
    const out = dest || this.bgmBus;
    const freq = this._midiToFreq(midi);

    const osc = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const og = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 3.98, time);

    g.gain.setValueAtTime(0.0008, time);
    g.gain.linearRampToValueAtTime(vol, time + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0008, time + dur);

    og.gain.setValueAtTime(0.0008, time);
    og.gain.linearRampToValueAtTime(vol * 0.22, time + 0.003);
    og.gain.exponentialRampToValueAtTime(0.0008, time + 0.055);

    osc.connect(g);
    overtone.connect(og);
    og.connect(g);
    g.connect(out);

    osc.start(time);
    overtone.start(time);
    osc.stop(time + dur + 0.02);
    overtone.stop(time + 0.07);
  }

  /**
   * Cheerful Strummed Ukulele Chord (gentle 14ms string roll across voicing)
   */
  _playUkuleleChord(midis, time, dur = 0.32, vol = 0.12, upStrum = false, dest = null) {
    if (!this.ctx || !midis || !midis.length) return;
    const out = dest || this.bgmBus;
    const notes = upStrum ? [...midis].reverse() : midis;
    const perStringVol = vol / Math.sqrt(notes.length);

    notes.forEach((m, i) => {
      const t = time + i * 0.015;
      const freq = this._midiToFreq(m);

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, t);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq * 1.002, t);

      filter.type = 'lowpass';
      filter.Q.setValueAtTime(1.2, t);
      filter.frequency.setValueAtTime(Math.min(3400, freq * 6.5), t);
      filter.frequency.exponentialRampToValueAtTime(Math.max(480, freq * 2.1), t + Math.min(0.18, dur));

      const mix2 = this.ctx.createGain();
      mix2.gain.setValueAtTime(0.28, t);

      g.gain.setValueAtTime(0.0008, t);
      g.gain.linearRampToValueAtTime(perStringVol, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0008, t + dur);

      osc1.connect(filter);
      osc2.connect(mix2);
      mix2.connect(filter);
      filter.connect(g);
      g.connect(out);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur + 0.02);
      osc2.stop(t + dur + 0.02);
    });
  }

  /**
   * Warm Pizzicato String Bass / Pluck
   */
  _playPizzicato(midi, time, dur = 0.24, vol = 0.22, dest = null) {
    if (!this.ctx || midi == null) return;
    const out = dest || this.bgmTrackGain; // Direct dry bus keeps bass tight!
    const freq = this._midiToFreq(midi);

    const osc = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    sub.type = 'triangle';
    sub.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.Q.setValueAtTime(2.0, time);
    filter.frequency.setValueAtTime(freq * 5.2, time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(140, freq * 1.35), time + 0.11);

    const oscMix = this.ctx.createGain();
    oscMix.gain.setValueAtTime(0.45, time);

    g.gain.setValueAtTime(0.0008, time);
    g.gain.linearRampToValueAtTime(vol, time + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0008, time + dur);

    osc.connect(oscMix);
    oscMix.connect(filter);
    sub.connect(filter);
    filter.connect(g);
    g.connect(out);

    osc.start(time);
    sub.start(time);
    osc.stop(time + dur + 0.02);
    sub.stop(time + dur + 0.02);
  }

  /**
   * Soft Felt Piano / Sparkling Celesta
   */
  _playFeltPiano(midi, time, dur = 0.55, vol = 0.16, bright = false, dest = null) {
    if (!this.ctx || midi == null) return;
    const out = dest || this.bgmBus;
    const freq = this._midiToFreq(midi);

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const g2 = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = bright ? 'sine' : 'triangle';
    osc2.frequency.setValueAtTime(freq * (bright ? 3 : 2), time);

    g.gain.setValueAtTime(0.0008, time);
    g.gain.linearRampToValueAtTime(vol, time + (bright ? 0.005 : 0.015));
    g.gain.exponentialRampToValueAtTime(0.0008, time + dur);

    g2.gain.setValueAtTime(0.0008, time);
    g2.gain.linearRampToValueAtTime(vol * (bright ? 0.24 : 0.16), time + 0.008);
    g2.gain.exponentialRampToValueAtTime(0.0008, time + dur * 0.45);

    osc1.connect(g);
    osc2.connect(g2);
    g2.connect(out);
    g.connect(out);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + dur + 0.03);
    osc2.stop(time + dur * 0.5 + 0.02);
  }

  /**
   * Light Playful Percussion (Kick, Woodblock, Brush Snare, Shaker)
   */
  _playPerc(type, time, vol = 0.14) {
    if (!this.ctx) return;
    const out = this.bgmTrackGain;

    if (type === 'kick') {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(132, time);
      osc.frequency.exponentialRampToValueAtTime(52, time + 0.085);
      g.gain.setValueAtTime(vol, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.11);
      osc.connect(g);
      g.connect(out);
      osc.start(time);
      osc.stop(time + 0.12);
    } else if (type === 'wood') {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(860, time);
      osc.frequency.exponentialRampToValueAtTime(640, time + 0.032);
      g.gain.setValueAtTime(vol * 0.85, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
      osc.connect(g);
      g.connect(out);
      osc.start(time);
      osc.stop(time + 0.05);
    } else if (type === 'shaker' && this.noiseBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(5800, time);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol * 0.55, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.038);
      src.connect(hp);
      hp.connect(g);
      g.connect(out);
      src.start(time);
      src.stop(time + 0.042);
    } else if (type === 'snare' && this.noiseBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1950, time);
      bp.Q.setValueAtTime(1.1, time);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol * 0.65, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.075);
      src.connect(bp);
      bp.connect(g);
      g.connect(out);
      src.start(time);
      src.stop(time + 0.08);
    }
  }

  // =========================================================================
  // ORIGINAL COMPOSITIONS & SEAMLESS LOOKAHEAD SCHEDULER
  // =========================================================================

  _getTrackData(trackName) {
    if (trackName === 'menu') {
      // "Pastel Pati Ninni" — Peaceful, warm & whimsical F Major (108 BPM, 64 8th-note steps = 8 bars)
      // Seamless turnaround: Bar 8 C7 resolves warmly straight back into Bar 1 Fmaj7!
      return {
        stepDur: 60 / 108 / 2, // ~0.2778s per 8th note
        length: 64,
        chords: [
          [65, 69, 72, 76], // 0: Fmaj7
          [62, 65, 69, 72], // 1: Dm7
          [58, 62, 65, 69], // 2: Bbmaj7
          [60, 64, 67, 70], // 3: C7
          [69, 72, 76, 79], // 4: Am7
          [62, 65, 69, 72], // 5: Dm7
          [67, 70, 74, 77], // 6: Gm7
          [60, 65, 67, 70]  // 7: C7sus4 -> resolves cleanly to Fmaj7!
        ],
        bass: [
          53, null, null, null, 48, null, 50, null, // F - C - D
          50, null, null, null, 57, null, 55, null, // D - A - G
          46, null, null, null, 53, null, 50, null, // Bb - F - D
          48, null, null, null, 55, null, 52, null, // C - G - E
          45, null, null, null, 52, null, 48, null, // A - E - C
          50, null, null, null, 57, null, 53, null, // D - A - F
          43, null, null, null, 50, null, 46, null, // G - D - Bb
          48, null, null, null, 55, null, 52, null  // C - G - E (-> F!)
        ],
        lead: [
          // Bar 1 (Fmaj7)
          69, null, 72, 74, 72, null, 69, null,
          // Bar 2 (Dm7)
          65, null, 69, null, 72, null, 69, 67,
          // Bar 3 (Bbmaj7)
          65, null, 74, null, 72, 70, 69, null,
          // Bar 4 (C7)
          67, null, 72, null, 76, null, 74, 72,
          // Bar 5 (Am7)
          76, null, 79, null, 77, 76, 72, null,
          // Bar 6 (Dm7)
          74, null, 77, null, 76, 74, 72, null,
          // Bar 7 (Gm7)
          70, null, 74, 72, 70, null, 69, 67,
          // Bar 8 (C7sus4 -> C7 smooth lift back to A4 on step 0)
          65, null, 67, null, 69, null, 72, 70
        ],
        sparkle: [
          null, null, null, null, 84, null, null, null,
          null, null, null, null, 81, null, null, null,
          null, null, null, null, 86, null, null, null,
          null, null, null, null, 84, null, null, null,
          null, null, null, null, 88, null, null, null,
          null, null, null, null, 86, null, null, null,
          null, null, null, null, 82, null, null, null,
          null, null, null, null, 84, null, 88, null
        ]
      };
    }

    if (trackName === 'victory') {
      // Joyful, breezy celebratory sparkle loop in G Major (118 BPM, 32 steps = 4 bars)
      return {
        stepDur: 60 / 118 / 2,
        length: 32,
        chords: [
          [67, 71, 74, 78], // Gmaj7
          [64, 67, 71, 74], // Em7
          [60, 64, 67, 71], // Cmaj7
          [62, 66, 69, 72]  // D7
        ],
        bass: [
          55, null, null, null, 50, null, 52, null,
          52, null, null, null, 47, null, 50, null,
          48, null, null, null, 55, null, 52, null,
          50, null, null, null, 57, null, 54, null
        ],
        lead: [
          79, null, 74, 76, 79, null, 83, null,
          79, null, 76, null, 74, null, 71, null,
          72, null, 76, 79, 84, null, 83, 81,
          79, null, 78, null, 74, null, 76, 78
        ]
      };
    }

    // Default: 'adventure' — "Mırnav Macera!" Energetic, catchy 16-bar 2D platformer theme!
    // G Major, 138 BPM (128 8th-note steps = 16 bars, A-section + joyful B-section + seamless D7->G turnaround!)
    return {
      stepDur: 60 / 138 / 2, // ~0.2174s per 8th note — crisp, lively, joyful!
      length: 128,
      chords: [
        // A Section (Bars 1-8)
        [67, 71, 74],       // 0: G
        [66, 69, 74],       // 1: D/F#
        [64, 67, 71, 74],   // 2: Em7
        [62, 66, 71],       // 3: Bm
        [60, 64, 67, 72],   // 4: C
        [59, 62, 67, 71],   // 5: G/B
        [57, 60, 64, 67],   // 6: Am7
        [62, 66, 69, 72],   // 7: D7
        // B Section (Bars 9-16: Bright Exploration Lift!)
        [60, 64, 67, 71],   // 8: Cmaj7
        [62, 66, 69, 71],   // 9: D6
        [59, 62, 66, 69],   // 10: Bm7
        [64, 67, 71, 74],   // 11: Em7
        [57, 60, 64, 67],   // 12: Am7
        [62, 66, 69, 72],   // 13: D7
        [67, 71, 74, 78],   // 14: Gmaj7
        [62, 67, 69, 72]    // 15: D9sus4 -> D7 seamless loop back to Bar 1 G!
      ],
      bass: [
        // A Section walking pizzicato bass
        43, null, 50, null, 43, null, 47, 50, // G
        42, null, 50, null, 45, null, 50, null, // D/F#
        40, null, 47, null, 40, null, 43, 47, // Em7
        47, null, 54, null, 47, null, 50, null, // Bm
        48, null, 55, null, 48, null, 52, 55, // C
        47, null, 55, null, 50, null, 47, null, // G/B
        45, null, 52, null, 45, null, 48, 52, // Am7
        50, null, 57, null, 50, null, 45, 42, // D7
        // B Section bouncy bass
        48, null, 55, null, 48, null, 52, null, // Cmaj7
        50, null, 57, null, 50, null, 54, null, // D6
        47, null, 54, null, 47, null, 50, null, // Bm7
        40, null, 47, null, 43, null, 47, null, // Em7
        45, null, 52, null, 48, null, 52, null, // Am7
        50, null, 57, null, 50, null, 54, null, // D7
        43, null, 50, null, 47, null, 50, null, // Gmaj7
        50, null, 57, null, 54, null, 50, 45  // D7 turnaround -> G!
      ],
      lead: [
        // Bar 1 (G): catchy upbeat marimba hook!
        71, 74, 79, null, 76, 74, 71, null,
        // Bar 2 (D/F#): playful answer
        69, 74, 78, null, 76, 74, 69, null,
        // Bar 3 (Em7): nimble skip
        71, 76, 79, null, 78, 76, 74, 71,
        // Bar 4 (Bm): cheerful bounce
        74, null, 78, null, 71, null, 74, 76,
        // Bar 5 (C): joyful leap up!
        76, 79, 84, null, 83, 81, 79, 76,
        // Bar 6 (G/B): graceful cascade
        74, 79, 83, null, 81, 79, 76, 74,
        // Bar 7 (Am7): adventurous climb
        72, 76, 81, null, 79, 78, 76, 72,
        // Bar 8 (D7): energetic turnaround
        74, null, 78, 81, null, 79, 78, 76,

        // B SECTION (Bars 9-16: Magical Fairy-Tale Discovery!)
        // Bar 9 (Cmaj7)
        79, null, 76, 79, 83, null, 81, 79,
        // Bar 10 (D6)
        78, null, 74, 78, 81, null, 79, 78,
        // Bar 11 (Bm7)
        74, null, 71, 74, 78, null, 76, 74,
        // Bar 12 (Em7)
        76, null, 79, null, 83, null, 81, 79,
        // Bar 13 (Am7)
        81, null, 76, 79, 81, 83, 84, null,
        // Bar 14 (D7)
        86, null, 83, 81, 78, null, 81, null,
        // Bar 15 (Gmaj7)
        79, null, 74, 76, 79, null, 83, null,
        // Bar 16 (D7 -> smooth pickup straight back into Bar 1 B4-D5-G5!)
        81, null, 78, null, 74, null, 71, 69
      ],
      counter: [
        // Delicate celesta harmony in B-section & phrase endings!
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, 83, null, null, null, null, null,
        null, null, 88, null, null, null, null, null,
        null, null, 86, null, null, null, null, null,
        null, null, 84, null, null, null, null, null,
        null, null, 86, null, 81, null, null, null,

        // B section shimmering celesta
        83, null, null, null, 86, null, null, null,
        81, null, null, null, 86, null, null, null,
        78, null, null, null, 83, null, null, null,
        79, null, null, null, 86, null, null, null,
        84, null, null, null, 88, null, null, null,
        86, null, null, null, 81, null, null, null,
        83, null, 86, null, 91, null, null, null,
        86, null, 81, null, 78, null, null, null
      ]
    };
  }

  _scheduleStep(track, step, time) {
    if (this.isMuted) return;

    const bar = Math.floor(step / 8);
    const beatInBar = step % 8;
    const chord = track.chords[bar % track.chords.length];

    if (this.currentTrack === 'menu') {
      // Calm, sweet, peaceful arrangement
      if (track.bass[step] != null) {
        this._playPizzicato(track.bass[step], time, 0.42, 0.16);
      }
      // Gentle ukulele chord arpeggio on beats 0 & 4
      if (beatInBar === 0) {
        this._playUkuleleChord(chord, time, 0.55, 0.10, false);
      } else if (beatInBar === 4) {
        this._playUkuleleChord(chord.slice(1), time, 0.42, 0.075, true);
      }
      // Soft felt piano melody
      if (track.lead[step] != null) {
        this._playFeltPiano(track.lead[step], time, 0.52, 0.18, false);
      }
      // Delicate celesta shimmer
      if (track.sparkle && track.sparkle[step] != null) {
        this._playFeltPiano(track.sparkle[step], time, 0.65, 0.085, true);
      }
      // Whisper-soft shaker on offbeats
      if (beatInBar === 2 || beatInBar === 6) {
        this._playPerc('shaker', time, 0.045);
      }
    } else if (this.currentTrack === 'victory') {
      // Joyful sparkling victory reprise
      if (track.bass[step] != null) {
        this._playPizzicato(track.bass[step], time, 0.34, 0.18);
      }
      if (beatInBar === 0 || beatInBar === 4) {
        this._playUkuleleChord(chord, time, 0.42, 0.12, beatInBar === 4);
      }
      if (track.lead[step] != null) {
        this._playMarimba(track.lead[step], time, 0.32, 0.21);
        this._playFeltPiano(track.lead[step] + 12, time, 0.45, 0.07, true);
      }
      if (beatInBar === 2 || beatInBar === 6) {
        this._playPerc('shaker', time, 0.065);
      }
    } else {
      // 'adventure' — Energetic, bouncy, cheerful platformer music!
      // 1. Walking pizzicato bass
      if (track.bass[step] != null) {
        this._playPizzicato(track.bass[step], time, 0.24, 0.24);
      }

      // 2. Bouncy ukulele offbeat strums (classic upbeat platformer feel!)
      if (beatInBar === 2 || beatInBar === 6) {
        this._playUkuleleChord(chord, time, 0.24, 0.145, false);
      } else if (beatInBar === 5) {
        this._playUkuleleChord(chord, time, 0.18, 0.085, true);
      }

      // 3. Catchy marimba lead (+ soft felt piano doubling in B-section)
      if (track.lead[step] != null) {
        this._playMarimba(track.lead[step], time, 0.27, 0.25);
        if (step >= 64) {
          this._playFeltPiano(track.lead[step], time, 0.30, 0.09, false);
        }
      }

      // 4. Sparkling celesta counter-melody
      if (track.counter && track.counter[step] != null) {
        this._playFeltPiano(track.counter[step], time, 0.48, 0.10, true);
      }

      // 5. Fun, crisp percussion groove
      if (beatInBar === 0 || beatInBar === 4) {
        this._playPerc('kick', time, 0.15);
      }
      if (beatInBar === 2 || beatInBar === 6) {
        this._playPerc('wood', time, 0.085);
        this._playPerc('snare', time, 0.075);
      }
      if (beatInBar % 2 === 1) {
        this._playPerc('shaker', time, 0.055);
      } else {
        this._playPerc('shaker', time, 0.032);
      }
    }
  }

  _runScheduler() {
    if (!this.bgmPlaying || !this.ctx || this.currentTrack === 'none' || this.currentTrack === 'fanfare') return;
    if (this.ctx.state !== 'running') return;

    const track = this._getTrackData(this.currentTrack);
    const lookahead = 0.14; // Schedule 140ms ahead for rock-solid timing

    // Catch up cleanly if tab was backgrounded
    if (this.nextNoteTime < this.ctx.currentTime - 0.25) {
      this.nextNoteTime = this.ctx.currentTime + 0.05;
    }

    while (this.nextNoteTime < this.ctx.currentTime + lookahead) {
      this._scheduleStep(track, this.stepIndex, this.nextNoteTime);
      this.nextNoteTime += track.stepDur;
      this.stepIndex = (this.stepIndex + 1) % track.length;
    }
  }

  /**
   * Smoothly switches background music between 'menu', 'adventure', 'victory', or 'none'
   */
  setMusicMode(mode = 'menu') {
    this.desiredTrack = mode;
    if (mode === 'none') {
      this.stopBGM();
      return;
    }

    this.ensureContext();
    if (!this.ctx) return;

    // Already playing the exact requested track -> keep flowing uninterrupted!
    if (this.bgmPlaying && this.currentTrack === mode) {
      return;
    }

    const now = this.ctx.currentTime;
    const wasPlaying = this.bgmPlaying && this.currentTrack !== 'none';

    if (wasPlaying && this.bgmTrackGain) {
      // Smooth 140ms fade out -> switch -> gentle fade in (zero clicks!)
      this.bgmTrackGain.gain.cancelScheduledValues(now);
      this.bgmTrackGain.gain.setValueAtTime(this.bgmTrackGain.gain.value, now);
      this.bgmTrackGain.gain.linearRampToValueAtTime(0.001, now + 0.14);

      this.currentTrack = mode;
      this.stepIndex = 0;
      this.nextNoteTime = now + 0.16;

      this.bgmTrackGain.gain.setValueAtTime(0.001, now + 0.15);
      this.bgmTrackGain.gain.linearRampToValueAtTime(1.0, now + 0.34);
    } else {
      this.currentTrack = mode;
      this.stepIndex = 0;
      this.nextNoteTime = now + 0.06;
      if (this.bgmTrackGain) {
        this.bgmTrackGain.gain.cancelScheduledValues(now);
        this.bgmTrackGain.gain.setValueAtTime(0.001, now);
        this.bgmTrackGain.gain.linearRampToValueAtTime(1.0, now + 0.28);
      }
    }

    this.bgmPlaying = true;
    if (!this.schedulerId) {
      this.schedulerId = setInterval(() => this._runScheduler(), 28);
    }
    this._runScheduler();
  }

  /**
   * Backward-compatible startBGM (defaults to 'adventure' or requested mode)
   */
  startBGM(mode = 'adventure') {
    this.setMusicMode(mode || 'adventure');
  }

  stopBGM() {
    this.bgmPlaying = false;
    this.currentTrack = 'none';
    if (this.schedulerId) {
      clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
  }

  // =========================================================================
  // SOUND EFFECTS (All Original Game SFX Preserved + Upgraded Fanfare & UI)
  // =========================================================================

  /**
   * Gentle magical chime for intro reveal & logo clicks
   */
  playIntroChime() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [72, 76, 79, 84]; // C5, E5, G5, C6
    notes.forEach((m, i) => {
      this._playFeltPiano(m, now + i * 0.065, 0.42, 0.15, true, this.sfxGain);
    });
  }

  /**
   * Procedural Cat Meow
   * @param {string} catType 'boncuk' (higher, sweeter) or 'muezza' (warmer, rounder)
   */
  playMeow(catType = 'boncuk') {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(3.5, t);

    const isBoncuk = catType === 'boncuk';
    const startFreq = isBoncuk ? 520 : 410;
    const peakFreq = isBoncuk ? 820 : 660;
    const endFreq = isBoncuk ? 440 : 350;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(peakFreq, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.38);

    filter.frequency.setValueAtTime(isBoncuk ? 1100 : 850, t);
    filter.frequency.linearRampToValueAtTime(isBoncuk ? 1800 : 1400, t + 0.14);
    filter.frequency.exponentialRampToValueAtTime(isBoncuk ? 900 : 700, t + 0.38);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  playJump() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(560, t + 0.16);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.17);
  }

  playLand() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  playEat() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(440, t);
    osc1.frequency.exponentialRampToValueAtTime(880, t + 0.08);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, t + 0.03);
    osc2.frequency.exponentialRampToValueAtTime(1760, t + 0.14);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t + 0.03);
    osc1.stop(t + 0.18);
    osc2.stop(t + 0.18);
  }

  playToyCollect() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const t = now + i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.29);
    });
  }

  playHurt() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(95, t + 0.22);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.26);

    setTimeout(() => {
      if (this.ctx && !this.isMuted) {
        const t2 = this.ctx.currentTime;
        const o2 = this.ctx.createOscillator();
        const g2 = this.ctx.createGain();
        o2.type = 'triangle';
        o2.frequency.setValueAtTime(680, t2);
        o2.frequency.exponentialRampToValueAtTime(420, t2 + 0.15);
        g2.gain.setValueAtTime(0.18, t2);
        g2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.16);
        o2.connect(g2);
        g2.connect(this.sfxGain);
        o2.start(t2);
        o2.stop(t2 + 0.17);
      }
    }, 120);
  }

  playSplash() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.exponentialRampToValueAtTime(250, t + 0.24);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + 0.25);
  }

  playSleepingCatStir() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(180, t + 0.15);
    osc.frequency.linearRampToValueAtTime(110, t + 0.35);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.39);
  }

  /**
   * Joyful Multi-Instrument Victory & Rescue Fanfare + Happy Purr!
   */
  playVictory() {
    this.ensureContext();
    this.desiredTrack = 'victory';
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Immediately hush the running adventure BGM so the fanfare shines cleanly!
    if (this.bgmPlaying && this.bgmTrackGain) {
      this.bgmTrackGain.gain.cancelScheduledValues(now);
      this.bgmTrackGain.gain.setValueAtTime(this.bgmTrackGain.gain.value, now);
      this.bgmTrackGain.gain.linearRampToValueAtTime(0.001, now + 0.08);
      this.currentTrack = 'fanfare';
    }

    if (!this.isMuted) {
      // Cheerful ukulele chord flourish + bright marimba/celesta fanfare in G Major!
      const fanfareNotes = [
        { m: 67, t: 0.00, d: 0.14 }, // G4
        { m: 71, t: 0.11, d: 0.14 }, // B4
        { m: 74, t: 0.22, d: 0.14 }, // D5
        { m: 79, t: 0.34, d: 0.22 }, // G5
        { m: 76, t: 0.54, d: 0.14 }, // E5
        { m: 78, t: 0.66, d: 0.14 }, // F#5
        { m: 79, t: 0.78, d: 0.65 }  // G5 triumphant hold!
      ];

      fanfareNotes.forEach(n => {
        this._playMarimba(n.m, now + n.t, n.d, 0.28, this.sfxGain);
        this._playFeltPiano(n.m + 12, now + n.t, n.d + 0.12, 0.13, true, this.sfxGain);
      });

      // Harmony ukulele strums underneath fanfare
      this._playUkuleleChord([67, 71, 74], now + 0.00, 0.34, 0.16, false, this.sfxGain);
      this._playUkuleleChord([60, 64, 67, 72], now + 0.52, 0.26, 0.16, false, this.sfxGain);
      this._playUkuleleChord([67, 71, 74, 79], now + 0.78, 0.75, 0.22, false, this.sfxGain);

      // Final sparkling celesta cascade (G5 -> B5 -> D6 -> G6)
      [79, 83, 86, 91].forEach((m, i) => {
        this._playFeltPiano(m, now + 0.84 + i * 0.055, 0.52, 0.11, true, this.sfxGain);
      });

      setTimeout(() => {
        this.playPurr(1.3);
      }, 650);
    }

    // Transition smoothly into the joyful victory sparkle loop right after fanfare!
    setTimeout(() => {
      if (this.desiredTrack === 'victory') {
        this.setMusicMode('victory');
      }
    }, 1180);
  }

  playPurr(duration = 1.0) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(65, t);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(24, t);
    lfoGain.gain.setValueAtTime(25, t);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.14, t);
    gain.gain.linearRampToValueAtTime(0.17, t + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + duration);
    osc.stop(t + duration);
  }
}

window.soundEngine = new SoundEngine();
