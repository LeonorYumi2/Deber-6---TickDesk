import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/shared/lib/supabase/client';

export type ResetPasswordStage = 'verifying' | 'ready' | 'success' | 'invalid_link';

type UseResetPasswordResult = {
  stage: ResetPasswordStage;
  errorMessage: string | null;
  loading: boolean;
  updatePassword: (password: string, confirmPassword: string) => Promise<boolean>;
};

function parseHashParams(hash: string): Record<string, string> {
  const clean = hash.replace(/^#/, '');
  if (!clean) return {};
  const params = new URLSearchParams(clean);
  const result: Record<string, string> = {};
  params.forEach((val, key) => {
    result[key] = val;
  });
  return result;
}

export function useResetPassword(): UseResetPasswordResult {
  const location = useLocation();
  const [stage, setStage] = useState<ResetPasswordStage>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hasExecutedRef = useRef(false);
  const isRecoveryValidatedRef = useRef(false);

  // Escuchar eventos globales de cambio de autenticación para detectar exclusivamente PASSWORD_RECOVERY
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // Únicamente el evento PASSWORD_RECOVERY confirma un flujo de recuperación legítimo.
      // Un evento SIGNED_IN ordinario NO es suficiente.
      if (event === 'PASSWORD_RECOVERY') {
        isRecoveryValidatedRef.current = true;
        setStage('ready');
        setErrorMessage(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    async function initRecovery() {
      try {
        const queryParams = new URLSearchParams(location.search);
        const hashParams = parseHashParams(location.hash);

        // Limpiar parámetros sensibles de la barra de direcciones de forma inmediata
        if (window.location.search || window.location.hash) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        // 1. Detectar si la URL contiene errores reportados por Supabase
        const errorCode = queryParams.get('error_code') || hashParams['error_code'];
        const errorDesc = queryParams.get('error_description') || hashParams['error_description'];
        const error = queryParams.get('error') || hashParams['error'];

        if (errorCode || error) {
          setStage('invalid_link');
          setErrorMessage(
            errorCode === 'otp_expired' || (errorDesc && errorDesc.toLowerCase().includes('expired'))
              ? 'El enlace de recuperación ha caducado o ya ha sido utilizado. Por favor, solicita uno nuevo desde la aplicación TickDesk.'
              : decodeURIComponent(errorDesc || error || 'El enlace de recuperación no es válido.')
          );
          return;
        }

        const queryType = queryParams.get('type');
        const hashType = hashParams['type'];
        const type = queryType || hashType;

        // 2. Formato A: token_hash con type=recovery
        const tokenHash = queryParams.get('token_hash');
        if (tokenHash) {
          if (type !== 'recovery') {
            setStage('invalid_link');
            setErrorMessage('El enlace no corresponde a una solicitud de recuperación de contraseña.');
            return;
          }

          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          });

          if (verifyError) {
            setStage('invalid_link');
            setErrorMessage(
              verifyError.message?.toLowerCase().includes('expired')
                ? 'El enlace de recuperación ha caducado o ya ha sido utilizado.'
                : 'El enlace de recuperación no es válido o ha expirado.'
            );
            return;
          }

          isRecoveryValidatedRef.current = true;
          setStage('ready');
          return;
        }

        // 3. Formato B: Flujo PKCE mediante parámetro code
        const code = queryParams.get('code');
        if (code) {
          if (type && type !== 'recovery') {
            setStage('invalid_link');
            setErrorMessage('El código recibido no corresponde a una solicitud de recuperación de contraseña.');
            return;
          }

          // Preparamos un listener previo para evitar condiciones de carrera.
          // Solo se validará la recuperación si Supabase emite el evento PASSWORD_RECOVERY.
          let isPasswordRecoveryConfirmed = false;

          const {
            data: { subscription: pkceListener },
          } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
              isPasswordRecoveryConfirmed = true;
              isRecoveryValidatedRef.current = true;
            }
          });

          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          // Pausa breve para permitir la propagación del evento por el emisor de Supabase
          await new Promise((resolve) => setTimeout(resolve, 50));
          pkceListener.unsubscribe();

          if (exchangeError) {
            setStage('invalid_link');
            setErrorMessage(
              exchangeError.message?.toLowerCase().includes('expired')
                ? 'El código de recuperación ha caducado o ya ha sido utilizado.'
                : 'El código de recuperación no es válido o ha expirado.'
            );
            return;
          }

          // Verificación estricta: No aceptar SIGNED_IN. Solo aceptar si se confirmó PASSWORD_RECOVERY.
          if (!isPasswordRecoveryConfirmed && !isRecoveryValidatedRef.current) {
            // Cerramos la sesión ordinaria abierta por error para no dejarla activa en la web
            await supabase.auth.signOut();
            isRecoveryValidatedRef.current = false;
            setStage('invalid_link');
            setErrorMessage(
              'El código proporcionado no corresponde a un flujo de recuperación de contraseña.'
            );
            return;
          }

          setStage('ready');
          return;
        }

        // 4. Formato C: Fragmento hash (#access_token=...&refresh_token=...&type=recovery)
        const accessToken = hashParams['access_token'];
        const refreshToken = hashParams['refresh_token'];

        if (accessToken && refreshToken) {
          if (hashType !== 'recovery') {
            setStage('invalid_link');
            setErrorMessage('Los parámetros recibidos no corresponden a un flujo de recuperación de contraseña.');
            return;
          }

          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setStage('invalid_link');
            setErrorMessage('No se pudo establecer la sesión de recuperación: ' + sessionError.message);
            return;
          }

          isRecoveryValidatedRef.current = true;
          setStage('ready');
          return;
        }

        // 5. Si ya fue validado por el evento PASSWORD_RECOVERY
        if (isRecoveryValidatedRef.current) {
          setStage('ready');
          return;
        }

        // 6. Si no hay parámetros de recuperación válidos, denegar acceso.
        // Nunca se acepta una sesión ordinaria preexistente como sesión de recuperación.
        setStage('invalid_link');
        setErrorMessage(
          'No se encontró una sesión de recuperación válida. Por motivos de seguridad, no está permitido acceder sin un enlace de recuperación emitido por TickDesk.'
        );
      } catch (err: unknown) {
        setStage('invalid_link');
        setErrorMessage(err instanceof Error ? err.message : 'Error inesperado al validar el enlace.');
      }
    }

    initRecovery();
  }, [location.search, location.hash]);

  const updatePassword = async (password: string, confirmPassword: string): Promise<boolean> => {
    if (!isRecoveryValidatedRef.current) {
      setErrorMessage('Operación no permitida: no se ha validado un flujo de recuperación de contraseña.');
      return false;
    }

    const trimmedPassword = password ? password.trim() : '';
    const trimmedConfirm = confirmPassword ? confirmPassword.trim() : '';

    if (!trimmedPassword) {
      setErrorMessage('Por favor, ingresa tu nueva contraseña.');
      return false;
    }

    if (trimmedPassword.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      return false;
    }

    if (!trimmedConfirm) {
      setErrorMessage('Por favor, confirma tu nueva contraseña.');
      return false;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setErrorMessage('Las contraseñas no coinciden.');
      return false;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: trimmedPassword,
      });

      setLoading(false);

      if (error) {
        setErrorMessage(error.message || 'No se pudo actualizar la contraseña.');
        return false;
      }

      setStage('success');
      // Cerramos la sesión en la web tras el cambio para que el usuario inicie sesión limpiamente en la app móvil
      await supabase.auth.signOut();
      return true;
    } catch (err: unknown) {
      setLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'Error al procesar la actualización.');
      return false;
    }
  };

  return {
    stage,
    errorMessage,
    loading,
    updatePassword,
  };
}
