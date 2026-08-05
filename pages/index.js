import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TodoList from '@/components/TodoList';
import DebtTracker from '@/components/DebtTracker';
import DeadlineBoard from '@/components/DeadlineBoard';
import ImportantDates from '@/components/ImportantDates';
import Watchlist from '@/components/Watchlist';
import ReminderBoard from '@/components/ReminderBoard';
import SettingsView from '@/components/SettingsView';

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
    id: 'reminders',
    label: 'Reminders',
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
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

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('todos');
  const [authChecked, setAuthChecked] = useState(false);
  const [envMode, setEnvMode] = useState('live');
  const [updatingEnv, setUpdatingEnv] = useState(false);

  useEffect(() => {
    if (router.isReady && router.query.tab) {
      setActiveTab(router.query.tab);
    }
  }, [router.isReady, router.query.tab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    router.replace({ query: { ...router.query, tab: tabId } }, undefined, { shallow: true });
  };

  useEffect(() => {
    fetch('/api/todos')
      .then(res => {
        if (res.status === 401) router.push('/login');
        else {
          setAuthChecked(true);
          fetch('/api/user/settings')
            .then(r => r.json())
            .then(data => { if (data.environmentMode) setEnvMode(data.environmentMode); });
        }
      })
      .catch(() => router.push('/login'));
  }, []);

  async function switchEnvMode(newMode) {
    if (newMode === envMode || updatingEnv) return;
    setUpdatingEnv(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environmentMode: newMode }),
      });
      const data = await res.json();
      if (data.environmentMode) {
        setEnvMode(data.environmentMode);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingEnv(false);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
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
      case 'todos': return <TodoList key={`todos-${envMode}`} />;
      case 'reminders': return <ReminderBoard key={`reminders-${envMode}`} />;
      case 'debts': return <DebtTracker key={`debts-${envMode}`} />;
      case 'deadlines': return <DeadlineBoard key={`deadlines-${envMode}`} />;
      case 'dates': return <ImportantDates key={`dates-${envMode}`} />;
      case 'watchlist': return <Watchlist key={`watchlist-${envMode}`} />;
      case 'settings': return <SettingsView key="settings" envMode={envMode} onSwitchEnvMode={switchEnvMode} updatingEnv={updatingEnv} />;
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

      {/* Desktop Left Sidebar Navigation */}
      <nav className="sidebar">
        <div style={{ marginBottom: 32, paddingLeft: 8 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>fih</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', opacity: activeTab === tab.id ? 1 : 0.7 }}>
                {tab.svg}
              </span>
              <span className="nav-text">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Settings & Sign Out Section */}
        <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Settings Button with Mode Badge */}
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabChange('settings')}
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span className="nav-text">Settings</span>
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              padding: '2px 7px',
              borderRadius: 10,
              background: envMode === 'live' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(251, 146, 60, 0.15)',
              color: envMode === 'live' ? '#4ade80' : '#fb923c',
              border: `1px solid ${envMode === 'live' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(251, 146, 60, 0.3)'}`,
            }}>
              {envMode === 'live' ? 'Live' : 'Dev'}
            </span>
          </button>

          {/* Sign Out Button */}
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

      {/* Mobile Top Header */}
      <header className="mobile-header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(18, 19, 25, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border-subtle)',
        flexDirection: 'column',
        gap: 14,
        padding: '16px 0 12px 0',
      }}>
        {/* Brand & Action Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1 }}>fih</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => handleTabChange('settings')}
              className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: 11, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: envMode === 'live' ? '#4ade80' : '#fb923c' }} />
              Settings ({envMode === 'live' ? 'Live' : 'Dev'})
            </button>
            <button className="btn btn-ghost" onClick={logout} style={{ fontSize: 13, padding: '4px 10px', color: 'var(--text-secondary)' }}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Natural Scrollable Horizontal Pills */}
        <div className="no-scrollbar" style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          padding: '2px 20px 4px 20px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  padding: '8px 16px',
                  borderRadius: 24,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: isActive ? '0 4px 14px rgba(192, 193, 255, 0.25)' : 'none',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 6 }}>{tab.svg}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="main-content">
        {/* Desktop Top Header */}
        <header className="desktop-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {activeTab === 'settings' ? 'Settings' : TABS.find(t => t.id === activeTab)?.label}
          </h1>
        </header>

        {/* Tab Content Component */}
        {renderTab()}
      </main>
    </>
  );
}
