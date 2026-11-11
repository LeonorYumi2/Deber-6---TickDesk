import { Card } from '@/shared/ui/card';
import { AppActions } from '@/shared/ui/app-actions';

export function HomePage() {
  return (
    <main
      style={{
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Card maxWidth="460px">
        <div style={{ textAlign: 'center', padding: '6px 0 2px' }}>
          <h2
            style={{
              margin: '0 0 12px 0',
              fontSize: 'var(--font-2xl)',
              fontWeight: 700,
              color: 'var(--color-petrol)',
              letterSpacing: '-0.4px',
              lineHeight: 1.25,
            }}
          >
            Portal Web TickDesk
          </h2>

          <p
            style={{
              margin: '0 0 24px 0',
              fontSize: 'var(--font-sm)',
              lineHeight: 1.6,
              color: 'var(--color-text-muted)',
            }}
          >
            Este portal gestiona de forma segura la verificación de cuentas y el restablecimiento de contraseñas para la aplicación móvil TickDesk.
          </p>

          <AppActions
            helperText="Para crear y gestionar tickets de soporte técnico, abre la aplicación en tu dispositivo Android."
          />
        </div>
      </Card>
    </main>
  );
}
