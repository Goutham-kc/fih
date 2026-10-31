import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function AnalyticsPulse({ onNavigate, envMode }) {
  const [stats, setStats] = useState({
    todosTotal: 0,
    todosDone: 0,
    deadlinesTotal: 0,
    deadlinesUpcoming: 0,
    totalOwedToMe: 0,
    totalIOwe: 0,
    remindersActive: 0,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [todosRes, debtsRes, deadlinesRes, remindersRes] = await Promise.all([
          fetch('/api/todos').then((r) => (r.ok ? r.json() : { todos: [] })),
          fetch('/api/debts').then((r) => (r.ok ? r.json() : { debts: [], summary: { totalOwe: 0, totalOwed: 0 } })),
          fetch('/api/deadlines').then((r) => (r.ok ? r.json() : { deadlines: [] })),
          fetch('/api/reminders').then((r) => (r.ok ? r.json() : { reminders: [] })),
        ]);

        if (!isMounted) return;

        const todos = todosRes.todos || [];
        const todosDone = todos.filter((t) => t.status === 'done').length;

        const deadlines = deadlinesRes.deadlines || [];
        const now = new Date();
        const deadlinesUpcoming = deadlines.filter((d) => new Date(d.dueDate) > now).length;

        const summary = debtsRes.summary || { totalOwe: 0, totalOwed: 0 };
        const reminders = remindersRes.reminders || [];
        const remindersActive = reminders.filter((r) => !r.sent).length;

        setStats({
          todosTotal: todos.length,
          todosDone,
          deadlinesTotal: deadlines.length,
          deadlinesUpcoming,
          totalOwedToMe: summary.totalOwed,
          totalIOwe: summary.totalOwe,
          remindersActive,
          loading: false,
        });
      } catch (e) {
        console.error(e);
        if (isMounted) setStats((prev) => ({ ...prev, loading: false }));
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [envMode]);

  const completionRate =
    stats.todosTotal > 0
      ? Math.round((stats.todosDone / stats.todosTotal) * 100)
      : 100;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}
    >
      {/* 1. Life Completion Radial Card */}
      <div
        onClick={() => onNavigate('todos')}
        className="fih-card-interactive"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 18,
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          cursor: 'pointer',
        }}
      >
        {/* Circular Progress Ring */}
        <div style={{ position: 'relative', width: 62, height: 62, flexShrink: 0 }}>
          <svg width="62" height="62" viewBox="0 0 68 68" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="34"
              cy="34"
              r="28"
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="5"
            />
            <circle
              cx="34"
              cy="34"
              r="28"
              fill="none"
              stroke="var(--accent-indigo)"
              strokeWidth="5"
              strokeDasharray={175.9}
              strokeDashoffset={175.9 - (175.9 * completionRate) / 100}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div
            className="tabular-nums"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            {stats.loading ? '—' : `${completionRate}%`}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Sparkles size={14} color="var(--accent-indigo)" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Execution Score
            </span>
          </div>
          <div
            className="tabular-nums"
            style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            {stats.todosDone} of {stats.todosTotal} Tasks Done
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {completionRate === 100 ? 'All tasks complete' : 'Focus on highest priority'}
          </div>
        </div>
      </div>

      {/* 2. Visual Cash Flow Bar Card */}
      <div
        onClick={() => onNavigate('debts')}
        className="fih-card-interactive"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 18,
          padding: '18px 22px',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={15} color="var(--accent-emerald)" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Cashflow Delta
            </span>
          </div>
          <span
            className="tabular-nums"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: stats.totalOwedToMe >= stats.totalIOwe ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            }}
          >
            {stats.loading ? '—' : `Net ₹${Math.abs(stats.totalOwedToMe - stats.totalIOwe).toLocaleString('en-IN')}`}
          </span>
        </div>

        {/* Stacked comparison bar */}
        <div
          style={{
            width: '100%',
            height: 8,
            borderRadius: 4,
            background: 'var(--bg-sunken)',
            overflow: 'hidden',
            display: 'flex',
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: `${(stats.totalOwedToMe / (stats.totalOwedToMe + stats.totalIOwe || 1)) * 100}%`,
              background: 'var(--accent-emerald)',
              transition: 'width 0.6s ease',
            }}
          />
          <div
            style={{
              width: `${(stats.totalIOwe / (stats.totalOwedToMe + stats.totalIOwe || 1)) * 100}%`,
              background: 'var(--accent-rose)',
              transition: 'width 0.6s ease',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
          <span className="tabular-nums">
            <strong style={{ color: 'var(--accent-emerald)' }}>+₹{stats.totalOwedToMe.toLocaleString('en-IN')}</strong> receivable
          </span>
          <span className="tabular-nums">
            <strong style={{ color: 'var(--accent-rose)' }}>-₹{stats.totalIOwe.toLocaleString('en-IN')}</strong> payable
          </span>
        </div>
      </div>

      {/* 3. Academic & Deadline Radar */}
      <div
        onClick={() => onNavigate('deadlines')}
        className="fih-card-interactive"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 18,
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: stats.deadlinesUpcoming > 0 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)',
            color: stats.deadlinesUpcoming > 0 ? 'var(--accent-rose)' : 'var(--accent-indigo)',
            flexShrink: 0,
          }}
        >
          {stats.deadlinesUpcoming > 0 ? <AlertCircle size={22} /> : <Calendar size={22} />}
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 2,
            }}
          >
            Radar
          </div>
          <div
            className="tabular-nums"
            style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            {stats.deadlinesUpcoming} Upcoming Deadlines
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {stats.remindersActive} active reminder alert{stats.remindersActive === 1 ? '' : 's'} queued
          </div>
        </div>
      </div>
    </div>
  );
}
