import { Card } from '@/shared/ui/card/card';
import { Button } from '@/shared/ui/button/button';
import { env } from '@/shared/config/env';
import { useConfirmEmail } from '../model/use-confirm-email';

export function ConfirmStatusCard() {
  const { status, message } = useConfirmEmail();

  const handleOpenApp = () => {
    window.location.href = env.appScheme;
  };

  if (status === 'loading') {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid var(--color-sky)',
              borderTopColor: 'var(--color-petrol)',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite',
            }}
          />
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-petrol)', marginBottom: '8px' }}>
            Verificando cuenta
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-steel)' }}>
            Por favor, espera unos momentos mientras confirmamos tu correo con Supabase...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(36, 78, 101, 0.1)',
              color: 'var(--color-petrol)',
              fontSize: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
            ✓
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-steel)',
              letterSpacing: '2px',
              display: 'block',
              marginBottom: '6px',
            }}>
            CONFIRMACIÓN COMPLETADA
          </span>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--color-petrol)',
              marginBottom: '10px',
            }}>
            ¡Correo verificado!
          </h2>
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--color-steel)',
              marginBottom: '28px',
            }}>
            {message} Ya puedes regresar a TickDesk en tu dispositivo móvil e iniciar sesión.
          </p>

          <Button onClick={handleOpenApp}>
            Abrir TickDesk en tu celular
          </Button>

          <p style={{ marginTop: '16px', fontSize: '11px', color: 'var(--color-steel)', lineHeight: 1.4 }}>
            * Si usas la versión instalada (APK), el botón abrirá la app directamente. Si pruebas en Expo Go, puedes regresar a la aplicación abierta en tu emulador o dispositivo.
          </p>
        </div>
      </Card>
    );
  }

  if (status === 'expired') {
    return (
      <Card>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(242, 140, 91, 0.15)',
              color: 'var(--color-coral)',
              fontSize: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
            ⏳
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-coral)',
              letterSpacing: '2px',
              display: 'block',
              marginBottom: '6px',
            }}>
            ENLACE NO VÁLIDO
          </span>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--color-petrol)',
              marginBottom: '10px',
            }}>
            Enlace caducado o utilizado
          </h2>
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--color-steel)',
              marginBottom: '24px',
            }}>
            {message} Es probable que tu correo ya haya sido confirmado previamente o que el enlace haya expirado por seguridad.
          </p>

          <Button onClick={handleOpenApp} variant="petrol">
            Ir a iniciar sesión en TickDesk
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(242, 140, 91, 0.15)',
            color: 'var(--color-coral)',
            fontSize: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
          ✕
        </div>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-coral)',
            letterSpacing: '2px',
            display: 'block',
            marginBottom: '6px',
          }}>
          ERROR DE VERIFICACIÓN
        </span>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--color-petrol)',
            marginBottom: '10px',
          }}>
          No pudimos verificar tu correo
        </h2>
        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'var(--color-steel)',
            marginBottom: '24px',
          }}>
          {message}
        </p>

        <Button onClick={handleOpenApp} variant="outline">
          Volver a la aplicación
        </Button>
      </div>
    </Card>
  );
}
