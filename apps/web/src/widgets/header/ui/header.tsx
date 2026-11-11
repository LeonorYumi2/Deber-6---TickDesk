import { Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 20px 12px',
        width: '100%',
        maxWidth: '460px',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-petrol)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
          }}
        >
          <Headphones size={19} color="#ffffff" strokeWidth={2.2} />
        </div>

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-petrol)',
              letterSpacing: '-0.3px',
              lineHeight: 1.15,
            }}
          >
            TickDesk
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--color-steel)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            SUPPORT SYSTEM
          </p>
        </div>
      </Link>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(91, 145, 165, 0.08)',
          border: '1px solid rgba(91, 145, 165, 0.15)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-coral)',
          }}
        />
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--color-petrol)',
            letterSpacing: '0.8px',
          }}
        >
          PORTAL WEB
        </span>
      </div>
    </header>
  );
}
