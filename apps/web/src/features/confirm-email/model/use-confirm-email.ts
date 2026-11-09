import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { EmailOtpType } from '@supabase/supabase-js';
import { supabase } from '@/shared/lib/supabase/client';

export type ConfirmStatus = 'loading' | 'success' | 'expired' | 'error';

type ConfirmResult = {
  status: ConfirmStatus;
  message: string;
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

export function useConfirmEmail(): ConfirmResult {
  const location = useLocation();
  const [status, setStatus] = useState<ConfirmStatus>('loading');
  const [message, setMessage] = useState<string>('Verificando tu correo electrónico...');
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    async function verify() {
      try {
        const queryParams = new URLSearchParams(location.search);
        const hashParams = parseHashParams(location.hash);

        // Limpiar parámetros sensibles de la barra de navegación para evitar persistencia en historial
        if (window.location.search || window.location.hash) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        // 1. Detectar si la URL entrante contiene parámetros de error explícitos
        const errorCode = queryParams.get('error_code') || hashParams['error_code'];
        const errorDesc = queryParams.get('error_description') || hashParams['error_description'];
        const error = queryParams.get('error') || hashParams['error'];

        if (errorCode || error) {
          if (
            errorCode === 'otp_expired' ||
            (errorDesc && errorDesc.toLowerCase().includes('expired')) ||
            (error && error.toLowerCase().includes('expired'))
          ) {
            setStatus('expired');
            setMessage('El enlace ha caducado o ya ha sido utilizado.');
            return;
          }

          setStatus('error');
          setMessage(decodeURIComponent(errorDesc || error || 'Ocurrió un error en la verificación.'));
          return;
        }

        // 2. Comprobar si el tipo es de recuperación de contraseña (no confundir operaciones)
        const rawType = queryParams.get('type') || hashParams['type'];
        if (rawType === 'recovery') {
          setStatus('error');
          setMessage(
            'Este enlace corresponde a la recuperación de contraseña, no a la confirmación de cuenta. Por favor, utiliza la opción correspondiente.'
          );
          return;
        }

        // 3. Formato A: token_hash y type (Email OTP verification)
        const tokenHash = queryParams.get('token_hash');
        const emailType = rawType as EmailOtpType | null;

        if (tokenHash && emailType) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: emailType,
          });

          if (verifyError) {
            const msg = verifyError.message.toLowerCase();
            if (msg.includes('expired') || msg.includes('invalid')) {
              setStatus('expired');
              setMessage('El enlace ha caducado o ya ha sido utilizado.');
            } else {
              setStatus('error');
              setMessage(verifyError.message);
            }
            return;
          }

          setStatus('success');
          setMessage('¡Tu correo electrónico ha sido confirmado correctamente!');
          return;
        }

        // 4. Formato B: Flujo PKCE mediante parámetro code
        const code = queryParams.get('code');

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            const msg = exchangeError.message.toLowerCase();
            if (msg.includes('expired') || msg.includes('invalid')) {
              setStatus('expired');
              setMessage('El enlace ha caducado o ya ha sido utilizado.');
            } else {
              setStatus('error');
              setMessage(exchangeError.message);
            }
            return;
          }

          setStatus('success');
          setMessage('¡Tu correo electrónico ha sido confirmado correctamente!');
          return;
        }

        // 5. Formato C: Fragmento URL con access_token y refresh_token
        const accessToken = hashParams['access_token'];
        const refreshToken = hashParams['refresh_token'];

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setStatus('error');
            setMessage(sessionError.message);
            return;
          }

          setStatus('success');
          setMessage('¡Tu correo electrónico ha sido confirmado correctamente!');
          return;
        }

        // 6. Verificar si ya existe una sesión activa y confirmada en el cliente
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.email_confirmed_at) {
          setStatus('success');
          setMessage('¡Tu correo electrónico ya se encuentra confirmado!');
          return;
        }

        // 7. Si no se recibieron parámetros válidos
        setStatus('error');
        setMessage('No se encontraron parámetros de verificación válidos en el enlace.');
      } catch (err: unknown) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Error inesperado durante la verificación.');
      }
    }

    verify();
  }, [location.search, location.hash]);

  return { status, message };
}
