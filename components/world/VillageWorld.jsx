
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

export default function VillageWorld({
  activeTab,
  manualTime = null,
  manualWeather = null,
}) {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;

    const saved = localStorage.getItem('pv_reduced_motion');

    if (saved !== null) return saved === 'true';

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const unsubscribe = eventBus.on(
      EVENTS.MOTION_TOGGLED,
      ({ reducedMotion: value }) => {
        setReducedMotion(value);
      }
    );

    const media = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    const handleMotionChange = (event) => {
      const saved = localStorage.getItem('pv_reduced_motion');

      if (saved === null) {
        setReducedMotion(event.matches);
      }
    };

    media.addEventListener('change', handleMotionChange);

    return () => {
      unsubscribe();
      media.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const currentIndex = CHAPTER_INDEX[activeTab] ?? 0;

  const mountainOffset = reducedMotion ? 0 : -currentIndex * 1.5;
  const hillOffset = reducedMotion ? 0 : -currentIndex * 4.2;
  const pathOffset = reducedMotion ? 0 : -currentIndex * 8.5;

  const transition = reducedMotion
    ? 'none'
    : 'transform 750ms cubic-bezier(0.25, 1, 0.5, 1)';

  return (
    <div
      className="pixel-village-world"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        isolation: 'isolate',
      }}
    >
      {/* Weather, daylight and night-time atmosphere */}
      <WeatherEngine
        activeTab={activeTab}
        manualTime={manualTime}
        manualWeather={manualWeather}
      />

      {/* Distant mountains */}
      <div
        className="parallax-layer layer-mountains"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '-20%',
          width: '140%',
          height: '46vh',
          transform: `translateX(${mountainOffset}%)`,
          transition,
          opacity: 0.38,
        }}
      >
        <svg
          viewBox="0 0 1200 300"
          preserveAspectRatio="none"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Far mountain silhouettes */}
          <path
            d="
              M0 300
              V180 H60 V155 H120 V120 H180 V145
              H230 V170 H280 V125 H330 V95
              H390 V115 H440 V150 H500 V125
              H550 V85 H610 V110 H660 V150
              H720 V175 H770 V140 H820 V100
              H880 V125 H930 V160 H990 V130
              H1040 V105 H1100 V135 H1150 V165
              H1200 V300 Z
            "
            fill="var(--pv-wood-dark, #7b4a28)"
            opacity="0.55"
          />

          {/* Mountain highlights */}
          <path
            d="
              M280 125 H330 V95 H390 V115
              H365 V130 H330 V145 H300 V155
              Z
              M550 85 H610 V110
              H585 V125 H560 V145 H540 Z
              M820 100 H880 V125
              H855 V140 H825 V155 H800 Z
            "
            fill="var(--pv-parchment, #e7c98d)"
            opacity="0.22"
          />

          {/* Near mountain ridge */}
          <path
            d="
              M0 300
              V220 H100 V195 H170 V170
              H240 V190 H320 V210
              H410 V180 H480 V165
              H550 V190 H640 V220
              H720 V185 H800 V175
              H870 V205 H960 V220
              H1050 V190 H1120 V210
              H1200 V300 Z
            "
            fill="var(--pv-grass-dark, #5e9440)"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Mid-ground hills */}
      <div
        className="parallax-layer layer-hills"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '-30%',
          width: '160%',
          height: '30vh',
          transform: `translateX(${hillOffset}%)`,
          transition,
          opacity: 0.58,
        }}
      >
        <svg
          viewBox="0 0 1400 200"
          preserveAspectRatio="none"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Back hill */}
          <path
            d="
              M0 200
              V105 H100 V85 H200 V65
              H300 V80 H400 V100
              H500 V75 H600 V55
              H700 V80 H800 V110
              H900 V85 H1000 V65
              H1100 V80 H1200 V105
              H1300 V85 H1400 V200 Z
            "
            fill="var(--pv-grass-dark, #5e9440)"
          />

          {/* Front hill */}
          <path
            d="
              M0 200
              V145 H100 V125 H220 V115
              H340 V135 H460 V150
              H580 V125 H700 V115
              H820 V130 H940 V145
              H1060 V120 H1180 V110
              H1300 V135 H1400 V150
              V200 Z
            "
            fill="var(--pv-grass-light, #8fc45a)"
            opacity="0.85"
          />

          {/* Small patches of distant vegetation */}
          <path
            d="
              M160 115 H190 V95 H220 V115
              H250 V125 H160 Z
              M650 115 H680 V90 H710 V115
              H740 V125 H650 Z
              M1120 110 H1150 V85 H1180 V110
              H1210 V120 H1120 Z
            "
            fill="var(--pv-grass-dark, #5e9440)"
            opacity="0.65"
          />
        </svg>
      </div>

      {/* Foreground village landscape */}
      <div
        className="parallax-layer layer-foreground"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '-40%',
          width: '180%',
          height: '16vh',
          minHeight: '90px',
          transform: `translateX(${pathOffset}%)`,
          transition,
          opacity: 0.7,
        }}
      >
        <svg
          viewBox="0 0 1600 120"
          preserveAspectRatio="none"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Soil layer */}
          <path
            d="
              M0 120
              V48 H100 V35 H220 V45
              H340 V55 H460 V42
              H580 V30 H700 V45
              H820 V55 H940 V38
              H1060 V48 H1180 V58
              H1300 V42 H1420 V50
              H1600 V120 Z
            "
            fill="var(--pv-soil, #7a4e2d)"
          />

          {/* Grass surface */}
          <path
            d="
              M0 120
              V72 H120 V62 H240 V70
              H360 V80 H480 V65
              H600 V58 H720 V72
              H840 V82 H960 V68
              H1080 V60 H1200 V72
              H1320 V82 H1440 V70
              H1600 V120 Z
            "
            fill="var(--pv-grass-light, #8fc45a)"
          />

          {/* Grass edge highlights */}
          <path
            d="
              M120 62 H240 V70 H200 V66 H120 Z
              M600 58 H720 V72 H680 V63 H600 Z
              M1080 60 H1200 V72 H1160 V65 H1080 Z
              M1440 70 H1600 V76 H1540 V74 H1440 Z
            "
            fill="#c1dc78"
            opacity="0.65"
          />

          {/* Small soil details */}
          <path
            d="
              M100 91 H130 V97 H100 Z
              M380 102 H410 V108 H380 Z
              M740 90 H770 V96 H740 Z
              M1040 100 H1070 V106 H1040 Z
              M1380 94 H1410 V100 H1380 Z
            "
            fill="var(--pv-wood-dark, #57371f)"
            opacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
}
