// Cozy Stardew Valley Sound Synthesizer via Web Audio API
// Generates nostalgic 8-bit & cozy acoustic-style chimes without external assets.

let audioCtx = null;
let soundEnabled = true;

if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('fih_sound_enabled');
  if (saved !== null) {
    soundEnabled = saved === 'true';
  }
}

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function toggleSound() {
  soundEnabled = !soundEnabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('fih_sound_enabled', String(soundEnabled));
  }
  if (soundEnabled) {
    playSound('coin');
  }
  return soundEnabled;
}

export function playSound(type = 'click') {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
      // Stardew Gold Coin Jingle (dual harmonic sine ping)
      case 'coin': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';

        // Fast high arpeggio: B5 (987Hz) -> E6 (1318Hz)
        osc1.frequency.setValueAtTime(987.77, now);
        osc1.frequency.setValueAtTime(1318.51, now + 0.08);

        osc2.frequency.setValueAtTime(1975.53, now);
        osc2.frequency.setValueAtTime(2637.02, now + 0.08);

        gain.gain.setValueAtTime(0.14, now);
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

      // Stardew Harvest / Quest Done (Triumphant warm pentatonic chime)
      case 'harvest':
      case 'quest': {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);

          gain.gain.setValueAtTime(0.12, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.32);
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

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      // Letter / Mailbox Paper Unfold (Soft filtered whisper)
      case 'paper':
      case 'mail': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(660, now + 0.12);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }

      // Junimo Fairy Sparkle (high shimmer)
      case 'sparkle':
      case 'fanfare': {
        const freqs = [880, 1108.73, 1318.51, 1760];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);

          gain.gain.setValueAtTime(0.09, now + i * 0.05);
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
    // Audio context may be restricted before first interaction
  }
}
