import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TodoList from '@/components/TodoList';
import DebtTracker from '@/components/DebtTracker';
import DeadlineBoard from '@/components/DeadlineBoard';
import ImportantDates from '@/components/ImportantDates';
import Watchlist from '@/components/Watchlist';

const TABS = [
  { id: 'todos', label: 'Todos' },
  { id: 'debts', label: 'Debts' },
  { id: 'deadlines', label: 'Deadlines' },
  { id: 'dates', label: 'Important Dates' },
  { id: 'watchlist', label: 'Watchlist' },
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '3px solid rgba(124, 58, 237, 0.2)',
            borderTopColor: 'var(--accent-violet)',
            animation: 'pulse 1s infinite spin'
          }} />
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>Loading Dashboard...</div>
        </div>
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

      {/* Header Bar */}
      <header className="navbar">
        <div className="brand-logo">
          fih
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginLeft: 12 }}>
            <span className="status-dot"></span> WhatsApp Bot Active
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-secondary" onClick={() => setWaOpen(true)} style={{ fontSize: 13, padding: '8px 14px' }}>
            WhatsApp Commands
          </button>
          <button className="btn btn-ghost" onClick={logout} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Sign out →
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="page-container">
        {/* Navigation Tabs */}
        <div className="tabs-container" style={{ marginBottom: 32 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTab()}
      </main>

      {/* WhatsApp Command Cheat Sheet Drawer */}
      <aside className={`wa-panel ${waOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>WhatsApp Commands</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Tap any command to copy</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => setWaOpen(false)}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {COMMAND_LIST.map((item, idx) => (
            <div
              key={idx}
              onClick={() => copyCommand(item.cmd, idx)}
              style={{
                background: 'rgba(18, 20, 32, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                padding: 12,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-violet)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <code style={{ fontSize: 13, color: 'var(--accent-cyan)', fontFamily: 'monospace', fontWeight: 600 }}>
                  {item.cmd}
                </code>
                <span style={{ fontSize: 11, color: copiedIndex === idx ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                  {copiedIndex === idx ? 'Copied ✓' : 'Copy'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Floating Action Toggle */}
      <button className="wa-toggle" onClick={() => setWaOpen(!waOpen)}>
        <span>WhatsApp Commands</span>
      </button>
    </>
  );
}
