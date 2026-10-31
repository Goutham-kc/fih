import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Calendar, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

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
          fetch('/api/todos').then(r => r.ok ? r.json() : { todos: [] }),
          fetch('/api/debts').then(r => r.ok ? r.json() : { debts: [], summary: { totalOwe: 0, totalOwed: 0 } }),
          fetch('/api/deadlines').then(r => r.ok ? r.json() : { deadlines: [] }),
          fetch('/api/reminders').then(r => r.ok ? r.json() : { reminders: [] }),
        ]);

        if (!isMounted) return;

        const todos = todosRes.todos || [];
        const todosDone = todos.filter(t => t.status === 'done').length;

        const deadlines = deadlinesRes.deadlines || [];
        const now = new Date();
        const deadlinesUpcoming = deadlines.filter(d => new Date(d.dueDate) > now).length;

        const summary = debtsRes.summary || { totalOwe: 0, totalOwed: 0 };
        const reminders = remindersRes.reminders || [];
        const remindersActive = reminders.filter(r => !r.sent).length;

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
        if (isMounted) setStats(prev => ({ ...prev, loading: false }));
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [envMode]);

  const completionRate = stats.todosTotal > 0
    ? Math.round((stats.todosDone / stats.todosTotal) * 100)
    : 100;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 16,
      marginBottom: 28,
    }}>
      {/* 1. Life Completion Radial Card */}
      <div
        onClick={() => onNavigate('todos')}
        className="card-interactive"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.06) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          borderRadius: 20,
          padding: '20px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          cursor: 'pointer',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.08)',
        }}
      >
        {/* SVG Circular Progress Ring */}
        <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
          <svg width="68" height="68" viewBox="0 0 68 68" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="34" cy="34" r="28"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="6"
            />
            <circle
              cx="34" cy="34" r="28"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="6"
              strokeDasharray={175.9}
              strokeDashoffset={175.9 - (175.9 * completionRate) / 100}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: 'var(--text-primary)'
          }}>
            {stats.loading ? '...' : `${completionRate}%`}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Sparkles size={15} color="#c084fc" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Execution Score
            </span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {stats.todosDone} of {stats.todosTotal} Tasks Done
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {completionRate === 100 ? '🎉 All clear for today' : 'Keep pushing forward'}
          </div>
        </div>
      </div>

      {/* 2. Visual Cash Flow Bar Card */}
      <div
        onClick={() => onNavigate('debts')}
        className="card-interactive"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%)',
          border: '1px solid rgba(52, 211, 153, 0.25)',
          borderRadius: 20,
          padding: '20px 22px',
          cursor: 'pointer',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(20, 184, 166, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={16} color="#34d399" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cash Flow Ratio
            </span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: stats.totalOwedToMe >= stats.totalIOwe ? '#34d399' : '#f43f5e' }}>
            {stats.loading ? '—' : `Net ₹${Math.abs(stats.totalOwedToMe - stats.totalIOwe)}`}
          </span>
        </div>

        {/* Stacked comparison bar */}
        <div style={{ width: '100%', height: 10, borderRadius: 5, background: 'rgba(255, 255, 255, 0.06)', overflow: 'hidden', display: 'flex', marginBottom: 12 }}>
          <div
            style={{
              width: `${(stats.totalOwedToMe / (stats.totalOwedToMe + stats.totalIOwe || 1)) * 100}%`,
              background: 'linear-gradient(90deg, #10b981, #34d399)',
              transition: 'width 0.6s ease',
            }}
          />
          <div
            style={{
              width: `${(stats.totalIOwe / (stats.totalOwedToMe + stats.totalIOwe || 1)) * 100}%`,
              background: 'linear-gradient(90deg, #f43f5e, #fb7185)',
              transition: 'width 0.6s ease',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ color: '#34d399', fontWeight: 600 }}>
            Receivable: ₹{stats.totalOwedToMe}
          </span>
          <span style={{ color: '#fb7185', fontWeight: 600 }}>
            Payable: ₹{stats.totalIOwe}
          </span>
        </div>
      </div>

      {/* 3. Upcoming Deadlines Radar Card */}
      <div
        onClick={() => onNavigate('deadlines')}
        className="card-interactive"
        style={{
          background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(251, 146, 60, 0.05) 100%)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          borderRadius: 20,
          padding: '20px 22px',
          cursor: 'pointer',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(244, 63, 94, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} color="#fb7185" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Academic Radar
            </span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
            background: 'rgba(244, 63, 94, 0.18)', color: '#fb7185'
          }}>
            {stats.deadlinesUpcoming} Active
          </span>
        </div>

        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {stats.loading ? '—' : `${stats.deadlinesUpcoming} Deadlines`}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={12} />
            <span>Reminders sync automated via WhatsApp</span>
          </div>
        </div>
      </div>
    </div>
  );
}
