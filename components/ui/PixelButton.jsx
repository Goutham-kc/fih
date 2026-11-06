import { playSound } from '@/lib/soundEffects';

export default function PixelButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost' | 'wood' | 'golden'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  soundType = 'click',
  className = '',
  style = {},
  ...props
}) {
  const handleClick = (e) => {
    if (disabled) return;
    if (soundType) playSound(soundType);
    if (onClick) onClick(e);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'golden':
        return {
          background: '#eab308',
          color: '#1a1005',
          border: '2px solid #713f12',
          boxShadow: 'inset 2px 2px 0 #fef08a, inset -2px -2px 0 #854d0e, 0 3px 0 #422006',
        };
      case 'primary':
        return {
          background: '#386e4e',
          color: '#fdfbf4',
          border: '2px solid #183324',
          boxShadow: 'inset 2px 2px 0 #5ca077, inset -2px -2px 0 #183324, 0 3px 0 #0f2117',
        };
      case 'secondary':
      case 'wood':
        return {
          background: '#2a523c',
          color: '#fdfbf4',
          border: '2px solid #14291e',
          boxShadow: 'inset 2px 2px 0 #468662, inset -2px -2px 0 #13241a, 0 3px 0 #0b1711',
        };
      case 'danger':
        return {
          background: '#dc2626',
          color: '#ffffff',
          border: '2px solid #5a0c1a',
          boxShadow: 'inset 2px 2px 0 #fca5a5, inset -2px -2px 0 #991b1b, 0 3px 0 #450a0a',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: '#fdfbf4',
          border: '2px solid transparent',
          boxShadow: 'none',
        };
      default:
        return {
          background: '#2a523c',
          color: '#fdfbf4',
          border: '2px solid #14291e',
          boxShadow: 'inset 2px 2px 0 #468662, inset -2px -2px 0 #13241a, 0 3px 0 #0b1711',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '4px 10px', fontSize: 10, minHeight: 30 };
      case 'lg':
        return { padding: '10px 20px', fontSize: 13, minHeight: 44 };
      case 'md':
      default:
        return { padding: '6px 14px', fontSize: 11, minHeight: 36 };
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`pixel-btn ${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        fontFamily: 'var(--font-pixel-display)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        borderRadius: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'none',
        userSelect: 'none',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
