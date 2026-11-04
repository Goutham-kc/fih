import { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  Calendar,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Scale,
  Sparkles,
  Sprout,
  BellRing,
  Pin,
} from 'lucide-react';
import WoodPanel from '@/components/ui/WoodPanel';
import PixelBadge from '@/components/ui/PixelBadge';

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

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: 14,
        marginBottom: 24,
      }}
    >
      {/* 1. To-dos metric (Chapter 1: Farmstead) */}
      <WoodPanel
        variant="default"
        onClick={() => onNavigate('todos')}
        style={{
          padding: '16px 18px',
          cursor: 'pointer',
          position: 'relative',
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
        }}
        title="Walk to The Farmstead"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#c4b5a5', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-pixel, monospace)' }}>
            Farmstead Quests
          </span>
          <Sprout size={16} color="#8fc45a" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="tabular-nums" style={{ fontSize: 26, fontWeight: 800, color: '#fdf6e2', fontFamily: 'var(--font-pixel, monospace)' }}>
              {data.loading ? '—' : data.todosCount}
            </span>
            {data.urgentTodos > 0 && (
              <PixelBadge variant="danger" size="sm">
                {data.urgentTodos} urgent
              </PixelBadge>
            )}
          </div>
          <span style={{ fontSize: 18 }}>🌱</span>
        </div>
        <div style={{ fontSize: 11, color: '#a38d7b', marginTop: 4 }}>
          {data.loading
            ? 'Tending crop plots...'
            : data.todosCount === 0
            ? 'All fields cleared'
            : `${data.todosCount} crop plot${data.todosCount === 1 ? '' : 's'} ripening`}
        </div>
      </WoodPanel>

      {/* 2. Today's Reminders (Chapter 4: Bell Tower) */}
      <WoodPanel
        variant="default"
        onClick={() => onNavigate('reminders')}
        style={{
          padding: '16px 18px',
          cursor: 'pointer',
          position: 'relative',
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
        }}
        title="Climb to The Bell Tower"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#e07a3f', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-pixel, monospace)' }}>
            Belfry Chimes Today
          </span>
          <BellRing size={16} color="#e07a3f" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span className="tabular-nums" style={{ fontSize: 26, fontWeight: 800, color: '#fdf6e2', fontFamily: 'var(--font-pixel, monospace)' }}>
            {data.loading ? '—' : data.remindersToday}
          </span>
          <span style={{ fontSize: 18 }}>🔔</span>
        </div>
        <div style={{ fontSize: 11, color: '#a38d7b', marginTop: 4 }}>
          {data.loading
            ? 'Checking belfry bells...'
            : data.remindersToday === 0
            ? 'Quiet day in belfry'
            : `${data.remindersToday} chime${data.remindersToday === 1 ? '' : 's'} queued today`}
        </div>
      </WoodPanel>

      {/* 3. Deadlines Soon (Chapter 3: Notice Board) */}
      <WoodPanel
        variant="default"
        onClick={() => onNavigate('deadlines')}
        style={{
          padding: '16px 18px',
          cursor: 'pointer',
          position: 'relative',
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
        }}
        title="Check Town Notice Board"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f2c230', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-pixel, monospace)' }}>
            Ripening in 48h
          </span>
          <Pin size={16} color="#f2c230" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span className="tabular-nums" style={{ fontSize: 26, fontWeight: 800, color: '#fdf6e2', fontFamily: 'var(--font-pixel, monospace)' }}>
            {data.loading ? '—' : data.deadlinesSoon}
          </span>
          <span style={{ fontSize: 18 }}>📌</span>
        </div>
        <div style={{ fontSize: 11, color: '#a38d7b', marginTop: 4 }}>
          {data.loading
            ? 'Reading notice ribbons...'
            : data.deadlinesSoon === 0
            ? 'Clear bulletin ahead'
            : `${data.deadlinesSoon} notice${data.deadlinesSoon === 1 ? '' : 's'} due soon`}
        </div>
      </WoodPanel>

      {/* 4. Net Debt Balance (Chapter 2: Ledger Hut) */}
      <WoodPanel
        variant="golden"
        onClick={() => onNavigate('debts')}
        style={{
          padding: '16px 18px',
          cursor: 'pointer',
          position: 'relative',
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
        }}
        title="Inspect Bram's Ledger Hut"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f2c230', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-pixel, monospace)' }}>
            Net Ledger Gold
          </span>
          <Scale size={16} color="#f2c230" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span
            className="tabular-nums"
            style={{
              fontSize: 26,
              fontWeight: 800,
              fontFamily: 'var(--font-pixel, monospace)',
              color: data.netDebt >= 0 ? '#8fc45a' : '#e05338',
            }}
          >
            {data.loading ? '—' : `${data.netDebt >= 0 ? '+' : ''}₹${Math.abs(data.netDebt).toLocaleString('en-IN')}`}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', color: data.netDebt >= 0 ? '#8fc45a' : '#e05338' }}>
            {data.netDebt >= 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#c4b5a5', marginTop: 4 }}>
          {data.loading
            ? 'Balancing scale...'
            : data.netDebt > 0
            ? 'Surplus in gold pouch'
            : data.netDebt < 0
            ? 'Net favors owed'
            : 'All tabs balanced'}
        </div>
      </WoodPanel>
    </div>
  );
}
