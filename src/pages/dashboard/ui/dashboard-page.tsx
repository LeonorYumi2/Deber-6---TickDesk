import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { CheckCircle2, Clock, LogOut, Ticket } from 'lucide-react-native';

import { useSession } from '@/entities/session';
import { SignOutConfirmModal } from '@/features/auth';
import { COLORS } from '@/shared/theme';
import { WelcomeModal } from '@/widgets/welcome-modal';

function getContextualGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    return 'Buenos días';
  }
  if (hour >= 12 && hour < 19) {
    return 'Buenas tardes';
  }
  return 'Buenas noches';
}

type DashboardPageProps = {
  welcome?: string;
};

export function DashboardPage({ welcome: welcomeProp }: DashboardPageProps = {}) {
  const { user } = useSession();
  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);
  const routeParams = useLocalSearchParams<{ welcome?: string }>();
  const welcomeParam = welcomeProp ?? routeParams.welcome;

  // Estado para controlar la visibilidad del modal de bienvenida
  const [isWelcomeModalVisible, setIsWelcomeModalVisible] = useState(welcomeParam === '1');
  const welcomeHandledRef = useRef(false);

  // Escuchar si useLocalSearchParams se hidrata después del primer render tick
  useEffect(() => {
    if (welcomeParam === '1' && !welcomeHandledRef.current) {
      welcomeHandledRef.current = true;
      setIsWelcomeModalVisible(true);
    }
  }, [welcomeParam]);

  const greeting = getContextualGreeting();

  const displayName =
    typeof user?.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : user?.email || 'Usuario';

  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-canvas" style={{ flex: 1 }}>
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

            {/* Píldora de estado alineada a la paleta TickDesk (sin verde no corporativo) */}
            <View className="flex-row items-center gap-2 rounded-full border border-sky/60 bg-white px-3 py-1.5">
              <View className="h-2 w-2 rounded-full bg-steel" />
              <Text className="text-[10px] font-semibold tracking-[1.2px] text-steel">
                CONECTADO
              </Text>
            </View>
          </View>

          {/* Tarjeta de bienvenida y perfil */}
          <View className="mt-2 rounded-3xl border border-sky/50 bg-white p-6 shadow-sm">
            <View className="flex-row items-center gap-4">
              {/* Avatar e información habitual en el Dashboard */}
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-petrol/10">
                <Text className="text-2xl font-bold text-petrol">{userInitial}</Text>
              </View>

              <View className="flex-1">
                <Text className="text-[11px] font-bold tracking-[1.5px] text-steel">
                  {greeting.toUpperCase()}
                </Text>
                <Text className="mt-0.5 text-xl font-bold tracking-tight text-petrol" numberOfLines={1}>
                  {displayName}
                </Text>
                <Text className="mt-0.5 text-xs text-steel" numberOfLines={1}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Resumen de tickets provisional con tokens de color de TickDesk */}
          <View className="mt-6">
            <Text className="mb-3 text-[11px] font-bold tracking-[2px] text-steel">
              RESUMEN DE ACTIVIDAD
            </Text>

            <View className="flex-row gap-3">
              <View className="flex-1 rounded-2xl border border-sky/40 bg-white p-4">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-xl bg-petrol/10">
                  <Ticket color={COLORS.PETROL} size={16} />
                </View>
                <Text className="text-2xl font-bold text-petrol">0</Text>
                <Text className="text-xs text-steel">Abiertos</Text>
              </View>

              <View className="flex-1 rounded-2xl border border-sky/40 bg-white p-4">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-xl bg-coral/10">
                  <Clock color={COLORS.CORAL} size={16} />
                </View>
                <Text className="text-2xl font-bold text-petrol">0</Text>
                <Text className="text-xs text-steel">En proceso</Text>
              </View>

              <View className="flex-1 rounded-2xl border border-sky/40 bg-white p-4">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-xl bg-sky/30">
                  <CheckCircle2 color={COLORS.STEEL} size={16} />
                </View>
                <Text className="text-2xl font-bold text-petrol">0</Text>
                <Text className="text-xs text-steel">Resueltos</Text>
              </View>
            </View>
          </View>

          {/* Nota informativa de Dashboard provisional */}
          <View className="mt-6 rounded-2xl border border-sky/30 bg-sky/15 p-4">
            <Text className="text-xs font-semibold text-petrol">
              Panel de control provisional
            </Text>
            <Text className="mt-1 text-xs leading-5 text-steel">
              Tu sesión se encuentra activa y persistida de forma segura. La creación y el seguimiento detallado de tickets se habilitarán en la siguiente etapa del proyecto.
            </Text>
          </View>

          {/* Botón de cierre de sesión con confirmación */}
          <Pressable
            accessibilityHint="Abre la ventana para confirmar el cierre de sesión."
            accessibilityRole="button"
            className="mt-8 h-14 flex-row items-center justify-center gap-3 rounded-2xl border border-coral/30 bg-white active:bg-coral/5"
            onPress={() => setIsSignOutModalVisible(true)}>
            <LogOut color={COLORS.CORAL} size={18} />
            <Text className="text-sm font-semibold text-coral">Cerrar sesión</Text>
          </Pressable>

          {/* Pie de página */}
          <View className="mt-auto items-center pt-8">
            <Text className="text-xs text-steel">TickDesk · Soporte técnico · EPN</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal de confirmación antes de cerrar sesión */}
      <SignOutConfirmModal
        visible={isSignOutModalVisible}
        onClose={() => setIsSignOutModalVisible(false)}
      />

      {/* Ventana emergente (modal) de bienvenida animada con el técnico de soporte */}
      <WelcomeModal
        visible={isWelcomeModalVisible}
        onClose={() => setIsWelcomeModalVisible(false)}
      />
    </SafeAreaView>
  );
}
