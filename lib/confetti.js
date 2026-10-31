import confetti from 'canvas-confetti';

export function fireSuccessBurst(origin = { x: 0.5, y: 0.6 }) {
  confetti({
    particleCount: 50,
    spread: 60,
    origin,
    colors: ['#6366f1', '#a855f7', '#14b8a6', '#f43f5e', '#ffd166'],
    disableForReducedMotion: true,
  });
}

export function fireBigCelebration() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 40 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}
