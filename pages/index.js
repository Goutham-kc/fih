import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TodoList from '@/components/TodoList';
import DebtTracker from '@/components/DebtTracker';
import DeadlineBoard from '@/components/DeadlineBoard';
import ImportantDates from '@/components/ImportantDates';
import Watchlist from '@/components/Watchlist';

const TABS = [
  { id: 'todos', label: 'Todos', icon: 'checklist' },
  { id: 'debts', label: 'Debts', icon: 'account_balance_wallet' },
  { id: 'deadlines', label: 'Deadlines', icon: 'event_busy' },
  { id: 'dates', label: 'Important Dates', icon: 'cake' },
  { id: 'watchlist', label: 'Watchlist', icon: 'menu_book' },
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
              <span className="material-symbols-outlined">{tab.icon}</span>
              <span className="nav-text">{tab.label}</span>
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

      {/* Main Content Canvas */}
      <main className="main-content">
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {TABS.find(t => t.id === activeTab)?.label}
          </h1>

          <button className="btn btn-secondary" onClick={() => setWaOpen(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chat</span>
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
        <span className="material-symbols-outlined">chat</span>
        <span>Bot Commands</span>
      </button>
    </>
  );
}
