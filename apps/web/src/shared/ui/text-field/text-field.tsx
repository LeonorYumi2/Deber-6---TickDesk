import { forwardRef, type InputHTMLAttributes } from 'react';

type TextFieldProps = {
  label?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, style, id, ...props }, ref) => {
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
        <input
          id={inputId}
          ref={ref}
          style={{
            height: '48px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${error ? 'var(--color-coral)' : 'var(--color-sky)'}`,
            padding: '0 14px',
            fontSize: '15px',
            color: 'var(--color-petrol)',
            backgroundColor: 'var(--color-white)',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s ease',
            ...style,
          }}
          {...props}
        />
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
