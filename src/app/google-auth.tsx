import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { AlertCircle } from 'lucide-react-native';

import { useSession } from '@/entities/session';
import { supabase } from '@/shared/lib/supabase';
import { COLORS } from '@/shared/theme';

export default function GoogleAuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_description?: string;
  }>();

  const { session, profile, isLoading, setPendingWelcome } = useSession();
  const initialError =
    params.error_description || params.error || null;
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);
  const attemptedCodeRef = useRef<string | null>(null);

  // 1. Si la sesión y el perfil ya están resueltos, redirigir al panel correspondiente con bienvenida
  useEffect(() => {
    if (session && profile && !isLoading) {
      setPendingWelcome(true);
      router.replace({
        pathname: `/${profile.role}`,
        params: { welcome: '1' },
      });
    }
  }, [session, profile, isLoading, router, setPendingWelcome]);

  // 2. Procesar el callback de autenticación (código PKCE o tokens)
  useEffect(() => {
    if (initialError || session) return;

    let isMounted = true;

    const processAuthCallback = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        const rawUrl = initialUrl || '';

        // Buscar código en query params o mediante expresión regular en la URL completa
        let code = params.code;
        if (!code && rawUrl.includes('code=')) {
          const match = rawUrl.match(/[?&#]code=([^&#]+)/);
          if (match) {
            code = decodeURIComponent(match[1]);
          }
        }

        if (code && attemptedCodeRef.current !== code) {
          attemptedCodeRef.current = code;
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            // Si el código ya fue consumido por el listener global de SessionProvider, no es un error fatal
            const msg = error.message.toLowerCase();
            if (!msg.includes('already') && !msg.includes('flow state')) {
              if (isMounted) {
                setErrorMessage(error.message);
              }
            }
          }
          return;
        }

        // Manejo de tokens en fragmento hash (#access_token=...&refresh_token=...)
        if (rawUrl.includes('access_token=') && rawUrl.includes('refresh_token=')) {
          const accessMatch = rawUrl.match(/[?&#]access_token=([^&#]+)/);
          const refreshMatch = rawUrl.match(/[?&#]refresh_token=([^&#]+)/);
          if (accessMatch && refreshMatch) {
            const accessToken = decodeURIComponent(accessMatch[1]);
            const refreshToken = decodeURIComponent(refreshMatch[1]);
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error && isMounted) {
              setErrorMessage(error.message);
            }
          }
        }
      } catch (err: unknown) {
        console.warn('Excepción al procesar callback de Google OAuth:', err);
      }
    };

    processAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [params.code, initialError, session]);

  if (errorMessage) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas px-6">
        <StatusBar style="dark" />
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-coral/10">
          <AlertCircle color={COLORS.CORAL} size={32} />
        </View>
        <Text className="text-center text-lg font-bold text-petrol">
          No se pudo iniciar sesión con Google
        </Text>
        <Text className="mt-2 text-center text-xs leading-5 text-steel max-w-[280px]">
          {errorMessage}
        </Text>

        <Pressable
          accessibilityRole="button"
          className="mt-6 h-12 w-full max-w-[260px] items-center justify-center rounded-2xl bg-petrol active:bg-petrol/90"
          onPress={() => router.replace('/')}>
          <Text className="text-sm font-semibold text-white">
            Volver al inicio de sesión
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-canvas px-6">
      <StatusBar style="dark" />
      <ActivityIndicator color={COLORS.PETROL} size="large" />
      <Text className="mt-4 text-base font-bold text-petrol">
        Completando inicio de sesión...
      </Text>
      <Text className="mt-1 text-xs text-steel">
        Cargando tu perfil y rol en TickDesk
      </Text>
    </View>
  );
}
