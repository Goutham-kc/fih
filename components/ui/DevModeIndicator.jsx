import { ShieldAlert, Sparkles } from 'lucide-react';

export default function DevModeIndicator({ envMode, onToggle, disabled }) {
  const isDev = envMode === 'development';

  return (
    <div
      role="status"
      aria-label={`Current Environment: ${isDev ? 'Development Sandbox' : 'Live Production'}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 0,
        background: isDev ? '#78350f' : '#064e3b',
        border: `2px solid ${isDev ? '#f59e0b' : '#10b981'}`,
        boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.2), 0 2px 0 #120b06',
        cursor: onToggle ? 'pointer' : 'default',
        userSelect: 'none',
      }}
      onClick={onToggle && !disabled ? onToggle : undefined}
      title={
        isDev
          ? 'Development Sandbox Mode: Isolated testing environment. Changes do not affect real records.'
          : 'Live Production Mode: Active personal operating records.'
      }
    >
      {/* Flashing Dot Indicator */}
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 2, // square pixel dot
          background: isDev ? '#f2c230' : '#8fc45a',
          boxShadow: `0 0 6px ${isDev ? '#f2c230' : '#8fc45a'}`,
          display: 'inline-block',
        }}
      />

      <span
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: isDev ? '#fde047' : '#dcfce7',
          fontFamily: 'var(--font-pixel, monospace)',
        }}
      >
        {isDev ? 'DEV SANDBOX' : 'LIVE'}
      </span>

      {isDev ? (
        <ShieldAlert size={12} style={{ color: '#f2c230' }} />
      ) : (
        <Sparkles size={11} style={{ color: '#8fc45a' }} />
      )}
    </div>
  );
}
