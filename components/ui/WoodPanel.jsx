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
  const isDark = variant === 'dark';

  // Authentic Fields of Mistria / Cozy Village Palette
  // Deep evergreen forest slate (#162a22) for default panels
  // Warm ivory linen (#fcf8ef) for parchment
  // Radiant moss-gold (#1e3324) for golden
  // Deep twilight slate (#0f1d17) for dark
  const bg = isParchment
    ? '#fcf8ef'
    : isGolden
    ? '#1c3326'
    : isDark
    ? '#0f1d17'
    : '#162a22';

  const borderColor = isParchment
    ? '#244030'
    : isGolden
    ? '#713f12'
    : isDark
    ? '#07100c'
    : '#0d1c16';

  const outlineColor = isParchment
    ? '#4a7c59'
    : isGolden
    ? '#eab308'
    : isDark
    ? '#1b3829'
    : '#2b523e';

  const shadow = isParchment
    ? 'inset 2px 2px 0 #ffffff, inset -2px -2px 0 #ded4be, 0 4px 0 #162a22'
    : isGolden
    ? 'inset 2px 2px 0 #fde047, inset -2px -2px 0 #854d0e, 0 4px 0 #0d1c16'
    : isDark
    ? 'inset 2px 2px 0 #234734, inset -2px -2px 0 #050a08, 0 4px 0 #040806'
    : 'inset 2px 2px 0 #3d7054, inset -2px -2px 0 #0a1410, 0 4px 0 #060c09';

  const textColor = isParchment ? '#162a22' : '#fdfbf4';

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
          <span style={{ position: 'absolute', top: 3, left: 3, width: 4, height: 4, background: '#f2c230', border: '1px solid #0d1c16' }} />
          <span style={{ position: 'absolute', top: 3, right: 3, width: 4, height: 4, background: '#f2c230', border: '1px solid #0d1c16' }} />
          <span style={{ position: 'absolute', bottom: 3, left: 3, width: 4, height: 4, background: '#f2c230', border: '1px solid #0d1c16' }} />
          <span style={{ position: 'absolute', bottom: 3, right: 3, width: 4, height: 4, background: '#f2c230', border: '1px solid #0d1c16' }} />
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
            borderBottom: isParchment ? '2px dashed #b5c7ba' : '2px dashed #2b523e',
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
                  color: isParchment ? '#162a22' : '#facc15',
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
                  color: isParchment ? '#3d614b' : '#97b8a3',
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
