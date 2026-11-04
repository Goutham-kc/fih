export default function PixelBadge({
  children,
  type = 'neutral', // 'whatsapp' | 'web' | 'neutral' | 'urgent' | 'success' | 'warning'
  size = 'sm',
  className = '',
  style = {},
  ...props
}) {
  const getBadgeConfig = () => {
    switch (type) {
      case 'whatsapp':
        return {
          background: 'rgba(56, 189, 248, 0.15)',
          border: '1.5px solid #38bdf8',
          color: '#38bdf8',
          icon: '🕊️',
          label: 'WhatsApp',
        };
      case 'web':
        return {
          background: 'rgba(201, 143, 85, 0.15)',
          border: '1.5px solid #c98f55',
          color: '#c98f55',
          icon: '🪶',
          label: 'Web',
        };
      case 'urgent':
        return {
          background: 'rgba(194, 65, 90, 0.2)',
          border: '1.5px solid #c2415a',
          color: '#f87171',
          icon: '⚠️',
          label: null,
        };
      case 'success':
        return {
          background: 'rgba(143, 196, 90, 0.2)',
          border: '1.5px solid #8fc45a',
          color: '#8fc45a',
          icon: '🌾',
          label: null,
        };
      case 'warning':
        return {
          background: 'rgba(242, 194, 48, 0.2)',
          border: '1.5px solid #f2c230',
          color: '#fde047',
          icon: '⭐',
          label: null,
        };
      case 'neutral':
      default:
        return {
          background: 'rgba(141, 138, 134, 0.2)',
          border: '1.5px solid #8d8a86',
          color: 'var(--pv-ink, #8d8a86)',
          icon: null,
          label: null,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`pixel-badge ${type} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: size === 'sm' ? '2px 7px' : '4px 10px',
        fontSize: size === 'sm' ? 10 : 12,
        fontWeight: 800,
        letterSpacing: '0.04em',
        borderRadius: 6,
        textTransform: 'uppercase',
        userSelect: 'none',
        background: config.background,
        border: config.border,
        color: config.color,
        ...style,
      }}
      {...props}
    >
      {config.icon && <span style={{ fontSize: '1.1em' }}>{config.icon}</span>}
      {children || config.label}
    </span>
  );
}

/**
 * Helper to derive source badge directly from audit description
 * Strictly confirms "via WhatsApp" per instruction 7
 */
export function deriveSourceBadge(description = '') {
  if (typeof description !== 'string') return <PixelBadge type="neutral">Record</PixelBadge>;
  if (/\bvia whatsapp\b/i.test(description)) {
    return <PixelBadge type="whatsapp" title="Created/modified via WhatsApp Bot" />;
  }
  if (/\b(created|completed|recorded|saved|dispatched)\b/i.test(description)) {
    return <PixelBadge type="web" title="Created/modified via Web Dashboard" />;
  }
  return <PixelBadge type="neutral" title="System Action" />;
}
