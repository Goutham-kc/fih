import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TodoList from '@/components/TodoList';
import DebtTracker from '@/components/DebtTracker';
import DeadlineBoard from '@/components/DeadlineBoard';
import ImportantDates from '@/components/ImportantDates';
import Watchlist from '@/components/Watchlist';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'todos', label: 'Tasks', icon: 'checklist' },
  { id: 'debts', label: 'Ledger', icon: 'account_balance_wallet' },
  { id: 'deadlines', label: 'Deadlines', icon: 'event_busy' },
  { id: 'dates', label: 'Dates', icon: 'cake' },
  { id: 'watchlist', label: 'Watch/Read', icon: 'menu_book' },
];

const COMMAND_LIST = [
  { cmd: '>todo Buy milk | 2026-08-01', desc: 'Create a new todo with optional due date' },
  { cmd: '>done milk', desc: 'Mark a todo as completed using fuzzy search' },
  { cmd: '>debt owe Alex 500 Lunch', desc: 'Record a debt you owe to someone' },
  { cmd: '>debt owed Sam 1200 Movie', desc: 'Record a debt someone owes you' },
  { cmd: '>debt settle Alex', desc: 'Settle all debts with a person' },
  { cmd: '>deadline Exam | 2026-08-15 10:00 | academic', desc: 'Add deadline with category' },
  { cmd: '>date Birthday | 09-14 | yearly', desc: 'Save an important recurring date' },
  { cmd: '>watch Inception | movie', desc: 'Add movie/show/book/anime to watchlist' },
  { cmd: '>watch Inception done 9', desc: 'Mark item done with rating (1-10)' },
  { cmd: '>list todo', desc: 'List items in any category' },
  { cmd: '>help', desc: 'View all command syntax' },
];

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [waOpen, setWaOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Summary counts for Briefing
  const [counts, setCounts] = useState({ todos: 0, deadlines: 0, owe: 0 });

  useEffect(() => {
    fetch('/api/todos')
      .then(res => {
        if (res.status === 401) router.push('/login');
        else {
          setAuthChecked(true);
          res.json().then(data => {
            const openTodos = (data.todos || []).filter(t => t.status === 'open');
            setCounts(prev => ({ ...prev, todos: openTodos.length }));
          });
        }
      })
      .catch(() => router.push('/login'));

    fetch('/api/deadlines')
      .then(res => res.json())
      .then(data => {
        setCounts(prev => ({ ...prev, deadlines: (data.deadlines || []).length }));
      })
      .catch(() => {});
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  function copyCommand(cmd, idx) {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '3px solid rgba(192, 193, 255, 0.2)',
            borderTopColor: 'var(--accent-primary)',
            animation: 'fadeIn 0.6s infinite linear'
          }} />
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Initializing FIH...</div>
        </div>
      </div>
    );
  }

  function renderContent() {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="animate-fade">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
              <div className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--accent-primary)' }}>checklist</span>
                    Tasks Overview
                  </h3>
                  <button className="btn btn-ghost" onClick={() => setActiveTab('todos')} style={{ fontSize: 12 }}>View all →</button>
                </div>
                <TodoList />
              </div>

              <div className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--accent-tertiary)' }}>account_balance_wallet</span>
                    Financial Ledger
                  </h3>
                  <button className="btn btn-ghost" onClick={() => setActiveTab('debts')} style={{ fontSize: 12 }}>View all →</button>
                </div>
                <DebtTracker />
              </div>
            </div>
          </div>
        );
      case 'todos': return <TodoList key="todos" />;
      case 'debts': return <DebtTracker key="debts" />;
      case 'deadlines': return <DeadlineBoard key="deadlines" />;
      case 'dates': return <ImportantDates key="dates" />;
      case 'watchlist': return <Watchlist key="watchlist" />;
      default: return null;
    }
  }

  return (
    <>
      <Head>
        <title>FIH — Personal Life OS</title>
        <meta name="description" content="High performance personal management OS" />
      </Head>

      {/* Ambient background glow */}
      <div className="ambient-glow" style={{ top: -100, left: '20%' }} />
      <div className="ambient-glow" style={{ bottom: -100, right: '20%' }} />

      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <div style={{ marginBottom: 32, paddingLeft: 8 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>FIH</h2>
          <p className="logo-sub" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--accent-primary)', textTransform: 'uppercase', marginTop: 2 }}>
            High Performance
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </button>
          ))}
        </div>

        <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
          <button className="nav-item" onClick={logout}>
            <span className="material-symbols-outlined">logout</span>
            <span className="nav-text">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Hero Section */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                Daily Briefing
              </span>
              <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 4 }}>
                Welcome back
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 6, maxWidth: 600 }}>
                You have <strong style={{ color: 'var(--accent-primary)' }}>{counts.todos} active tasks</strong> and <strong style={{ color: 'var(--accent-secondary)' }}>{counts.deadlines} upcoming deadlines</strong> tracked in your OS.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setWaOpen(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chat</span>
                WhatsApp Commands
              </button>
            </div>
          </div>
        </section>

        {/* Content Render */}
        {renderContent()}
      </main>

      {/* WhatsApp Command Cheat Sheet Drawer */}
      <aside className={`wa-panel ${waOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>WhatsApp Commands</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Tap any command to copy</p>
          </div>
          <button className="btn btn-ghost" onClick={() => setWaOpen(false)} style={{ padding: '4px 8px' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {COMMAND_LIST.map((item, idx) => (
            <div
              key={idx}
              onClick={() => copyCommand(item.cmd, idx)}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: 12,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <code style={{ fontSize: 13, color: 'var(--accent-primary)', fontFamily: 'monospace', fontWeight: 600 }}>
                  {item.cmd}
                </code>
                <span style={{ fontSize: 11, color: copiedIndex === idx ? 'var(--accent-tertiary)' : 'var(--text-muted)' }}>
                  {copiedIndex === idx ? 'Copied ✓' : 'Copy'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Floating Action Toggle */}
      <button className="wa-toggle" onClick={() => setWaOpen(!waOpen)}>
        <span className="material-symbols-outlined">chat</span>
        <span>Bot Commands</span>
      </button>
    </>
  );
}
