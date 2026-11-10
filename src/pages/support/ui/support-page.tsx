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
  Headphones,
  Inbox,
  KeyRound,
  LogOut,
  Ticket as TicketIcon,
  UserCheck,
} from 'lucide-react-native';

import { useSession } from '@/entities/session';
import { TicketCard, type Ticket } from '@/entities/ticket';
import { SignOutConfirmModal } from '@/features/auth';
import { ChangePasswordModal } from '@/features/change-password';
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

type SupportPageProps = {
  welcome?: string;
};

export function SupportPage({ welcome: welcomeProp }: SupportPageProps = {}) {
  const { user, profile } = useSession();

  const [activeTab, setActiveTab] = useState<'queue' | 'assigned'>('queue');
  const [queueTickets, setQueueTickets] = useState<Ticket[]>([]);
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

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
      const [queueRes, assignedRes] = await Promise.all([
        supabase
          .from('tickets')
          .select('*, requester_profile:profiles!user_id(full_name, email)')
          .eq('status', 'pending')
          .is('assigned_to', null)
          .order('created_at', { ascending: true }),
        supabase
          .from('tickets')
          .select('*, requester_profile:profiles!user_id(full_name, email)')
          .eq('assigned_to', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (queueRes.data) {
        setQueueTickets(queueRes.data as unknown as Ticket[]);
      }
      if (assignedRes.data) {
        setAssignedTickets(assignedRes.data as unknown as Ticket[]);
      }
    } catch (err) {
      console.warn('Excepción al cargar tickets de soporte:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      Promise.all([
        supabase
          .from('tickets')
          .select('*, requester_profile:profiles!user_id(full_name, email)')
          .eq('status', 'pending')
          .is('assigned_to', null)
          .order('created_at', { ascending: true }),
        supabase
          .from('tickets')
          .select('*, requester_profile:profiles!user_id(full_name, email)')
          .eq('assigned_to', user.id)
          .order('created_at', { ascending: false }),
      ]).then(([queueRes, assignedRes]) => {
        if (!isMounted) return;
        if (queueRes.data) {
          setQueueTickets(queueRes.data as unknown as Ticket[]);
        }
        if (assignedRes.data) {
          setAssignedTickets(assignedRes.data as unknown as Ticket[]);
        }
        setLoading(false);
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
  const displayName = profile?.full_name?.trim() || user?.user_metadata?.full_name?.trim() || user?.email || 'Técnico de soporte';
  const userInitial = displayName.charAt(0).toUpperCase();

  // Contadores
  const queueCount = queueTickets.length;
  const myActiveCount = assignedTickets.filter((t) => t.status === 'in_progress').length;
  const myResolvedCount = assignedTickets.filter((t) => t.status === 'resolved').length;

  // Ticket actualmente activo en atención por este especialista
  const currentActiveTicket = assignedTickets.find((t) => t.status === 'in_progress');

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
                SOPORTE
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

            <View className="mt-4 flex-row items-center justify-between rounded-xl border border-sky/30 bg-canvas px-3.5 py-2">
              <View>
                <Text className="text-[10px] font-bold uppercase tracking-wider text-steel">
                  Área de trabajo
                </Text>
                <Text className="mt-0.5 text-sm font-semibold text-petrol">
                  Panel de soporte técnico
                </Text>
              </View>

              <Pressable
                accessibilityHint="Abre el modal para cambiar tu contraseña."
                accessibilityRole="button"
                className="flex-row items-center gap-1.5 rounded-lg border border-sky/50 bg-white px-2.5 py-1.5 active:bg-canvas"
                onPress={() => setIsPasswordModalVisible(true)}>
                <KeyRound color={COLORS.PETROL} size={13} />
                <Text className="text-[11px] font-semibold text-petrol">
                  Contraseña
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Banner de ticket activo en atención (si existe) */}
          {currentActiveTicket ? (
            <Pressable
              accessibilityRole="button"
              className="mt-4 rounded-2xl border border-petrol/40 bg-petrol/5 p-4 active:bg-petrol/10"
              onPress={() => {
                setSelectedTicket(currentActiveTicket);
                setIsDetailModalVisible(true);
              }}>
              <View className="flex-row items-center justify-between pb-1.5">
                <View className="flex-row items-center gap-2">
                  <View className="h-2 w-2 rounded-full bg-coral animate-pulse" />
                  <Text className="text-[11px] font-bold tracking-wider text-petrol uppercase">
                    Tienes 1 ticket activo en atención
                  </Text>
                </View>
                <Text className="text-[10px] font-semibold text-coral">Ver &rarr;</Text>
              </View>
              <Text className="text-sm font-bold text-petrol" numberOfLines={1}>
                {currentActiveTicket.title}
              </Text>
            </Pressable>
          ) : null}

          {/* Resumen de tickets de soporte */}
          <View className="mt-6">
            <Text className="mb-3 text-[11px] font-bold tracking-[2px] text-steel">
              MÉTRICAS DE ATENCIÓN
            </Text>

            <View className="flex-row gap-3">
              <View className="flex-1 rounded-2xl border border-sky/40 bg-white p-4">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-xl bg-petrol/10">
                  <TicketIcon color={COLORS.PETROL} size={16} />
                </View>
                <Text className="text-2xl font-bold text-petrol">{queueCount}</Text>
                <Text className="text-xs text-steel">En cola</Text>
              </View>

              <View className="flex-1 rounded-2xl border border-sky/40 bg-white p-4">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-xl bg-coral/10">
                  <Clock color={COLORS.CORAL} size={16} />
                </View>
                <Text className="text-2xl font-bold text-petrol">{myActiveCount}</Text>
                <Text className="text-xs text-steel">En proceso</Text>
              </View>

              <View className="flex-1 rounded-2xl border border-sky/40 bg-white p-4">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-xl bg-sky/30">
                  <CheckCircle2 color={COLORS.STEEL} size={16} />
                </View>
                <Text className="text-2xl font-bold text-petrol">{myResolvedCount}</Text>
                <Text className="text-xs text-steel">Resueltos</Text>
              </View>
            </View>
          </View>

          {/* Pestañas de navegación entre Cola y Asignados */}
          <View className="mt-7 flex-row rounded-2xl border border-sky/40 bg-white p-1">
            <Pressable
              accessibilityRole="tab"
              className={`flex-1 h-11 flex-row items-center justify-center gap-1.5 rounded-xl ${
                activeTab === 'queue' ? 'bg-petrol shadow-sm' : 'active:bg-canvas'
              }`}
              onPress={() => setActiveTab('queue')}>
              <Headphones
                color={activeTab === 'queue' ? '#FFFFFF' : COLORS.STEEL}
                size={14}
              />
              <Text
                className={`text-xs font-bold ${
                  activeTab === 'queue' ? 'text-white' : 'text-steel'
                }`}>
                Cola de tickets ({queueCount})
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="tab"
              className={`flex-1 h-11 flex-row items-center justify-center gap-1.5 rounded-xl ${
                activeTab === 'assigned' ? 'bg-petrol shadow-sm' : 'active:bg-canvas'
              }`}
              onPress={() => setActiveTab('assigned')}>
              <UserCheck
                color={activeTab === 'assigned' ? '#FFFFFF' : COLORS.STEEL}
                size={14}
              />
              <Text
                className={`text-xs font-bold ${
                  activeTab === 'assigned' ? 'text-white' : 'text-steel'
                }`}>
                Mis asignados ({assignedTickets.length})
              </Text>
            </Pressable>
          </View>

          {/* Listado dinámico según la pestaña activa */}
          <View className="mt-4">
            {loading && queueTickets.length === 0 && assignedTickets.length === 0 ? (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator color={COLORS.PETROL} size="large" />
                <Text className="mt-3 text-xs text-steel">Cargando tickets de soporte...</Text>
              </View>
            ) : activeTab === 'queue' ? (
              queueTickets.length === 0 ? (
                <View className="rounded-3xl border border-sky/40 bg-white p-8 items-center text-center shadow-sm">
                  <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-canvas">
                    <Inbox color={COLORS.STEEL} size={28} />
                  </View>
                  <Text className="text-base font-bold text-petrol">
                    La cola de tickets está al día
                  </Text>
                  <Text className="mt-1 text-center text-xs leading-5 text-steel max-w-[260px]">
                    No hay solicitudes pendientes sin asignar en este momento.
                  </Text>
                </View>
              ) : (
                queueTickets.map((t) => (
                  <TicketCard
                    key={t.id}
                    ticket={t}
                    onPress={(clicked) => {
                      setSelectedTicket(clicked);
                      setIsDetailModalVisible(true);
                    }}
                  />
                ))
              )
            ) : assignedTickets.length === 0 ? (
              <View className="rounded-3xl border border-sky/40 bg-white p-8 items-center text-center shadow-sm">
                <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-canvas">
                  <UserCheck color={COLORS.STEEL} size={28} />
                </View>
                <Text className="text-base font-bold text-petrol">
                  Sin tickets asignados
                </Text>
                <Text className="mt-1 text-center text-xs leading-5 text-steel max-w-[260px]">
                  Dirígete a la pestaña de cola para atender un ticket disponible.
                </Text>
              </View>
            ) : (
              assignedTickets.map((t) => (
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

          {/* Botones de gestión de cuenta */}
          <View className="mt-8 gap-2.5">
            <Pressable
              accessibilityHint="Abre la ventana para cambiar tu contraseña."
              accessibilityRole="button"
              className="h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-sky/50 bg-white active:bg-canvas"
              onPress={() => setIsPasswordModalVisible(true)}>
              <KeyRound color={COLORS.PETROL} size={16} />
              <Text className="text-xs font-semibold text-petrol">Cambiar contraseña</Text>
            </Pressable>

            <Pressable
              accessibilityHint="Abre la ventana para confirmar el cierre de sesión."
              accessibilityRole="button"
              className="h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-coral/30 bg-white active:bg-coral/5"
              onPress={() => setIsSignOutModalVisible(true)}>
              <LogOut color={COLORS.CORAL} size={16} />
              <Text className="text-xs font-semibold text-coral">Cerrar sesión</Text>
            </Pressable>
          </View>

          {/* Pie de página */}
          <View className="mt-auto items-center pt-8">
            <Text className="text-xs text-steel">TickDesk · Soporte técnico · EPN</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal de detalle de ticket (atender, resolver, cambiar prioridad, observaciones) */}
      <TicketDetailModal
        ticket={selectedTicket}
        visible={isDetailModalVisible}
        onClose={() => {
          setIsDetailModalVisible(false);
          setSelectedTicket(null);
        }}
        onTicketUpdated={() => {
          loadTickets();
        }}
      />

      {/* Modal para cambiar contraseña */}
      <ChangePasswordModal
        visible={isPasswordModalVisible}
        onClose={() => setIsPasswordModalVisible(false)}
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
