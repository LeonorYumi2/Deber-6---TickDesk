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
import LottieView from 'lottie-react-native';
import {
  CheckCircle2,
  Clock,
  Headphones,
  Ticket as TicketIcon,
  UserCheck,
} from 'lucide-react-native';

import { useSession } from '@/entities/session';
import { TicketCard, type Ticket } from '@/entities/ticket';
import welcomeBadgeAnimation from '@/shared/assets/animations/welcome-badge.json';
import { supabase } from '@/shared/lib/supabase';
import { COLORS } from '@/shared/theme';
import { AppLogo } from '@/shared/ui/app-logo';
import { AppMenu, AppMenuButton } from '@/widgets/app-menu';
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
  const { user, profile, pendingWelcome, consumeWelcome } = useSession();

  const [activeTab, setActiveTab] = useState<'queue' | 'assigned'>('queue');
  const [queueTickets, setQueueTickets] = useState<Ticket[]>([]);
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const routeParams = useLocalSearchParams<{ welcome?: string }>();
  const isFromPropOrRoute = (welcomeProp ?? routeParams.welcome) === '1';

  const [isWelcomeModalVisible, setIsWelcomeModalVisible] = useState(false);
  const welcomeHandledRef = useRef(false);

  useEffect(() => {
    const shouldShow = pendingWelcome || isFromPropOrRoute;
    if (shouldShow && !welcomeHandledRef.current) {
      welcomeHandledRef.current = true;
      consumeWelcome();
      setIsWelcomeModalVisible(true);
    }
  }, [pendingWelcome, isFromPropOrRoute, consumeWelcome]);

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
            <AppLogo />

            {/* Píldora de rol y Menú de opciones */}
            <View className="flex-row items-center gap-2.5">
              <View className="flex-row items-center gap-2 rounded-full border border-sky/60 bg-white px-3 py-1.5">
                <View className="h-2 w-2 rounded-full bg-steel" />
                <Text className="text-[10px] font-semibold tracking-[1.2px] text-steel">
                  SOPORTE
                </Text>
              </View>

              <AppMenuButton onPress={() => setIsMenuVisible(true)} />
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
              <View className="flex-row items-center justify-between pb-2">
                <View className="flex-row items-center gap-2">
                  <View className="h-2.5 w-2.5 rounded-full bg-coral" />
                  <Text className="text-[11px] font-bold tracking-wider text-petrol uppercase">
                    Ticket en atención activa
                  </Text>
                </View>

                <View className="rounded-lg bg-petrol px-2.5 py-1">
                  <Text className="text-[10px] font-bold text-white">Atender ahora &rarr;</Text>
                </View>
              </View>

              <Text className="text-sm font-bold text-petrol" numberOfLines={1}>
                {currentActiveTicket.title}
              </Text>
              <Text className="mt-0.5 text-xs text-steel" numberOfLines={1}>
                Toca aquí para agregar observaciones o resolver la incidencia.
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
                <Text className="text-xs text-steel">Abiertos</Text>
              </View>

              <View className="flex-1 rounded-2xl border border-sky/40 bg-white p-4">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-xl bg-coral/10">
                  <Clock color={COLORS.CORAL} size={16} />
                </View>
                <Text className="text-2xl font-bold text-petrol">{myActiveCount}</Text>
                <Text className="text-xs text-steel">En proceso</Text>
              </View>

              <View className="flex-1 rounded-2xl border border-petrol/20 bg-petrol/5 p-4">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-xl bg-petrol/15">
                  <CheckCircle2 color={COLORS.PETROL} size={16} />
                </View>
                <Text className="text-2xl font-bold text-petrol">{myResolvedCount}</Text>
                <Text className="text-xs font-semibold text-petrol">Resueltos</Text>
              </View>
            </View>
          </View>

          {/* Pestañas de navegación entre Cola y Asignados */}
          <View className="mt-7 flex-row rounded-2xl border border-sky/40 bg-white p-1">
            <Pressable
              accessibilityRole="tab"
              className={`flex-1 h-11 flex-row items-center justify-center gap-1.5 rounded-xl px-2 ${
                activeTab === 'queue' ? 'bg-petrol shadow-sm' : 'active:bg-canvas'
              }`}
              onPress={() => setActiveTab('queue')}>
              <Headphones
                color={activeTab === 'queue' ? '#FFFFFF' : COLORS.STEEL}
                size={14}
              />
              <Text
                className={`text-[11px] sm:text-xs font-bold ${
                  activeTab === 'queue' ? 'text-white' : 'text-steel'
                }`}>
                Cola abierta ({queueCount})
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="tab"
              className={`flex-1 h-11 flex-row items-center justify-center gap-1.5 rounded-xl px-2 ${
                activeTab === 'assigned' ? 'bg-petrol shadow-sm' : 'active:bg-canvas'
              }`}
              onPress={() => setActiveTab('assigned')}>
              <UserCheck
                color={activeTab === 'assigned' ? '#FFFFFF' : COLORS.STEEL}
                size={14}
              />
              <Text
                className={`text-[11px] sm:text-xs font-bold ${
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
                <View className="rounded-3xl border border-sky/40 bg-white p-7 items-center text-center shadow-sm">
                  <View className="mb-2 h-24 w-24 items-center justify-center">
                    <LottieView
                      autoPlay
                      loop
                      source={welcomeBadgeAnimation}
                      style={{ width: 90, height: 90 }}
                    />
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
              <View className="rounded-3xl border border-sky/40 bg-white p-7 items-center text-center shadow-sm">
                <View className="mb-2 h-24 w-24 items-center justify-center">
                  <LottieView
                    autoPlay
                    loop
                    source={welcomeBadgeAnimation}
                    style={{ width: 90, height: 90 }}
                  />
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

      {/* Menú lateral de la aplicación (centraliza opciones de cuenta) */}
      <AppMenu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />

      {/* Ventana emergente (modal) de bienvenida animada con el técnico de soporte */}
      <WelcomeModal
        visible={isWelcomeModalVisible}
        onClose={() => setIsWelcomeModalVisible(false)}
      />
    </SafeAreaView>
  );
}
