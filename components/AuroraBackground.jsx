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

    // Floating glowing orbs
    const orbs = [
      { x: width * 0.2, y: height * 0.25, r: 240, color: 'rgba(99, 102, 241, 0.18)', vx: 0.25, vy: 0.15 },
      { x: width * 0.8, y: height * 0.35, r: 260, color: 'rgba(168, 85, 247, 0.15)', vx: -0.2, vy: 0.2 },
      { x: width * 0.5, y: height * 0.75, r: 280, color: 'rgba(20, 184, 166, 0.12)', vx: 0.15, vy: -0.18 },
      { x: width * 0.85, y: height * 0.85, r: 220, color: 'rgba(236, 72, 153, 0.12)', vx: -0.15, vy: -0.12 },
    ];

    let t = 0;
    const render = () => {
      t += 0.01;
      ctx.clearRect(0, 0, width, height);

      orbs.forEach((orb, i) => {
        orb.x += orb.vx + Math.sin(t + i) * 0.3;
        orb.y += orb.vy + Math.cos(t + i) * 0.3;

        if (orb.x < -100) orb.x = width + 100;
        if (orb.x > width + 100) orb.x = -100;
        if (orb.y < -100) orb.y = height + 100;
        if (orb.y > height + 100) orb.y = -100;

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

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
        filter: 'blur(50px)',
      }}
    />
  );
}
