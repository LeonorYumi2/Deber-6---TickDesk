import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import {
  CheckCircle2,
  Clock,
  Inbox,
  LogOut,
  Plus,
  Ticket as TicketIcon,
} from 'lucide-react-native';

import { useSession } from '@/entities/session';
import { TicketCard, type Ticket } from '@/entities/ticket';
import { SignOutConfirmModal } from '@/features/auth';
import { CreateTicketModal } from '@/features/create-ticket';
import { supabase } from '@/shared/lib/supabase';
import { COLORS } from '@/shared/theme';
import { TicketDetailModal } from '@/widgets/ticket-detail-modal';
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

type RequesterPageProps = {
  welcome?: string;
};

export function RequesterPage({ welcome: welcomeProp }: RequesterPageProps = {}) {
  const { user, profile } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const routeParams = useLocalSearchParams<{ welcome?: string }>();
  const welcomeParam = welcomeProp ?? routeParams.welcome;

  const [isWelcomeModalVisible, setIsWelcomeModalVisible] = useState(welcomeParam === '1');
  const welcomeHandledRef = useRef(false);

  useEffect(() => {
    if (welcomeParam === '1' && !welcomeHandledRef.current) {
      welcomeHandledRef.current = true;
      setIsWelcomeModalVisible(true);
    }
  }, [welcomeParam]);

  const loadTickets = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, assigned_profile:profiles!assigned_to(full_name, email)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTickets(data as unknown as Ticket[]);
      }
    } catch (err) {
      console.warn('Excepción al consultar tickets:', err);
    } finally {
      setLoadingTickets(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      supabase
        .from('tickets')
        .select('*, assigned_profile:profiles!assigned_to(full_name, email)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!isMounted) return;
          if (!error && data) {
            setTickets(data as unknown as Ticket[]);
          }
          setLoadingTickets(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTickets();
  }, [loadTickets]);

  const greeting = getContextualGreeting();
  const displayName = profile?.full_name?.trim() || user?.user_metadata?.full_name?.trim() || user?.email || 'Solicitante';
  const userInitial = displayName.charAt(0).toUpperCase();

  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  return (
    <SafeAreaView className="flex-1 bg-canvas" style={{ flex: 1 }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            colors={[COLORS.PETROL]}
            onRefresh={onRefresh}
            refreshing={refreshing}
            tintColor={COLORS.PETROL}
          />
        }>
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

            {/* Píldora de rol */}
            <View className="flex-row items-center gap-2 rounded-full border border-sky/60 bg-white px-3 py-1.5">
              <View className="h-2 w-2 rounded-full bg-steel" />
              <Text className="text-[10px] font-semibold tracking-[1.2px] text-steel">
                SOLICITANTE
              </Text>
            </View>
          </View>

          {/* Tarjeta de bienvenida y perfil */}
          <View className="mt-2 rounded-3xl border border-sky/50 bg-white p-6 shadow-sm">
            <View className="flex-row items-center gap-4">
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

            <View className="mt-4 rounded-xl border border-sky/30 bg-canvas px-3.5 py-2">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-steel">
                Área de trabajo
              </Text>
              <Text className="mt-0.5 text-sm font-semibold text-petrol">
                Panel de solicitante
              </Text>
            </View>
          </View>

          {/* Botón principal de acción: Crear nuevo ticket */}
          <Pressable
            accessibilityHint="Abre el formulario para registrar un nuevo ticket de soporte técnico."
            accessibilityRole="button"
            className="mt-6 h-14 flex-row items-center justify-center gap-2.5 rounded-2xl bg-petrol shadow-sm active:bg-petrol/90"
            onPress={() => setIsCreateModalVisible(true)}>
            <Plus color="#FFFFFF" size={20} />
            <Text className="text-[15px] font-semibold text-white">Crear nuevo ticket</Text>
          </Pressable>

          {/* Resumen de tickets del solicitante */}
          <View className="mt-6">
            <Text className="mb-3 text-[11px] font-bold tracking-[2px] text-steel">
              RESUMEN DE MIS TICKETS
            </Text>

            <View className="flex-row gap-3">
              <View className="flex-1 rounded-2xl border border-sky/40 bg-white p-4">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-xl bg-petrol/10">
                  <TicketIcon color={COLORS.PETROL} size={16} />
                </View>
                <Text className="text-2xl font-bold text-petrol">{pendingCount}</Text>
                <Text className="text-xs text-steel">Abiertos</Text>
              </View>

              <View className="flex-1 rounded-2xl border border-sky/40 bg-white p-4">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-xl bg-coral/10">
                  <Clock color={COLORS.CORAL} size={16} />
                </View>
                <Text className="text-2xl font-bold text-petrol">{inProgressCount}</Text>
                <Text className="text-xs text-steel">En proceso</Text>
              </View>

              <View className="flex-1 rounded-2xl border border-sky/40 bg-white p-4">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-xl bg-sky/30">
                  <CheckCircle2 color={COLORS.STEEL} size={16} />
                </View>
                <Text className="text-2xl font-bold text-petrol">{resolvedCount}</Text>
                <Text className="text-xs text-steel">Resueltos</Text>
              </View>
            </View>
          </View>

          {/* Listado de tickets */}
          <View className="mt-7">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[11px] font-bold tracking-[2px] text-steel">
                HISTORIAL DE INCIDENCIAS ({tickets.length})
              </Text>
              {loadingTickets ? (
                <ActivityIndicator color={COLORS.PETROL} size="small" />
              ) : null}
            </View>

            {loadingTickets && tickets.length === 0 ? (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator color={COLORS.PETROL} size="large" />
                <Text className="mt-3 text-xs text-steel">Cargando tus solicitudes...</Text>
              </View>
            ) : tickets.length === 0 ? (
              <View className="rounded-3xl border border-sky/40 bg-white p-8 items-center text-center shadow-sm">
                <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-canvas">
                  <Inbox color={COLORS.STEEL} size={28} />
                </View>
                <Text className="text-base font-bold text-petrol">
                  No tienes tickets registrados
                </Text>
                <Text className="mt-1 text-center text-xs leading-5 text-steel max-w-[260px]">
                  Crea tu primera solicitud para recibir asistencia del equipo de soporte técnico.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  className="mt-5 h-11 px-5 flex-row items-center justify-center gap-2 rounded-xl bg-petrol active:bg-petrol/90"
                  onPress={() => setIsCreateModalVisible(true)}>
                  <Plus color="#FFFFFF" size={16} />
                  <Text className="text-xs font-semibold text-white">Crear primer ticket</Text>
                </Pressable>
              </View>
            ) : (
              tickets.map((t) => (
                <TicketCard
                  key={t.id}
                  ticket={t}
                  onPress={(clicked) => {
                    setSelectedTicket(clicked);
                    setIsDetailModalVisible(true);
                  }}
                />
              ))
            )}
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

      {/* Modal para crear un nuevo ticket */}
      <CreateTicketModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSuccess={(newTicket) => {
          setTickets((prev) => [newTicket, ...prev]);
        }}
      />

      {/* Modal de detalle de ticket (con edición, eliminación y observaciones) */}
      <TicketDetailModal
        ticket={selectedTicket}
        visible={isDetailModalVisible}
        onClose={() => {
          setIsDetailModalVisible(false);
          setSelectedTicket(null);
        }}
        onTicketUpdated={(updated) => {
          setTickets((prev) =>
            prev.map((t) => (t.id === updated.id ? updated : t))
          );
        }}
        onTicketDeleted={(deletedId) => {
          setTickets((prev) => prev.filter((t) => t.id !== deletedId));
        }}
      />

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
