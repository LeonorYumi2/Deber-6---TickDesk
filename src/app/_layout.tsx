import '../../global.css';

import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useGlobalSearchParams, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ProfileErrorView, SessionProvider, useSession, type UserRole } from '@/entities/session';
import { COLORS } from '@/shared/theme';

type RolePath = `/${UserRole}`;

function RootNavigationLayout() {
  const { session, profile, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const globalParams = useGlobalSearchParams<{ welcome?: string }>();
  const hasCheckedInitialSession = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const currentSegment = segments[0] as string | undefined;
    const isAuthRoute =
      !currentSegment || currentSegment === 'register' || currentSegment === 'google-auth';

    // 1. Sin sesión: solo puede acceder a login y registro.
    if (!session) {
      hasCheckedInitialSession.current = true;
      if (!isAuthRoute) {
        router.replace('/');
      }
      return;
    }

    // 2. Con sesión pero sin perfil válido:
    // El render se encarga de mostrar ProfileErrorView y bloquear cualquier panel.
    if (!profile) {
      hasCheckedInitialSession.current = true;
      return;
    }

    // 3. Con sesión y perfil válido: solo puede acceder al panel correspondiente a su rol.
    const targetPath: RolePath = `/${profile.role}`;

    // Verificación inicial de sesión persistida (arranque en frío).
    // Si ya existe sesión, redirigir al panel del rol de forma limpia (sin parámetros de bienvenida).
    if (!hasCheckedInitialSession.current) {
      hasCheckedInitialSession.current = true;
      if (currentSegment !== profile.role) {
        router.replace(targetPath);
      }
      return;
    }

    // Si el usuario se encuentra en login, registro, dashboard o en el panel de otro rol, redirigir a su panel.
    if (currentSegment !== profile.role) {
      const welcome = globalParams.welcome;
      if (welcome === '1') {
        router.replace({ pathname: targetPath, params: { welcome: '1' } });
      } else {
        router.replace(targetPath);
      }
    }
  }, [session, profile, isLoading, segments, globalParams.welcome, router]);

  // Mientras isLoading sea true, mostrar la pantalla de carga sin redireccionar.
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <StatusBar style="dark" />
        <ActivityIndicator color={COLORS.PETROL} size="large" />
      </View>
    );
  }

  // Si existe sesión pero el perfil no es válido o no se pudo obtener, no conceder acceso a ningún panel.
  // Mostrar un estado seguro con opción de cerrar sesión o reintentar.
  if (session && !profile) {
    return <ProfileErrorView />;
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
