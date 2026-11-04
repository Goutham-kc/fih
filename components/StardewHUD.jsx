import { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Coins,
  Sparkles,
  Scroll,
} from 'lucide-react';

export default function StardewHUD({ envMode }) {
  const [time, setTime] = useState(new Date());
  const [hudData, setHudData] = useState({
    todos: [],
    debts: [],
    reminders: [],
    loading: true,
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        const [tRes, dRes, rRes] = await Promise.all([
          fetch('/api/todos').then((r) => (r.ok ? r.json() : { todos: [] })),
          fetch('/api/debts').then((r) => (r.ok ? r.json() : { debts: [] })),
          fetch('/api/reminders').then((r) => (r.ok ? r.json() : { reminders: [] })),
        ]);
        if (isMounted) {
          setHudData({
            todos: tRes.todos || [],
            debts: dRes.debts || [],
            reminders: rRes.reminders || [],
            loading: false,
          });
        }
      } catch (e) {
        if (isMounted) setHudData((prev) => ({ ...prev, loading: false }));
      }
    }
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [envMode]);

  // Compute Stardew Valley Season
  const month = time.getMonth(); // 0 = Jan, 10 = Nov
  let season = 'Spring';
  let seasonEmoji = '🌸';
  if (month >= 2 && month <= 4) {
    season = 'Spring';
    seasonEmoji = '🌸';
  } else if (month >= 5 && month <= 7) {
    season = 'Summer';
    seasonEmoji = '🌻';
  } else if (month >= 8 && month <= 10) {
    season = 'Fall';
    seasonEmoji = '🍂';
  } else {
    season = 'Winter';
    seasonEmoji = '❄️';
  }

  // Day number and weekday
  const dayOfMonth = time.getDate();
  const dayName = time.toLocaleDateString('en-US', { weekday: 'short' });
  const hours = time.getHours();
  const isNight = hours < 6 || hours >= 18;

  // Stardew clock display (e.g. 10:00 pm)
  const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();

  // Fortune Teller / Welwick's Oracle
  const dayOfWeekIndex = time.getDay();
  const fortunes = [
    'The spirits are in good humor today. You will feel a burst of energy for your chores!',
    'The spirits are very happy today! They will shower your daily quests with luck.',
    'The spirits are mildly perturbed, but your steadfast focus will harvest great rewards.',
    'The stars are peaceful tonight. A wonderful time to read by the hearth or tend to the ledger.',
    'The spirits are pleased with your diligence. Expect a smooth and bountiful harvest.',
    'A lucky breeze sweeps through the valley! Perfect for clearing overdue notices.',
    'The spirits are neutral today. The outcome of your day lies completely in your hands.',
  ];
  const dailyFortune = fortunes[dayOfWeekIndex % fortunes.length];

  // Farm Gold (Net debt)
  const activeDebts = hudData.debts.filter((d) => !d.settled);
  let netGold = 0;
  activeDebts.forEach((d) => {
    if (d.direction === 'owed_to_me') netGold += d.amount;
    else netGold -= d.amount;
  });

  // Story chapter & stats
  const completedToday = hudData.todos.filter((t) => {
    if (t.status !== 'done' || !t.completedAt) return false;
    const completed = new Date(t.completedAt);
    const today = new Date();
    return completed.toDateString() === today.toDateString();
  }).length;

  const openQuests = hudData.todos.filter((t) => t.status === 'open').length;

  return (
    <div
      className="stardew-hud-card"
      style={{
        background: 'var(--bg-card)',
        borderRadius: 20,
        padding: '20px 24px',
        border: '1px solid var(--border-subtle)',
        marginBottom: 24,
        position: 'relative',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 20,
          alignItems: 'center',
        }}
      >
        {/* 1. Stardew Valley Iconic Golden Clock & Calendar HUD */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'var(--bg-sunken)',
            padding: '14px 18px',
            borderRadius: 16,
            border: '2px solid rgba(245, 158, 11, 0.35)',
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.2)',
          }}
        >
          {/* Circular Sun/Moon Clock Graphic */}
          <div
            style={{
              position: 'relative',
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: isNight
                ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
                : 'linear-gradient(135deg, #38bdf8 0%, #fde047 100%)',
              border: '3px solid #f59e0b',
              boxShadow: '0 0 14px rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isNight ? (
              <Moon size={24} color="#fde047" style={{ filter: 'drop-shadow(0 0 4px #fde047)' }} />
            ) : (
              <Sun size={26} color="#d97706" style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }} />
            )}
            {/* Season Badge */}
            <span
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                fontSize: 14,
                background: 'var(--bg-card)',
                borderRadius: '50%',
                padding: 1,
                border: '1px solid var(--border-subtle)',
              }}
            >
              {seasonEmoji}
            </span>
          </div>

          {/* Stardew Time & Season Header */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  letterSpacing: '0.02em',
                }}
              >
                {dayName}. {dayOfMonth} of {season}
              </span>
              <span
                className="tabular-nums"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#f59e0b',
                  letterSpacing: '0.04em',
                }}
              >
                {timeStr}
              </span>
            </div>

            {/* Farm Gold Pouch Meter */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 4,
                padding: '3px 8px',
                borderRadius: 8,
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                width: 'fit-content',
              }}
            >
              <Coins size={14} color="#f59e0b" />
              <span
                className="tabular-nums"
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: netGold >= 0 ? '#10b981' : '#f43f5e',
                  letterSpacing: '0.02em',
                }}
              >
                {netGold >= 0 ? '+' : ''}₹{Math.abs(netGold).toLocaleString('en-IN')}g
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Farm Balance</span>
            </div>
          </div>
        </div>

        {/* 2. Valley Story Scroll & Daily Quest Log Narrative */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Scroll size={14} color="#f59e0b" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
              }}
            >
              The Daily Valley Chronicle
            </span>
          </div>

          <div
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: 'var(--text-primary)',
            }}
          >
            {completedToday > 0 ? (
              <span>
                🌾 You’ve harvested <strong>{completedToday} chore{completedToday === 1 ? '' : 's'}</strong> today. {openQuests} quest{openQuests === 1 ? '' : 's'} remain pinned to your journal.
              </span>
            ) : openQuests > 0 ? (
              <span>
                🌱 A peaceful day on the farm. <strong>{openQuests} quest{openQuests === 1 ? '' : 's'}</strong> are ready to be tended to today.
              </span>
            ) : (
              <span>
                ✨ All farmstead chores are complete! Put your feet by the hearth and enjoy the valley evening.
              </span>
            )}
          </div>

          {/* Welwick's Fortune Teller Oracle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: 'var(--text-secondary)',
              marginTop: 2,
            }}
          >
            <Sparkles size={12} color="#f59e0b" style={{ flexShrink: 0 }} />
            <span>
              <em>Oracle:</em> {dailyFortune}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
