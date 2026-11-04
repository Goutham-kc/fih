export default function WoodPanel({
  children,
  title,
  subtitle,
  actions,
  className = '',
  style = {},
  variant = 'default', // 'default' | 'parchment' | 'dark'
  cornerStuds = true,
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      className={`pixel-wood-panel ${variant} ${className}`}
      style={{
        position: 'relative',
        borderRadius: 14,
        background:
          variant === 'parchment'
            ? 'linear-gradient(180deg, #fdf6e2 0%, #f4e4bc 100%)'
            : 'linear-gradient(180deg, #2b1a11 0%, #1f130b 100%)',
        border: '3px solid #7b4a28',
        boxShadow:
          variant === 'parchment'
            ? '0 4px 16px rgba(59, 42, 30, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 0 #d3b27d'
            : '0 6px 20px rgba(0, 0, 0, 0.45), inset 0 2px 0 rgba(201, 143, 85, 0.4), inset 0 -2px 0 #140c07',
        color: variant === 'parchment' ? '#3b2a1e' : '#f5e6d3',
        padding: '18px 20px',
        ...style,
      }}
      {...props}
    >
      {/* Corner Brass Studs */}
      {cornerStuds && (
        <>
          <span style={{ position: 'absolute', top: 5, left: 5, width: 6, height: 6, background: '#f2c230', border: '1px solid #7b4a28', borderRadius: 1 }} />
          <span style={{ position: 'absolute', top: 5, right: 5, width: 6, height: 6, background: '#f2c230', border: '1px solid #7b4a28', borderRadius: 1 }} />
          <span style={{ position: 'absolute', bottom: 5, left: 5, width: 6, height: 6, background: '#f2c230', border: '1px solid #7b4a28', borderRadius: 1 }} />
          <span style={{ position: 'absolute', bottom: 5, right: 5, width: 6, height: 6, background: '#f2c230', border: '1px solid #7b4a28', borderRadius: 1 }} />
        </>
      )}

      {/* Header if title is provided */}
      {(title || subtitle || actions) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 14,
            paddingBottom: 8,
            borderBottom: variant === 'parchment' ? '2px dashed #d3b27d' : '2px dashed #4a2811',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  margin: 0,
                  color: variant === 'parchment' ? '#3b2a1e' : '#f2c230',
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: 11,
                  margin: '2px 0 0 0',
                  color: variant === 'parchment' ? '#6d5543' : '#a38d7b',
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
