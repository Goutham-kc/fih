export default function WoodPanel({
  children,
  title,
  subtitle,
  actions,
  className = '',
  style = {},
  variant = 'default', // 'default' | 'parchment' | 'dark' | 'golden'
  cornerStuds = true,
  as: Component = 'div',
  ...props
}) {
  const isParchment = variant === 'parchment';
  const isGolden = variant === 'golden';

  const bg = isParchment
    ? '#fdf6e2'
    : isGolden
    ? '#3d2315'
    : '#2b1a11';

  const borderColor = isParchment
    ? '#452817'
    : isGolden
    ? '#713f12'
    : '#1a0f08';

  const outlineColor = isParchment
    ? '#a66538'
    : isGolden
    ? '#eab308'
    : '#7b4a28';

  const shadow = isParchment
    ? 'inset 2px 2px 0 #ffffff, inset -2px -2px 0 #d4c29a, 0 4px 0 #2b1a11'
    : isGolden
    ? 'inset 2px 2px 0 #fde047, inset -2px -2px 0 #854d0e, 0 4px 0 #2b1a11'
    : 'inset 2px 2px 0 #a36c3a, inset -2px -2px 0 #120b06, 0 4px 0 #0c0704';

  const textColor = isParchment ? '#2b1a11' : '#fdf6e2';

  return (
    <Component
      className={`pixel-wood-panel ${variant} ${className}`}
      style={{
        position: 'relative',
        borderRadius: 0,
        background: bg,
        border: `3px solid ${borderColor}`,
        outline: `2px solid ${outlineColor}`,
        boxShadow: shadow,
        color: textColor,
        padding: '16px 18px',
        ...style,
      }}
      {...props}
    >
      {/* Corner Square Studs */}
      {cornerStuds && (
        <>
          <span style={{ position: 'absolute', top: 3, left: 3, width: 4, height: 4, background: '#f2c230', border: '1px solid #1a0f08' }} />
          <span style={{ position: 'absolute', top: 3, right: 3, width: 4, height: 4, background: '#f2c230', border: '1px solid #1a0f08' }} />
          <span style={{ position: 'absolute', bottom: 3, left: 3, width: 4, height: 4, background: '#f2c230', border: '1px solid #1a0f08' }} />
          <span style={{ position: 'absolute', bottom: 3, right: 3, width: 4, height: 4, background: '#f2c230', border: '1px solid #1a0f08' }} />
        </>
      )}

      {/* Header if title is provided */}
      {(title || subtitle || actions) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 12,
            paddingBottom: 6,
            borderBottom: isParchment ? '2px dashed #b89b72' : '2px dashed #4a2811',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'var(--font-pixel-display)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0,
                  color: isParchment ? '#2b1a11' : '#facc15',
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-pixel-body)',
                  margin: '2px 0 0 0',
                  color: isParchment ? '#6d5543' : '#a38d7b',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div style={{ display: 'flex', gap: 6 }}>{actions}</div>}
        </div>
      )}

      {children}
    </Component>
  );
}
