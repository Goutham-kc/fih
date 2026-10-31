import { useState } from 'react';
import { useTheme } from '@/lib/theme';
import { toast } from 'sonner';
import { Moon, Sun, Monitor, AlertTriangle, Database } from 'lucide-react';

export default function SettingsView({ envMode, onSwitchEnvMode, updatingEnv }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [wiping, setWiping] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // 'live' | 'development' | null

  async function executeWipe(targetMode) {
    setWiping(true);
    try {
      const res = await fetch('/api/user/wipe-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetMode }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${targetMode === 'live' ? 'Live' : 'Development'} database wiped clean`);
      } else {
        toast.error(`Error: ${data.error || 'Failed to wipe'}`);
      }
    } catch (e) {
      toast.error('Network error when wiping database.');
    } finally {
      setWiping(false);
      setConfirmTarget(null);
    }
  }

  return (
    <div className="animate-fade" style={{ maxWidth: 680 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, letterSpacing: '-0.01em' }}>
          Preferences & Controls
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Manage your interface appearance, database collection environment, and data maintenance.
        </p>
      </div>

      {/* 1. Theme Selection Card */}
      <div className="fih-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              Theme & Appearance
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
              Choose your preferred visual theme for the web interface.
            </p>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: 8,
              background: 'var(--bg-sunken)',
              color: 'var(--accent-indigo)',
              border: '1px solid var(--border-subtle)',
              flexShrink: 0,
            }}
          >
            {theme === 'system' ? `System (${resolvedTheme})` : theme === 'light' ? 'Light' : 'Dark'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 14 }}>
          {/* Dark Mode Card */}
          <div
            onClick={() => setTheme('dark')}
            className="fih-card-interactive"
            style={{
              border: `2px solid ${theme === 'dark' ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
              borderRadius: 12,
              padding: '14px',
              cursor: 'pointer',
              background: theme === 'dark' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-sunken)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Moon size={16} color="var(--accent-indigo)" />
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Dark</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
              Deep obsidian palette
            </p>
          </div>

          {/* Light Mode Card */}
          <div
            onClick={() => setTheme('light')}
            className="fih-card-interactive"
            style={{
              border: `2px solid ${theme === 'light' ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
              borderRadius: 12,
              padding: '14px',
              cursor: 'pointer',
              background: theme === 'light' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-sunken)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sun size={16} color="var(--accent-amber)" />
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Light</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
              Crisp clean paper mode
            </p>
          </div>

          {/* System Mode Card */}
          <div
            onClick={() => setTheme('system')}
            className="fih-card-interactive"
            style={{
              border: `2px solid ${theme === 'system' ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
              borderRadius: 12,
              padding: '14px',
              cursor: 'pointer',
              background: theme === 'system' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-sunken)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Monitor size={16} color="var(--text-secondary)" />
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>System Auto</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
              Syncs with operating system
            </p>
          </div>
        </div>
      </div>

      {/* 2. Environment Mode Setting Card */}
      <div className="fih-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              Database Environment Mode
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
              Select which database collection is active for your web dashboard and WhatsApp bot.
            </p>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: 8,
              background: envMode === 'live' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              color: envMode === 'live' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              border: `1px solid ${envMode === 'live' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
              flexShrink: 0,
            }}
          >
            {envMode === 'live' ? 'Live' : 'Development'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 14 }}>
          {/* Live Mode Option */}
          <div
            onClick={() => onSwitchEnvMode('live')}
            className="fih-card-interactive"
            style={{
              border: `2px solid ${envMode === 'live' ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
              borderRadius: 12,
              padding: 16,
              cursor: updatingEnv ? 'not-allowed' : 'pointer',
              background: envMode === 'live' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-sunken)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)' }} />
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Live Production</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Your real personal data. Daily WhatsApp messages and active items are stored here.
            </p>
          </div>

          {/* Development Mode Option */}
          <div
            onClick={() => onSwitchEnvMode('development')}
            className="fih-card-interactive"
            style={{
              border: `2px solid ${envMode === 'development' ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
              borderRadius: 12,
              padding: 16,
              cursor: updatingEnv ? 'not-allowed' : 'pointer',
              background: envMode === 'development' ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-sunken)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-amber)' }} />
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Development Sandbox</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Isolated testing collection. Perfect for testing new bot features without cluttering Live data.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Reset & Wipe Settings */}
      <div
        className="fih-card"
        style={{
          border: '1px solid rgba(244, 63, 94, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <AlertTriangle size={17} color="var(--accent-rose)" />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-rose)', margin: 0 }}>
            Database Reset & Maintenance
          </h3>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
          Permanently clear stored records for a specific environment. This resets todos, debts, deadlines, dates, watchlist, and reminders.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setConfirmTarget('live')}
            disabled={wiping}
            className="btn btn-danger"
            style={{ fontSize: 12, padding: '6px 14px', minHeight: 34 }}
          >
            Wipe Live Database
          </button>

          <button
            onClick={() => setConfirmTarget('development')}
            disabled={wiping}
            className="btn btn-secondary"
            style={{ fontSize: 12, padding: '6px 14px', minHeight: 34, borderColor: 'rgba(245, 158, 11, 0.3)', color: 'var(--accent-amber)' }}
          >
            Wipe Development Database
          </button>
        </div>

        {/* Confirmation Card */}
        {confirmTarget && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 10,
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-rose)', marginBottom: 10 }}>
              ⚠️ Are you sure you want to permanently delete all items in the <u>{confirmTarget.toUpperCase()}</u> database? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => executeWipe(confirmTarget)}
                disabled={wiping}
                className="btn btn-danger"
                style={{
                  background: 'var(--accent-rose)',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  fontSize: 12,
                  minHeight: 32,
                }}
              >
                {wiping ? 'Wiping...' : `Confirm Wipe (${confirmTarget.toUpperCase()})`}
              </button>
              <button
                onClick={() => setConfirmTarget(null)}
                disabled={wiping}
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: '6px 12px', minHeight: 32 }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
