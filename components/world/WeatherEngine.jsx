import { useEffect, useRef, useState } from 'react';
import { eventBus, EVENTS } from '@/lib/eventBus';

// Date-seeded pseudo-random generator (stable for the entire day)
export function getDateSeededWeather(date = new Date()) {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const x = Math.sin(seed) * 10000;
  const rand = x - Math.floor(x);

  const month = date.getMonth();
  if (month === 11 || month <= 1) {
    // Winter: snow or clear
    return rand > 0.4 ? 'snow' : 'clear';
  } else if (month >= 2 && month <= 4) {
    // Spring: breeze or clear
    return rand > 0.5 ? 'breeze' : 'clear';
  } else if (month >= 5 && month <= 7) {
    // Summer: fireflies or clear
    return rand > 0.4 ? 'fireflies' : 'clear';
  } else {
    // Fall: breeze (falling leaves) or clear
    return rand > 0.35 ? 'breeze' : 'clear';
  }
}

export function getTimeOfDay(hour) {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'dusk';
  return 'night';
}

export default function WeatherEngine({ activeTab, manualTime = null, manualWeather = null }) {
  const canvasRef = useRef(null);
  const [timeOfDay, setTimeOfDay] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTime = localStorage.getItem('pv_time_override');
      if (savedTime && savedTime !== 'auto') return savedTime;
    }
    if (activeTab === 'watchlist') return 'night'; // Chapter 5 is permanently twilight/night
    if (activeTab === 'audit') return 'night'; // Chapter 6 is underground cellar
    if (manualTime) return manualTime;
    return getTimeOfDay(new Date().getHours());
  });

  const [weather, setWeather] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedWeather = localStorage.getItem('pv_weather_override');
      if (savedWeather && savedWeather !== 'auto') return savedWeather;
    }
    if (activeTab === 'audit') return 'clear'; // Underground cellar ignores weather
    if (manualWeather) return manualWeather;
    return getDateSeededWeather(new Date());
  });

  // Listen to manual overrides or eventBus
  useEffect(() => {
    const unsubWeather = eventBus.on(EVENTS.WEATHER_CHANGED, ({ weather: newWeather }) => {
      if (newWeather === 'auto') {
        setWeather(getDateSeededWeather(new Date()));
      } else if (newWeather) {
        setWeather(newWeather);
      }
    });

    const unsubTime = eventBus.on(EVENTS.TIME_CHANGED, ({ time: newTime }) => {
      if (newTime === 'auto') {
        setTimeOfDay(getTimeOfDay(new Date().getHours()));
      } else if (newTime) {
        setTimeOfDay(newTime);
      }
    });

    return () => {
      unsubWeather();
      unsubTime();
    };
  }, []);

  // Canvas weather particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = canvas.getContext('2d');
    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Weather particle pool (capped strictly at max 24 desktop, 12 mobile)
    const count = window.innerWidth < 768 ? 12 : 24;
    const particles = [];

    const leafColors = ['#c98f55', '#a36c3a', '#7b4a28', '#c2415a', '#f2c230'];
    const snowColors = ['#f8fafc', '#e2e8f0', '#cbd5e1'];
    const fireflyColors = ['#fef08a', '#fde047', '#86efac'];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: weather === 'fireflies' ? Math.random() * 2.5 + 1.5 : Math.random() * 5 + 3,
        speedX: weather === 'rain' ? 1.5 : (Math.random() - 0.5) * 0.8,
        speedY: weather === 'rain' ? Math.random() * 4 + 4 : Math.random() * 0.6 + 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        color:
          weather === 'snow'
            ? snowColors[Math.floor(Math.random() * snowColors.length)]
            : weather === 'fireflies'
            ? fireflyColors[Math.floor(Math.random() * fireflyColors.length)]
            : leafColors[Math.floor(Math.random() * leafColors.length)],
        opacity: Math.random() * 0.35 + 0.2,
        oscillation: Math.random() * 100,
        oscillationSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    function render() {
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      if (weather !== 'clear') {
        particles.forEach((p) => {
          p.oscillation += p.oscillationSpeed;
          p.rotation += p.rotationSpeed;

          if (weather === 'rain') {
            // Rain streak
            p.x += p.speedX;
            p.y += p.speedY;

            ctx.save();
            ctx.strokeStyle = 'rgba(79, 155, 209, 0.4)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + 3, p.y + 10);
            ctx.stroke();
            ctx.restore();
          } else if (weather === 'fireflies') {
            // Firefly glow
            p.x += Math.sin(p.oscillation) * 0.6;
            p.y += Math.cos(p.oscillation) * 0.4;
            const alpha = (Math.sin(p.oscillation * 2) + 1) / 2 * 0.5 + 0.15;

            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.globalAlpha = alpha;
            ctx.fill();
            ctx.restore();
          } else {
            // Breeze / Falling leaves or snow
            p.x += p.speedX + Math.sin(p.oscillation) * 1.1;
            p.y += p.speedY;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;

            if (weather === 'snow') {
              ctx.beginPath();
              ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.beginPath();
              ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }

          // Screen wrap
          if (p.y > height + 20) p.y = -20;
          if (p.x > width + 20) p.x = -20;
          if (p.x < -20) p.x = width + 20;
        });
      }

      animId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [weather]);

  return (
    <>
      {/* Sky Gradient Background Layer */}
      <div
        className={`pixel-sky-layer sky-${timeOfDay}`}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -2,
          pointerEvents: 'none',
          transition: 'background 1.5s ease',
        }}
      />

      {/* Atmospheric Particles Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          opacity: 0.75,
        }}
        aria-hidden="true"
      />
    </>
  );
}
