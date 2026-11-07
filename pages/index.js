import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ThemeToggle } from '@/lib/theme';
import { eventBus, EVENTS } from '@/lib/eventBus';
import {
  CheckSquare,
  Clock,
  CreditCard,
  Calendar,
  Sparkles,
  Film,
  History,
  Settings,
  LogOut,
  ChevronRight,
  LayoutGrid,
  X,
} from 'lucide-react';
import TodoList from '@/components/TodoList';
import DebtTracker from '@/components/DebtTracker';
import DeadlineBoard from '@/components/DeadlineBoard';
import ImportantDates from '@/components/ImportantDates';
import Watchlist from '@/components/Watchlist';
import ReminderBoard from '@/components/ReminderBoard';
import SettingsView from '@/components/SettingsView';
import AuditLogView from '@/components/AuditLogView';
import OverviewCards from '@/components/OverviewCards';
import AnalyticsPulse from '@/components/AnalyticsPulse';
import AuroraBackground from '@/components/AuroraBackground';

const TABS = [
  { id: 'todos', label: 'Tasks', icon: CheckSquare },
  { id: 'reminders', label: 'Reminders', icon: Clock },
  { id: 'debts', label: 'Ledger', icon: CreditCard },
  { id: 'deadlines', label: 'Deadlines', icon: Calendar },
  { id: 'dates', label: 'Dates', icon: Sparkles },
  { id: 'watchlist', label: 'Watchlist', icon: Film },
  { id: 'audit', label: 'Audit Log', icon: History },
];

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('todos');
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [envMode, setEnvMode] = useState('live');
  const [updatingEnv, setUpdatingEnv] = useState(false);
  const [greeting, setGreeting] = useState('Good day');
  const [username, setUsername] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) setGreeting('Good morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    setDateStr(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    );
  }, []);

  useEffect(() => {
    if (router.isReady && router.query.tab) {
      setActiveTab(router.query.tab);
    }
  }, [router.isReady, router.query.tab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMoreSheetOpen(false);
    router.replace({ query: { ...router.query, tab: tabId } }, undefined, { shallow: true });
  };

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && moreSheetOpen) {
        setMoreSheetOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moreSheetOpen]);

  useEffect(() => {
    fetch('/api/todos')
      .then((res) => {
        if (res.status === 401) router.push('/login');
        else {
          setAuthChecked(true);
          fetch('/api/user/settings')
            .then((r) => r.json())
            .then((data) => {
              if (data.environmentMode) setEnvMode(data.environmentMode);
              if (data.username) setUsername(data.username);
            });
        }
      })
      .catch(() => router.push('/login'));

    const unsubUser = eventBus.on(EVENTS.USER_UPDATED, (data) => {
      if (data?.username) setUsername(data.username);
    });

    return () => {
      unsubUser();
    };
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
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-dark)',
        }}
      >
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading Precision Dashboard...</div>
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
      case 'audit': return <AuditLogView key={`audit-${envMode}`} />;
      case 'settings': return <SettingsView key="settings" envMode={envMode} onSwitchEnvMode={switchEnvMode} updatingEnv={updatingEnv} />;
      default: return null;
    }
  }

  return (
    <>
      <Head>
        <title>fih — Personal Operating System</title>
        <meta name="description" content="Precision Personal Life Operations & WhatsApp Chronicle" />
      </Head>

      <AuroraBackground />
      {/* Ambient Radial Accent */}
      <div className="ambient-glow" style={{ top: -80, left: '20%' }} />

      {/* Desktop Left Sidebar Navigation */}
      <nav className="sidebar">
        {/* Brand Header */}
        <div style={{ marginBottom: 32, paddingLeft: 8, paddingRight: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 28,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              fih
            </span>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 2 }}>
              Chronicle
            </div>
          </div>
          <ThemeToggle size={18} />
        </div>

        {/* Tab Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                <Icon size={17} style={{ opacity: isActive ? 1 : 0.75 }} />
                <span className="nav-text">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings & Sign Out Section */}
        <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Settings Button with Mode Indicator */}
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabChange('settings')}
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Settings size={17} />
              <span className="nav-text">Settings</span>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                padding: '2px 7px',
                borderRadius: 8,
                background: envMode === 'live' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                color: envMode === 'live' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                border: `1px solid ${envMode === 'live' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
              }}
            >
              {envMode === 'live' ? 'Live' : 'Dev'}
            </span>
          </button>

          {/* Sign Out Button */}
          <button className="nav-item" onClick={logout}>
            <LogOut size={17} />
            <span className="nav-text">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <header
        className="mobile-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--bg-mobile-header)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--border-subtle)',
          flexDirection: 'column',
          gap: 12,
          padding: '14px 0 10px 0',
        }}
      >
        {/* Brand & Action Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 26,
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}
            >
              fih
            </span>
            <ThemeToggle size={16} style={{ width: 32, height: 32 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => switchEnvMode(envMode === 'live' ? 'development' : 'live')}
              disabled={updatingEnv}
              style={{
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 20,
                background: envMode === 'live' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                color: envMode === 'live' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                border: `1px solid ${envMode === 'live' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: envMode === 'live' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                }}
              />
              {envMode === 'live' ? 'Live' : 'Dev'}
            </button>
            <button
              className="btn btn-ghost"
              onClick={logout}
              style={{ fontSize: 13, padding: '4px 8px', color: 'var(--text-secondary)' }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Scrollable Horizontal Navigation with Edge Gradient Mask */}
        <div
          className="no-scrollbar mask-edge-fade"
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            padding: '2px 18px 4px 18px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  padding: '8px 14px',
                  borderRadius: 24,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: isActive ? '0 2px 10px var(--accent-primary-glow)' : 'none',
                }}
              >
                <Icon size={14} style={{ marginRight: 6 }} />
                {tab.label}
              </button>
            );
          })}
          <button
            className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleTabChange('settings')}
            style={{
              fontSize: 13,
              fontWeight: activeTab === 'settings' ? 600 : 500,
              padding: '8px 14px',
              borderRadius: 24,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <Settings size={14} style={{ marginRight: 6 }} />
            Settings
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="main-content">
        {/* Desktop Editorial Greeting & Hero */}
        <header className="desktop-header" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 6,
                }}
              >
                {dateStr || 'Personal Operating System'} • {envMode === 'live' ? 'Live Mode' : 'Sandbox Mode'}
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 'clamp(32px, 3.6vw, 46px)',
                  fontWeight: 400,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  margin: 0,
                }}
              >
                {activeTab === 'settings'
                  ? 'Settings & Controls'
                  : activeTab === 'audit'
                  ? 'System Audit Chronicle'
                  : `${greeting}, ${username ? username.charAt(0).toUpperCase() + username.slice(1) : 'friend'}.`}
              </h1>
            </div>

            {/* Quick Mode Toggle Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => switchEnvMode(envMode === 'live' ? 'development' : 'live')}
                disabled={updatingEnv}
                title="Toggle between Live and Development database"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: envMode === 'live' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  border: `1px solid ${envMode === 'live' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                  color: envMode === 'live' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: envMode === 'live' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                    boxShadow: `0 0 8px ${envMode === 'live' ? 'var(--accent-emerald)' : 'var(--accent-amber)'}`,
                  }}
                />
                <span>{envMode === 'live' ? 'Live Production' : 'Dev Sandbox'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Top Graphical Pulse & Overview Metrics */}
        {activeTab !== 'settings' && activeTab !== 'audit' && (
          <>
            <AnalyticsPulse onNavigate={handleTabChange} envMode={envMode} />
            <OverviewCards onNavigate={handleTabChange} envMode={envMode} />
          </>
        )}

        {/* Tab Content Component with Emil Kowalski page transition */}
        <section key={activeTab} className="page-enter">
          {renderTab()}
        </section>

        {/* Quiet Editorial Footer */}
        <footer
          style={{
            marginTop: 64,
            paddingTop: 24,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--text-primary)' }}>
              fih
            </span>
            <span>•</span>
            <span>Precision Personal Operating System</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>WhatsApp Bot Active</span>
            <span>•</span>
            <button
              onClick={() => handleTabChange('audit')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 12,
                textDecoration: 'underline',
              }}
            >
              Audit Log
            </button>
          </div>
        </footer>
      </main>

      {/* Native Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center' }}>
          {[
            { id: 'todos', label: 'Tasks', icon: CheckSquare },
            { id: 'reminders', label: 'Alerts', icon: Clock },
            { id: 'debts', label: 'Ledger', icon: CreditCard },
            { id: 'deadlines', label: 'Due', icon: Calendar },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  minHeight: 46,
                  background: 'none',
                  border: 'none',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px 0',
                  position: 'relative',
                  transition: 'color var(--duration-fast) ease, transform var(--duration-fast) ease',
                }}
              >
                <Icon size={20} style={{ strokeWidth: isActive ? 2.2 : 1.8, marginBottom: 3 }} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: '0.02em' }}>
                  {item.label}
                </span>
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      width: 14,
                      height: 2.5,
                      borderRadius: 2,
                      background: 'var(--accent-primary)',
                    }}
                  />
                )}
              </button>
            );
          })}

          {/* More Sheet Trigger */}
          <button
            onClick={() => setMoreSheetOpen(!moreSheetOpen)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              minHeight: 46,
              background: 'none',
              border: 'none',
              color: ['dates', 'watchlist', 'audit', 'settings'].includes(activeTab) || moreSheetOpen
                ? 'var(--text-primary)'
                : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px 0',
              position: 'relative',
            }}
          >
            <LayoutGrid size={20} style={{ strokeWidth: ['dates', 'watchlist', 'audit', 'settings'].includes(activeTab) ? 2.2 : 1.8, marginBottom: 3 }} />
            <span style={{ fontSize: 10, fontWeight: ['dates', 'watchlist', 'audit', 'settings'].includes(activeTab) ? 700 : 500, letterSpacing: '0.02em' }}>
              More
            </span>
            {['dates', 'watchlist', 'audit', 'settings'].includes(activeTab) && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  width: 14,
                  height: 2.5,
                  borderRadius: 2,
                  background: 'var(--accent-primary)',
                }}
              />
            )}
          </button>
        </div>
      </nav>

      {/* Slide-Up Bottom Sheet for Secondary Navigation */}
      {moreSheetOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            animation: 'fihSurfaceEnter var(--duration-fast) ease',
          }}
          onClick={() => setMoreSheetOpen(false)}
        >
          <div
            className="sheet-enter"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation & Secondary Controls"
            style={{
              background: 'var(--bg-card)',
              borderTop: '1px solid var(--border-default)',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: '16px 20px calc(24px + env(safe-area-inset-bottom, 0px)) 20px',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.4)',
              maxHeight: '82vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: 'var(--border-strong)',
                margin: '0 auto 16px auto',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                Secondary Modules
              </span>
              <button
                onClick={() => setMoreSheetOpen(false)}
                className="btn btn-ghost"
                aria-label="Close navigation sheet"
                style={{ padding: 4, minHeight: 32, borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { id: 'dates', label: 'Dates', icon: Sparkles, desc: 'Anniversaries & events' },
                { id: 'watchlist', label: 'Watchlist', icon: Film, desc: 'Movies & queue' },
                { id: 'audit', label: 'Audit Log', icon: History, desc: 'Chronicle telemetry' },
                { id: 'settings', label: 'Settings', icon: Settings, desc: 'System preferences' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '14px 14px',
                      borderRadius: 12,
                      background: isActive ? 'var(--bg-active)' : 'var(--bg-sunken)',
                      border: `1px solid ${isActive ? 'var(--border-strong)' : 'var(--border-subtle)'}`,
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Icon size={16} style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions Row */}
            <div style={{ display: 'flex', gap: 10, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => {
                  switchEnvMode(envMode === 'live' ? 'development' : 'live');
                }}
                disabled={updatingEnv}
                className="btn btn-secondary"
                style={{ flex: 1, minHeight: 44, fontSize: 13, justifyContent: 'center' }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: envMode === 'live' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                    marginRight: 6,
                  }}
                />
                {envMode === 'live' ? 'Live Production' : 'Dev Sandbox'}
              </button>

              <button
                onClick={logout}
                className="btn btn-secondary"
                style={{ minHeight: 44, padding: '0 16px', fontSize: 13, color: 'var(--accent-rose)' }}
              >
                <LogOut size={16} style={{ marginRight: 6 }} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
