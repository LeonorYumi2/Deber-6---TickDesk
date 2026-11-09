import { type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'petrol' | 'coral' | 'outline';

type ButtonProps = {
  variant?: ButtonVariant;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = 'petrol',
  fullWidth = true,
  children,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return 'rgba(36, 78, 101, 0.4)';
    if (variant === 'coral') return 'var(--color-coral)';
    if (variant === 'outline') return 'transparent';
    return 'var(--color-petrol)';
  };

  const getColor = () => {
    if (variant === 'outline') return 'var(--color-petrol)';
    return 'var(--color-white)';
  };

  const getBorder = () => {
    if (variant === 'outline') return '1px solid var(--color-sky)';
    return 'none';
  };

  return (
    <button
      disabled={disabled}
      style={{
        width: fullWidth ? '100%' : 'auto',
        height: '52px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: getBackgroundColor(),
        color: getColor(),
        border: getBorder(),
        fontSize: '15px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '0 20px',
        transition: 'opacity 0.2s ease',
        ...style,
      }}
      {...props}>
      {children}
    </button>
  );
}
