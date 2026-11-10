import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LogOut, RefreshCw, ShieldAlert } from 'lucide-react-native';

import { useSession } from '../model/session-context';
import { COLORS } from '@/shared/theme';

export function ProfileErrorView() {
  const { user, signOut, refreshProfile } = useSession();
  const [retrying, setRetrying] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleRetry = async () => {
    if (retrying || signingOut) return;
    setRetrying(true);
    try {
      await refreshProfile();
    } catch (err) {
      console.error('Error al reintentar verificación de perfil:', err);
    } finally {
      setRetrying(false);
    }
  };

  const handleSignOut = async () => {
    if (signingOut || retrying) return;
    setSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled">
        <View className="mx-auto w-full max-w-[440px] flex-1 px-6 pb-8">
          {/* Barra superior */}
          <View className="flex-row items-center justify-between pb-6 pt-3">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-petrol">
                <Text className="text-lg font-bold text-white">T</Text>
              </View>
              <View>
                <Text className="text-lg font-bold tracking-tight text-petrol">TickDesk</Text>
                <Text className="text-[10px] font-semibold tracking-[2px] text-steel">
                  SUPPORT SYSTEM
                </Text>
              </View>
            </View>

            {/* Píldora de estado restringido */}
            <View className="flex-row items-center gap-2 rounded-full border border-coral/30 bg-coral/10 px-3 py-1.5">
              <View className="h-2 w-2 rounded-full bg-coral" />
              <Text className="text-[10px] font-semibold tracking-[1.2px] text-coral">
                SIN ACCESO
              </Text>
            </View>
          </View>

          {/* Tarjeta de estado seguro / perfil no disponible */}
          <View className="mt-4 rounded-3xl border border-sky/50 bg-white p-6 shadow-sm">
            <View className="items-center text-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-coral/15">
                <ShieldAlert color={COLORS.CORAL} size={32} />
              </View>

              <Text className="text-center text-xl font-bold tracking-tight text-petrol">
                Acceso no autorizado
              </Text>

              <Text className="mt-2 text-center text-xs leading-5 text-steel">
                Tu cuenta ha iniciado sesión correctamente, pero no cuenta con un perfil asignado o con un rol autorizado (solicitante, soporte o administrador) en el sistema.
              </Text>

              {/* Caja informativa de usuario */}
              <View className="mt-5 w-full rounded-2xl border border-sky/40 bg-canvas p-3.5">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-steel">
                  Cuenta autenticada
                </Text>
                <Text className="mt-0.5 text-xs font-semibold text-petrol" numberOfLines={1}>
                  {user?.email || 'Sin correo asociado'}
                </Text>
              </View>

              <Text className="mt-4 text-center text-[11px] text-steel">
                Por motivos de seguridad, el acceso a los paneles permanece bloqueado. Si se trata de un nuevo usuario, contacta al administrador.
              </Text>
            </View>
          </View>

          {/* Botones de acción */}
          <View className="mt-6 gap-3">
            <Pressable
              accessibilityHint="Vuelve a consultar el perfil del usuario en el sistema."
              accessibilityRole="button"
              className={`h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-petrol shadow-sm active:bg-petrol/90 ${
                retrying ? 'opacity-70' : ''
              }`}
              disabled={retrying || signingOut}
              onPress={handleRetry}>
              {retrying ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <RefreshCw color="#FFFFFF" size={18} />
                  <Text className="text-sm font-semibold text-white">Reintentar verificación</Text>
                </>
              )}
            </Pressable>

            <Pressable
              accessibilityHint="Cierra la sesión actual y regresa a la pantalla de ingreso."
              accessibilityRole="button"
              className={`h-14 flex-row items-center justify-center gap-2 rounded-2xl border border-coral/30 bg-white active:bg-coral/5 ${
                signingOut ? 'opacity-70' : ''
              }`}
              disabled={signingOut || retrying}
              onPress={handleSignOut}>
              {signingOut ? (
                <ActivityIndicator color={COLORS.CORAL} />
              ) : (
                <>
                  <LogOut color={COLORS.CORAL} size={18} />
                  <Text className="text-sm font-semibold text-coral">Cerrar sesión</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Pie de página */}
          <View className="mt-auto items-center pt-8">
            <Text className="text-xs text-steel">TickDesk · Soporte técnico · EPN</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
