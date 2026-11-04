import { useEffect, useState } from 'react';
import WeatherEngine from './WeatherEngine';
import { eventBus, EVENTS } from '@/lib/eventBus';

const CHAPTER_INDEX = {
  todos: 0,
  reminders: 1,
  deadlines: 2,
  debts: 3,
  dates: 4,
  watchlist: 5,
  audit: 6,
  settings: 7,
};

export default function VillageWorld({ activeTab, manualTime = null, manualWeather = null }) {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pv_reduced_motion');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    const unsub = eventBus.on(EVENTS.MOTION_TOGGLED, ({ reducedMotion: rm }) => {
      setReducedMotion(rm);
    });

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => {
      const saved = localStorage.getItem('pv_reduced_motion');
      if (saved === null) setReducedMotion(e.matches);
    };
    media.addEventListener('change', handler);
    return () => {
      unsub();
      media.removeEventListener('change', handler);
    };
  }, []);

  const currentIndex = CHAPTER_INDEX[activeTab] ?? 0;
  // Parallax offsets: Distant mountains move slow (1.5%), mid-ground hills move medium (4%), village path moves 8%
  const mountainOffset = reducedMotion ? 0 : -currentIndex * 1.5;
  const hillOffset = reducedMotion ? 0 : -currentIndex * 4.2;
  const pathOffset = reducedMotion ? 0 : -currentIndex * 8.5;

  return (
    <div
      className="pixel-village-world"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* 1. Day / Night & Weather Sky Engine */}
      <WeatherEngine activeTab={activeTab} manualTime={manualTime} manualWeather={manualWeather} />

      {/* 2. Parallax Layer 1: Distant Pine Mountains */}
      <div
        className="parallax-layer layer-mountains"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '-20%',
          width: '140%',
          height: '42vh',
          transform: `translateX(${mountainOffset}%)`,
          transition: reducedMotion ? 'none' : 'transform 750ms cubic-bezier(0.25, 1, 0.5, 1)',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'bottom',
          opacity: 0.35,
        }}
      >
        <svg viewBox="0 0 1200 200" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path
            d="M0,200 L0,120 Q120,40 240,110 T480,90 T720,130 T960,70 T1200,100 L1200,200 Z"
            fill="var(--pv-wood-dark, #7b4a28)"
            opacity="0.45"
          />
          <path
            d="M0,200 L0,150 Q160,80 320,140 T640,110 T960,150 T1200,120 L1200,200 Z"
            fill="var(--pv-grass-dark, #5e9440)"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* 3. Parallax Layer 2: Mid-ground Rolling Hills & Windmill Silhouettes */}
      <div
        className="parallax-layer layer-hills"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '-30%',
          width: '160%',
          height: '26vh',
          transform: `translateX(${hillOffset}%)`,
          transition: reducedMotion ? 'none' : 'transform 750ms cubic-bezier(0.25, 1, 0.5, 1)',
          opacity: 0.5,
        }}
      >
        <svg viewBox="0 0 1400 160" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path
            d="M0,160 L0,80 Q140,20 280,70 T560,50 T840,90 T1120,40 T1400,60 L1400,160 Z"
            fill="var(--pv-grass-dark, #5e9440)"
          />
        </svg>
      </div>

      {/* 4. Parallax Layer 3: Foreground Village Path Horizon Ribbon */}
      <div
        className="parallax-layer layer-foreground"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '-40%',
          width: '180%',
          height: '14vh',
          transform: `translateX(${pathOffset}%)`,
          transition: reducedMotion ? 'none' : 'transform 750ms cubic-bezier(0.25, 1, 0.5, 1)',
          opacity: 0.65,
        }}
      >
        <svg viewBox="0 0 1600 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path
            d="M0,100 L0,40 Q200,10 400,35 T800,25 T1200,45 T1600,20 L1600,100 Z"
            fill="var(--pv-soil, #7a4e2d)"
          />
          <path
            d="M0,100 L0,65 Q250,45 500,60 T1000,50 T1500,65 T1600,55 L1600,100 Z"
            fill="var(--pv-grass-light, #8fc45a)"
          />
        </svg>
      </div>
    </div>
  );
}
