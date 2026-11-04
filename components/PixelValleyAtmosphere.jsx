import { useEffect, useRef, useState } from 'react';

function getInitialSeason(override) {
  if (override) return override;
  if (typeof window === 'undefined') return 'Fall';
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
}

export default function PixelValleyAtmosphere({ seasonOverride = null }) {
  const canvasRef = useRef(null);
  const [season] = useState(() => getInitialSeason(seasonOverride));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle budget: strictly capped for 60fps performance (max 20 on desktop, 12 on mobile)
    const particleCount = window.innerWidth < 768 ? 12 : 20;
    const particles = [];

    const fallColors = ['#c98f55', '#a36c3a', '#7b4a28', '#c2415a', '#f2c230'];
    const springColors = ['#fbcfe8', '#f472b6', '#fda4af', '#fecdd3'];
    const summerColors = ['#fef08a', '#86efac', '#fde047', '#fed7aa'];
    const winterColors = ['#e0f2fe', '#bae6fd', '#f8fafc', '#cbd5e1'];

    let colors = fallColors;
    if (season === 'Spring') colors = springColors;
    else if (season === 'Summer') colors = summerColors;
    else if (season === 'Winter') colors = winterColors;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: season === 'Summer' ? Math.random() * 2.5 + 1.5 : Math.random() * 5 + 3,
        speedX: season === 'Summer' ? (Math.random() - 0.5) * 0.5 : Math.random() * 0.7 + 0.2,
        speedY: season === 'Summer' ? (Math.random() - 0.5) * 0.4 : Math.random() * 0.6 + 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.025,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.35 + 0.25,
        oscillation: Math.random() * 100,
        oscillationSpeed: Math.random() * 0.015 + 0.01,
        glow: season === 'Summer' ? Math.random() * Math.PI : 0,
      });
    }

    let mouseX = -100;
    let mouseY = -100;
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    function render() {
      // Pause animation loop if page is hidden
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.oscillation += p.oscillationSpeed;
        p.rotation += p.rotationSpeed;

        if (season === 'Summer') {
          // Firefly hovering logic
          p.x += p.speedX + Math.sin(p.oscillation) * 0.5;
          p.y += p.speedY + Math.cos(p.oscillation) * 0.5;
          p.glow += 0.04;
          const glowAlpha = (Math.sin(p.glow) + 1) / 2 * 0.45 + 0.15;

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.globalAlpha = glowAlpha;
          ctx.fill();
          ctx.restore();
        } else {
          // Leaf or petal fluttering logic
          p.x += p.speedX + Math.sin(p.oscillation) * 1.1;
          p.y += p.speedY;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          if (season === 'Winter') {
            // Snowflake
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Leaf shape
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // Screen wrap
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        } else if (p.y < -20) {
          p.y = height + 20;
        }
        if (p.x > width + 20) {
          p.x = -20;
        } else if (p.x < -20) {
          p.x = width + 20;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [season]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.7,
      }}
      aria-hidden="true"
    />
  );
}
