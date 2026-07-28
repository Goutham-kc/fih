import { useState } from 'react';

export default function SettingsView({ envMode, onSwitchEnvMode, updatingEnv }) {
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
          Manage your database environment and application preferences.
        </p>
      </div>

      {/* 1. Environment Mode Setting Card */}
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
              1. Active Environment Mode
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
            color: envMode === 'live' ? '#4ade80' : '#fb923c',
            border: `1px solid ${envMode === 'live' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(251, 146, 60, 0.3)'}`,
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
              border: `2px solid ${envMode === 'live' ? '#4ade80' : 'var(--border-subtle)'}`,
              borderRadius: 12,
              padding: 16,
              cursor: updatingEnv ? 'not-allowed' : 'pointer',
              background: envMode === 'live' ? 'rgba(74, 222, 128, 0.05)' : 'rgba(255, 255, 255, 0.02)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80' }} />
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
              border: `2px solid ${envMode === 'development' ? '#fb923c' : 'var(--border-subtle)'}`,
              borderRadius: 12,
              padding: 16,
              cursor: updatingEnv ? 'not-allowed' : 'pointer',
              background: envMode === 'development' ? 'rgba(251, 146, 60, 0.05)' : 'rgba(255, 255, 255, 0.02)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fb923c' }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Development</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Isolated testing collection. Perfect for testing new bot features without cluttering Live data.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Reset & Wipe Settings */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 16,
        padding: 24,
        boxShadow: 'var(--shadow-card)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f87171', marginBottom: 4 }}>
          2. Database Reset & Wipe
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
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
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
              background: 'rgba(251, 146, 60, 0.15)',
              color: '#fb923c',
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
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#f87171', marginBottom: 12 }}>
              ⚠️ Are you sure you want to permanently delete all items in the <u>{confirmTarget.toUpperCase()}</u> database? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => executeWipe(confirmTarget)}
                disabled={wiping}
                className="btn"
                style={{
                  background: '#ef4444',
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
          <div style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: wipeMessage.includes('✅') ? '#4ade80' : '#f87171' }}>
            {wipeMessage}
          </div>
        )}
      </div>
    </div>
  );
}
