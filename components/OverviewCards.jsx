import { useState, useEffect } from 'react';
import { CheckSquare, Clock, Calendar, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function OverviewCards({ onNavigate, envMode }) {
  const [data, setData] = useState({
    todosCount: 0,
    urgentTodos: 0,
    remindersToday: 0,
    deadlinesSoon: 0,
    netDebt: 0,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadOverview() {
      try {
        const [todosRes, remindersRes, debtsRes, deadlinesRes] = await Promise.all([
          fetch('/api/todos').then((r) => (r.ok ? r.json() : { todos: [] })),
          fetch('/api/reminders').then((r) => (r.ok ? r.json() : { reminders: [] })),
          fetch('/api/debts').then((r) => (r.ok ? r.json() : { debts: [], summary: { net: 0 } })),
          fetch('/api/deadlines').then((r) => (r.ok ? r.json() : { deadlines: [] })),
        ]);

        if (!isMounted) return;

        const todos = todosRes.todos || [];
        const openTodos = todos.filter((t) => t.status === 'open');
        const urgentTodos = openTodos.filter((t) => t.priority === 'high').length;

        const reminders = remindersRes.reminders || [];
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const remindersToday = reminders.filter((r) => {
          const at = new Date(r.remindAt);
          return at >= startOfDay && at <= endOfDay;
        }).length;

        const deadlines = deadlinesRes.deadlines || [];
        const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const deadlinesSoon = deadlines.filter((d) => {
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
          loading: false,
        });
      } catch (err) {
        console.error('Failed to load overview data:', err);
        if (isMounted) setData((prev) => ({ ...prev, loading: false }));
      }
    }

    loadOverview();
    return () => {
      isMounted = false;
    };
  }, [envMode]);

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: 14,
        marginBottom: 28,
      }}
    >
      {/* 1. To-dos metric */}
      <div
        onClick={() => onNavigate('todos')}
        onMouseMove={handleCardMouseMove}
        className="fih-card-interactive fih-spotlight"
        style={{
          padding: '18px 20px',
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Tasks & To-Dos</span>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--accent-indigo)',
            }}
          >
            <CheckSquare size={16} />
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="tabular-nums" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              {data.loading ? '—' : data.todosCount}
            </span>
            {data.urgentTodos > 0 && (
              <span
                className="tabular-nums"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--badge-high-color)',
                  background: 'var(--badge-high-bg)',
                  border: '1px solid var(--badge-high-border)',
                  padding: '2px 7px',
                  borderRadius: 6,
                }}
              >
                {data.urgentTodos} urgent
              </span>
            )}
          </div>
          {/* Micro sparkline */}
          <svg width="48" height="20" viewBox="0 0 48 20" style={{ opacity: 0.6 }}>
            <path d="M 0 16 Q 12 4, 24 12 T 48 6" fill="none" stroke="var(--accent-indigo)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="48" cy="6" r="2.5" fill="var(--accent-indigo)" />
          </svg>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
          {data.loading
            ? 'Checking tasks...'
            : data.todosCount === 0
            ? 'All caught up'
            : `${data.todosCount} pending action item${data.todosCount === 1 ? '' : 's'}`}
        </div>
      </div>

      {/* 2. Today's Reminders */}
      <div
        onClick={() => onNavigate('reminders')}
        onMouseMove={handleCardMouseMove}
        className="fih-card-interactive fih-spotlight"
        style={{
          padding: '18px 20px',
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Today's Reminders</span>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(245, 158, 11, 0.1)',
              color: 'var(--accent-amber)',
            }}
          >
            <Clock size={16} />
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="tabular-nums" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              {data.loading ? '—' : data.remindersToday}
            </span>
          </div>
          {/* Micro radar beacon */}
          <div style={{ position: 'relative', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid var(--accent-amber)' }} className="animate-pulse" />
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-amber)' }} />
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
          {data.loading
            ? 'Checking schedule...'
            : data.remindersToday === 0
            ? 'No alerts today'
            : `${data.remindersToday} alert${data.remindersToday === 1 ? '' : 's'} scheduled`}
        </div>
      </div>

      {/* 3. Deadlines Soon */}
      <div
        onClick={() => onNavigate('deadlines')}
        onMouseMove={handleCardMouseMove}
        className="fih-card-interactive fih-spotlight"
        style={{
          padding: '18px 20px',
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Due in 48 Hours</span>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(244, 63, 94, 0.1)',
              color: 'var(--accent-rose)',
            }}
          >
            <Calendar size={16} />
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="tabular-nums" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              {data.loading ? '—' : data.deadlinesSoon}
            </span>
          </div>
          {/* Micro countdown graphic */}
          <svg width="24" height="24" viewBox="0 0 24 24" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="12" cy="12" r="9" fill="none" stroke="var(--border-subtle)" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="9" fill="none" stroke="var(--accent-rose)" strokeWidth="2.5" strokeDasharray="56.5" strokeDashoffset="18" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
          {data.loading
            ? 'Checking due dates...'
            : data.deadlinesSoon === 0
            ? 'Clear schedule ahead'
            : `${data.deadlinesSoon} deadline${data.deadlinesSoon === 1 ? '' : 's'} approaching`}
        </div>
      </div>

      {/* 4. Net Debt Balance */}
      <div
        onClick={() => onNavigate('debts')}
        onMouseMove={handleCardMouseMove}
        className="fih-card-interactive fih-spotlight"
        style={{
          padding: '18px 20px',
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Net Balance</span>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                data.netDebt > 0
                  ? 'rgba(16, 185, 129, 0.1)'
                  : data.netDebt < 0
                  ? 'rgba(244, 63, 94, 0.1)'
                  : 'rgba(107, 114, 128, 0.1)',
              color:
                data.netDebt > 0
                  ? 'var(--accent-emerald)'
                  : data.netDebt < 0
                  ? 'var(--accent-rose)'
                  : 'var(--text-muted)',
            }}
          >
            <CreditCard size={16} />
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span
            className="tabular-nums"
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color:
                data.netDebt > 0
                  ? 'var(--accent-emerald)'
                  : data.netDebt < 0
                  ? 'var(--accent-rose)'
                  : 'var(--text-primary)',
            }}
          >
            {data.loading ? '—' : `₹${Math.abs(data.netDebt).toLocaleString('en-IN')}`}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', color: data.netDebt >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {data.netDebt >= 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
          {data.loading
            ? 'Calculating balances...'
            : data.netDebt > 0
            ? 'Others owe you net'
            : data.netDebt < 0
            ? 'You owe net'
            : 'All personal balances settled'}
        </div>
      </div>
    </div>
  );
}
