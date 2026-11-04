import { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  Sparkles,
  Radio,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function InteractiveTelemetry({ onNavigate, envMode }) {
  const [activeView, setActiveView] = useState('velocity'); // 'velocity' | 'horizon' | 'matrix'
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredPin, setHoveredPin] = useState(null);
  const [scrubberX, setScrubberX] = useState(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [loading, setLoading] = useState(true);

  // Raw telemetry data
  const [telemetry, setTelemetry] = useState({
    velocityPoints: [],
    horizonItems: [],
    cashflowSummary: { totalOwed: 0, totalOwe: 0, net: 0, topReceivables: [], topPayables: [] },
    todayStats: { tasksDoneToday: 0, remindersCount: 0, deadlinesCount: 0 },
  });

  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Mouse spotlight coordinates
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty('--mouse-x', `${x}px`);
    containerRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [todosRes, debtsRes, deadlinesRes, remindersRes, logsRes] = await Promise.all([
          fetch('/api/todos').then((r) => (r.ok ? r.json() : { todos: [] })),
          fetch('/api/debts').then((r) => (r.ok ? r.json() : { debts: [], summary: { totalOwe: 0, totalOwed: 0, net: 0 } })),
          fetch('/api/deadlines').then((r) => (r.ok ? r.json() : { deadlines: [] })),
          fetch('/api/reminders').then((r) => (r.ok ? r.json() : { reminders: [] })),
          fetch('/api/audit-logs?limit=150').then((r) => (r.ok ? r.json() : { logs: [] })),
        ]);

        if (!isMounted) return;

        const todos = todosRes.todos || [];
        const debts = debtsRes.debts || [];
        const deadlines = deadlinesRes.deadlines || [];
        const reminders = remindersRes.reminders || [];
        const logs = logsRes.logs || [];

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        // 1. Build 7-Day Velocity Data Points
        const points = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

          const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          // Completed tasks on this day
          const tasksDone = todos.filter((t) => {
            if (t.status !== 'done' || !t.completedAt) return false;
            const completed = new Date(t.completedAt);
            return completed >= dayStart && completed <= dayEnd;
          }).length;

          // Chronicle audit logs on this day
          const dayLogs = logs.filter((l) => {
            const created = new Date(l.createdAt);
            return created >= dayStart && created <= dayEnd;
          }).length;

          // Compute composite activity velocity index
          const velocityScore = Math.max(2, tasksDone * 2.5 + dayLogs * 1.2);

          points.push({
            dayLabel,
            dateStr,
            tasksDone,
            chronicleEvents: dayLogs,
            velocityScore,
            isToday: i === 0,
          });
        }

        // 2. Build 24-Hour Horizon Items (Today's orbit)
        const horizon = [];

        // Reminders today
        reminders.forEach((r) => {
          const at = new Date(r.remindAt);
          if (at >= startOfToday && at <= endOfToday) {
            const minutesFromMidnight = at.getHours() * 60 + at.getMinutes();
            const percent = (minutesFromMidnight / 1440) * 100;
            horizon.push({
              id: `rem-${r._id}`,
              type: 'reminder',
              title: r.title,
              timeStr: at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              percent: Math.min(98, Math.max(2, percent)),
              status: r.sent ? 'sent' : 'pending',
              module: 'reminders',
            });
          }
        });

        // Deadlines today
        deadlines.forEach((dl) => {
          const due = new Date(dl.dueDate);
          if (due >= startOfToday && due <= endOfToday) {
            const minutesFromMidnight = due.getHours() * 60 + due.getMinutes();
            const percent = (minutesFromMidnight / 1440) * 100;
            horizon.push({
              id: `dl-${dl._id}`,
              type: 'deadline',
              title: dl.title,
              timeStr: due.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              percent: Math.min(98, Math.max(2, percent)),
              status: due < now ? 'overdue' : 'upcoming',
              module: 'deadlines',
            });
          }
        });

        // Tasks due today
        todos.forEach((t) => {
          if (t.dueDate) {
            const due = new Date(t.dueDate);
            if (due >= startOfToday && due <= endOfToday) {
              const minutesFromMidnight = due.getHours() * 60 + due.getMinutes();
              const percent = (minutesFromMidnight / 1440) * 100;
              horizon.push({
                id: `todo-${t._id}`,
                type: 'todo',
                title: t.title,
                timeStr: due.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                percent: Math.min(98, Math.max(2, percent)),
                status: t.status === 'done' ? 'done' : 'open',
                module: 'todos',
              });
            }
          }
        });

        // 3. Financial Breakdown
        const activeDebts = debts.filter((d) => !d.settled);
        const personMap = {};
        activeDebts.forEach((d) => {
          if (!personMap[d.person]) personMap[d.person] = { person: d.person, net: 0, owedToMe: 0, iOwe: 0 };
          if (d.direction === 'owed_to_me') {
            personMap[d.person].owedToMe += d.amount;
            personMap[d.person].net += d.amount;
          } else {
            personMap[d.person].iOwe += d.amount;
            personMap[d.person].net -= d.amount;
          }
        });

        const people = Object.values(personMap);
        const topReceivables = people.filter((p) => p.net > 0).sort((a, b) => b.net - a.net).slice(0, 3);
        const topPayables = people.filter((p) => p.net < 0).sort((a, b) => a.net - b.net).slice(0, 3);

        const summary = debtsRes.summary || { totalOwe: 0, totalOwed: 0, net: 0 };

        // 4. Today summary
        const tasksDoneToday = todos.filter((t) => {
          if (t.status !== 'done' || !t.completedAt) return false;
          const completed = new Date(t.completedAt);
          return completed >= startOfToday && completed <= endOfToday;
        }).length;

        setTelemetry({
          velocityPoints: points,
          horizonItems: horizon,
          cashflowSummary: {
            totalOwed: summary.totalOwed || 0,
            totalOwe: summary.totalOwe || 0,
            net: (summary.totalOwed || 0) - (summary.totalOwe || 0),
            topReceivables,
            topPayables,
          },
          todayStats: {
            tasksDoneToday,
            remindersCount: reminders.length,
            deadlinesCount: deadlines.length,
          },
        });
        setLoading(false);
      } catch (err) {
        console.error('InteractiveTelemetry load error:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [envMode]);

  // Current time ratio (0 - 100%)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimePercent = (currentMinutes / 1440) * 100;
  const currentTimeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // Generate smooth SVG Bézier curve for the 7 velocity points
  const svgWidth = 640;
  const svgHeight = 140;
  const paddingX = 40;
  const paddingY = 24;

  const points = telemetry.velocityPoints;
  const maxScore = Math.max(10, ...points.map((p) => p.velocityScore));

  const coords = points.map((p, idx) => {
    const x = paddingX + (idx / Math.max(1, points.length - 1)) * (svgWidth - paddingX * 2);
    const normalizedY = (p.velocityScore / maxScore) * (svgHeight - paddingY * 2);
    const y = svgHeight - paddingY - normalizedY;
    return { x, y, point: p, index: idx };
  });

  // SVG Catmull-Rom or Cubic Bézier path generator
  function createBezierPath(pointsArray) {
    if (pointsArray.length === 0) return '';
    let d = `M ${pointsArray[0].x} ${pointsArray[0].y}`;
    for (let i = 0; i < pointsArray.length - 1; i++) {
      const p0 = pointsArray[i === 0 ? 0 : i - 1];
      const p1 = pointsArray[i];
      const p2 = pointsArray[i + 1];
      const p3 = pointsArray[i + 2 < pointsArray.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }

  const curvePath = createBezierPath(coords);
  const areaPath = coords.length > 0
    ? `${curvePath} L ${coords[coords.length - 1].x} ${svgHeight} L ${coords[0].x} ${svgHeight} Z`
    : '';

  // Handle interactive hover scrubbing across the graph
  const handleSvgPointerMove = (e) => {
    if (!svgRef.current || coords.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (!clientX) return;
    const relX = ((clientX - rect.left) / rect.width) * svgWidth;

    // Find nearest point
    let closest = coords[0];
    let minDiff = Infinity;
    coords.forEach((c) => {
      const diff = Math.abs(c.x - relX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = c;
      }
    });

    setScrubberX(closest.x);
    setHoveredPoint(closest);
    setIsScrubbing(true);
  };

  const handleSvgPointerLeave = () => {
    setIsScrubbing(false);
    setHoveredPoint(null);
    setScrubberX(null);
  };

  const triggerPing = () => {
    setPulseActive(true);
    setTimeout(() => setPulseActive(false), 900);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fih-card fih-spotlight"
      style={{
        padding: '24px 28px',
        marginBottom: 24,
        position: 'relative',
        background: 'var(--bg-card)',
        borderRadius: 20,
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* ── Top Header Bar with Mode Switcher & Telemetry Pill ─────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
          marginBottom: 20,
          position: 'relative',
          zIndex: 3,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-indigo)',
              boxShadow: pulseActive ? '0 0 16px var(--accent-primary-glow)' : 'none',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            <Activity size={18} className={pulseActive ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
                Life Telemetry Cockpit
              </span>
              <button
                onClick={triggerPing}
                title="Telemetry sync ping"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 6px',
                  borderRadius: 12,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--accent-emerald)',
                  background: 'rgba(16, 185, 129, 0.12)',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent-emerald)',
                    boxShadow: '0 0 8px var(--accent-emerald)',
                  }}
                />
                Live Sync
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              WhatsApp Chronicle & Realtime Orbit Telemetry
            </div>
          </div>
        </div>

        {/* Interactive Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            background: 'var(--bg-sunken)',
            padding: 3,
            borderRadius: 10,
            border: '1px solid var(--border-subtle)',
          }}
        >
          {[
            { id: 'velocity', label: 'Velocity Wave', icon: Activity },
            { id: 'horizon', label: '24h Horizon', icon: Clock },
            { id: 'matrix', label: 'Cashflow Matrix', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`btn ${isActive ? 'btn-secondary' : 'btn-ghost'}`}
                style={{
                  fontSize: 12,
                  padding: '5px 12px',
                  minHeight: 32,
                  borderRadius: 8,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <Icon size={13} style={{ marginRight: 6 }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Graphic Canvas Display ─────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* VIEW 1: 7-DAY VELOCITY WAVE (Interactive SVG with Scrubber) */}
        {activeView === 'velocity' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                7-Day Activity Velocity • Scrub curve to inspect
              </div>
              {hoveredPoint ? (
                <div className="tabular-nums" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-indigo)' }}>
                  {hoveredPoint.point.dayLabel}, {hoveredPoint.point.dateStr}: {hoveredPoint.point.tasksDone} Tasks Complete, {hoveredPoint.point.chronicleEvents} Events
                </div>
              ) : (
                <div className="tabular-nums" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Today: <strong style={{ color: 'var(--text-primary)' }}>{telemetry.todayStats.tasksDoneToday} tasks completed</strong>
                </div>
              )}
            </div>

            {/* SVG Interactive Canvas */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 150,
                cursor: 'crosshair',
                touchAction: 'none',
              }}
              onPointerMove={handleSvgPointerMove}
              onPointerLeave={handleSvgPointerLeave}
            >
              <svg
                ref={svgRef}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="none"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-indigo)" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="var(--accent-indigo)" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--accent-indigo)" />
                    <stop offset="50%" stopColor="var(--accent-violet)" />
                    <stop offset="100%" stopColor="var(--accent-emerald)" />
                  </linearGradient>
                </defs>

                {/* Subtle horizontal grid lines */}
                <line x1="0" y1={paddingY} x2={svgWidth} y2={paddingY} stroke="var(--border-subtle)" strokeDasharray="3 4" strokeWidth="1" />
                <line x1="0" y1={svgHeight / 2} x2={svgWidth} y2={svgHeight / 2} stroke="var(--border-subtle)" strokeDasharray="3 4" strokeWidth="1" />
                <line x1="0" y1={svgHeight - paddingY} x2={svgWidth} y2={svgHeight - paddingY} stroke="var(--border-subtle)" strokeWidth="1" />

                {/* Area Gradient Fill */}
                {areaPath && <path d={areaPath} fill="url(#velocityGrad)" />}

                {/* Main Dynamic Bézier Stroke */}
                {curvePath && (
                  <path
                    d={curvePath}
                    fill="none"
                    stroke="url(#strokeGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 2px 8px var(--accent-primary-glow))',
                    }}
                  />
                )}

                {/* Day Points & Anchor Dots */}
                {coords.map((c, i) => {
                  const isHovered = hoveredPoint && hoveredPoint.index === i;
                  return (
                    <g key={i}>
                      {/* Vertical connector line on hover */}
                      {isHovered && (
                        <line
                          x1={c.x}
                          y1={0}
                          x2={c.x}
                          y2={svgHeight}
                          stroke="var(--accent-indigo)"
                          strokeWidth="1.5"
                          strokeDasharray="2 3"
                          opacity="0.8"
                        />
                      )}

                      {/* Outer pulse ring on hover */}
                      {isHovered && (
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r="10"
                          fill="none"
                          stroke="var(--accent-indigo)"
                          strokeWidth="2"
                          opacity="0.4"
                          className="animate-pulse"
                        />
                      )}

                      {/* Point Node */}
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r={isHovered ? 6 : c.point.isToday ? 5 : 4}
                        fill={c.point.isToday ? 'var(--accent-emerald)' : 'var(--bg-card)'}
                        stroke={c.point.isToday ? 'var(--accent-emerald)' : 'var(--accent-indigo)'}
                        strokeWidth="2.5"
                        style={{
                          transition: 'r 0.15s ease',
                          cursor: 'pointer',
                        }}
                      />

                      {/* Day Label on X Axis */}
                      <text
                        x={c.x}
                        y={svgHeight + 2}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight={c.point.isToday || isHovered ? '700' : '500'}
                        fill={c.point.isToday ? 'var(--accent-emerald)' : isHovered ? 'var(--text-primary)' : 'var(--text-muted)'}
                        style={{ userSelect: 'none' }}
                      >
                        {c.point.dayLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Floating Glass Scrubber HUD Tooltip */}
              {hoveredPoint && (
                <div
                  style={{
                    position: 'absolute',
                    top: Math.max(0, (hoveredPoint.y / svgHeight) * 150 - 64),
                    left: `${Math.min(84, Math.max(16, (hoveredPoint.x / svgWidth) * 100))}%`,
                    transform: 'translateX(-50%)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-hover)',
                    borderRadius: 10,
                    padding: '8px 12px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    pointerEvents: 'none',
                    zIndex: 10,
                    whiteSpace: 'nowrap',
                    animation: 'fihSurfaceEnter var(--duration-fast) ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {hoveredPoint.point.dayLabel}, {hoveredPoint.point.dateStr}
                    </span>
                    {hoveredPoint.point.isToday && (
                      <span className="badge badge-low" style={{ fontSize: 9, padding: '1px 5px' }}>
                        Today
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                    <span className="tabular-nums" style={{ color: 'var(--accent-emerald)' }}>
                      ✓ {hoveredPoint.point.tasksDone} tasks done
                    </span>
                    <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      ⚡ {hoveredPoint.point.chronicleEvents} events
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: 24-HOUR HORIZON (Day Circadian Ribbon) */}
        {activeView === 'horizon' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                Today&apos;s 24-Hour Horizon Orbit • Hover pins to reveal schedule
              </div>
              <div className="tabular-nums" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                Current Time: <span style={{ color: 'var(--accent-emerald)' }}>{currentTimeString}</span> ({Math.round(currentTimePercent)}% of day)
              </div>
            </div>

            {/* 24-Hour Glowing Track */}
            <div style={{ position: 'relative', marginTop: 18, marginBottom: 24, padding: '12px 0' }}>
              {/* Background Ribbon Track */}
              <div
                style={{
                  width: '100%',
                  height: 10,
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 25%, #4338ca 50%, #d97706 75%, #0f172a 100%)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
                  position: 'relative',
                }}
              >
                {/* Past day shaded overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: `${currentTimePercent}%`,
                    background: 'rgba(255, 255, 255, 0.18)',
                    borderRadius: '6px 0 0 6px',
                  }}
                />

                {/* Current Time Beacon */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${currentTimePercent}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 5,
                  }}
                  title={`Now: ${currentTimeString}`}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'var(--accent-emerald)',
                      border: '2px solid #ffffff',
                      boxShadow: '0 0 14px var(--accent-emerald)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffffff' }} />
                  </div>
                  {/* Subtle vertical indicator needle */}
                  <div
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 9,
                      fontWeight: 800,
                      color: 'var(--accent-emerald)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    NOW
                  </div>
                </div>

                {/* Horizon Event Pins */}
                {telemetry.horizonItems.map((item) => {
                  const isHovered = hoveredPin?.id === item.id;
                  const pinColor =
                    item.type === 'reminder'
                      ? 'var(--accent-amber)'
                      : item.type === 'deadline'
                      ? 'var(--accent-rose)'
                      : 'var(--accent-indigo)';

                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setHoveredPin(item)}
                      onMouseLeave={() => setHoveredPin(null)}
                      onClick={() => onNavigate(item.module)}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: `${item.percent}%`,
                        transform: 'translate(-50%, -50%)',
                        cursor: 'pointer',
                        zIndex: isHovered ? 12 : 6,
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: isHovered ? 16 : 12,
                          height: isHovered ? 16 : 12,
                          borderRadius: '50%',
                          background: pinColor,
                          border: '2px solid var(--bg-card)',
                          boxShadow: `0 0 10px ${pinColor}`,
                          transition: 'all 0.15s ease',
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Time tick markers (0h, 6h, 12h, 18h, 24h) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  marginTop: 10,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <span>00:00 (Midnight)</span>
                <span>06:00 (Dawn)</span>
                <span>12:00 (Noon)</span>
                <span>18:00 (Dusk)</span>
                <span>23:59</span>
              </div>

              {/* Hovered Pin Info Drawer */}
              {hoveredPin ? (
                <div
                  style={{
                    marginTop: 14,
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'var(--bg-sunken)',
                    border: '1px solid var(--border-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    animation: 'fihSurfaceEnter var(--duration-fast) ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.1)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {hoveredPin.type}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {hoveredPin.title}
                    </span>
                    <span className="tabular-nums" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      at {hoveredPin.timeStr}
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate(hoveredPin.module)}
                    className="btn btn-ghost"
                    style={{ fontSize: 11, padding: '3px 8px', minHeight: 26 }}
                  >
                    Open View <ChevronRight size={12} />
                  </button>
                </div>
              ) : telemetry.horizonItems.length === 0 ? (
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                  No scheduled alarms or due deadlines for today. Your afternoon horizon is clear.
                </div>
              ) : (
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                  {telemetry.horizonItems.length} event{telemetry.horizonItems.length === 1 ? '' : 's'} plotted along today’s orbit. Hover any beacon point to inspect.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: CASHFLOW MATRIX (Financial Spectrum & Split) */}
        {activeView === 'matrix' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                Financial Delta Distribution • Ledger Balance Dynamics
              </div>
              <div className="tabular-nums" style={{ fontSize: 13, fontWeight: 700 }}>
                Net Position:{' '}
                <span style={{ color: telemetry.cashflowSummary.net >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                  {telemetry.cashflowSummary.net >= 0 ? '+' : ''}₹{telemetry.cashflowSummary.net.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Split vector visualization bar */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  width: '100%',
                  height: 12,
                  borderRadius: 6,
                  background: 'var(--bg-sunken)',
                  overflow: 'hidden',
                  display: 'flex',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
                }}
              >
                <div
                  style={{
                    width: `${
                      (telemetry.cashflowSummary.totalOwed /
                        (telemetry.cashflowSummary.totalOwed + telemetry.cashflowSummary.totalOwe || 1)) *
                      100
                    }%`,
                    background: 'var(--accent-emerald)',
                    transition: 'width 0.6s var(--ease-out)',
                  }}
                  title={`Receivable: ₹${telemetry.cashflowSummary.totalOwed.toLocaleString('en-IN')}`}
                />
                <div
                  style={{
                    width: `${
                      (telemetry.cashflowSummary.totalOwe /
                        (telemetry.cashflowSummary.totalOwed + telemetry.cashflowSummary.totalOwe || 1)) *
                      100
                    }%`,
                    background: 'var(--accent-rose)',
                    transition: 'width 0.6s var(--ease-out)',
                  }}
                  title={`Payable: ₹${telemetry.cashflowSummary.totalOwe.toLocaleString('en-IN')}`}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11 }}>
                <span className="tabular-nums" style={{ color: 'var(--accent-emerald)' }}>
                  ● ₹{telemetry.cashflowSummary.totalOwed.toLocaleString('en-IN')} to collect (
                  {Math.round(
                    (telemetry.cashflowSummary.totalOwed /
                      (telemetry.cashflowSummary.totalOwed + telemetry.cashflowSummary.totalOwe || 1)) *
                      100
                  )}
                  %)
                </span>
                <span className="tabular-nums" style={{ color: 'var(--accent-rose)' }}>
                  ● ₹{telemetry.cashflowSummary.totalOwe.toLocaleString('en-IN')} to settle (
                  {Math.round(
                    (telemetry.cashflowSummary.totalOwe /
                      (telemetry.cashflowSummary.totalOwed + telemetry.cashflowSummary.totalOwe || 1)) *
                      100
                  )}
                  %)
                </span>
              </div>
            </div>

            {/* Top Counterparties Chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--bg-sunken)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: 6, textTransform: 'uppercase' }}>
                  Top Receivables
                </div>
                {telemetry.cashflowSummary.topReceivables.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No pending receivables</div>
                ) : (
                  telemetry.cashflowSummary.topReceivables.map((p) => (
                    <div key={p.person} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{p.person}</span>
                      <span className="tabular-nums" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                        +₹{p.net.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--bg-sunken)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-rose)', marginBottom: 6, textTransform: 'uppercase' }}>
                  Top Payables
                </div>
                {telemetry.cashflowSummary.topPayables.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No pending payables</div>
                ) : (
                  telemetry.cashflowSummary.topPayables.map((p) => (
                    <div key={p.person} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{p.person}</span>
                      <span className="tabular-nums" style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>
                        -₹{Math.abs(p.net).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
