
import React, { useEffect } from 'react';
import { PixelHotbarIcon } from '@/components/ui/PixelIcons';

const CHAPTER_HOTBAR = [
  { id: null, label: 'Map', icon: '🗺️', num: 'M' },
  { id: 'todos', label: 'Quests', icon: '🌾', num: '1' },
  { id: 'reminders', label: 'Belfry', icon: '🔔', num: '2' },
  { id: 'debts', label: 'Ledger', icon: '🪙', num: '3' },
  { id: 'deadlines', label: 'Board', icon: '📌', num: '4' },
  { id: 'dates', label: 'Mill', icon: '🌸', num: '5' },
  { id: 'watchlist', label: 'Cinema', icon: '🎬', num: '6' },
  { id: 'audit', label: 'Cellar', icon: '📜', num: '7' },
  { id: 'settings', label: 'Forge', icon: '⚒️', num: '8' },
];

export default function RPGHotbar({
  activeTab = null,
  onSelectTab,
  isMobile = false,
}) {
  const hotbarItems = isMobile
    ? CHAPTER_HOTBAR.filter((item) => item.id !== null)
    : CHAPTER_HOTBAR;

  useEffect(() => {
    function handleKeyDown(e) {
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName) ||
        e.target?.isContentEditable ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey
      ) return;

      if (e.code === 'KeyM' || e.key === '0') {
        if (!isMobile && onSelectTab) onSelectTab(null);
        return;
      }

      const num = Number(e.key);
      if (Number.isInteger(num) && num >= 1 && num <= 8) {
        const target = CHAPTER_HOTBAR[num];
        if (target && onSelectTab) onSelectTab(target.id);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectTab, isMobile]);

  return (
    <nav
      className={`rpg-hotbar ${isMobile ? 'rpg-hotbar-mobile' : ''}`}
      aria-label="Village Chapter Toolbar"
    >
      <div className="rpg-hotbar-inner">
        {hotbarItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id || 'map'}
              type="button"
              onClick={() => onSelectTab?.(item.id)}
              title={`${item.label} (${item.num})`}
              aria-label={`${item.label}, shortcut ${item.num}`}
              aria-current={isActive ? 'page' : undefined}
              className={`rpg-hotbar-slot ${isActive ? 'active' : ''}`}
            >
              <span className="rpg-hotbar-key">{item.num}</span>
              <span className="rpg-hotbar-icon" aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PixelHotbarIcon id={item.id} size={22} />
              </span>
              <span className="rpg-hotbar-label">{item.label}</span>
              {isActive && <span className="rpg-hotbar-indicator" />}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .rpg-hotbar {
          position: fixed;
          z-index: 90;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          max-width: calc(100vw - 24px);
          padding: 8px;
          background: linear-gradient(180deg, #244434 0%, #1a3326 18%, #12241b 100%);
          border: 3px solid #0a1711;
          box-shadow:
            inset 0 2px 0 #3d7054,
            inset 0 -3px 0 #09140f,
            0 7px 0 rgba(0, 0, 0, 0.25),
            0 12px 28px rgba(0, 0, 0, 0.5);
        }

        .rpg-hotbar-inner {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .rpg-hotbar-slot {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 0 0 58px;
          width: 58px;
          height: 62px;
          padding: 5px 2px 4px;
          border: 2px solid #234232;
          border-radius: 0;
          background: linear-gradient(145deg, #182e22, #0d1a13);
          color: #e8f4ec;
          cursor: pointer;
          transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
          box-shadow:
            inset 2px 2px 0 rgba(80, 207, 143, 0.1),
            inset -2px -2px 0 rgba(0, 0, 0, 0.4);
        }

        .rpg-hotbar-slot:hover {
          transform: translateY(-4px);
          background: linear-gradient(145deg, #224231, #13241b);
          border-color: #4a8262;
        }

        .rpg-hotbar-slot:focus-visible {
          outline: 2px solid #fde68a;
          outline-offset: 3px;
        }

        .rpg-hotbar-slot.active {
          transform: translateY(-5px);
          border-color: #facc15;
          background: linear-gradient(145deg, #2c4e38, #183022);
          color: #fff2b8;
          box-shadow:
            inset 2px 2px 0 #ca8a04,
            inset -2px -2px 0 #0f1d16,
            0 0 0 2px rgba(250, 204, 21, 0.2),
            0 0 14px rgba(250, 204, 21, 0.35);
        }

        .rpg-hotbar-key {
          position: absolute;
          top: 3px;
          left: 5px;
          font-family: var(--font-pixel-display, monospace);
          font-size: 8px;
          color: #8faea0;
        }

        .rpg-hotbar-icon {
          font-size: 22px;
          line-height: 1.2;
          margin-top: 3px;
          filter: drop-shadow(1px 2px 0 rgba(0, 0, 0, 0.5));
        }

        .rpg-hotbar-label {
          margin-top: 3px;
          font-family: var(--font-pixel-display, monospace);
          font-size: 7px;
          line-height: 1.3;
          color: #c2d9cc;
          white-space: nowrap;
        }

        .rpg-hotbar-slot.active .rpg-hotbar-label {
          color: #ffe58a;
        }

        .rpg-hotbar-indicator {
          position: absolute;
          bottom: -3px;
          left: 50%;
          width: 7px;
          height: 7px;
          transform: translateX(-50%);
          background: #facc15;
          box-shadow: 0 0 7px #facc15;
        }

        @media (max-width: 768px) {
          .rpg-hotbar {
            bottom: 8px;
            max-width: calc(100vw - 12px);
            overflow-x: auto;
            padding: 5px;
            scrollbar-width: none;
          }

          .rpg-hotbar::-webkit-scrollbar {
            display: none;
          }

          .rpg-hotbar-inner {
            gap: 4px;
          }

          .rpg-hotbar-slot {
            flex-basis: 46px;
            width: 46px;
            height: 52px;
          }

          .rpg-hotbar-icon {
            font-size: 18px;
          }

          .rpg-hotbar-label {
            font-size: 6px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rpg-hotbar-slot {
            transition: none;
          }

          .rpg-hotbar-slot:hover,
          .rpg-hotbar-slot.active {
            transform: none;
          }
        }
      `}</style>
    </nav>
  );
}
