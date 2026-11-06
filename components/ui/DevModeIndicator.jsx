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
        padding: '3px 9px',
        borderRadius: 5,
        background: isDev ? 'rgba(120, 53, 15, 0.7)' : 'rgba(6, 78, 59, 0.65)',
        backdropFilter: 'blur(4px)',
        border: `1px solid ${isDev ? '#f59e0b' : 'rgba(80, 207, 143, 0.4)'}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.25)',
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
