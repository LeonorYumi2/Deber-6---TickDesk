import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'petrol' | 'coral' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = 'petrol',
  size = 'md',
  fullWidth = true,
  loading = false,
  icon,
  children,
  style,
  disabled,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isDisabled = disabled || loading;

  const getHeight = () => {
    if (size === 'sm') return '36px';
    if (size === 'lg') return '48px';
    return '44px';
  };

  const getFontSize = () => {
    if (size === 'sm') return '13px';
    if (size === 'lg') return '15px';
    return '14px';
  };

  const getBackgroundColor = () => {
    if (isDisabled) return 'rgba(91, 145, 165, 0.2)';
    if (variant === 'coral') {
      return isHovered ? '#e47d4c' : 'var(--color-coral)';
    }
    if (variant === 'outline') {
      return isHovered ? 'rgba(36, 78, 101, 0.04)' : 'transparent';
    }
    if (variant === 'ghost') {
      return isHovered ? 'rgba(36, 78, 101, 0.05)' : 'transparent';
    }
    // Default 'petrol'
    return isHovered ? '#1c3e51' : 'var(--color-petrol)';
  };

  const getColor = () => {
    if (isDisabled) return 'var(--color-text-subtle)';
    if (variant === 'outline') {
      return 'var(--color-petrol)';
    }
    if (variant === 'ghost') {
      return 'var(--color-steel)';
    }
    return '#ffffff';
  };

  const getBorder = () => {
    if (variant === 'outline') {
      return `1px solid ${isHovered ? 'var(--color-steel)' : 'var(--color-border)'}`;
    }
    return '1px solid transparent';
  };

  const getShadow = () => {
    if (isDisabled || variant === 'outline' || variant === 'ghost') return 'none';
    if (variant === 'coral') {
      return isHovered ? '0 4px 12px rgba(242, 140, 91, 0.25)' : '0 1px 3px rgba(242, 140, 91, 0.2)';
    }
    return isHovered ? '0 4px 12px rgba(36, 78, 101, 0.2)' : '0 1px 3px rgba(36, 78, 101, 0.15)';
  };

  return (
    <button
      disabled={isDisabled}
      onMouseEnter={(e) => {
        setIsHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        onMouseLeave?.(e);
      }}
      style={{
        width: fullWidth ? '100%' : 'auto',
        height: getHeight(),
        borderRadius: 'var(--radius-md)',
        backgroundColor: getBackgroundColor(),
        color: getColor(),
        border: getBorder(),
        fontSize: getFontSize(),
        fontWeight: 600,
        letterSpacing: '0.1px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: size === 'sm' ? '0 14px' : '0 18px',
        boxShadow: getShadow(),
        transform: isHovered && !isDisabled ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'all var(--transition-fast)',
        userSelect: 'none',
        outline: 'none',
        boxSizing: 'border-box',
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: variant === 'outline' ? 'var(--color-petrol)' : '#ffffff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : icon ? (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
