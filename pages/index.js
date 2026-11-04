import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TodoList from '@/components/TodoList';
import DebtTracker from '@/components/DebtTracker';
import DeadlineBoard from '@/components/DeadlineBoard';
import ImportantDates from '@/components/ImportantDates';
import Watchlist from '@/components/Watchlist';
import ReminderBoard from '@/components/ReminderBoard';
import SettingsView from '@/components/SettingsView';
import AuditLogView from '@/components/AuditLogView';
import PixelWorldCanvas, { CHAPTER_ANCHORS } from '@/components/world/PixelWorldCanvas';
import RPGHotbar from '@/components/ui/RPGHotbar';
import RPGDialogueBox from '@/components/ui/RPGDialogueBox';
import DevModeIndicator from '@/components/ui/DevModeIndicator';
import { soundManager } from '@/lib/soundManager';
import { eventBus, EVENTS } from '@/lib/eventBus';
import { getDateSeededWeather } from '@/components/world/WeatherEngine';
import dialogueContent, { getContextualDialogue } from '@/content/dialogue';
import { CHARACTER_META } from '@/components/character/CharacterSprite';

export default function Dashboard() {
  const router = useRouter();
  // Default to null (Overworld Exploration Map View) unless ?tab= is in URL
  const [activeTab, setActiveTab] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [envMode, setEnvMode] = useState('live');
  const [updatingEnv, setUpdatingEnv] = useState(false);
  const [debts, setDebts] = useState([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showCanvas, setShowCanvas] = useState(true); // Accessible toggle
  const [panelMinimized, setPanelMinimized] = useState(false);
  const [time, setTime] = useState(new Date());

  // Check auth & hydrate user settings
  useEffect(() => {
    fetch('/api/todos')
      .then((res) => {
        if (res.status === 401) router.push('/login');
        else {
          setAuthChecked(true);
          fetch('/api/user/settings')
            .then((r) => r.json())
            .then((data) => {
              if (data.environmentMode) setEnvMode(data.environmentMode);
            });
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  // Fetch debts for in-world object binding (scale tilt & coin sacks)
  const fetchDebts = async () => {
    try {
      const res = await fetch('/api/debts');
      if (res.ok) {
        const data = await res.json();
        setDebts(data.debts || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDebts();
    }, 0);
    const unsubDebt1 = eventBus.on(EVENTS.DEBT_CREATED, fetchDebts);
    const unsubDebt2 = eventBus.on(EVENTS.DEBT_SETTLED, fetchDebts);
    return () => {
      clearTimeout(timer);
      unsubDebt1();
      unsubDebt2();
    };
  }, [envMode]);

  useEffect(() => {
    const clockTimer = setInterval(() => setTime(new Date()), 10000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const savedRm = localStorage.getItem('pv_reduced_motion');
        if (savedRm !== null) {
          setReducedMotion(savedRm === 'true');
        } else {
          setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Sync with URL query parameter
  useEffect(() => {
    if (router.isReady && router.query.tab) {
      const timer = setTimeout(() => {
        setActiveTab(router.query.tab);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [router.isReady, router.query.tab]);

  const handleTabChange = (tabId, options = {}) => {
    soundManager.playSfx('wood');
    if (options.panelOnly !== undefined) {
      setShowCanvas(!options.panelOnly);
    }
    setActiveTab(tabId);
    if (tabId) {
      router.replace({ query: { ...router.query, tab: tabId } }, undefined, { shallow: true });
    } else {
      setShowCanvas(true);
      const q = { ...router.query };
      delete q.tab;
      router.replace({ query: q }, undefined, { shallow: true });
    }
  };

  const handleCloseChapter = () => {
    soundManager.playSfx('wood');
    setShowCanvas(true);
    setActiveTab(null);
    const q = { ...router.query };
    delete q.tab;
    router.replace({ query: q }, undefined, { shallow: true });
  };

  async function switchEnvMode(newMode) {
    if (newMode === envMode || updatingEnv) return;
    setUpdatingEnv(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environmentMode: newMode }),
      });
      const data = await res.json();
      if (data.environmentMode) {
        setEnvMode(data.environmentMode);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingEnv(false);
    }
  }

  if (!authChecked) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#120b06',
          color: '#fdf6e2',
          fontFamily: 'var(--font-pixel-display)',
          fontSize: 12,
        }}
      >
        <span>LOADING 16-BIT PIXEL VALLEY...</span>
      </div>
    );
  }

  // Calculate Net Gold for HUD
  const activeDebts = debts.filter((d) => !d.settled);
  let netGold = 0;
  activeDebts.forEach((d) => {
    if (d.direction === 'owed_to_me') netGold += d.amount;
    else netGold -= d.amount;
  });

  // Calculate current season & weather
  const month = time.getMonth();
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
  const dayName = time.toLocaleDateString('en-US', { weekday: 'short' });
  const dayOfMonth = time.getDate();
  const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  const currentWeather = getDateSeededWeather(time);

  // Time of Day & Contextual Dialogue
  const currentHour = time.getHours();
  const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'day' : currentHour < 21 ? 'evening' : 'night';

  let currentResidentId = 'pip';
  let residentFullName = 'Pip the Farmhand';
  let chapterTitle = 'Pixel Valley Overworld';
  let dialogueLine = 'Welcome to Pixel Valley! Use WASD or Arrow Keys to walk. Click any house, press [E] to enter, or [P] for Panel Only view.';

  if (activeTab) {
    const chapterDialogue = dialogueContent[activeTab] || dialogueContent.debts;
    currentResidentId = chapterDialogue?.character || 'pip';
    const residentMeta = CHARACTER_META[currentResidentId] || { name: 'Resident', title: 'Villager' };
    residentFullName = `${residentMeta.name} ${residentMeta.title}`;
    chapterTitle = chapterDialogue.chapterTitle || 'Village Chapter';
    dialogueLine = getContextualDialogue(activeTab, {
      timeOfDay,
      weather: currentWeather,
    });
  }

  function renderTabContent() {
    switch (activeTab) {
      case 'todos': return <TodoList key={`todos-${envMode}`} />;
      case 'reminders': return <ReminderBoard key={`reminders-${envMode}`} />;
      case 'debts': return <DebtTracker key={`debts-${envMode}`} />;
      case 'deadlines': return <DeadlineBoard key={`deadlines-${envMode}`} />;
      case 'dates': return <ImportantDates key={`dates-${envMode}`} />;
      case 'watchlist': return <Watchlist key={`watchlist-${envMode}`} />;
      case 'audit': return <AuditLogView key={`audit-${envMode}`} />;
      case 'settings': return <SettingsView key="settings" envMode={envMode} onSwitchEnvMode={switchEnvMode} updatingEnv={updatingEnv} />;
      default: return null;
    }
  }

  return (
    <>
      <Head>
        <title>fih — Pixel Valley (16-Bit RPG)</title>
        <meta name="description" content="16-Bit Top-Down Farming RPG Personal Operating System" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          background: '#120b06',
          fontFamily: 'var(--font-pixel-body)',
        }}
      >
        {/* ── 1. The Interactive Top-Down Canvas World (Section 3) ── */}
        {showCanvas && (
          <div
            className="world-canvas-wrapper"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
            }}
          >
            <PixelWorldCanvas
              activeTab={activeTab}
              debtsData={debts}
              reducedMotion={reducedMotion}
              onNavigateToChapter={handleTabChange}
              onCloseChapter={handleCloseChapter}
              onSelectDebt={() => {
                setPanelMinimized(false);
              }}
            />
          </div>
        )}

        {/* ── 2. Top Pixel HUD (Section 5) ── */}
        <header
          className="pixel-wood-card"
          style={{
            position: 'fixed',
            top: 12,
            left: 14,
            right: activeTab && showCanvas ? '510px' : '14px',
            zIndex: 80,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            borderWidth: 3,
            transition: 'right 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>🌾</span>
              <span
                style={{
                  fontFamily: 'var(--font-pixel-display)',
                  fontSize: 11,
                  color: '#facc15',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Pixel Valley
              </span>
            </div>

            {/* Persistent Dev Mode Indicator */}
            <DevModeIndicator
              envMode={envMode}
              onToggle={() => switchEnvMode(envMode === 'live' ? 'development' : 'live')}
              disabled={updatingEnv}
            />

            {/* Clock & Season */}
            <div
              className="tabular-nums"
              style={{
                fontSize: 12,
                color: '#fdf6e2',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>{seasonEmoji} {dayName}. {dayOfMonth}</span>
              <span style={{ color: '#facc15' }}>• {timeStr}</span>
            </div>

            {/* Gold Pouch */}
            <div
              className="tabular-nums"
              style={{
                fontSize: 12,
                color: netGold >= 0 ? '#8fc45a' : '#f87171',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>🪙 {netGold >= 0 ? '+' : ''}₹{Math.abs(netGold).toLocaleString('en-IN')}g</span>
            </div>

            {/* Weather Pill */}
            <div style={{ fontSize: 11, color: '#60a5fa', textTransform: 'capitalize' }}>
              {currentWeather === 'rain' ? '🌧️ Rain' : currentWeather === 'snow' ? '❄️ Snow' : '☀️ Clear'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Keyboard Guide Pill */}
            {!activeTab && (
              <div
                style={{
                  fontSize: 10,
                  color: '#fef08a',
                  background: 'rgba(26, 15, 8, 0.85)',
                  padding: '4px 8px',
                  border: '1px solid #784323',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>🎮 WASD / Arrows to Walk • [E] Enter • [P] Panel Only</span>
              </div>
            )}

            {/* Village Map Button when panel is open */}
            {activeTab && (
              <button
                type="button"
                className="btn-pixel btn-gold"
                onClick={handleCloseChapter}
                style={{ padding: '3px 8px', fontSize: 9 }}
                title="Return to Village Map (Esc / M)"
              >
                🗺️ Village Map (Esc)
              </button>
            )}

            {/* Accessible View Toggle */}
            <button
              type="button"
              className={`btn-pixel ${!showCanvas ? 'btn-gold' : ''}`}
              onClick={() => setShowCanvas(!showCanvas)}
              style={{ padding: '3px 8px', fontSize: 9 }}
              title="Toggle between 16-bit Top-down World and Plain Ledger view"
            >
              {showCanvas ? '📜 Panel Only' : '🗺️ Show World'}
            </button>
          </div>
        </header>

        {/* ── 3. Data Lives In The World: Side Parchment Panel (Section 4) ── */}
        {activeTab && (
          <div
            className={`rpg-parchment-stage ${showCanvas ? 'over-world' : 'fullscreen'}`}
            style={{
              position: 'fixed',
              zIndex: 60,
              overflowY: 'auto',
            }}
          >
            <div
              className="pixel-parchment-card"
              style={{
                padding: '18px 20px',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {/* Parchment Header & Close/Minimize/Panel Only */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '2px dashed #452817',
                  paddingBottom: 8,
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-pixel-display)',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#452817',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {CHAPTER_ANCHORS[activeTab]?.name || 'Ledger Hut'}
                  </span>
                  <div style={{ fontSize: 11, color: '#784323', marginTop: 2 }}>
                    16-bit RPG Ledger • Bound to live records
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {/* Panel Only / Split World Toggle Option right when opened */}
                  <button
                    type="button"
                    className={`btn-pixel ${!showCanvas ? 'btn-gold' : ''}`}
                    onClick={() => setShowCanvas(!showCanvas)}
                    style={{ padding: '4px 8px', fontSize: 9 }}
                    title={showCanvas ? 'Switch to Fullscreen Panel Only' : 'Switch to Split World View'}
                  >
                    {showCanvas ? '📜 Panel Only' : '🗺️ Split World'}
                  </button>
                  <button
                    type="button"
                    className="btn-pixel btn-gold"
                    onClick={handleCloseChapter}
                    style={{ padding: '4px 8px', fontSize: 9 }}
                    title="Return to Village Map (Esc)"
                  >
                    ✕ Map (Esc)
                  </button>
                  <button
                    type="button"
                    className="btn-pixel"
                    onClick={() => setPanelMinimized(!panelMinimized)}
                    style={{ padding: '4px 8px', fontSize: 9 }}
                    title="Minimize/Expand Parchment Panel"
                  >
                    {panelMinimized ? '▲ Open' : '▼ Min'}
                  </button>
                </div>
              </div>

              {/* Active Data Component */}
              {!panelMinimized && (
                <div style={{ flex: 1 }}>
                  {renderTabContent()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 4. Bottom RPG Dialogue Box (Section 5) ── */}
        <div
          className="rpg-dialogue-wrapper"
          style={{
            position: 'fixed',
            bottom: 68,
            left: 14,
            zIndex: 80,
            maxWidth: 580,
          }}
        >
          <RPGDialogueBox
            character={currentResidentId}
            name={residentFullName}
            chapterName={chapterTitle}
            text={dialogueLine}
          />
        </div>

        {/* ── 5. Bottom RPG Hotbar Navigation (Section 5) ── */}
        <RPGHotbar
          activeTab={activeTab}
          onSelectTab={handleTabChange}
        />
      </div>

      <style jsx>{`
        /* Responsive Desktop vs Mobile layout per Section 4 of Addendum */
        .rpg-parchment-stage.over-world {
          top: 14px;
          right: 14px;
          bottom: 74px;
          width: 480px;
          max-width: calc(100vw - 28px);
        }

        .rpg-parchment-stage.fullscreen {
          inset: 60px 14px 74px 14px;
          width: auto;
          max-width: 900px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .world-canvas-wrapper {
            height: ${activeTab ? '38vh !important' : '100vh !important'};
            bottom: auto !important;
          }
          .rpg-parchment-stage.over-world {
            top: 38vh !important;
            right: 8px !important;
            left: 8px !important;
            bottom: 68px !important;
            width: auto !important;
          }
          .rpg-dialogue-wrapper {
            display: ${activeTab ? 'none' : 'block'};
            bottom: 72px !important;
            left: 8px !important;
            right: 8px !important;
            max-width: none !important;
          }
        }
      `}</style>
    </>
  );
}
