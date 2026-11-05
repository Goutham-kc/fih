import confetti from 'canvas-confetti';

export function fireSuccessBurst(origin = { x: 0.5, y: 0.6 }) {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  confetti({
    particleCount: 45,
    spread: 55,
    origin,
    colors: ['#6366f1', '#a855f7', '#10b981', '#f43f5e', '#f59e0b'],
    disableForReducedMotion: true,
  });
}

export function fireBigCelebration() {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  const duration = 2.2 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 28, spread: 360, ticks: 50, zIndex: 9999, disableForReducedMotion: true };

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 35 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.15, 0.35), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.65, 0.85), y: Math.random() - 0.2 } }));
  }, 240);
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}
