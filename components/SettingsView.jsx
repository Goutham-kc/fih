import { useState } from 'react';

export default function SettingsView({ envMode, onSwitchEnvMode, updatingEnv }) {
  const [wiping, setWiping] = useState(false);
  const [wipeMessage, setWipeMessage] = useState('');

  async function handleWipeLive() {
    if (!confirm('Are you sure you want to wipe all Live data? This cannot be undone.')) return;
    setWiping(true);
    setWipeMessage('');
    try {
      const res = await fetch('/api/user/wipe-live', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setWipeMessage('✅ Live database wiped clean successfully!');
      } else {
        setWipeMessage(`❌ Error: ${data.error || 'Failed to wipe'}`);
      }
    } catch (e) {
      setWipeMessage('❌ Network error when wiping database.');
    } finally {
      setWiping(false);
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

      {/* Environment Mode Setting Card */}
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
              Active Environment Mode
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

      {/* Danger Zone: Wipe Live Database */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 16,
        padding: 24,
        boxShadow: 'var(--shadow-card)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f87171', marginBottom: 4 }}>
          Danger Zone
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
          Permanently clear all items (todos, debts, deadlines, dates, watchlist, reminders) from your Live database.
        </p>

        <button
          onClick={handleWipeLive}
          disabled={wiping}
          className="btn"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 8,
          }}
        >
          {wiping ? 'Wiping Live Database...' : 'Wipe Live Database'}
        </button>

        {wipeMessage && (
          <div style={{ marginTop: 12, fontSize: 13, color: wipeMessage.includes('✅') ? '#4ade80' : '#f87171' }}>
            {wipeMessage}
          </div>
        )}
      </div>
    </div>
  );
}
