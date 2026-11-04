import { useState } from 'react';
import { useTheme } from '@/lib/theme';
import { toast } from 'sonner';
import {
  Moon,
  Sun,
  Monitor,
  AlertTriangle,
  Volume2,
  VolumeX,
  Compass,
  Wrench,
  KeyRound,
} from 'lucide-react';
import WoodPanel from '@/components/ui/WoodPanel';
import PixelButton from '@/components/ui/PixelButton';
import PixelBadge from '@/components/ui/PixelBadge';
import { soundManager } from '@/lib/soundManager';
import { eventBus, EVENTS } from '@/lib/eventBus';

export default function SettingsView({ envMode, onSwitchEnvMode, updatingEnv }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [wiping, setWiping] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // 'live' | 'development' | null

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('idle');

  // Toolshed Sound State (Spec 8.3 & 8.5)
  const [soundMuted, setSoundMuted] = useState(() => (typeof window !== 'undefined' ? soundManager.isMuted() : true));
  const [masterVol, setMasterVol] = useState(() => (typeof window !== 'undefined' ? soundManager.masterVolume : 0.8));
  const [sfxVol, setSfxVol] = useState(() => (typeof window !== 'undefined' ? soundManager.sfxVolume : 0.8));
  const [ambienceVol, setAmbienceVol] = useState(() => (typeof window !== 'undefined' ? soundManager.ambienceVolume : 0.4));

  // Toolshed Motion & Parallax State (Spec 8.2 & 8.5)
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    const savedRm = localStorage.getItem('pv_reduced_motion');
    return savedRm !== null ? savedRm === 'true' : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Toolshed Weather & Atmosphere State (Spec 8.2 & 8.5)
  const [weatherOverride, setWeatherOverride] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pv_weather_override') || 'auto';
    }
    return 'auto';
  });
  const [timeOverride, setTimeOverride] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pv_time_override') || 'auto';
    }
    return 'auto';
  });

  function handleToggleSound() {
    const next = soundManager.toggleMute();
    setSoundMuted(next);
    toast.success(next ? 'Sound muted' : 'Sound activated 🔔');
  }

  function handleMasterVolChange(e) {
    const val = parseFloat(e.target.value);
    setMasterVol(val);
    soundManager.setMasterVolume(val);
  }

  function handleSfxVolChange(e) {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    soundManager.setSfxVolume(val);
    soundManager.playSfx('coin');
  }

  function handleAmbienceVolChange(e) {
    const val = parseFloat(e.target.value);
    setAmbienceVol(val);
    soundManager.setAmbienceVolume(val);
  }

  function handleToggleReducedMotion() {
    const next = !reducedMotion;
    setReducedMotion(next);
    localStorage.setItem('pv_reduced_motion', String(next));
    eventBus.emit(EVENTS.MOTION_TOGGLED, { reducedMotion: next });
    toast.success(next ? 'Reduced motion enabled' : 'Full parallax motion restored');
  }

  function handleWeatherChange(val) {
    setWeatherOverride(val);
    localStorage.setItem('pv_weather_override', val);
    eventBus.emit(EVENTS.WEATHER_CHANGED, { weather: val });
    toast.success(`Weather set to: ${val}`);
  }

  function handleTimeChange(val) {
    setTimeOverride(val);
    localStorage.setItem('pv_time_override', val);
    eventBus.emit(EVENTS.TIME_CHANGED, { time: val });
    toast.success(`Time of day set to: ${val}`);
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

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordStatus('saving');
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        soundManager.playSfx('wood');
        toast.success('Password updated successfully! 🔐');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error updating password');
    } finally {
      setPasswordStatus('idle');
    }
  }

  return (
    <div className="animate-fade" style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <WoodPanel variant="golden" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: '#2b1a11',
              border: '2px solid #a36c3a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            <Wrench size={24} color="#f2c230" />
          </div>
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display, serif)',
                fontSize: 22,
                fontWeight: 700,
                color: '#fdf6e2',
                margin: 0,
                letterSpacing: '0.01em',
              }}
            >
              The Toolshed (Settings & Workshop)
            </h2>
            <p style={{ fontSize: 13, color: '#c4b5a5', margin: '4px 0 0 0' }}>
              Tune your village soundscapes, seasonal weather, camera motion, security keyring, and database workshop environments.
            </p>
          </div>
        </div>
      </WoodPanel>

      {/* 1. Toolshed Sound & Audio Section (Spec 8.3 & 8.5) */}
      <WoodPanel variant="default" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {soundMuted ? <VolumeX size={20} color="#c2415a" /> : <Volume2 size={20} color="#8fc45a" />}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fdf6e2', margin: 0 }}>
                Acoustic Soundscape & Chimes
              </h3>
              <p style={{ fontSize: 12, color: '#c4b5a5', margin: '2px 0 0 0' }}>
                Procedural 8-bit web audio chimes, wood taps, and soft mountain breezes.
              </p>
            </div>
          </div>
          <PixelButton
            variant={soundMuted ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleToggleSound}
          >
            {soundMuted ? '🔇 Unmute Audio' : '🔊 Mute Sound'}
          </PixelButton>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            background: 'rgba(0,0,0,0.2)',
            padding: 16,
            borderRadius: 10,
            border: '1px solid rgba(163, 108, 58, 0.3)',
          }}
        >
          {/* Master Volume */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fdf6e2' }}>Master Volume</span>
              <span style={{ fontSize: 12, color: '#f2c230', fontFamily: 'var(--font-pixel, monospace)' }}>
                {Math.round(masterVol * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVol}
              onChange={handleMasterVolChange}
              disabled={soundMuted}
              style={{ width: '100%', accentColor: '#f2c230' }}
            />
          </div>

          {/* SFX Volume */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fdf6e2' }}>Sound Effects (SFX)</span>
              <span style={{ fontSize: 12, color: '#f2c230', fontFamily: 'var(--font-pixel, monospace)' }}>
                {Math.round(sfxVol * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVol}
              onChange={handleSfxVolChange}
              disabled={soundMuted}
              style={{ width: '100%', accentColor: '#8fc45a' }}
            />
          </div>

          {/* Ambience Volume */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fdf6e2' }}>Nature Ambience</span>
              <span style={{ fontSize: 12, color: '#f2c230', fontFamily: 'var(--font-pixel, monospace)' }}>
                {Math.round(ambienceVol * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambienceVol}
              onChange={handleAmbienceVolChange}
              disabled={soundMuted}
              style={{ width: '100%', accentColor: '#4f9bd1' }}
            />
          </div>
        </div>
      </WoodPanel>

      {/* 2. Toolshed Motion & Weather Controls (Spec 8.2 & 8.5) */}
      <WoodPanel variant="default" style={{ padding: '20px 22px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fdf6e2', marginBottom: 4 }}>
          Atmosphere & Parallax Camera
        </h3>
        <p style={{ fontSize: 12, color: '#c4b5a5', marginBottom: 16 }}>
          Control horizon camera panning speeds, day/night lighting, and seasonal skies.
        </p>

        {/* Motion Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderRadius: 8,
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(163, 108, 58, 0.3)',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Compass size={18} color="#f2c230" />
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fdf6e2' }}>
                Parallax Camera Panning
              </span>
              <p style={{ fontSize: 11, color: '#a38d7b', margin: 0 }}>
                {reducedMotion ? 'Reduced Motion (Instant 150ms fade)' : 'Full 4-Layer Dynamic Parallax Scene'}
              </p>
            </div>
          </div>
          <PixelButton
            variant={reducedMotion ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleToggleReducedMotion}
          >
            {reducedMotion ? 'Enable Full Parallax' : 'Enable Reduced Motion'}
          </PixelButton>
        </div>

        {/* Weather Selector */}
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#fdf6e2', display: 'block', marginBottom: 8 }}>
            Sky Weather Override:
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'auto', label: '🌱 Auto (Date-Seeded)' },
              { id: 'clear', label: '☀️ Clear' },
              { id: 'breeze', label: '🍃 Breeze / Leaves' },
              { id: 'rain', label: '🌧️ Gentle Rain' },
              { id: 'snow', label: '❄️ Snowfall' },
              { id: 'fireflies', label: '✨ Fireflies' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleWeatherChange(opt.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: weatherOverride === opt.id ? '2px solid #f2c230' : '1px solid #7b4a28',
                  background: weatherOverride === opt.id ? '#3d2315' : '#2b1a11',
                  color: weatherOverride === opt.id ? '#f2c230' : '#c4b5a5',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time of Day Override */}
        <div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#fdf6e2', display: 'block', marginBottom: 8 }}>
            Time of Day Lighting:
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'auto', label: '⏰ Auto (Clock-Synced)' },
              { id: 'dawn', label: '🌅 Dawn' },
              { id: 'day', label: '☀️ Daytime' },
              { id: 'dusk', label: '🌇 Dusk' },
              { id: 'night', label: '🌙 Night' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleTimeChange(opt.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: timeOverride === opt.id ? '2px solid #f2c230' : '1px solid #7b4a28',
                  background: timeOverride === opt.id ? '#3d2315' : '#2b1a11',
                  color: timeOverride === opt.id ? '#f2c230' : '#c4b5a5',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </WoodPanel>

      {/* 3. Theme & Appearance (Preserved & Styled) */}
      <WoodPanel variant="default" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fdf6e2', margin: 0 }}>
              Theme & Appearance
            </h3>
            <p style={{ fontSize: 12, color: '#c4b5a5', margin: '2px 0 0 0' }}>
              Choose your preferred visual theme for the web interface.
            </p>
          </div>
          <PixelBadge variant="info">
            {theme === 'system' ? `System (${resolvedTheme})` : theme === 'light' ? 'Light' : 'Dark'}
          </PixelBadge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          {/* Dark Mode Card */}
          <div
            onClick={() => setTheme('dark')}
            style={{
              border: `2px solid ${theme === 'dark' ? '#f2c230' : '#7b4a28'}`,
              borderRadius: 10,
              padding: '14px',
              cursor: 'pointer',
              background: theme === 'dark' ? '#3d2315' : '#2b1a11',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Moon size={16} color="#f2c230" />
              <span style={{ fontWeight: 600, fontSize: 13, color: '#fdf6e2' }}>Dark</span>
            </div>
            <p style={{ fontSize: 11, color: '#a38d7b', margin: 0 }}>
              Cozy Pixel Valley hearth
            </p>
          </div>

          {/* Light Mode Card */}
          <div
            onClick={() => setTheme('light')}
            style={{
              border: `2px solid ${theme === 'light' ? '#f2c230' : '#7b4a28'}`,
              borderRadius: 10,
              padding: '14px',
              cursor: 'pointer',
              background: theme === 'light' ? '#3d2315' : '#2b1a11',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sun size={16} color="#d97706" />
              <span style={{ fontWeight: 600, fontSize: 13, color: '#fdf6e2' }}>Light</span>
            </div>
            <p style={{ fontSize: 11, color: '#a38d7b', margin: 0 }}>
              Crisp parchment mode
            </p>
          </div>

          {/* System Mode Card */}
          <div
            onClick={() => setTheme('system')}
            style={{
              border: `2px solid ${theme === 'system' ? '#f2c230' : '#7b4a28'}`,
              borderRadius: 10,
              padding: '14px',
              cursor: 'pointer',
              background: theme === 'system' ? '#3d2315' : '#2b1a11',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Monitor size={16} color="#8fc45a" />
              <span style={{ fontWeight: 600, fontSize: 13, color: '#fdf6e2' }}>System Auto</span>
            </div>
            <p style={{ fontSize: 11, color: '#a38d7b', margin: 0 }}>
              Syncs with OS
            </p>
          </div>
        </div>
      </WoodPanel>

      {/* 4. Keyring Vault: Change Password */}
      <WoodPanel variant="default" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <KeyRound size={20} color="#f2c230" />
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fdf6e2', margin: 0 }}>
                Keyring Vault: Change Password
              </h3>
              <p style={{ fontSize: 12, color: '#c4b5a5', margin: '2px 0 0 0' }}>
                Update your login password securely. Requires verifying your current password.
              </p>
            </div>
          </div>
          <PixelBadge variant="info">🔐 BCrypt</PixelBadge>
        </div>

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 440 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#fdf6e2', marginBottom: 4 }}>
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '8px 10px',
                background: '#1a0f08',
                border: '2px solid #7b4a28',
                color: '#fdf6e2',
                fontSize: 12,
                fontFamily: 'monospace',
                borderRadius: 4,
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#fdf6e2', marginBottom: 4 }}>
                New Password (8+ chars)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 chars"
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: '#1a0f08',
                  border: '2px solid #7b4a28',
                  color: '#fdf6e2',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  borderRadius: 4,
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#fdf6e2', marginBottom: 4 }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: '#1a0f08',
                  border: '2px solid #7b4a28',
                  color: '#fdf6e2',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  borderRadius: 4,
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 4 }}>
            <PixelButton
              variant="primary"
              size="sm"
              type="submit"
              disabled={passwordStatus === 'saving'}
            >
              {passwordStatus === 'saving' ? 'Updating Keyring...' : 'Update Password 🗝️'}
            </PixelButton>
          </div>
        </form>
      </WoodPanel>

      {/* 5. Database Environment Mode (Preserved & Styled) */}
      <WoodPanel variant="default" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fdf6e2', margin: 0 }}>
              Database Environment Mode
            </h3>
            <p style={{ fontSize: 12, color: '#c4b5a5', margin: '2px 0 0 0' }}>
              Select which database collection is active for your web dashboard and WhatsApp bot.
            </p>
          </div>
          <PixelBadge variant={envMode === 'live' ? 'success' : 'warning'}>
            {envMode === 'live' ? '🌿 Live' : '🛠️ Development'}
          </PixelBadge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {/* Live Mode Option */}
          <div
            onClick={() => onSwitchEnvMode('live')}
            style={{
              border: `2px solid ${envMode === 'live' ? '#8fc45a' : '#7b4a28'}`,
              borderRadius: 10,
              padding: 16,
              cursor: updatingEnv ? 'not-allowed' : 'pointer',
              background: envMode === 'live' ? 'rgba(143, 196, 90, 0.12)' : '#2b1a11',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8fc45a' }} />
              <span style={{ fontWeight: 600, fontSize: 14, color: '#fdf6e2' }}>Live Production</span>
            </div>
            <p style={{ fontSize: 12, color: '#c4b5a5', margin: 0, lineHeight: 1.4 }}>
              Your real personal data. Daily WhatsApp messages and active items are stored here.
            </p>
          </div>

          {/* Development Mode Option */}
          <div
            onClick={() => onSwitchEnvMode('development')}
            style={{
              border: `2px solid ${envMode === 'development' ? '#f2c230' : '#7b4a28'}`,
              borderRadius: 10,
              padding: 16,
              cursor: updatingEnv ? 'not-allowed' : 'pointer',
              background: envMode === 'development' ? 'rgba(242, 194, 48, 0.12)' : '#2b1a11',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f2c230' }} />
              <span style={{ fontWeight: 600, fontSize: 14, color: '#fdf6e2' }}>Development Sandbox</span>
            </div>
            <p style={{ fontSize: 12, color: '#c4b5a5', margin: 0, lineHeight: 1.4 }}>
              Isolated testing collection. Perfect for testing new bot features without cluttering Live data.
            </p>
          </div>
        </div>
      </WoodPanel>

      {/* 6. Reset & Wipe Settings (Preserved & Styled) */}
      <WoodPanel
        variant="default"
        style={{
          padding: '20px 22px',
          borderColor: 'rgba(194, 65, 90, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <AlertTriangle size={18} color="#c2415a" />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#c2415a', margin: 0 }}>
            Database Reset & Maintenance
          </h3>
        </div>
        <p style={{ fontSize: 12, color: '#c4b5a5', marginBottom: 16, lineHeight: 1.5 }}>
          Permanently clear stored records for a specific environment. This resets todos, debts, deadlines, dates, watchlist, and reminders.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <PixelButton
            variant="danger"
            size="sm"
            onClick={() => setConfirmTarget('live')}
            disabled={wiping}
          >
            Wipe Live Database
          </PixelButton>

          <PixelButton
            variant="secondary"
            size="sm"
            onClick={() => setConfirmTarget('development')}
            disabled={wiping}
          >
            Wipe Development Database
          </PixelButton>
        </div>

        {/* Confirmation Modal */}
        {confirmTarget && (
          <div
            className="modal-enter"
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 8,
              background: 'rgba(194, 65, 90, 0.15)',
              border: '2px solid #c2415a',
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 600, color: '#fdf6e2', marginBottom: 12 }}>
              ⚠️ Are you sure you want to permanently delete all items in the <u>{confirmTarget.toUpperCase()}</u> database? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <PixelButton
                variant="danger"
                size="sm"
                onClick={() => executeWipe(confirmTarget)}
                disabled={wiping}
              >
                {wiping ? 'Wiping...' : `Confirm Wipe (${confirmTarget.toUpperCase()})`}
              </PixelButton>
              <PixelButton
                variant="secondary"
                size="sm"
                onClick={() => setConfirmTarget(null)}
                disabled={wiping}
              >
                Cancel
              </PixelButton>
            </div>
          </div>
        )}
      </WoodPanel>
    </div>
  );
}
