import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { AppActions } from '@/shared/ui/app-actions';
import { useResetPassword } from '../model/use-reset-password';

export function ResetPasswordForm() {
  const { stage, errorMessage, loading, updatePassword } = useResetPassword();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedPassword) {
      setLocalError('Ingresa tu nueva contraseña.');
      return;
    }

    if (trimmedPassword.length < 8) {
      setLocalError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (!trimmedConfirm) {
      setLocalError('Confirma tu nueva contraseña.');
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
            Verificando enlace
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-sm)',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}
          >
            Comprobando la validez de tu solicitud de restablecimiento...
          </p>
        </div>
      </Card>
    );
  }

  // 2. Estado: Éxito tras actualizar la contraseña
  if (stage === 'success') {
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
            Contraseña actualizada
          </h2>

          <p
            style={{
              margin: '0 0 20px 0',
              fontSize: 'var(--font-sm)',
              lineHeight: 1.5,
              color: 'var(--color-text-muted)',
            }}
          >
            Tu contraseña se restableció correctamente. Ya puedes iniciar sesión en TickDesk con tu nueva clave.
          </p>

          <AppActions />
        </div>
      </Card>
    );
  }

  // 3. Estado: Enlace inválido o expirado
  if (stage === 'invalid_link') {
    const isExpired =
      errorMessage?.toLowerCase().includes('caducado') ||
      errorMessage?.toLowerCase().includes('expirado') ||
      errorMessage?.toLowerCase().includes('expired');

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
            {isExpired ? <Clock size={28} strokeWidth={2.2} /> : <AlertTriangle size={28} strokeWidth={2.2} />}
          </div>

          <h2
            style={{
              margin: '0 0 10px 0',
              fontSize: 'var(--font-xl)',
              fontWeight: 700,
              color: 'var(--color-petrol)',
            }}
          >
            {isExpired ? 'Enlace caducado' : 'Enlace no válido'}
          </h2>

          <p
            style={{
              margin: '0 0 20px 0',
              fontSize: 'var(--font-sm)',
              lineHeight: 1.5,
              color: 'var(--color-text-muted)',
            }}
          >
            {errorMessage ||
              'El enlace de recuperación ha expirado o no es válido. Puedes solicitar uno nuevo desde la app móvil.'}
          </p>

          <AppActions />
        </div>
      </Card>
    );
  }

  // 4. Estado: Formulario principal de restablecimiento
  const displayError = localError || errorMessage;

  return (
    <Card maxWidth="420px">
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: '24px' }}>
          <h2
            style={{
              margin: '0 0 8px 0',
              fontSize: 'var(--font-xl)',
              fontWeight: 700,
              color: 'var(--color-petrol)',
              letterSpacing: '-0.3px',
            }}
          >
            Restablecer contraseña
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-sm)',
              lineHeight: 1.5,
              color: 'var(--color-text-muted)',
            }}
          >
            Ingresa tu nueva contraseña para acceder a TickDesk.
          </p>
        </div>

        {displayError ? (
          <div
            style={{
              backgroundColor: 'rgba(242, 140, 91, 0.08)',
              border: '1px solid rgba(242, 140, 91, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              marginBottom: '18px',
              fontSize: 'var(--font-xs)',
              color: 'var(--color-coral)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
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
                color: 'var(--color-steel)',
                outline: 'none',
              }}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
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
                color: 'var(--color-steel)',
                outline: 'none',
              }}
            >
              {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          }
          disabled={loading}
          autoComplete="new-password"
          required
        />

        <div style={{ marginTop: '8px' }}>
          <Button
            type="submit"
            variant="petrol"
            size="md"
            fullWidth
            loading={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
