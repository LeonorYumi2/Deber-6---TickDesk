import '../../global.css';

import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SessionProvider, useSession } from '@/entities/session';
import { COLORS } from '@/shared/theme';

function RootNavigationLayout() {
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const hasCheckedInitialSession = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = !segments[0] || segments[0] === 'register';
    const inProtectedGroup = segments[0] === 'dashboard';

    // 1. Verificación inicial de sesión persistida (arranque en frío).
    // Si ya existe sesión, redirigir al Dashboard de forma limpia (sin parámetros de bienvenida).
    if (!hasCheckedInitialSession.current) {
      hasCheckedInitialSession.current = true;
      if (session && inAuthGroup) {
        router.replace('/dashboard');
      }
      return;
    }

    // 2. Si no hay sesión activa y se intenta acceder o permanecer en una ruta protegida (ej. tras logout)
    if (!session && inProtectedGroup) {
      router.replace('/');
    }
  }, [session, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <StatusBar style="dark" />
        <ActivityIndicator color={COLORS.PETROL} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootNavigationLayout />
    </SessionProvider>
  );
}
