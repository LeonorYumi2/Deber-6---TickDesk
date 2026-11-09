import { type ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-white)',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 24px',
        boxShadow: 'var(--shadow-subtle)',
        width: '100%',
        maxWidth: '440px',
        margin: '0 auto',
      }}
      className={className}>
      {children}
    </div>
  );
}
