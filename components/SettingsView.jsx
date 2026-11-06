import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { toast } from 'sonner';
import { Moon, Sun, Monitor, AlertTriangle, Database, Phone, Mail, User } from 'lucide-react';

export default function SettingsView({ envMode, onSwitchEnvMode, updatingEnv }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [wiping, setWiping] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // 'live' | 'development' | null

  // User Profile
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneModified, setPhoneModified] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameModified, setUsernameModified] = useState(false);

  useEffect(() => {
    fetch('/api/user/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.email) setEmail(data.email);
        if (data.username !== undefined) setUsername(data.username);
        if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
      })
      .catch((err) => console.error('Failed to load profile settings:', err));
  }, []);

  async function handleSaveUsername(e) {
    e.preventDefault();
    const cleanUsername = username.toLowerCase().trim();
    if (cleanUsername && !/^[a-zA-Z0-9_.-]{3,30}$/.test(cleanUsername)) {
      toast.error('Username must be 3-30 characters (letters, numbers, _, -, .)');
      return;
    }

    setSavingUsername(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsername(data.username || '');
        setUsernameModified(false);
        toast.success('Username updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update username');
      }
    } catch {
      toast.error('Network error when updating username.');
    } finally {
      setSavingUsername(false);
    }
  }

  async function handleSavePhone(e) {
    e.preventDefault();
    const cleanPhone = whatsappNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid phone number with country code (e.g. 919876543210)');
      return;
    }

    setSavingPhone(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappNumber: cleanPhone }),
      });
      const data = await res.json();
      if (res.ok) {
        setWhatsappNumber(data.whatsappNumber);
        setPhoneModified(false);
        toast.success('WhatsApp number updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update WhatsApp number');
      }
    } catch {
      toast.error('Network error when updating phone number.');
    } finally {
      setSavingPhone(false);
    }
  }

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
          Manage your account profile, appearance, database collection environment, and data maintenance.
        </p>
      </div>

      {/* 0. Account & WhatsApp Number Card */}
      <div className="fih-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              Account & Credentials
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
              Your username, login email, and phone number linked to the WhatsApp assistant bot.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
          {/* Email row */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              LOGIN EMAIL
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-sunken)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
              <Mail size={16} color="var(--text-secondary)" />
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{email || 'Loading...'}</span>
            </div>
          </div>

          {/* Username form */}
          <form onSubmit={handleSaveUsername}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              USERNAME
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <User size={16} color="var(--accent-indigo)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  className="fih-input"
                  style={{ paddingLeft: 38 }}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameModified(true);
                  }}
                  placeholder="e.g. goutham or alex_smith"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!usernameModified || savingUsername}
                style={{ fontSize: 13, padding: '0 16px', borderRadius: 10, height: 40 }}
              >
                {savingUsername ? 'Saving...' : 'Update Username'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, marginBottom: 0 }}>
              💡 You can use either your email or this username to sign into the dashboard.
            </p>
          </form>

          {/* WhatsApp phone number form */}
          <form onSubmit={handleSavePhone}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              LINKED WHATSAPP NUMBER
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Phone size={16} color="var(--accent-emerald)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="tel"
                  className="fih-input"
                  style={{ paddingLeft: 38 }}
                  value={whatsappNumber}
                  onChange={(e) => {
                    setWhatsappNumber(e.target.value);
                    setPhoneModified(true);
                  }}
                  placeholder="e.g. 919876543210 (country code without +)"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!phoneModified || savingPhone}
                style={{ fontSize: 13, padding: '0 16px', borderRadius: 10, height: 40 }}
              >
                {savingPhone ? 'Saving...' : 'Update Phone'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, marginBottom: 0 }}>
              💡 Messages sent to the FIH bot from this phone number are automatically assigned to your account.
            </p>
          </form>
        </div>
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
          <AlertTriangle size={18} color="var(--accent-rose)" />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-rose)', margin: 0 }}>
            Reset & Wipe Database
          </h3>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Permanently clear all items from your chosen database environment. This action is irreversible.
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
            className="modal-enter"
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
