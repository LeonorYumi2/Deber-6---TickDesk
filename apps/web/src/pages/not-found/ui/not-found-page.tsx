import { Link } from 'react-router-dom';
import { Card } from '@/shared/ui/card/card';

export function NotFoundPage() {
  return (
    <main style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Card>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-petrol)', marginBottom: '8px' }}>
          404 - Página no encontrada
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-steel)', marginBottom: '20px' }}>
          La dirección a la que intentas acceder no existe en el portal de TickDesk.
        </p>
        <Link
          to="/"
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-coral)',
            textDecoration: 'underline',
          }}>
          Ir al inicio
        </Link>
      </Card>
    </main>
  );
}
