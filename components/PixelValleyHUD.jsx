import { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Coins,
  Sparkles,
  Scroll,
  Volume2,
  VolumeX,
  Compass,
  CloudRain,
  Snowflake,
  Wind,
  X,
  HelpCircle,
  Award,
} from 'lucide-react';
import DevModeIndicator from '@/components/ui/DevModeIndicator';
import PixelButton from '@/components/ui/PixelButton';
import WoodPanel from '@/components/ui/WoodPanel';
import CharacterSprite from '@/components/character/CharacterSprite';
import { soundManager } from '@/lib/soundManager';
import { eventBus, EVENTS } from '@/lib/eventBus';
import { getDateSeededWeather } from '@/components/world/WeatherEngine';

export default function PixelValleyHUD({ envMode, onSwitchEnvMode, updatingEnv }) {
  const [time, setTime] = useState(new Date());
  const [soundMuted, setSoundMuted] = useState(() => (typeof window !== 'undefined' ? soundManager.isMuted() : true));
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    const savedRm = localStorage.getItem('pv_reduced_motion');
    return savedRm !== null ? savedRm === 'true' : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [currentWeather, setCurrentWeather] = useState(() => getDateSeededWeather(new Date()));
  const [wrenModalOpen, setWrenModalOpen] = useState(false);
  const [hudData, setHudData] = useState({
    todos: [],
    debts: [],
    reminders: [],
    loading: true,
  });

  useEffect(() => {
    const unsubSound = eventBus.on(EVENTS.SOUND_TOGGLED, ({ muted }) => setSoundMuted(muted));
    const unsubMotion = eventBus.on(EVENTS.MOTION_TOGGLED, ({ reducedMotion: rm }) => setReducedMotion(rm));
    const unsubWeather = eventBus.on(EVENTS.WEATHER_CHANGED, ({ weather: w }) => {
      if (w === 'auto') setCurrentWeather(getDateSeededWeather(new Date()));
      else setCurrentWeather(w);
    });

    return () => {
      unsubSound();
      unsubMotion();
      unsubWeather();
    };
  }, []);

  function handleToggleSound() {
    const next = soundManager.toggleMute();
    setSoundMuted(next);
  }

  function handleToggleMotion() {
    const next = !reducedMotion;
    setReducedMotion(next);
    localStorage.setItem('pv_reduced_motion', String(next));
    eventBus.emit(EVENTS.MOTION_TOGGLED, { reducedMotion: next });
  }

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

  // Compute Valley Season
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

  // Clock display (e.g. 10:00 pm)
  const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();

  // The Valley Oracle daily fortune
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

  // Spec Section 8.4: Village Growth & Prosperity Indicators
  const harvestedCrops = hudData.todos.filter((t) => t.status === 'done').length;
  const settledDebts = hudData.debts.filter((d) => d.settled).length;
  const prosperityScore = harvestedCrops * 10 + settledDebts * 15;
  let prosperityRank = '🌱 Sprout Hamlet';
  if (prosperityScore >= 300) prosperityRank = '👑 Golden Realm';
  else if (prosperityScore >= 150) prosperityRank = '🌾 Bountiful Village';
  else if (prosperityScore >= 50) prosperityRank = '🌿 Green Dale';

  // Story chapter & stats
  const completedToday = hudData.todos.filter((t) => {
    if (t.status !== 'done' || !t.completedAt) return false;
    const completed = new Date(t.completedAt);
    const today = new Date();
    return completed.toDateString() === today.toDateString();
  }).length;

  const openQuests = hudData.todos.filter((t) => t.status === 'open').length;

  return (
    <>
      <div
        className="pixel-hud-card"
        style={{
          background: 'linear-gradient(180deg, #2b1a11 0%, #1f130b 100%)',
          borderRadius: 16,
          padding: '16px 20px',
          border: '3px solid #7b4a28',
          marginBottom: 24,
          position: 'relative',
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.45), inset 0 2px 0 rgba(201, 143, 85, 0.3)',
        }}
      >
        {/* Corner Studs */}
        <span style={{ position: 'absolute', top: 4, left: 4, width: 5, height: 5, background: '#f2c230', borderRadius: 1 }} />
        <span style={{ position: 'absolute', top: 4, right: 4, width: 5, height: 5, background: '#f2c230', borderRadius: 1 }} />
        <span style={{ position: 'absolute', bottom: 4, left: 4, width: 5, height: 5, background: '#f2c230', borderRadius: 1 }} />
        <span style={{ position: 'absolute', bottom: 4, right: 4, width: 5, height: 5, background: '#f2c230', borderRadius: 1 }} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 16,
            alignItems: 'center',
          }}
        >
          {/* 1. Golden Clock & Calendar HUD */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: 'linear-gradient(180deg, #3d2315 0%, #29150b 100%)',
              padding: '12px 16px',
              borderRadius: 12,
              border: '2px solid #a36c3a',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
            }}
          >
            {/* Circular Sun/Moon Clock Graphic */}
            <div
              style={{
                position: 'relative',
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: isNight
                  ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
                  : 'linear-gradient(135deg, #38bdf8 0%, #fde047 100%)',
                border: '2px solid #f2c230',
                boxShadow: '0 0 10px rgba(242, 194, 48, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isNight ? (
                <Moon size={22} color="#fde047" style={{ filter: 'drop-shadow(0 0 4px #fde047)' }} />
              ) : (
                <Sun size={24} color="#d97706" style={{ filter: 'drop-shadow(0 0 6px #f2c230)' }} />
              )}
              {/* Season Badge */}
              <span
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  fontSize: 13,
                  background: '#2b1a11',
                  borderRadius: '50%',
                  padding: '1px 2px',
                  border: '1px solid #7b4a28',
                }}
              >
                {seasonEmoji}
              </span>
            </div>

            {/* Time & Season Header */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display, serif)',
                    fontStyle: 'italic',
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#fdf6e2',
                    letterSpacing: '0.01em',
                  }}
                >
                  {dayName}. {dayOfMonth} of {season}
                </span>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#f2c230',
                    letterSpacing: '0.04em',
                    fontFamily: 'var(--font-pixel, monospace)',
                  }}
                >
                  {timeStr}
                </span>
              </div>

              {/* Farm Gold Pouch Meter & Persistent Dev Mode Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '2px 7px',
                    borderRadius: 6,
                    background: 'rgba(242, 194, 48, 0.15)',
                    border: '1px solid rgba(242, 194, 48, 0.3)',
                  }}
                >
                  <Coins size={13} color="#f2c230" />
                  <span
                    className="tabular-nums"
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: netGold >= 0 ? '#8fc45a' : '#c2415a',
                    }}
                  >
                    {netGold >= 0 ? '+' : ''}₹{Math.abs(netGold).toLocaleString('en-IN')}g
                  </span>
                  <span style={{ fontSize: 9, color: '#a38d7b', fontWeight: 700 }}>GOLD</span>
                </div>

                {/* Constraint 4: Persistent HUD indicator for Live vs Dev */}
                <DevModeIndicator
                  envMode={envMode}
                  onToggle={onSwitchEnvMode ? () => onSwitchEnvMode(envMode === 'live' ? 'development' : 'live') : undefined}
                  disabled={updatingEnv}
                />

                {/* Village Prosperity Rank */}
                <div
                  title={`Village Growth Prosperity: ${prosperityScore} pts (${harvestedCrops} crops harvested, ${settledDebts} favors settled)`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 7px',
                    borderRadius: 6,
                    background: 'rgba(143, 196, 90, 0.15)',
                    border: '1px solid rgba(143, 196, 90, 0.35)',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#8fc45a',
                    fontFamily: 'var(--font-pixel, monospace)',
                  }}
                >
                  <Award size={11} color="#8fc45a" />
                  <span>{prosperityRank}</span>
                </div>

                {/* Weather Indicator Badge */}
                <div
                  title={`Valley Weather: ${currentWeather}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 7px',
                    borderRadius: 6,
                    background: 'rgba(79, 155, 209, 0.15)',
                    border: '1px solid rgba(79, 155, 209, 0.3)',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#4f9bd1',
                    textTransform: 'capitalize',
                  }}
                >
                  {currentWeather === 'rain' && <CloudRain size={12} />}
                  {currentWeather === 'snow' && <Snowflake size={12} />}
                  {currentWeather === 'breeze' && <Wind size={12} />}
                  {currentWeather === 'fireflies' && <Sparkles size={12} />}
                  {(currentWeather === 'clear' || !['rain', 'snow', 'breeze', 'fireflies'].includes(currentWeather)) && <Sun size={12} />}
                  <span>{currentWeather}</span>
                </div>

                {/* Messenger Bird (Wren) Interactive Button */}
                <button
                  type="button"
                  onClick={() => setWrenModalOpen(true)}
                  title="Wren the Messenger Bird: Click to view WhatsApp bot command sheet"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 7px',
                    borderRadius: 6,
                    background: 'rgba(143, 196, 90, 0.15)',
                    border: '1px solid rgba(143, 196, 90, 0.3)',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#8fc45a',
                    cursor: 'pointer',
                  }}
                >
                  <span>🕊️ Wren Guide</span>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#8fc45a' }} />
                </button>

                {/* Quick Sound Toggle */}
                <button
                  type="button"
                  onClick={handleToggleSound}
                  title={soundMuted ? 'Sound Muted — Click to activate' : 'Sound Active — Click to mute'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 7px',
                    borderRadius: 6,
                    background: soundMuted ? 'rgba(194, 65, 90, 0.15)' : 'rgba(143, 196, 90, 0.15)',
                    border: `1px solid ${soundMuted ? 'rgba(194, 65, 90, 0.4)' : 'rgba(143, 196, 90, 0.4)'}`,
                    color: soundMuted ? '#c2415a' : '#8fc45a',
                    cursor: 'pointer',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {soundMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  <span>{soundMuted ? 'MUTED' : 'AUDIO'}</span>
                </button>

                {/* Quick Motion Toggle */}
                <button
                  type="button"
                  onClick={handleToggleMotion}
                  title={reducedMotion ? 'Reduced Motion Active — Click to enable full parallax' : 'Full Parallax Active — Click to reduce motion'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 7px',
                    borderRadius: 6,
                    background: 'rgba(201, 143, 85, 0.15)',
                    border: '1px solid rgba(201, 143, 85, 0.35)',
                    color: '#fdf6e2',
                    cursor: 'pointer',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  <Compass size={12} color="#f2c230" />
                  <span>{reducedMotion ? 'STATIC' : 'MOTION'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Daily Chronicle Log & Oracle Narrative */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Scroll size={13} color="#f2c230" />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#a38d7b',
                  fontFamily: 'var(--font-pixel, monospace)',
                }}
              >
                The Daily Valley Chronicle
              </span>
            </div>

            <div
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: '#fdf6e2',
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

            {/* Oracle Fortune */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: '#c4b5a5',
                marginTop: 2,
              }}
            >
              <Sparkles size={11} color="#f2c230" style={{ flexShrink: 0 }} />
              <span>
                <em>Oracle:</em> {dailyFortune}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Wren's WhatsApp Bot Commands Cheat Sheet Modal */}
      {wrenModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setWrenModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 540 }}
          >
            <WoodPanel variant="golden" style={{ padding: 24, position: 'relative' }}>
              <button
                onClick={() => setWrenModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  background: 'transparent',
                  border: 'none',
                  color: '#c4b5a5',
                  cursor: 'pointer',
                  padding: 4,
                }}
                aria-label="Close command sheet"
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <CharacterSprite character="wren" state="idle" size={44} />
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fdf6e2', margin: 0, fontFamily: 'var(--font-pixel, monospace)' }}>
                    Messenger Wren’s Dispatch Commands
                  </h3>
                  <span style={{ fontSize: 11, color: '#f2c230', fontWeight: 600 }}>
                    Text these directly to your WhatsApp assistant from anywhere!
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  background: '#1f130b',
                  border: '1.5px solid #4d3324',
                  borderRadius: 8,
                  padding: 16,
                  maxHeight: '60vh',
                  overflowY: 'auto',
                }}
              >
                {[
                  { cmd: '>todo [task]', eg: '>todo Water the parsnips', desc: 'Plant a new daily quest plot' },
                  { cmd: '>remind [task] in [time]', eg: '>remind Call vet in 2 hours', desc: 'Tie an alert bell to the belfry' },
                  { cmd: '>owe [person] [amount]', eg: '>owe Arjun 500 for seeds', desc: 'Inscribe a favor into the gold ledger' },
                  { cmd: '>deadline [title] on [date]', eg: '>deadline AI Exam on Nov 15', desc: 'Pin a notice to the harvest bulletin' },
                  { cmd: '>watch [title] | [type]', eg: '>watch Dune 2 | movie', desc: 'Load a reel onto the Moonlight projector' },
                  { cmd: '>list [module]', eg: '>list todo  or  >list debt', desc: 'Receive instant carrier summary report' },
                  { cmd: 'help or menu', eg: 'help', desc: 'Wren delivers the full interactive directory' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderBottom: idx === 6 ? 'none' : '1px solid #3d2315',
                      paddingBottom: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                      <code style={{ color: '#8fc45a', fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>
                        {item.cmd}
                      </code>
                      <span style={{ fontSize: 10, color: '#a38d7b', textTransform: 'uppercase', fontWeight: 700 }}>
                        {item.desc}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#c4b5a5', fontStyle: 'italic' }}>
                      Example: {item.eg}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <PixelButton
                  variant="wood"
                  size="sm"
                  onClick={() => setWrenModalOpen(false)}
                >
                  Close Dispatch Guide
                </PixelButton>
              </div>
            </WoodPanel>
          </div>
        </div>
      )}
    </>
  );
}
