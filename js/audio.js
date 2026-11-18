/**
 * BONCUK & MÜEZZA – THE MAGICAL CAT ADVENTURE
 * Audio System: 100% Procedural Web Audio API Sound & Music Engine
 * Zero external audio assets required; runs reliably offline and cross-platform.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.bgmNoteIndex = 0;
    this.bgmChordIndex = 0;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;

    // Load muted state from localStorage if available
    try {
      const saved = localStorage.getItem('boncuk_muezza_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch (e) {}
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      if (this.ctx.state === 'suspended') {
        const unlock = () => {
          this.ctx.resume();
          document.removeEventListener('click', unlock);
          document.removeEventListener('keydown', unlock);
          document.removeEventListener('touchstart', unlock);
        };
        document.addEventListener('click', unlock);
        document.addEventListener('keydown', unlock);
        document.addEventListener('touchstart', unlock);
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

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime, 0.05);
    }
    try {
      localStorage.setItem('boncuk_muezza_muted', this.isMuted);
    } catch (e) {}
    return this.isMuted;
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

    // Pitch sweep "m-ya-oo-w"
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(peakFreq, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.38);

    // Formant filter modulation mimicking vocal tract
    filter.frequency.setValueAtTime(isBoncuk ? 1100 : 850, t);
    filter.frequency.linearRampToValueAtTime(isBoncuk ? 1800 : 1400, t + 0.14);
    filter.frequency.exponentialRampToValueAtTime(isBoncuk ? 900 : 700, t + 0.38);

    // Envelope
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  /**
   * Soft springy jumping sound
   */
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

  /**
   * Soft paw landing sound
   */
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

  /**
   * Cat treats / food munch crunch
   */
  playEat() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Crisp chomp click + sweet chime
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

  /**
   * Special toy (Toilet Paper / Sock) collection chime
   */
  playToyCollect() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    // Happy 4-note ascending bell arpeggio (C5, E5, G5, C6)
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

  /**
   * Hazard hit / Hurt
   */
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

    // Add distressed kitten squeak
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

  /**
   * Water splash sound
   */
  playSplash() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // White noise burst filtered + water bubble tone
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

  /**
   * Sleeping cat disturbance snore/grunt
   */
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
   * Level Victory Fanfare & Happy Purr
   */
  playVictory() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    // Glorious warm fanfare: G4, C5, E5, G5, C6 + purr vibration
    const melody = [
      { f: 392.00, d: 0.14 },
      { f: 523.25, d: 0.14 },
      { f: 659.25, d: 0.16 },
      { f: 783.99, d: 0.18 },
      { f: 1046.50, d: 0.45 }
    ];

    let offset = 0;
    const now = this.ctx.currentTime;

    melody.forEach((note) => {
      const t = now + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + note.d + 0.05);

      offset += note.d * 0.85;
    });

    // Happy purr rumble
    setTimeout(() => {
      this.playPurr(1.5);
    }, 450);
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

    // Purring frequency modulation (around 24Hz purr motor)
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(24, t);
    lfoGain.gain.setValueAtTime(25, t);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.linearRampToValueAtTime(0.18, t + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + duration);
    osc.stop(t + duration);
  }

  /**
   * Continuous Procedural Fairy-Tale Background Music
   */
  startBGM() {
    this.ensureContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.scheduleNextBGMStep();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  scheduleNextBGMStep() {
    if (!this.bgmPlaying || !this.ctx) return;

    // Pastel pentatonic progression in C / G Major:
    // Chords: Cmaj7 (C E G B), Am9 (A C E B), Fmaj7 (F A C E), G6 (G B D E)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 493.88], // Am9
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 329.63]  // G6
    ];

    const currentChord = chords[this.bgmChordIndex % chords.length];
    // Gentle marimba/music-box arpeggio note
    const noteFreq = currentChord[this.bgmNoteIndex % currentChord.length];

    if (!this.isMuted) {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Octave shimmer for music box feel
      const octave = (this.bgmNoteIndex % 2 === 0) ? 1 : 2;
      osc.frequency.setValueAtTime(noteFreq * octave, t);

      // Soft envelope
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(t);
      osc.stop(t + 0.5);

      // Play soft bass tone on chord start
      if (this.bgmNoteIndex === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(currentChord[0] * 0.5, t);

        bassGain.gain.setValueAtTime(0.14, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);

        bassOsc.start(t);
        bassOsc.stop(t + 0.95);
      }
    }

    this.bgmNoteIndex++;
    if (this.bgmNoteIndex >= 4) {
      this.bgmNoteIndex = 0;
      this.bgmChordIndex++;
    }

    // Step duration: 260ms per note (~115 BPM 8th notes)
    this.bgmTimer = setTimeout(() => {
      this.scheduleNextBGMStep();
    }, 260);
  }
}

window.soundEngine = new SoundEngine();
