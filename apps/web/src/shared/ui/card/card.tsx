import { type ReactNode, type CSSProperties } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  maxWidth?: number | string;
};

export function Card({
  children,
  className = '',
  style,
  maxWidth = '440px',
}: CardProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 32px',
        boxShadow: 'var(--shadow-card)',
        width: '100%',
        maxWidth,
        margin: '0 auto',
        animation: 'fadeInCard 0.25s ease-out',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
