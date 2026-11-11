import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';

export function NotFoundPage() {
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
      <Card maxWidth="420px">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '6px 0 2px',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(242, 140, 91, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-coral)',
              marginBottom: '16px',
            }}
          >
            <Compass size={28} strokeWidth={2.2} />
          </div>

          <h2
            style={{
              margin: '0 0 8px 0',
              fontSize: 'var(--font-xl)',
              fontWeight: 700,
              color: 'var(--color-petrol)',
              lineHeight: 1.25,
            }}
          >
            Página no encontrada
          </h2>

          <p
            style={{
              margin: '0 0 24px 0',
              fontSize: 'var(--font-sm)',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}
          >
            La ruta a la que intentas acceder no existe en el portal de TickDesk.
          </p>

          <Link to="/" style={{ textDecoration: 'none', width: '100%' }}>
            <Button variant="petrol" size="md" fullWidth icon={<ArrowLeft size={16} />}>
              Volver al inicio
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
