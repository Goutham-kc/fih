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
          color: '#1a0f08',
          border: '2px solid #713f12',
          boxShadow: 'inset 2px 2px 0 #fef08a, inset -2px -2px 0 #854d0e, 0 3px 0 #422006',
        };
      case 'primary':
        return {
          background: '#c98f55',
          color: '#1a0f08',
          border: '2px solid #54331a',
          boxShadow: 'inset 2px 2px 0 #fde047, inset -2px -2px 0 #784323, 0 3px 0 #2b1a11',
        };
      case 'secondary':
      case 'wood':
        return {
          background: '#7b4a28',
          color: '#fdf6e2',
          border: '2px solid #1a0f08',
          boxShadow: 'inset 2px 2px 0 #a36c3a, inset -2px -2px 0 #3d1f0f, 0 3px 0 #120b06',
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
          color: '#fdf6e2',
          border: '2px solid transparent',
          boxShadow: 'none',
        };
      default:
        return {
          background: '#7b4a28',
          color: '#fdf6e2',
          border: '2px solid #1a0f08',
          boxShadow: 'inset 2px 2px 0 #a36c3a, inset -2px -2px 0 #3d1f0f, 0 3px 0 #120b06',
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
