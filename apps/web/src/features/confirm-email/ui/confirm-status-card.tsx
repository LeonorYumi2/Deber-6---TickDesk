import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { AppActions } from '@/shared/ui/app-actions';
import { useConfirmEmail } from '../model/use-confirm-email';

export function ConfirmStatusCard() {
  const { status, message } = useConfirmEmail();

  if (status === 'loading') {
    return (
      <Card maxWidth="420px">
        <div
          style={{
            textAlign: 'center',
            padding: '16px 0 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(184, 221, 227, 0.4)',
              borderTopColor: 'var(--color-petrol)',
              borderRadius: '50%',
              margin: '0 auto 18px',
              animation: 'spin 0.8s linear infinite',
            }}
          />

          <h2
            style={{
              margin: '0 0 8px 0',
              fontSize: 'var(--font-xl)',
              fontWeight: 700,
              color: 'var(--color-petrol)',
              lineHeight: 1.25,
            }}
          >
            Verificando cuenta
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-sm)',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}
          >
            Por favor, espera un momento mientras validamos tu enlace...
          </p>
        </div>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card maxWidth="420px">
        <div style={{ textAlign: 'center', padding: '6px 0 2px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(36, 78, 101, 0.08)',
              color: 'var(--color-petrol)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 size={28} strokeWidth={2.4} />
          </div>

          <h2
            style={{
              margin: '0 0 10px 0',
              fontSize: 'var(--font-xl)',
              fontWeight: 700,
              color: 'var(--color-petrol)',
              letterSpacing: '-0.3px',
            }}
          >
            ¡Correo verificado!
          </h2>

          <p
            style={{
              margin: '0 0 20px 0',
              fontSize: 'var(--font-sm)',
              lineHeight: 1.5,
              color: 'var(--color-text-muted)',
            }}
          >
            {message || 'Tu cuenta ha sido activada con éxito.'} Ya puedes iniciar sesión en TickDesk.
          </p>

          <AppActions />
        </div>
      </Card>
    );
  }

  if (status === 'expired') {
    return (
      <Card maxWidth="420px">
        <div style={{ textAlign: 'center', padding: '6px 0 2px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(242, 140, 91, 0.1)',
              color: 'var(--color-coral)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Clock size={28} strokeWidth={2.2} />
          </div>

          <h2
            style={{
              margin: '0 0 10px 0',
              fontSize: 'var(--font-xl)',
              fontWeight: 700,
              color: 'var(--color-petrol)',
            }}
          >
            Enlace caducado
          </h2>

          <p
            style={{
              margin: '0 0 20px 0',
              fontSize: 'var(--font-sm)',
              lineHeight: 1.5,
              color: 'var(--color-text-muted)',
            }}
          >
            {message || 'Este enlace ya fue utilizado o ha expirado.'} Si tu cuenta ya fue confirmada, puedes iniciar sesión directamente.
          </p>

          <AppActions />
        </div>
      </Card>
    );
  }

  // Error state
  return (
    <Card maxWidth="420px">
      <div style={{ textAlign: 'center', padding: '6px 0 2px' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'rgba(242, 140, 91, 0.1)',
            color: 'var(--color-coral)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <AlertTriangle size={28} strokeWidth={2.2} />
        </div>

        <h2
          style={{
            margin: '0 0 10px 0',
            fontSize: 'var(--font-xl)',
            fontWeight: 700,
            color: 'var(--color-petrol)',
          }}
        >
          Error de verificación
        </h2>

        <p
          style={{
            margin: '0 0 20px 0',
            fontSize: 'var(--font-sm)',
            lineHeight: 1.5,
            color: 'var(--color-text-muted)',
          }}
        >
          {message || 'No fue posible validar el enlace de confirmación.'}
        </p>

        <AppActions />
      </div>
    </Card>
  );
}
