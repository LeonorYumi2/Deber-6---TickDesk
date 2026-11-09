import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Card } from '@/shared/ui/card/card';
import { Button } from '@/shared/ui/button/button';
import { TextField } from '@/shared/ui/text-field/text-field';
import { env } from '@/shared/config/env';
import { useResetPassword } from '../model/use-reset-password';

export function ResetPasswordForm() {
  const { stage, errorMessage, loading, updatePassword } = useResetPassword();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleOpenApp = () => {
    window.location.href = env.appScheme;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedPassword) {
      setLocalError('Por favor, ingresa tu nueva contraseña.');
      return;
    }

    if (trimmedPassword.length < 8) {
      setLocalError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (!trimmedConfirm) {
      setLocalError('Por favor, confirma tu nueva contraseña.');
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setLocalError('Las contraseñas no coinciden.');
      return;
    }

    await updatePassword(trimmedPassword, trimmedConfirm);
  };

  // 1. Estado: Verificando enlace
  if (stage === 'verifying') {
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
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-steel)',
              letterSpacing: '2px',
              display: 'block',
              marginBottom: '6px',
            }}>
            VALIDACIÓN DE SEGURIDAD
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-petrol)', marginBottom: '8px' }}>
            Verificando enlace
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-steel)' }}>
            Por favor, espera unos momentos mientras comprobamos la solicitud de recuperación...
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

  // 2. Estado: Éxito al actualizar la contraseña
  if (stage === 'success') {
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
            CONTRASEÑA ACTUALIZADA
          </span>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--color-petrol)',
              marginBottom: '10px',
            }}>
            ¡Contraseña restablecida!
          </h2>
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--color-steel)',
              marginBottom: '28px',
            }}>
            Tu contraseña ha sido actualizada exitosamente. Por seguridad, la sesión de recuperación se ha cerrado.
            Ya puedes abrir la aplicación móvil e iniciar sesión con tu nueva contraseña.
          </p>

          <Button onClick={handleOpenApp}>
            Abrir TickDesk en tu celular
          </Button>

          <p style={{ marginTop: '16px', fontSize: '11px', color: 'var(--color-steel)', lineHeight: 1.4 }}>
            * Si tienes la aplicación instalada en tu dispositivo, el botón la abrirá directamente. También puedes
            regresar a TickDesk en tu emulador.
          </p>
        </div>
      </Card>
    );
  }

  // 3. Estado: Enlace inválido, expirado o acceso no autorizado
  if (stage === 'invalid_link') {
    const isExpired = errorMessage?.toLowerCase().includes('caducado') || errorMessage?.toLowerCase().includes('expirado');

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
            {isExpired ? '⏳' : '✕'}
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
            {isExpired ? 'Enlace caducado o utilizado' : 'No se pudo restablecer la contraseña'}
          </h2>
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--color-steel)',
              marginBottom: '24px',
            }}>
            {errorMessage ||
              'El enlace de recuperación no es válido o ha expirado. Por motivos de seguridad, debes solicitar un nuevo enlace desde la aplicación móvil.'}
          </p>

          <Button onClick={handleOpenApp} variant="petrol">
            Ir a TickDesk en tu celular
          </Button>
        </div>
      </Card>
    );
  }

  // 4. Estado: Formulario de nueva contraseña (ready)
  const displayError = localError || errorMessage;

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-steel)',
            letterSpacing: '2px',
            display: 'block',
            marginBottom: '8px',
          }}>
          SEGURIDAD DE LA CUENTA
        </span>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--color-petrol)',
            marginBottom: '10px',
          }}>
          Nueva contraseña
        </h2>
        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.5,
            color: 'var(--color-steel)',
            marginBottom: '24px',
          }}>
          Ingresa la nueva contraseña que utilizarás para acceder a TickDesk. Debe tener al menos 8 caracteres.
        </p>

        {displayError ? (
          <div
            style={{
              backgroundColor: 'rgba(242, 140, 91, 0.12)',
              border: '1px solid var(--color-coral)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '13px',
              color: 'var(--color-petrol)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
            <span style={{ color: 'var(--color-coral)', fontWeight: 'bold' }}>✕</span>
            <span>{displayError}</span>
          </div>
        ) : null}

        <TextField
          id="new-password"
          label="Nueva contraseña"
          type={showPassword ? 'text' : 'password'}
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (localError) setLocalError(null);
          }}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5B91A5',
                outline: 'none',
              }}>
              {showPassword ? <EyeOff size={19} color="#5B91A5" /> : <Eye size={19} color="#5B91A5" />}
            </button>
          }
          disabled={loading}
          autoComplete="new-password"
          required
        />

        <TextField
          id="confirm-password"
          label="Confirmar contraseña"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Repite la nueva contraseña"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (localError) setLocalError(null);
          }}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5B91A5',
                outline: 'none',
              }}>
              {showConfirmPassword ? <EyeOff size={19} color="#5B91A5" /> : <Eye size={19} color="#5B91A5" />}
            </button>
          }
          disabled={loading}
          autoComplete="new-password"
          required
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginBottom: '24px',
            marginTop: '-6px',
          }}>
          <span style={{ fontSize: '12px', color: 'var(--color-steel)' }}>
            Mínimo 8 caracteres
          </span>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando contraseña...' : 'Guardar nueva contraseña'}
        </Button>
      </form>
    </Card>
  );
}
