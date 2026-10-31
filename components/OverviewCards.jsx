import { useState, useEffect } from 'react';

export default function OverviewCards({ onNavigate, envMode }) {
  const [data, setData] = useState({
    todosCount: 0,
    urgentTodos: 0,
    remindersToday: 0,
    deadlinesSoon: 0,
    netDebt: 0,
    loading: true
  });

  useEffect(() => {
    let isMounted = true;

    async function loadOverview() {
      try {
        const [todosRes, remindersRes, debtsRes, deadlinesRes] = await Promise.all([
          fetch('/api/todos').then(r => r.ok ? r.json() : { todos: [] }),
          fetch('/api/reminders').then(r => r.ok ? r.json() : { reminders: [] }),
          fetch('/api/debts').then(r => r.ok ? r.json() : { debts: [], summary: { net: 0 } }),
          fetch('/api/deadlines').then(r => r.ok ? r.json() : { deadlines: [] })
        ]);

        if (!isMounted) return;

        const todos = todosRes.todos || [];
        const openTodos = todos.filter(t => t.status === 'open');
        const urgentTodos = openTodos.filter(t => t.priority === 'high').length;

        const reminders = remindersRes.reminders || [];
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const remindersToday = reminders.filter(r => {
          const at = new Date(r.remindAt);
          return at >= startOfDay && at <= endOfDay;
        }).length;

        const deadlines = deadlinesRes.deadlines || [];
        const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const deadlinesSoon = deadlines.filter(d => {
          const due = new Date(d.dueDate);
          return due > now && due <= in48h;
        }).length;

        const netDebt = debtsRes.summary ? debtsRes.summary.net : 0;

        setData({
          todosCount: openTodos.length,
          urgentTodos,
          remindersToday,
          deadlinesSoon,
          netDebt,
          loading: false
        });
      } catch (err) {
        console.error('Failed to load overview data:', err);
        if (isMounted) setData(prev => ({ ...prev, loading: false }));
      }
    }

    loadOverview();
    return () => { isMounted = false; };
  }, [envMode]);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: 14,
      marginBottom: 28,
    }}>
      {/* 1. To-dos metric */}
      <div
        onClick={() => onNavigate('todos')}
        className="card-interactive"
        style={{
          padding: '16px 18px',
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Tasks & To-Dos</span>
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-indigo)'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            {data.loading ? '—' : data.todosCount}
          </span>
          {data.urgentTodos > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600, color: 'var(--badge-high-color)',
              background: 'var(--badge-high-bg)', border: '1px solid var(--badge-high-border)',
              padding: '2px 6px', borderRadius: 6
            }}>
              {data.urgentTodos} urgent
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
          {data.loading ? 'Checking tasks...' : data.todosCount === 0 ? 'All caught up' : `${data.todosCount} open action item${data.todosCount === 1 ? '' : 's'}`}
        </div>
      </div>

      {/* 2. Today's Reminders */}
      <div
        onClick={() => onNavigate('reminders')}
        className="card-interactive"
        style={{
          padding: '16px 18px',
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Today's Reminders</span>
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(234, 179, 8, 0.12)', color: 'var(--accent-amber)'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            {data.loading ? '—' : data.remindersToday}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
          {data.loading ? 'Checking schedule...' : data.remindersToday === 0 ? 'No alerts today' : `Scheduled for today`}
        </div>
      </div>

      {/* 3. Deadlines Soon */}
      <div
        onClick={() => onNavigate('deadlines')}
        className="card-interactive"
        style={{
          padding: '16px 18px',
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Next 48 Hours</span>
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(244, 63, 94, 0.12)', color: 'var(--accent-rose)'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            {data.loading ? '—' : data.deadlinesSoon}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
          {data.loading ? 'Checking due dates...' : data.deadlinesSoon === 0 ? 'No close deadlines' : `Upcoming within 48h`}
        </div>
      </div>

      {/* 4. Net Debt Balance */}
      <div
        onClick={() => onNavigate('debts')}
        className="card-interactive"
        style={{
          padding: '16px 18px',
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Net Balance</span>
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(52, 211, 153, 0.12)', color: 'var(--accent-emerald)'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: data.netDebt > 0 ? 'var(--accent-emerald)' : data.netDebt < 0 ? 'var(--accent-rose)' : 'var(--text-primary)'
          }}>
            {data.loading ? '—' : `₹${Math.abs(data.netDebt)}`}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
          {data.loading ? 'Calculating...' : data.netDebt > 0 ? 'Others owe you net' : data.netDebt < 0 ? 'You owe net' : 'All balances settled'}
        </div>
      </div>
    </div>
  );
}
