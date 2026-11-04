import React, { useEffect } from 'react';

const CHAPTER_HOTBAR = [
  { id: 'todos', label: 'Quests', icon: '🌾', num: '1' },
  { id: 'reminders', label: 'Belfry', icon: '🔔', num: '2' },
  { id: 'debts', label: 'Ledger', icon: '🪙', num: '3' },
  { id: 'deadlines', label: 'Board', icon: '📌', num: '4' },
  { id: 'dates', label: 'Festivals', icon: '🌸', num: '5' },
  { id: 'watchlist', label: 'Cinema', icon: '🎬', num: '6' },
  { id: 'audit', label: 'Cellar', icon: '📜', num: '7' },
  { id: 'settings', label: 'Toolshed', icon: '🔧', num: '8' },
];

export default function RPGHotbar({ activeTab = 'debts', onSelectTab }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName) || e.target?.isContentEditable) {
        return;
      }
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= CHAPTER_HOTBAR.length) {
        const target = CHAPTER_HOTBAR[num - 1];
        if (target && onSelectTab) {
          onSelectTab(target.id);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectTab]);
  return (
    <nav
      className="rpg-hotbar"
      aria-label="Village Chapter Toolbar"
      style={{
        position: 'fixed',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        background: '#2b1a11',
        border: '3px solid #1a0f08',
        boxShadow: 'inset 2px 2px 0 #7b4a28, inset -2px -2px 0 #120b06, 0 6px 20px rgba(0,0,0,0.75)',
        zIndex: 90,
      }}
    >
      {CHAPTER_HOTBAR.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab && onSelectTab(item.id)}
            title={`${item.label} (${item.num})`}
            className={`rpg-hotbar-slot ${isActive ? 'active' : ''}`}
            style={{
              width: 44,
              height: 44,
              background: isActive ? '#3d2315' : '#1a0f08',
              border: isActive ? '2px solid #facc15' : '2px solid #452817',
              boxShadow: isActive
                ? 'inset 2px 2px 0 #ca8a04, inset -2px -2px 0 #fde047, 0 0 10px rgba(250, 204, 21, 0.5)'
                : 'inset 2px 2px 0 #0c0704, inset -2px -2px 0 #784323',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              borderRadius: 0,
              padding: 0,
            }}
          >
            {/* Slot Number Keybinding */}
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: 3,
                fontSize: 8,
                fontWeight: 800,
                color: '#a38d7b',
                fontFamily: 'var(--font-pixel-display)',
              }}
            >
              {item.num}
            </span>

            {/* Pixel Icon */}
            <span style={{ fontSize: 18, marginTop: 4 }}>{item.icon}</span>

            {/* Active Indicator Pip */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  bottom: -2,
                  width: 4,
                  height: 4,
                  background: '#facc15',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
