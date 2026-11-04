import React, { useEffect } from 'react';

const CHAPTER_HOTBAR = [
  { id: null, label: 'Map', icon: '🗺️', num: 'M' },
  { id: 'todos', label: 'Quests', icon: '🌾', num: '1' },
  { id: 'reminders', label: 'Belfry', icon: '🔔', num: '2' },
  { id: 'debts', label: 'Ledger', icon: '🪙', num: '3' },
  { id: 'deadlines', label: 'Board', icon: '📌', num: '4' },
  { id: 'dates', label: 'Festivals', icon: '🌸', num: '5' },
  { id: 'watchlist', label: 'Cinema', icon: '🎬', num: '6' },
  { id: 'audit', label: 'Cellar', icon: '📜', num: '7' },
  { id: 'settings', label: 'Toolshed', icon: '🔧', num: '8' },
];

export default function RPGHotbar({ activeTab = null, onSelectTab, isMobile = false }) {
  const hotbarItems = isMobile
    ? CHAPTER_HOTBAR.filter((item) => item.id !== null)
    : CHAPTER_HOTBAR;

  useEffect(() => {
    function handleKeyDown(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName) || e.target?.isContentEditable) {
        return;
      }
      if (e.code === 'KeyM' || e.key === '0') {
        if (!isMobile && onSelectTab) onSelectTab(null);
        return;
      }
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 8) {
        const target = CHAPTER_HOTBAR[num]; // index 1 to 8 (since index 0 is Map)
        if (target && onSelectTab) {
          onSelectTab(target.id);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectTab, isMobile]);

  return (
    <nav
      className="rpg-hotbar"
      aria-label="Village Chapter Toolbar"
      style={{
        position: 'fixed',
        bottom: isMobile ? 8 : 12,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 4 : 6,
        padding: isMobile ? '4px 6px' : '6px 10px',
        maxWidth: isMobile ? 'calc(100vw - 12px)' : 'none',
        overflowX: isMobile ? 'auto' : 'visible',
        WebkitOverflowScrolling: 'touch',
        background: '#2b1a11',
        border: isMobile ? '2px solid #1a0f08' : '3px solid #1a0f08',
        boxShadow: 'inset 2px 2px 0 #7b4a28, inset -2px -2px 0 #120b06, 0 6px 20px rgba(0,0,0,0.75)',
        zIndex: 90,
      }}
    >
      {hotbarItems.map((item) => {
        const isActive = activeTab === item.id;
        const slotSize = isMobile ? 38 : 44;
        return (
          <button
            key={item.id || 'map'}
            type="button"
            onClick={() => onSelectTab && onSelectTab(item.id)}
            title={`${item.label} (${item.num})`}
            className={`rpg-hotbar-slot ${isActive ? 'active' : ''}`}
            style={{
              width: slotSize,
              height: slotSize,
              minWidth: slotSize,
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
                fontSize: isMobile ? 7 : 8,
                fontWeight: 800,
                color: item.id === null ? '#60a5fa' : '#a38d7b',
                fontFamily: 'var(--font-pixel-display)',
              }}
            >
              {item.num}
            </span>

            {/* Pixel Icon */}
            <span style={{ fontSize: isMobile ? 16 : 18, marginTop: isMobile ? 2 : 4 }}>{item.icon}</span>

            {/* Active Indicator Pip */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  bottom: -2,
                  width: 6,
                  height: 6,
                  background: '#facc15',
                  boxShadow: '0 0 4px #facc15',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
