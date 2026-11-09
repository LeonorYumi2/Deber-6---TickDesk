import { Card } from '@/shared/ui/card/card';
import { Button } from '@/shared/ui/button/button';
import { env } from '@/shared/config/env';

export function HomePage() {
  const handleOpenApp = () => {
    window.location.href = env.appScheme;
  };

  return (
    <main style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Card>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-steel)',
            letterSpacing: '2px',
            display: 'block',
            marginBottom: '8px',
          }}>
          PORTAL DE AUTENTICACIÓN
        </span>
        <h2
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--color-petrol)',
            lineHeight: 1.25,
            marginBottom: '12px',
          }}>
          TickDesk Web
        </h2>
        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'var(--color-steel)',
            marginBottom: '28px',
          }}>
          Este portal complementario gestiona los servicios de verificación de correo electrónico
          y recuperación de contraseñas de la aplicación móvil TickDesk.
        </p>

        <Button onClick={handleOpenApp}>
          Abrir aplicación TickDesk
        </Button>
      </Card>
    </main>
  );
}
