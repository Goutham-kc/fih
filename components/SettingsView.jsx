import { useState } from 'react';
import { useTheme } from '@/lib/theme';

export default function SettingsView({ envMode, onSwitchEnvMode, updatingEnv }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [wiping, setWiping] = useState(false);
  const [wipeMessage, setWipeMessage] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null); // 'live' | 'development' | null

  async function executeWipe(targetMode) {
    setWiping(true);
    setWipeMessage('');
    try {
      const res = await fetch('/api/user/wipe-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetMode }),
      });
      const data = await res.json();
      if (res.ok) {
        setWipeMessage(`✅ ${targetMode === 'live' ? 'Live' : 'Development'} database wiped clean successfully!`);
      } else {
        setWipeMessage(`❌ Error: ${data.error || 'Failed to wipe'}`);
      }
    } catch (e) {
      setWipeMessage('❌ Network error when wiping database.');
    } finally {
      setWiping(false);
      setConfirmTarget(null);
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>App Settings</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Manage your interface appearance, database environment, and application preferences.
        </p>
      </div>

      {/* 1. Theme Selection Card */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        padding: 24,
        boxShadow: 'var(--shadow-card)',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              1. Theme & Appearance
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Choose your preferred visual theme for the web interface.
            </p>
          </div>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: 12,
            background: 'var(--bg-hover)',
            color: 'var(--accent-primary)',
            border: '1px solid var(--border-subtle)',
            flexShrink: 0,
            marginLeft: 16,
          }}>
            {theme === 'system' ? `System (${resolvedTheme})` : theme === 'light' ? 'Light' : 'Dark'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 16 }}>
          {/* Dark Mode Card */}
          <div
            onClick={() => setTheme('dark')}
            style={{
              border: `2px solid ${theme === 'dark' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              borderRadius: 12,
              padding: 14,
              cursor: 'pointer',
              background: theme === 'dark' ? 'var(--badge-planned-bg)' : 'var(--bg-hover)',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🌙</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Dark Theme</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
              Deep sleek night mode
            </p>
          </div>

          {/* Light Mode Card */}
          <div
            onClick={() => setTheme('light')}
            style={{
              border: `2px solid ${theme === 'light' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              borderRadius: 12,
              padding: 14,
              cursor: 'pointer',
              background: theme === 'light' ? 'var(--badge-planned-bg)' : 'var(--bg-hover)',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>☀️</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Light Theme</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
              Crisp clean day mode
            </p>
          </div>

          {/* System Mode Card */}
          <div
            onClick={() => setTheme('system')}
            style={{
              border: `2px solid ${theme === 'system' ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              borderRadius: 12,
              padding: 14,
              cursor: 'pointer',
              background: theme === 'system' ? 'var(--badge-planned-bg)' : 'var(--bg-hover)',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>💻</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>System Auto</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
              Syncs with device OS
            </p>
          </div>
        </div>
      </div>

      {/* 2. Environment Mode Setting Card */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        padding: 24,
        boxShadow: 'var(--shadow-card)',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              2. Active Environment Mode
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Select which database collection is active for your web dashboard and WhatsApp bot.
            </p>
          </div>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: 12,
            background: envMode === 'live' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(251, 146, 60, 0.15)',
            color: envMode === 'live' ? '#16a34a' : '#ea580c',
            border: `1px solid ${envMode === 'live' ? 'rgba(74, 222, 128, 0.4)' : 'rgba(251, 146, 60, 0.4)'}`,
            flexShrink: 0,
            marginLeft: 16,
          }}>
            {envMode === 'live' ? 'Live' : 'Development'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
          {/* Live Mode Option */}
          <div
            onClick={() => onSwitchEnvMode('live')}
            style={{
              border: `2px solid ${envMode === 'live' ? '#16a34a' : 'var(--border-subtle)'}`,
              borderRadius: 12,
              padding: 16,
              cursor: updatingEnv ? 'not-allowed' : 'pointer',
              background: envMode === 'live' ? 'rgba(74, 222, 128, 0.08)' : 'var(--bg-hover)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a' }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Live Mode</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Your real production data. Daily WhatsApp messages and active items are saved here.
            </p>
          </div>

          {/* Development Mode Option */}
          <div
            onClick={() => onSwitchEnvMode('development')}
            style={{
              border: `2px solid ${envMode === 'development' ? '#ea580c' : 'var(--border-subtle)'}`,
              borderRadius: 12,
              padding: 16,
              cursor: updatingEnv ? 'not-allowed' : 'pointer',
              background: envMode === 'development' ? 'rgba(251, 146, 60, 0.08)' : 'var(--bg-hover)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ea580c' }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Development</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Isolated testing collection. Perfect for testing new bot features without cluttering Live data.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Reset & Wipe Settings */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 16,
        padding: 24,
        boxShadow: 'var(--shadow-card)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent-rose)', marginBottom: 4 }}>
          3. Database Reset & Wipe
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
          Select an environment to permanently delete all stored items (todos, debts, deadlines, dates, watchlist, reminders).
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => setConfirmTarget('live')}
            disabled={wiping}
            className="btn"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--accent-rose)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 10,
            }}
          >
            Wipe Live Database
          </button>

          <button
            onClick={() => setConfirmTarget('development')}
            disabled={wiping}
            className="btn"
            style={{
              background: 'rgba(251, 146, 60, 0.12)',
              color: 'var(--accent-amber)',
              border: '1px solid rgba(251, 146, 60, 0.4)',
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 10,
            }}
          >
            Wipe Development Database
          </button>
        </div>

        {/* Confirmation Card */}
        {confirmTarget && (
          <div style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-rose)', marginBottom: 12 }}>
              ⚠️ Are you sure you want to permanently delete all items in the <u>{confirmTarget.toUpperCase()}</u> database? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => executeWipe(confirmTarget)}
                disabled={wiping}
                className="btn"
                style={{
                  background: 'var(--accent-rose)',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 6,
                }}
              >
                {wiping ? 'Wiping...' : `Yes, Wipe ${confirmTarget.toUpperCase()}`}
              </button>
              <button
                onClick={() => setConfirmTarget(null)}
                disabled={wiping}
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: '6px 14px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {wipeMessage && (
          <div style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: wipeMessage.includes('✅') ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {wipeMessage}
          </div>
        )}
      </div>
    </div>
  );
}
