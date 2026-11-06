import React, { useRef, useEffect } from 'react';

/**
 * Living 16-bit village landscape background for the title/login screen.
 * Pans slowly across the authentic Fields of Mistria map with gentle
 * falling cherry blossoms, evening fireflies, and warm dusk lighting.
 */
export default function LoginScenicBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let animFrame = 0;

    // Load village map
    const mapImg = new Image();
    mapImg.src = '/village_assets/rm_town_base.png';

    // Scenic camera waypoints (Town Fountain -> Saturday Market -> Farmstead -> Plaza)
    const waypoints = [
      { x: 1096, y: 1200 }, // Great Town Fountain
      { x: 1280, y: 1680 }, // Town Center & Notice Board
      { x: 1324, y: 2050 }, // Celine's Farmstead
      { x: 916, y: 1741 },  // Sleeping Dragon Inn
    ];

    let currentWpIndex = 0;
    let camX = waypoints[0].x;
    let camY = waypoints[0].y;

    // Cherry blossoms
    const petals = Array.from({ length: 42 }).map(() => ({
      x: Math.random() * 2000,
      y: Math.random() * 1200,
      rx: 2.2 + Math.random() * 1.8,
      ry: 1.2 + Math.random() * 1.0,
      speedX: 0.4 + Math.random() * 0.7,
      speedY: 0.6 + Math.random() * 0.8,
      rotSpeed: 0.02 + Math.random() * 0.03,
      angle: Math.random() * Math.PI * 2,
      swayPhase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.4 ? '#fca5a5' : '#f472b6',
      alpha: 0.6 + Math.random() * 0.35,
    }));

    // Twilight fireflies
    const fireflies = Array.from({ length: 24 }).map(() => ({
      baseX: Math.random() * 2000,
      baseY: Math.random() * 1200,
      x: 0,
      y: 0,
      phase: Math.random() * Math.PI * 2,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    function handleResize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.imageSmoothingEnabled = false;
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    function render() {
      animFrame++;
      const w = canvas.width;
      const h = canvas.height;

      // Smooth camera interpolation between scenic waypoints
      const targetWp = waypoints[currentWpIndex];
      const distToWp = Math.hypot(targetWp.x - camX, targetWp.y - camY);
      if (distToWp < 30) {
        currentWpIndex = (currentWpIndex + 1) % waypoints.length;
      } else {
        camX += (targetWp.x - camX) * 0.003;
        camY += (targetWp.y - camY) * 0.003;
      }

      ctx.save();

      // Clear with twilight deep slate
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Render map with camera centering & 2.2x zoom
      const zoom = Math.max(1.8, Math.min(2.5, w / 600));
      ctx.save();
      ctx.translate(Math.floor(w / 2), Math.floor(h / 2));
      ctx.scale(zoom, zoom);
      ctx.translate(-Math.floor(camX), -Math.floor(camY));

      if (mapImg.complete && mapImg.naturalWidth > 0) {
        ctx.drawImage(mapImg, 0, 0);
      }

      ctx.restore();

      // Warm Golden Hour Dusk Lighting Overlay
      const duskGrad = ctx.createLinearGradient(0, 0, 0, h);
      duskGrad.addColorStop(0, 'rgba(251, 146, 60, 0.14)');
      duskGrad.addColorStop(0.5, 'rgba(180, 83, 9, 0.18)');
      duskGrad.addColorStop(1, 'rgba(15, 23, 42, 0.42)');
      ctx.fillStyle = duskGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle edge vignette
      const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
      vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vig.addColorStop(1, 'rgba(10, 15, 25, 0.72)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      // Falling cherry blossom petals
      petals.forEach((p) => {
        p.x += p.speedX + Math.sin(p.swayPhase + animFrame * 0.04) * 0.6;
        p.y += p.speedY;
        p.angle += p.rotSpeed;

        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * (w + 100) - 50;
        }
        if (p.x > w + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.alpha;

        // Petal body
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
        ctx.fill();

        // White highlight tip
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = p.alpha * 0.55;
        ctx.fillRect(-1, -0.5, 1.5, 1);
        ctx.restore();
      });

      // Ambient evening fireflies
      fireflies.forEach((f) => {
        f.x = (f.baseX + Math.sin(f.phase + animFrame * 0.03) * 30 + w) % w;
        f.y = (f.baseY + Math.cos(f.phase * 1.3 + animFrame * 0.02) * 20 + h) % h;

        const pulse = (Math.sin(animFrame * 0.1 + f.pulsePhase) + 1) / 2;
        const alpha = 0.2 + pulse * 0.7;

        ctx.save();
        const rad = ctx.createRadialGradient(f.x, f.y, 0.5, f.x, f.y, 5);
        rad.addColorStop(0, `rgba(254, 240, 138, ${alpha.toFixed(2)})`);
        rad.addColorStop(0.4, `rgba(134, 239, 172, ${(alpha * 0.5).toFixed(2)})`);
        rad.addColorStop(1, 'rgba(134, 239, 172, 0)');
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.fillRect(Math.floor(f.x), Math.floor(f.y), 1.5, 1.5);
        ctx.restore();
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        imageRendering: 'pixelated',
      }}
    />
  );
}
