import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

type TextFieldProps = {
  label?: string;
  error?: string;
  helperText?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      helperText,
      leftElement,
      rightElement,
      style,
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          width: '100%',
          marginBottom: '18px',
        }}
      >
        {label ? (
          <label
            htmlFor={inputId}
            style={{
              fontSize: 'var(--font-xs)',
              fontWeight: 600,
              color: error ? 'var(--color-coral)' : 'var(--color-petrol)',
              letterSpacing: '0.2px',
              transition: 'color var(--transition-fast)',
            }}
          >
            {label}
          </label>
        ) : null}

        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {leftElement && (
            <div
              style={{
                position: 'absolute',
                left: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isFocused ? 'var(--color-petrol)' : 'var(--color-text-subtle)',
                pointerEvents: 'none',
                transition: 'color var(--transition-fast)',
              }}
            >
              {leftElement}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            style={{
              height: '44px',
              width: '100%',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${
                error
                  ? 'var(--color-coral)'
                  : isFocused
                  ? 'var(--color-steel)'
                  : 'var(--color-border)'
              }`,
              paddingLeft: leftElement ? '38px' : '14px',
              paddingRight: rightElement ? '40px' : '14px',
              fontSize: 'var(--font-sm)',
              color: 'var(--color-text-main)',
              backgroundColor: 'var(--color-surface)',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'all var(--transition-fast)',
              boxShadow: isFocused
                ? error
                  ? 'var(--focus-ring-coral)'
                  : 'var(--focus-ring)'
                : 'none',
              boxSizing: 'border-box',
              ...style,
            }}
            {...props}
          />

          {rightElement && (
            <div
              style={{
                position: 'absolute',
                right: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {rightElement}
            </div>
          )}
        </div>

        {error ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: 'var(--font-xs)',
              color: 'var(--color-coral)',
              fontWeight: 500,
              marginTop: '1px',
            }}
          >
            <AlertCircle size={13} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <span
            style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
              marginTop: '1px',
            }}
          >
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
