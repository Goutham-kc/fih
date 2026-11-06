
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import TodoList from '@/components/TodoList';
import DebtTracker from '@/components/DebtTracker';
import DeadlineBoard from '@/components/DeadlineBoard';
import ImportantDates from '@/components/ImportantDates';
import Watchlist from '@/components/Watchlist';
import ReminderBoard from '@/components/ReminderBoard';
import SettingsView from '@/components/SettingsView';
import AuditLogView from '@/components/AuditLogView';
import PixelWorldCanvas, {
  CHAPTER_ANCHORS,
  shouldShowDialogue,
  getHudControlsGuide,
} from '@/components/world/PixelWorldCanvas';
import RPGHotbar from '@/components/ui/RPGHotbar';
import RPGDialogueBox from '@/components/ui/RPGDialogueBox';
import DevModeIndicator from '@/components/ui/DevModeIndicator';
import { soundManager } from '@/lib/soundManager';
import { eventBus, EVENTS } from '@/lib/eventBus';
import { getDateSeededWeather } from '@/components/world/WeatherEngine';
import dialogueContent, {
  getContextualDialogue,
} from '@/content/dialogue';
import { CHARACTER_META } from '@/components/character/CharacterSprite';
import {
  PixelWheat,
  PixelCoin,
  PixelSeasonIcon,
  PixelWeatherIcon,
  PixelMap,
  PixelScroll,
  PixelKeyboard,
} from '@/components/ui/PixelIcons';

export default function Dashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [envMode, setEnvMode] = useState('live');
  const [updatingEnv, setUpdatingEnv] = useState(false);
  const [debts, setDebts] = useState([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showCanvas, setShowCanvas] = useState(true);
  const [panelMinimized, setPanelMinimized] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [nearbyBuilding, setNearbyBuilding] = useState(null);
  const [username, setUsername] = useState('');
  const [time, setTime] = useState(new Date());

  // Authentication and user settings
  useEffect(() => {
    fetch('/api/todos')
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
        } else {
          setAuthChecked(true);

          fetch('/api/user/settings')
            .then((r) => r.json())
            .then((data) => {
              if (data.environmentMode) {
                setEnvMode(data.environmentMode);
              }
            });
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  // Fetch debts for world interactions
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

  // Clock
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setTime(new Date());
    }, 10000);

    return () => clearInterval(clockTimer);
  }, []);

  // Reduced motion preference
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const savedRm = localStorage.getItem('pv_reduced_motion');

        if (savedRm !== null) {
          setReducedMotion(savedRm === 'true');
        } else {
          setReducedMotion(
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
          );
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Mobile viewport detection
  useEffect(() => {
    function checkMobile() {
      const mobile = window.innerWidth <= 768;

      setIsMobile(mobile);
    }

    checkMobile();

    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [activeTab]);

  // URL tab synchronization
  useEffect(() => {
    if (router.isReady) {
      if (router.query.tab) {
        const timer = setTimeout(() => {
          setActiveTab(router.query.tab);
        }, 0);

        return () => clearTimeout(timer);
      }
    }
  }, [router.isReady, router.query.tab]);

  // Chapter navigation
  const handleTabChange = useCallback(
    (tabId, options = {}) => {
      soundManager.playSfx('wood');
      setHasInteracted(true);

      if (options.panelOnly !== undefined) {
        setShowCanvas(!options.panelOnly);
      }

      const effectiveTab = tabId;

      setActiveTab(effectiveTab);

      if (effectiveTab) {
        router.replace(
          {
            query: {
              ...router.query,
              tab: effectiveTab,
            },
          },
          undefined,
          { shallow: true }
        );
      } else {
        setShowCanvas(true);

        const q = { ...router.query };
        delete q.tab;

        router.replace(
          { query: q },
          undefined,
          { shallow: true }
        );
      }
    },
    [router]
  );

  // Close chapter
  const handleCloseChapter = useCallback(() => {
    soundManager.playSfx('wood');

    setShowCanvas(true);
    setActiveTab(null);

    const q = { ...router.query };
    delete q.tab;

    router.replace(
      { query: q },
      undefined,
      { shallow: true }
    );
  }, [router]);

  // Keyboard interactions
  useEffect(() => {
    function handleGlobalKeyDown(e) {
      const tag = document.activeElement?.tagName?.toLowerCase();

      if (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select'
      ) {
        if (e.code === 'Escape' || e.key === 'Escape') {
          document.activeElement.blur();
        }

        return;
      }

      const interactionCodes = [
        'KeyW',
        'KeyA',
        'KeyS',
        'KeyD',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'KeyE',
        'KeyP',
        'Space',
        'Enter',
        'Escape',
      ];

      if (
        interactionCodes.includes(e.code) ||
        interactionCodes.includes(e.key)
      ) {
        setHasInteracted(true);
      }

      if (e.code === 'Escape' || e.key === 'Escape') {
        if (activeTab) {
          e.preventDefault();
          handleCloseChapter();
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [activeTab, handleCloseChapter]);

  // Environment mode
  async function switchEnvMode(newMode) {
    if (newMode === envMode || updatingEnv) return;

    setUpdatingEnv(true);

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          environmentMode: newMode,
        }),
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

  // Loading screen
  if (!authChecked) {
    return (
      <div className="fih-loading-screen">
        <div className="loading-decoration">🌾</div>
        <span>LOADING FIH VALLEY...</span>
        <div className="loading-subtitle">
          Preparing your little world
        </div>

        <style jsx>{`
          .fih-loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background:
              radial-gradient(ellipse at center, #382619 0%, #120b06 75%);
            color: #fdf6e2;
            font-family: var(--font-pixel-display);
            font-size: 12px;
            gap: 14px;
          }

          .loading-decoration {
            font-size: 38px;
            animation: loading-bob 1.5s ease-in-out infinite;
          }

          .loading-subtitle {
            color: #b99a70;
            font-family: var(--font-pixel-body);
            font-size: 11px;
          }

          @keyframes loading-bob {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-7px);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .loading-decoration {
              animation: none;
            }
          }
        `}</style>
      </div>
    );
  }

  // Net Gold calculation
  const activeDebts = debts.filter((d) => !d.settled);

  let netGold = 0;

  activeDebts.forEach((d) => {
    if (d.direction === 'owed_to_me') {
      netGold += d.amount;
    } else {
      netGold -= d.amount;
    }
  });

  // Season and weather
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

  const dayName = time.toLocaleDateString('en-US', {
    weekday: 'short',
  });

  const dayOfMonth = time.getDate();

  const timeStr = time
    .toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
    .toLowerCase();

  const currentWeather = getDateSeededWeather(time);

  // Time of day and dialogue
  const currentHour = time.getHours();

  const timeOfDay =
    currentHour < 12
      ? 'morning'
      : currentHour < 17
        ? 'day'
        : currentHour < 21
          ? 'evening'
          : 'night';

  let currentResidentId = 'pip';
  let residentFullName = 'Pip the Farmhand';
  let chapterTitle = 'Fih Valley Overworld';

  let dialogueLine =
    'Welcome to Fih Valley! Use WASD or Arrow Keys to walk. Click any house, press [E] to enter, or [P] for Panel Only view.';

  if (activeTab) {
    const chapterDialogue =
      dialogueContent[activeTab] || dialogueContent.debts;

    currentResidentId = chapterDialogue?.character || 'pip';

    const residentMeta = CHARACTER_META[currentResidentId] || {
      name: 'Resident',
      title: 'Villager',
    };

    residentFullName =
      `${residentMeta.name} ${residentMeta.title || residentMeta.role || ''}`.trim();

    chapterTitle =
      chapterDialogue.chapterTitle || 'Village Chapter';

    dialogueLine = getContextualDialogue(activeTab, {
      timeOfDay,
      weather: currentWeather,
    });
  } else if (nearbyBuilding) {
    const bDialogue =
      dialogueContent[nearbyBuilding.id] || dialogueContent.todos;

    currentResidentId = bDialogue?.character || 'pip';

    const residentMeta = CHARACTER_META[currentResidentId] || {
      name: 'Resident',
      title: 'Villager',
    };

    residentFullName =
      `${residentMeta.name} ${residentMeta.title || residentMeta.role || ''}`.trim();

    chapterTitle =
      nearbyBuilding.name || nearbyBuilding.label || 'Building';

    const speech = getContextualDialogue(nearbyBuilding.id, {
      timeOfDay,
      weather: currentWeather,
    });

    dialogueLine =
      `${speech} Press [E] to enter or [P] for Panel Only.`;
  }

  const showDialogue = shouldShowDialogue({
    activeTab,
    hasInteracted,
    nearbyBuilding,
  });

  const hudControlsGuide = getHudControlsGuide({
    activeTab,
    hasInteracted,
    nearbyBuilding,
  });

  // Chapter content
  function renderTabContent() {
    switch (activeTab) {
      case 'todos':
        return <TodoList key={`todos-${envMode}`} />;

      case 'reminders':
        return <ReminderBoard key={`reminders-${envMode}`} />;

      case 'debts':
        return <DebtTracker key={`debts-${envMode}`} />;

      case 'deadlines':
        return <DeadlineBoard key={`deadlines-${envMode}`} />;

      case 'dates':
        return <ImportantDates key={`dates-${envMode}`} />;

      case 'watchlist':
        return <Watchlist key={`watchlist-${envMode}`} />;

      case 'audit':
        return <AuditLogView key={`audit-${envMode}`} />;

      case 'settings':
        return (
          <SettingsView
            key="settings"
            envMode={envMode}
            onSwitchEnvMode={switchEnvMode}
            updatingEnv={updatingEnv}
          />
        );

      default:
        return null;
    }
  }

  return (
    <>
      <Head>
        <title>fih — Fih Valley</title>
        <meta
          name="description"
          content="Fih Valley Personal Operating System"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
      </Head>

      <div className="fih-dashboard">

        {/* Interactive village world */}
        {showCanvas && (
          <div className="world-canvas-wrapper">
            <PixelWorldCanvas
              activeTab={activeTab}
              debtsData={debts}
              reducedMotion={reducedMotion}
              onNavigateToChapter={handleTabChange}
              onCloseChapter={handleCloseChapter}
              onPlayerInteract={() => setHasInteracted(true)}
              onNearbyBuildingChange={setNearbyBuilding}
              onSelectDebt={() => {
                setPanelMinimized(false);
              }}
            />
          </div>
        )}

        {/* Top HUD */}
        <header className="dashboard-hud">

          <div className="dashboard-hud-left">

            <div className="dashboard-brand">
              <span className="dashboard-brand-icon" style={{ display: 'inline-flex', alignItems: 'center' }}><PixelWheat size={18} /></span>
              <span className="dashboard-brand-name">
                {username ? `${username.charAt(0).toUpperCase() + username.slice(1)}'s Valley` : 'Fih Valley'}
              </span>
            </div>

            <DevModeIndicator
              envMode={envMode}
              onToggle={() =>
                switchEnvMode(
                  envMode === 'live' ? 'development' : 'live'
                )
              }
              disabled={updatingEnv}
            />

            <div className="dashboard-info-pill tabular-nums">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <PixelSeasonIcon season={season} size={14} />
                <span>{dayName}. {dayOfMonth}</span>
              </span>
              <span className="dashboard-info-divider">•</span>
              <span>{timeStr}</span>
            </div>

            <div
              className={`dashboard-gold-pill tabular-nums ${
                netGold >= 0 ? 'gold-positive' : 'gold-negative'
              }`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <PixelCoin size={14} />
              <span>
                {netGold >= 0 ? '+' : '-'}₹
                {Math.abs(netGold).toLocaleString('en-IN')}g
              </span>
            </div>

            {!isMobile && (
              <div className="dashboard-weather-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <PixelWeatherIcon weather={currentWeather} size={14} />
                <span>
                  {currentWeather === 'rain'
                    ? 'Rain'
                    : currentWeather === 'snow'
                      ? 'Snow'
                      : 'Clear'}
                </span>
              </div>
            )}
          </div>

          {!isMobile && (
            <div className="dashboard-hud-right">

              {hudControlsGuide && (
                <div className="dashboard-controls-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <PixelKeyboard size={13} />
                  <span>{hudControlsGuide}</span>
                </div>
              )}

              {activeTab && (
                <button
                  type="button"
                  className="btn-pixel btn-gold dashboard-action-button"
                  onClick={handleCloseChapter}
                  title="Return to Village Map (Esc / M)"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  <PixelMap size={13} />
                  <span>Village Map</span>
                </button>
              )}

              <button
                type="button"
                className={`btn-pixel dashboard-action-button ${
                  !showCanvas ? 'btn-gold' : ''
                }`}
                onClick={() => setShowCanvas(!showCanvas)}
                title="Toggle between World Map and Panel Only view"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
              >
                {showCanvas ? (
                  <>
                    <PixelScroll size={13} />
                    <span>Panel Only</span>
                  </>
                ) : (
                  <>
                    <PixelMap size={13} />
                    <span>Show World</span>
                  </>
                )}
              </button>
            </div>
          )}
        </header>

        {/* Chapter parchment panel */}
        {activeTab && (
          <div
            className={`rpg-parchment-stage ${
              isMobile
                ? 'mobile-panel-only'
                : showCanvas
                  ? 'over-world'
                  : 'fullscreen'
            }`}
          >
            <div className="pixel-parchment-card dashboard-parchment-card">

              {/* Chapter heading */}
              <div className="dashboard-chapter-header">

                <div className="dashboard-chapter-heading-content">
                  <div className="dashboard-chapter-eyebrow">
                    FIH VALLEY JOURNAL
                  </div>

                  <span className="dashboard-chapter-title">
                    {CHAPTER_ANCHORS[activeTab]?.name || 'Ledger Hut'}
                  </span>

                  <div className="dashboard-chapter-subtitle">
                    {CHAPTER_ANCHORS[activeTab]?.chapterTitle ||
                      'Village Chapter'}
                    <span className="chapter-subtitle-dot">•</span>
                    <span>Bound to live records</span>
                  </div>
                </div>

                {!isMobile && (
                  <div className="dashboard-chapter-actions">

                    <button
                      type="button"
                      className={`btn-pixel dashboard-panel-button ${
                        !showCanvas ? 'btn-gold' : ''
                      }`}
                      onClick={() => setShowCanvas(!showCanvas)}
                      title={
                        showCanvas
                          ? 'Switch to Fullscreen Panel Only'
                          : 'Switch to Split World View'
                      }
                    >
                      {showCanvas ? (
                        <>
                          <PixelScroll size={12} style={{ marginRight: 4 }} />
                          <span>Panel Only</span>
                        </>
                      ) : (
                        <>
                          <PixelMap size={12} style={{ marginRight: 4 }} />
                          <span>Split World</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn-pixel btn-gold dashboard-panel-button"
                      onClick={handleCloseChapter}
                      title="Return to Village Map (Esc)"
                    >
                      ✕ Map
                    </button>

                    <button
                      type="button"
                      className="btn-pixel dashboard-panel-button"
                      onClick={() =>
                        setPanelMinimized(!panelMinimized)
                      }
                      title="Minimize or expand parchment panel"
                    >
                      {panelMinimized ? '▲ Open' : '▼ Min'}
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile resident dialogue */}
              {isMobile && (
                <div className="dashboard-resident-quote">
                  <span className="dashboard-resident-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <PixelWheat size={20} />
                  </span>

                  <div className="dashboard-resident-text">
                    <strong>{residentFullName}:</strong>{' '}
                    {dialogueLine
                      .replace(
                        ' Press [E] to enter or [P] for Panel Only.',
                        ''
                      )
                      .replace(
                        ' Use WASD or Arrow Keys to walk. Click any house, press [E] to enter, or [P] for Panel Only view.',
                        ''
                      )}
                  </div>
                </div>
              )}

              {/* Active chapter content */}
              {(!panelMinimized || isMobile) && (
                <div className="dashboard-chapter-content">
                  {renderTabContent()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Desktop dialogue box */}
        {!isMobile && showDialogue && (
          <div
            className="rpg-dialogue-wrapper"
            onClick={() => {
              if (!activeTab && !nearbyBuilding) {
                setHasInteracted(true);
              }
            }}
            title={
              !activeTab && !nearbyBuilding
                ? 'Click to dismiss welcome'
                : undefined
            }
          >
            <RPGDialogueBox
              character={currentResidentId}
              name={residentFullName}
              chapterName={chapterTitle}
              text={dialogueLine}
              onNext={() => {
                if (!activeTab && !nearbyBuilding) {
                  setHasInteracted(true);
                }
              }}
            />
          </div>
        )}

        {/* Bottom navigation */}
        <RPGHotbar
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          isMobile={isMobile}
        />
      </div>

      <style jsx>{`
        /* Main dashboard */

        .fih-dashboard {
          position: relative;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          background: #120b06;
          font-family: var(--font-pixel-body);
          color: #fdf6e2;
        }

        .world-canvas-wrapper {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        /* Wooden top HUD */

        .dashboard-hud {
          position: fixed;
          top: 12px;
          left: 14px;
          right: 14px;
          z-index: 80;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;

          background: linear-gradient(
            180deg,
            rgba(20, 38, 28, 0.72) 0%,
            rgba(13, 27, 20, 0.82) 100%
          ) !important;
          backdrop-filter: blur(10px) saturate(1.25);
          -webkit-backdrop-filter: blur(10px) saturate(1.25);

          border: 1.5px solid rgba(80, 207, 143, 0.28) !important;
          border-radius: 8px;

          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -1px 0 rgba(0, 0, 0, 0.35),
            0 8px 24px rgba(6, 16, 11, 0.45) !important;

          transition: right 0.2s ease;
        }

        .dashboard-hud-left,
        .dashboard-hud-right {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .dashboard-brand {
          display: flex;
          align-items: center;
          gap: 7px;
          padding-right: 12px;
          border-right: 1px solid rgba(80, 207, 143, 0.22);
        }

        .dashboard-brand-icon {
          font-size: 18px;
          filter: drop-shadow(0 0 4px rgba(242, 194, 48, 0.4));
        }

        .dashboard-brand-name {
          font-family: var(--font-pixel-display);
          font-size: 11px;
          color: #ffdc75;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-shadow: 1px 1px 0 #0d1f16, 0 0 8px rgba(250, 204, 21, 0.3);
        }

        .dashboard-info-pill,
        .dashboard-gold-pill,
        .dashboard-weather-pill,
        .dashboard-controls-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          min-height: 28px;
          padding: 4px 10px;
          border: 1px solid rgba(80, 207, 143, 0.18);
          border-radius: 5px;
          background: rgba(10, 22, 16, 0.5);
          backdrop-filter: blur(4px);
          font-size: 11px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .dashboard-info-pill {
          color: #fdfbf4;
        }

        .dashboard-info-divider {
          color: #50cf8f;
          opacity: 0.6;
        }

        .dashboard-gold-pill {
          font-weight: 700;
          border-color: rgba(242, 194, 48, 0.3);
          background: rgba(30, 24, 8, 0.5);
        }

        .gold-positive {
          color: #a8d878;
        }

        .gold-negative {
          color: #ff8989;
        }

        .dashboard-weather-pill {
          color: #9fd8f0;
          text-transform: capitalize;
        }

        .dashboard-controls-pill {
          color: #fde047;
          font-size: 10px;
          opacity: 0.9;
        }

        .dashboard-action-button {
          padding: 6px 11px !important;
          font-size: 9px !important;
          min-height: 28px;
          border-radius: 5px !important;
          background: rgba(36, 68, 52, 0.85) !important;
          border: 1px solid rgba(80, 207, 143, 0.35) !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 3px 6px rgba(0, 0, 0, 0.3) !important;
          color: #fdfbf4 !important;
          backdrop-filter: blur(4px);
        }

        .dashboard-action-button:hover {
          background: rgba(48, 92, 70, 0.95) !important;
          border-color: rgba(80, 207, 143, 0.6) !important;
        }

        .dashboard-action-button.btn-gold {
          background: rgba(234, 179, 8, 0.9) !important;
          border-color: #fde047 !important;
          color: #1a1005 !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 3px 6px rgba(0, 0, 0, 0.3) !important;
        }

        .dashboard-action-button.btn-gold:hover {
          background: #facc15 !important;
        }

        /* Chapter panel positioning */

        .rpg-parchment-stage {
          position: fixed;
          z-index: 60;
          overflow-y: auto;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          scrollbar-color: #3b7450 #ebe0cd;
        }

        .rpg-parchment-stage.over-world {
          top: 82px;
          right: 14px;
          bottom: 82px;
          width: 480px;
          max-width: calc(100vw - 28px);
        }

        .rpg-parchment-stage.fullscreen {
          inset: 82px 14px 82px 14px;
          width: auto;
          max-width: 1000px;
          margin: 0 auto;
        }

        /* Parchment appearance */

        .dashboard-parchment-card {
          position: relative;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px;

          background:
            radial-gradient(
              ellipse at 12% 8%,
              rgba(255, 255, 255, 0.65),
              transparent 45%
            ),
            radial-gradient(
              ellipse at 90% 90%,
              rgba(80, 207, 143, 0.08),
              transparent 50%
            ),
            linear-gradient(
              145deg,
              #fbf7ee 0%,
              #f4ede0 52%,
              #ebe0cd 100%
            ) !important;

          border: 4px solid #233e30 !important;

          box-shadow:
            inset 0 0 0 2px rgba(254, 243, 199, 0.75),
            inset 0 0 25px rgba(35, 62, 48, 0.08),
            0 8px 30px rgba(10, 24, 18, 0.5) !important;

          color: #192e22;
        }

        /* Chapter heading */

        .dashboard-chapter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 13px;
          border-bottom: 2px dashed rgba(43, 82, 60, 0.4);
        }

        .dashboard-chapter-heading-content {
          min-width: 0;
        }

        .dashboard-chapter-eyebrow {
          margin-bottom: 7px;
          color: #3b7450;
          font-family: var(--font-pixel-display);
          font-size: 7px;
          letter-spacing: 0.13em;
        }

        .dashboard-chapter-title {
          display: block;
          color: #163322;
          font-family: var(--font-pixel-display);
          font-size: 13px;
          font-weight: 700;
          line-height: 1.7;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          overflow-wrap: anywhere;
          text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.8);
        }

        .dashboard-chapter-subtitle {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          margin-top: 5px;
          color: #436650;
          font-size: 10px;
          line-height: 1.6;
        }

        .chapter-subtitle-dot {
          color: #3b7450;
        }

        .dashboard-chapter-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 6px;
        }

        .dashboard-panel-button {
          padding: 5px 8px !important;
          font-size: 8px !important;
        }

        /* Chapter content */

        .dashboard-chapter-content {
          flex: 1;
          min-width: 0;
          color: #192e22;
        }

        .dashboard-parchment-card button.btn-pixel {
          transition:
            transform 120ms ease,
            box-shadow 120ms ease,
            filter 120ms ease;
        }

        .dashboard-parchment-card button.btn-pixel:hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
        }

        .dashboard-parchment-card button:focus-visible {
          outline: 3px solid #9a682d;
          outline-offset: 3px;
        }

        /* Mobile resident dialogue */

        .dashboard-resident-quote {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px;
          background: rgba(238, 246, 240, 0.85);
          border: 1px solid #3b7450;
          box-shadow: inset 0 0 0 1px rgba(254, 243, 199, 0.5);
          border-radius: 3px;
        }

        .dashboard-resident-icon {
          flex: 0 0 auto;
          font-size: 21px;
        }

        .dashboard-resident-text {
          color: #244434;
          font-size: 10px;
          font-style: italic;
          line-height: 1.6;
        }

        .dashboard-resident-text strong {
          color: #163322;
          font-style: normal;
        }

        /* Dialogue positioning */

        .rpg-dialogue-wrapper {
          position: fixed;
          bottom: 82px;
          left: 14px;
          z-index: 80;
          width: min(580px, calc(100vw - 28px));
          cursor: pointer;
        }

        /* Tablet */

        @media (max-width: 1000px) and (min-width: 769px) {
          .rpg-parchment-stage.over-world {
            width: 420px;
          }

          .dashboard-hud-left,
          .dashboard-hud-right {
            gap: 6px;
          }
        }

        /* Mobile */

        @media (max-width: 768px) {
          .dashboard-hud {
            top: 8px;
            left: 8px;
            right: 8px;
            padding: 6px 10px;
            gap: 6px;
            border-radius: 6px;
            border: 1px solid rgba(80, 207, 143, 0.25) !important;
            box-shadow:
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              0 6px 16px rgba(0, 0, 0, 0.4) !important;
          }

          .dashboard-hud-left {
            width: 100%;
            justify-content: space-between;
            gap: 6px;
          }

          .dashboard-brand {
            padding-right: 6px;
          }

          .dashboard-brand-icon {
            font-size: 15px;
          }

          .dashboard-brand-name {
            font-size: 9px;
          }

          .dashboard-info-pill,
          .dashboard-gold-pill {
            min-height: 25px;
            padding: 4px 6px;
            font-size: 9px;
          }

          .world-canvas-wrapper { display: block !important; }

          .rpg-parchment-stage,
          .rpg-parchment-stage.mobile-panel-only,
          .rpg-parchment-stage.over-world,
          .rpg-parchment-stage.fullscreen {
            position: fixed !important;
            top: 65px !important;
            left: 6px !important;
            right: 6px !important;
            bottom: 70px !important;
            width: auto !important;
            max-width: none !important;
            margin: 0 !important;
            z-index: 60 !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }

          .dashboard-parchment-card {
            padding: 13px 11px !important;
            gap: 12px;
            min-height: 100% !important;
            border-width: 3px !important;
            border-radius: 4px !important;
          }

          .dashboard-chapter-header {
            padding-bottom: 10px;
          }

          .dashboard-chapter-eyebrow {
            font-size: 6px;
            margin-bottom: 5px;
          }

          .dashboard-chapter-title {
            font-size: 11px;
          }

          .dashboard-chapter-subtitle {
            font-size: 9px;
          }

          .dashboard-resident-quote {
            padding: 8px;
          }

          .dashboard-resident-text {
            font-size: 9px;
          }

          .rpg-dialogue-wrapper {
            display: none !important;
          }
        }

        /* Small phones */

        @media (max-width: 380px) {
          .dashboard-brand-name {
            font-size: 8px;
          }

          .dashboard-info-pill,
          .dashboard-gold-pill {
            font-size: 8px;
          }

          .dashboard-chapter-title {
            font-size: 10px;
          }
        }

        /* Reduced motion accessibility */

        @media (prefers-reduced-motion: reduce) {
          .dashboard-parchment-card button.btn-pixel {
            transition: none;
          }

          .dashboard-parchment-card button.btn-pixel:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  );
}
