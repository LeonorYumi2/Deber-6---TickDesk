import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

type TextFieldProps = {
  label?: string;
  error?: string;
  rightElement?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, rightElement, style, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginBottom: '16px' }}>
        {label ? (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-petrol)',
            }}>
            {label}
          </label>
        ) : null}
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          <input
            id={inputId}
            ref={ref}
            style={{
              height: '48px',
              width: '100%',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${error ? 'var(--color-coral)' : 'var(--color-sky)'}`,
              padding: rightElement ? '0 44px 0 14px' : '0 14px',
              fontSize: '15px',
              color: 'var(--color-petrol)',
              backgroundColor: 'var(--color-white)',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box',
              ...style,
            }}
            {...props}
          />
          {rightElement ? (
            <div
              style={{
                position: 'absolute',
                right: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {rightElement}
            </div>
          ) : null}
        </div>
        {error ? (
          <span style={{ fontSize: '12px', color: 'var(--color-coral)', fontWeight: 500 }}>
            {error}
          </span>
        ) : null}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
