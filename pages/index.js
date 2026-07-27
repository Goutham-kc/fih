import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TodoList from '@/components/TodoList';
import DebtTracker from '@/components/DebtTracker';
import DeadlineBoard from '@/components/DeadlineBoard';
import ImportantDates from '@/components/ImportantDates';
import Watchlist from '@/components/Watchlist';

const TABS = [
  { id: 'todos', label: '✅ Todos' },
  { id: 'debts', label: '💰 Debts' },
  { id: 'deadlines', label: '📅 Deadlines' },
  { id: 'dates', label: '🎂 Dates' },
  { id: 'watchlist', label: '🎬 Watchlist' },
];

const WA_COMMANDS = `Commands start with >

>todo <text> [| due-date]
>done <fuzzy-title>

>debt owe <person> <amt> [note]
>debt owed <person> <amt> [note]
>debt settle <person>

>deadline <title> | <date> [time] [| cat]

>date <title> | <MM-DD> [| yearly]

>watch <title> [| type]
>watch <title> done [rating]

>list <todo|debt|deadline|date|watch>
>help
cancel  — cancel pending question`;

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('todos');
  const [waOpen, setWaOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

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

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 18 }}>⏳ Loading...</div>
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

      {/* Navbar */}
      <nav>
        <div className="logo">fih</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Welcome back!</span>
          <button className="btn btn-ghost" onClick={logout} style={{ fontSize: 13 }}>Sign out →</button>
        </div>
      </nav>

      {/* Main content */}
      <div className="page-container">
        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 24, overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Section header */}
        <div className="section-header">
          <h1 className="section-title">
            {TABS.find(t => t.id === activeTab)?.label}
          </h1>
        </div>

        {/* Tab content */}
        {renderTab()}
      </div>

      {/* WhatsApp panel */}
      <div className={`wa-panel ${waOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>📱 WhatsApp Commands</span>
          <button className="btn btn-ghost" onClick={() => setWaOpen(false)} style={{ padding: '2px 8px' }}>✕</button>
        </div>
        <pre style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
          background: 'var(--bg-elevated)',
          padding: 12,
          borderRadius: 8,
          fontFamily: 'monospace',
        }}>{WA_COMMANDS}</pre>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
          💡 All commands start with <code style={{ background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: 4 }}>{'>'}</code>. Dates use <code style={{ background: 'var(--bg-elevated)', padding: '1px 5px', borderRadius: 4 }}>YYYY-MM-DD</code> format.
        </div>
      </div>

      {/* WhatsApp toggle FAB */}
      <button className="wa-toggle" onClick={() => setWaOpen(!waOpen)} title="WhatsApp Commands">
        💬
      </button>
    </>
  );
}
