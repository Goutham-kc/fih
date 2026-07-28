import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TodoList from '@/components/TodoList';
import DebtTracker from '@/components/DebtTracker';
import DeadlineBoard from '@/components/DeadlineBoard';
import ImportantDates from '@/components/ImportantDates';
import Watchlist from '@/components/Watchlist';

const TABS = [
  {
    id: 'todos',
    label: 'Todos',
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    id: 'debts',
    label: 'Debts',
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    id: 'deadlines',
    label: 'Deadlines',
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'dates',
    label: 'Important Dates',
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: 'watchlist',
    label: 'Watchlist',
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
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
  const [activeTab, setActiveTab] = useState('todos');
  const [waOpen, setWaOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    fetch('/api/todos')
      .then(res => {
        if (res.status === 401) router.push('/login');
        else setAuthChecked(true);
      })
      .catch(() => router.push('/login'));
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
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading Dashboard...</div>
      </div>
    );
  }

  function renderTab() {
    switch (activeTab) {
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
        <title>Dashboard — fih</title>
        <meta name="description" content="Your personal life dashboard" />
      </Head>

      {/* Ambient Background Glow */}
      <div className="ambient-glow" style={{ top: -100, left: '25%' }} />
      <div className="ambient-glow" style={{ bottom: -100, right: '25%' }} />

      {/* Left Sidebar Navigation */}
      <nav className="sidebar">
        <div style={{ marginBottom: 32, paddingLeft: 8 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>fih</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', opacity: activeTab === tab.id ? 1 : 0.7 }}>
                {tab.svg}
              </span>
              <span className="nav-text">{tab.label}</span>
            </button>
          ))}
        </div>

        <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
          <button className="nav-item" onClick={logout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="nav-text">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="main-content">
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {TABS.find(t => t.id === activeTab)?.label}
          </h1>

          <button className="btn btn-secondary" onClick={() => setWaOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            WhatsApp Commands
          </button>
        </header>

        {/* Tab Content Component */}
        {renderTab()}
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>Bot Commands</span>
      </button>
    </>
  );
}
