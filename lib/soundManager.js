// Pixel Valley - Audio & Sound Manager
// Generates nostalgic 8-bit & cozy acoustic soundscapes via native Web Audio API (Spec Section 8.3)
// 100% procedural, zero external network downloads, independent channel volumes

import { eventBus, EVENTS } from './eventBus';

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = true;
    this.masterVolume = 0.8;
    this.sfxVolume = 0.8;
    this.ambienceVolume = 0.4;
    this.ambienceNode = null;
    this.lastHoverTime = 0;
    this.lastDialogueTime = 0;

    if (typeof window !== 'undefined') {
      const savedMuted = localStorage.getItem('pv_sound_muted');
      const savedMaster = localStorage.getItem('pv_sound_master');
      const savedSfx = localStorage.getItem('pv_sound_sfx');
      const savedAmbience = localStorage.getItem('pv_sound_ambience');

      this.muted = savedMuted !== null ? savedMuted === 'true' : true;
      if (savedMaster !== null) this.masterVolume = parseFloat(savedMaster) || 0.8;
      if (savedSfx !== null) this.sfxVolume = parseFloat(savedSfx) || 0.8;
      if (savedAmbience !== null) this.ambienceVolume = parseFloat(savedAmbience) || 0.4;

      // Subscribe to eventBus events
      this.initEventListeners();
    }
  }

  getAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('pv_sound_muted', String(this.muted));
    }
    if (!this.muted) {
      this.playSfx('coin');
      this.startAmbience();
    } else {
      this.stopAmbience();
    }
    eventBus.emit(EVENTS.SOUND_TOGGLED, { muted: this.muted });
    return this.muted;
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (typeof window !== 'undefined') {
      localStorage.setItem('pv_sound_master', String(this.masterVolume));
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (typeof window !== 'undefined') {
      localStorage.setItem('pv_sound_sfx', String(this.sfxVolume));
    }
  }

  setAmbienceVolume(val) {
    this.ambienceVolume = Math.max(0, Math.min(1, val));
    if (typeof window !== 'undefined') {
      localStorage.setItem('pv_sound_ambience', String(this.ambienceVolume));
    }
  }

  getEffectiveVolume(channel = 'sfx') {
    if (this.muted) return 0;
    const channelVol = channel === 'ambience' ? this.ambienceVolume : this.sfxVolume;
    return this.masterVolume * channelVol;
  }

  initEventListeners() {
    eventBus.on(EVENTS.TASK_COMPLETED, () => this.playSfx('harvest'));
    eventBus.on(EVENTS.DEBT_SETTLED, () => this.playSfx('fanfare'));
    eventBus.on(EVENTS.DEBT_PAYMENT, () => this.playSfx('coin'));
    eventBus.on(EVENTS.DEADLINE_COMPLETED, () => this.playSfx('harvest'));
    eventBus.on(EVENTS.REMINDER_FIRED, () => this.playSfx('bell'));
    eventBus.on(EVENTS.CHAPTER_ENTERED, () => this.playSfx('wood'));
  }

  /**
   * Play procedural sound effect
   */
  playSfx(type = 'click') {
    if (this.muted) return;
    const volume = this.getEffectiveVolume('sfx');
    if (volume <= 0) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      switch (type) {
        // Gold Coin Jingle (dual harmonic sine ping)
        case 'coin': {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(987.77, now); // B5
          osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6
          osc2.frequency.setValueAtTime(1975.53, now);
          osc2.frequency.setValueAtTime(2637.02, now + 0.08);

          gain.gain.setValueAtTime(volume * 0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.35);
          osc2.stop(now + 0.35);
          break;
        }

        // Harvest / Quest Done (Triumphant warm pentatonic chime: C5-E5-G5-C6)
        case 'harvest':
        case 'quest': {
          const notes = [523.25, 659.25, 783.99, 1046.50];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.065);

            gain.gain.setValueAtTime(volume * 0.14, now + idx * 0.065);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + 0.3);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + idx * 0.065);
            osc.stop(now + idx * 0.065 + 0.32);
          });
          break;
        }

        // Wooden Plank Tap / Button Press
        case 'click':
        case 'wood': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(240, now);
          osc.frequency.exponentialRampToValueAtTime(90, now + 0.06);

          gain.gain.setValueAtTime(volume * 0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        // Hover tick (throttled to max once per 100ms)
        case 'hover': {
          const currentTime = Date.now();
          if (currentTime - this.lastHoverTime < 100) return;
          this.lastHoverTime = currentTime;

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);

          gain.gain.setValueAtTime(volume * 0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.025);
          break;
        }

        // Bell Ring (for Bell Tower & Reminders)
        case 'bell': {
          const freqs = [659.25, 1318.51, 1975.53];
          freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime((volume * 0.12) / (i + 1), now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 1.2);
          });
          break;
        }

        // Wax Stamp Thunk (for settling debts / stamping documents)
        case 'stamp': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

          gain.gain.setValueAtTime(volume * 0.22, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        // Paper rustle / page turn
        case 'paper':
        case 'mail': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.linearRampToValueAtTime(650, now + 0.12);

          gain.gain.setValueAtTime(volume * 0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }

        // Celebration Fanfare / Fairy Sparkle
        case 'fanfare':
        case 'sparkle': {
          const freqs = [880, 1108.73, 1318.51, 1760];
          freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);

            gain.gain.setValueAtTime(volume * 0.1, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.26);
          });
          break;
        }

        default:
          break;
      }
    } catch (e) {
      // AudioContext could be blocked by browser autoplay policy before user gesture
    }
  }

  /**
   * Play character-specific speech typewriter blip (Spec Section 8.3)
   */
  playDialogueBlip(characterId = 'pip') {
    if (this.muted) return;
    const volume = this.getEffectiveVolume('sfx');
    if (volume <= 0) return;

    const currentTime = Date.now();
    if (currentTime - this.lastDialogueTime < 70) return;
    this.lastDialogueTime = currentTime;

    const pitches = {
      pip: 440,       // A4 - cheerful farmer
      hoot: 220,      // A3 - low resonant owl
      marigold: 587,  // D5 - bouncy light rabbit
      bram: 175,      // F3 - deep dignified badger
      juniper: 659,   // E5 - playful nimble fox
      moss: 130,      // C3 - ancient steady turtle
      wren: 880,      // A5 - soft high bird chirp
      clover: 330,    // E4 - warm gentle goat elder
      rowan: 520,     // C5 - energetic hedgehog craftsman
    };

    const freq = pitches[characterId] || 440;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, now + 0.04);

      gain.gain.setValueAtTime(volume * 0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  /**
   * Start soft procedural ambient background murmur (gentle filtered white-noise breeze)
   */
  startAmbience() {
    if (this.muted || this.ambienceNode) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Soft low-pass filter to sound like gentle distant mountain breeze
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(this.getEffectiveVolume('ambience') * 0.02, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      this.ambienceNode = { whiteNoise, gain };
    } catch (e) {}
  }

  stopAmbience() {
    if (this.ambienceNode) {
      try {
        this.ambienceNode.whiteNoise.stop();
        this.ambienceNode.whiteNoise.disconnect();
      } catch (e) {}
      this.ambienceNode = null;
    }
  }
}

export const soundManager = new SoundManager();
