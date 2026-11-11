export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        marginTop: 'auto',
        textAlign: 'center',
        padding: '24px 20px',
        fontSize: '11px',
        color: 'var(--color-text-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <p style={{ margin: 0, fontWeight: 500 }}>
        TickDesk v1.0.0 &bull; Escuela Politécnica Nacional
      </p>
      <p style={{ margin: 0, fontSize: '10px' }}>
        &copy; {currentYear} Todos los derechos reservados.
      </p>
    </footer>
  );
}
