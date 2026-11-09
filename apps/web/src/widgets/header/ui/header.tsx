export function Header() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 20px',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '16px',
            backgroundColor: 'var(--color-petrol)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-white)',
            fontSize: '18px',
            fontWeight: 'bold',
          }}>
          T
        </div>
        <div>
          <h1
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-petrol)',
              letterSpacing: '-0.3px',
              lineHeight: 1.2,
            }}>
            TickDesk
          </h1>
          <p
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--color-steel)',
              letterSpacing: '2px',
            }}>
            SUPPORT SYSTEM
          </p>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(184, 221, 227, 0.3)',
          padding: '6px 12px',
          borderRadius: '999px',
        }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-coral)',
          }}
        />
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--color-steel)',
            letterSpacing: '1px',
          }}>
          PORTAL WEB
        </span>
      </div>
    </header>
  );
}
