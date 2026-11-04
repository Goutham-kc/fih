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
        borderRadius: 8,
        background: isDev
          ? 'linear-gradient(135deg, rgba(242, 194, 48, 0.22) 0%, rgba(196, 150, 21, 0.15) 100%)'
          : 'linear-gradient(135deg, rgba(143, 196, 90, 0.22) 0%, rgba(94, 148, 64, 0.15) 100%)',
        border: `2px solid ${isDev ? 'var(--pv-gold, #f2c230)' : 'var(--pv-grass-light, #8fc45a)'}`,
        boxShadow: isDev
          ? '0 2px 8px rgba(242, 194, 48, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          : '0 2px 8px rgba(143, 196, 90, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
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
