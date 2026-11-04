import { playSound } from '@/lib/soundEffects';

export default function PixelButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost' | 'wood'
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
      case 'primary':
        return {
          background: 'linear-gradient(180deg, #c98f55 0%, #a36c3a 100%)',
          color: '#ffffff',
          border: '2px solid #54331a',
          boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.35), inset 0 -2px 0 #4a2811, 0 3px 0 #3b2a1e',
        };
      case 'secondary':
        return {
          background: 'linear-gradient(180deg, #f4e4bc 0%, #e5cca0 100%)',
          color: '#3b2a1e',
          border: '2px solid #a36c3a',
          boxShadow: 'inset 0 2px 0 #ffffff, inset 0 -2px 0 #c98f55, 0 3px 0 #7b4a28',
        };
      case 'danger':
        return {
          background: 'linear-gradient(180deg, #c2415a 0%, #991b1b 100%)',
          color: '#ffffff',
          border: '2px solid #5a0c1a',
          boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 #4c0519, 0 3px 0 #28030d',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--pv-ink, inherit)',
          border: '2px solid transparent',
          boxShadow: 'none',
        };
      case 'wood':
      default:
        return {
          background: 'linear-gradient(180deg, #8fc45a 0%, #5e9440 100%)',
          color: '#ffffff',
          border: '2px solid #365922',
          boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 0 #2a451b, 0 3px 0 #1b2e10',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '4px 10px', fontSize: 11, minHeight: 32 };
      case 'lg':
        return { padding: '10px 22px', fontSize: 14, minHeight: 46 };
      case 'md':
      default:
        return { padding: '6px 14px', fontSize: 12, minHeight: 38 };
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
        fontFamily: 'var(--font-sans, inherit)',
        fontWeight: 700,
        letterSpacing: '0.02em',
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'transform 80ms ease, box-shadow 80ms ease',
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
