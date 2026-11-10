import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { AuthError } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Eye, EyeOff } from 'lucide-react-native';

import { supabase } from '@/shared/lib/supabase';
import { useSession, type UserRole } from '@/entities/session';
import { COLORS } from '@/shared/theme';
import { TextField } from '@/shared/ui/text-field';
import { ForgotPasswordModal } from './forgot-password-modal';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type TargetRoute = `/${UserRole}` | '/dashboard';

function getFriendlyErrorMessage(error: AuthError): string {
  const message = error.message.toLowerCase();
  if (message.includes('invalid login credentials')) {
    return 'Credenciales incorrectas. Verifica tu correo y contraseña.';
  }
  if (message.includes('email not confirmed')) {
    return 'Tu correo electrónico no ha sido confirmado. Revisa tu bandeja de entrada.';
  }
  if (message.includes('too many requests')) {
    return 'Demasiados intentos fallidos. Espera unos momentos antes de reintentar.';
  }
  return error.message || 'Ocurrió un error al iniciar sesión. Inténtalo de nuevo.';
}

export function LoginForm() {
  const { profile } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (loading || googleLoading) return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Por favor, ingresa tu correo electrónico.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMessage('Ingresa un correo electrónico válido (ej. usuario@empresa.com).');
      return;
    }

    if (!password) {
      setErrorMessage('Por favor, ingresa tu contraseña.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
      return;
    }

    // Sesión iniciada con éxito -> Dirigir al usuario a su panel correspondiente según su rol
    const targetRoute: TargetRoute = profile?.role ? `/${profile.role}` : '/dashboard';
    router.replace({ pathname: targetRoute, params: { welcome: '1' } });
  };

  const handleGoogleLogin = async () => {
    if (loading || googleLoading) return;
    setGoogleLoading(true);
    setErrorMessage(null);

    try {
      WebBrowser.maybeCompleteAuthSession();
      const redirectTo = Linking.createURL('google-auth');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error('Error al iniciar OAuth con Google:', error);
        if (
          error.message?.toLowerCase().includes('not enabled') ||
          error.message?.toLowerCase().includes('unsupported provider')
        ) {
          setErrorMessage(
            'El proveedor de Google no está habilitado en la consola de Supabase. Revisa las credenciales de Google Cloud Console.'
          );
        } else {
          setErrorMessage(error.message || 'No se pudo iniciar sesión con Google.');
        }
        return;
      }

      if (!data?.url) {
        setErrorMessage('No se recibió la URL de autenticación de Google desde Supabase.');
        return;
      }

      // Abrir sesión segura en el navegador del dispositivo (Custom Tabs en Android)
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (res.type === 'success' && res.url) {
        const parsed = Linking.parse(res.url);
        const code =
          typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : undefined;

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (
            exchangeError &&
            !exchangeError.message.toLowerCase().includes('already') &&
            !exchangeError.message.toLowerCase().includes('flow state')
          ) {
            console.error('Error al intercambiar código:', exchangeError.message);
            setErrorMessage(exchangeError.message || 'Error al autenticar con Google.');
          }
        } else if (res.url.includes('access_token')) {
          const hashOrQuery = res.url.includes('#') ? res.url.split('#')[1] : res.url.split('?')[1];
          if (hashOrQuery) {
            const params = new URLSearchParams(hashOrQuery);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            if (accessToken && refreshToken) {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (sessionError) {
                console.error('Error al establecer sesión:', sessionError.message);
                setErrorMessage(sessionError.message || 'Error al establecer sesión con Google.');
              }
            }
          }
        }
      } else if (res.type === 'cancel' || res.type === 'dismiss') {
        console.info('Inicio de sesión con Google cancelado por el usuario.');
      }
    } catch (err) {
      console.error('Excepción al conectar con Google OAuth:', err);
      const msg = err instanceof Error ? err.message : 'Error de conexión al conectar con Google.';
      setErrorMessage(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View className="w-full">
      <View className="gap-5">
        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading && !googleLoading}
          keyboardType="email-address"
          label="Correo electrónico"
          onChangeText={(val) => {
            setEmail(val);
            if (errorMessage) setErrorMessage(null);
          }}
          placeholder="nombre@empresa.com"
          value={email}
        />

        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading && !googleLoading}
          label="Contraseña"
          onChangeText={(val) => {
            setPassword(val);
            if (errorMessage) setErrorMessage(null);
          }}
          placeholder="Tu contraseña"
          rightElement={
            <Pressable
              accessibilityHint="Muestra u oculta los caracteres de la contraseña."
              accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setShowPassword((prev) => !prev)}>
              {showPassword ? (
                <EyeOff color={COLORS.STEEL} size={20} />
              ) : (
                <Eye color={COLORS.STEEL} size={20} />
              )}
            </Pressable>
          }
          secureTextEntry={!showPassword}
          value={password}
        />
      </View>

      <View className="mt-3 flex-row justify-end">
        <Pressable
          accessibilityRole="button"
          disabled={loading || googleLoading}
          hitSlop={8}
          onPress={() => setForgotModalVisible(true)}>
          <Text className="text-xs font-semibold text-coral">¿Olvidaste tu contraseña?</Text>
        </Pressable>
      </View>

      {errorMessage ? (
        <View className="mt-4 rounded-xl border border-coral/30 bg-coral/10 p-3">
          <Text className="text-center text-xs font-medium text-coral">{errorMessage}</Text>
        </View>
      ) : null}

      <Pressable
        accessibilityHint="Inicia sesión con tus credenciales tradicionales."
        accessibilityRole="button"
        className={`mt-7 h-14 items-center justify-center rounded-2xl bg-coral ${
          loading || googleLoading ? 'opacity-70' : 'active:opacity-90'
        }`}
        disabled={loading || googleLoading}
        onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-[15px] font-semibold text-white">Iniciar sesión</Text>
        )}
      </Pressable>

      <View className="my-6 flex-row items-center gap-4">
        <View className="h-px flex-1 bg-sky" />
        <Text className="text-[11px] font-medium tracking-[1px] text-steel">O CONTINÚA CON</Text>
        <View className="h-px flex-1 bg-sky" />
      </View>

      <Pressable
        accessibilityHint="Inicia sesión con tu cuenta de Google."
        accessibilityRole="button"
        className={`h-14 flex-row items-center justify-center gap-3 rounded-2xl border border-sky bg-white ${
          loading || googleLoading ? 'opacity-70' : 'active:bg-canvas'
        }`}
        disabled={loading || googleLoading}
        onPress={handleGoogleLogin}>
        {googleLoading ? (
          <ActivityIndicator color={COLORS.PETROL} size="small" />
        ) : (
          <>
            <View className="h-7 w-7 items-center justify-center rounded-full bg-canvas border border-sky/50">
              <Text className="text-sm font-extrabold text-petrol">G</Text>
            </View>
            <Text className="text-sm font-semibold text-petrol">Continuar con Google</Text>
          </>
        )}
      </Pressable>

      <View className="mt-7 flex-row items-center justify-center gap-1">
        <Text className="text-sm text-steel">¿Aún no tienes una cuenta?</Text>
        <Pressable
          accessibilityRole="button"
          disabled={loading || googleLoading}
          hitSlop={8}
          onPress={() => router.push('/register')}>
          <Text className="text-sm font-semibold text-petrol">Crear cuenta</Text>
        </Pressable>
      </View>

      {forgotModalVisible ? (
        <ForgotPasswordModal
          initialEmail={email}
          onClose={() => setForgotModalVisible(false)}
          visible={forgotModalVisible}
        />
      ) : null}
    </View>
  );
}
