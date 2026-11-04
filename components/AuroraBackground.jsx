import { useEffect, useRef } from 'react';

export default function AuroraBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width, height;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const orbs = [
      { x: width * 0.2, y: height * 0.25, r: 260, color: 'rgba(79, 110, 247, 0.10)', vx: 0.18, vy: 0.10 },
      { x: width * 0.8, y: height * 0.35, r: 280, color: 'rgba(14, 165, 233, 0.08)', vx: -0.15, vy: 0.15 },
      { x: width * 0.5, y: height * 0.75, r: 300, color: 'rgba(16, 185, 129, 0.07)', vx: 0.10, vy: -0.12 },
      { x: width * 0.85, y: height * 0.85, r: 240, color: 'rgba(244, 63, 94, 0.05)', vx: -0.10, vy: -0.08 },
    ];

    const drawFrame = (time) => {
      ctx.clearRect(0, 0, width, height);
      orbs.forEach((orb, i) => {
        const x = orb.x + Math.sin(time + i) * 0.25;
        const y = orb.y + Math.cos(time + i) * 0.25;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, orb.r);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) {
      // Draw single calm ambient frame without running a continuous 60fps loop
      drawFrame(0);
      return () => {
        window.removeEventListener('resize', resize);
      };
    }

    let t = 0;
    const render = () => {
      t += 0.008;
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -120) orb.x = width + 120;
        if (orb.x > width + 120) orb.x = -120;
        if (orb.y < -120) orb.y = height + 120;
        if (orb.y > height + 120) orb.y = -120;
      });

      drawFrame(t);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85,
        filter: 'blur(52px)',
      }}
    />
  );
}
