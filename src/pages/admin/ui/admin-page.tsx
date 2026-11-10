import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import {
  Headphones,
  LogOut,
  Search,
  Shield,
  Ticket as TicketIcon,
  UserCog,
  Users,
} from 'lucide-react-native';

import { useSession, type Profile, type UserRole } from '@/entities/session';
import { ChangeRoleModal } from '@/features/admin-change-role';
import { SignOutConfirmModal } from '@/features/auth';
import { supabase } from '@/shared/lib/supabase';
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

type AdminPageProps = {
  welcome?: string;
};

export function AdminPage({ welcome: welcomeProp }: AdminPageProps = {}) {
  const { user, profile } = useSession();

  const [usersList, setUsersList] = useState<Profile[]>([]);
  const [totalTicketsCount, setTotalTicketsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedUserForRole, setSelectedUserForRole] = useState<Profile | null>(null);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);

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

  const loadData = useCallback(async () => {
    try {
      const fetchTicketCount = async (): Promise<number> => {
        try {
          // Intento prioritario: RPC segura admin_get_total_tickets (SECURITY DEFINER)
          const { data: rpcCount, error: rpcError } = await supabase.rpc('admin_get_total_tickets');
          if (!rpcError && typeof rpcCount === 'number') {
            return rpcCount;
          }
          if (rpcError) {
            console.info('RPC admin_get_total_tickets no disponible o error:', rpcError.message);
          }
        } catch {
          // Continuar con fallback
        }

        // Fallback: consulta directa a public.tickets con conteo exacto
        const { count, error: countError } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.warn('Advertencia al consultar conteo de tickets en public.tickets:', countError.message);
          return 0;
        }

        return typeof count === 'number' ? count : 0;
      };

      const [profilesRes, ticketCount] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .order('full_name', { ascending: true }),
        fetchTicketCount(),
      ]);

      if (profilesRes.data) {
        setUsersList(profilesRes.data as Profile[]);
      } else if (profilesRes.error) {
        console.warn('Error al cargar perfiles en admin:', profilesRes.error.message);
      }

      setTotalTicketsCount(ticketCount);
    } catch (err) {
      console.warn('Excepción al cargar datos de administración:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .order('full_name', { ascending: true }),
      supabase
        .rpc('admin_get_total_tickets')
        .then(
          ({ data: rpcCount, error: rpcError }) => {
            if (!rpcError && typeof rpcCount === 'number') {
              return rpcCount;
            }
            return supabase
              .from('tickets')
              .select('*', { count: 'exact', head: true })
              .then(({ count }) => (typeof count === 'number' ? count : 0));
          },
          () => {
            return supabase
              .from('tickets')
              .select('*', { count: 'exact', head: true })
              .then(({ count }) => (typeof count === 'number' ? count : 0));
          }
        ),
    ]).then(([profilesRes, ticketCount]) => {
      if (!isMounted) return;
      if (profilesRes.data) {
        setUsersList(profilesRes.data as Profile[]);
      }
      setTotalTicketsCount(ticketCount);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const greeting = getContextualGreeting();
  const displayName = profile?.full_name?.trim() || user?.user_metadata?.full_name?.trim() || user?.email || 'Administrador';
  const userInitial = displayName.charAt(0).toUpperCase();

  // Contadores
  const techniciansCount = usersList.filter((u) => u.role === 'support').length;
  const totalUsersCount = usersList.length;

  // Filtrado de usuarios para búsqueda rápida
  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = u.full_name?.toLowerCase().includes(q);
    const emailMatch = u.email?.toLowerCase().includes(q);
    const roleMatch = u.role?.toLowerCase().includes(q);
    return nameMatch || emailMatch || roleMatch;
  });

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
                ADMINISTRADOR
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
                Panel de administración del sistema
              </Text>
            </View>
          </View>

          {/* Resumen global del sistema */}
          <View className="mt-6">
            <Text className="mb-3 text-[11px] font-bold tracking-[2px] text-steel">
              MÉTRICAS GLOBALES
            </Text>

            <View className="flex-row gap-3">
              <View className="flex-1 rounded-2xl border border-sky/40 bg-white p-4">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-xl bg-petrol/10">
                  <TicketIcon color={COLORS.PETROL} size={16} />
                </View>
                <Text className="text-2xl font-bold text-petrol">{totalTicketsCount}</Text>
                <Text className="text-xs text-steel">Total tickets</Text>
              </View>

              <View className="flex-1 rounded-2xl border border-sky/40 bg-white p-4">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-xl bg-coral/10">
                  <Headphones color={COLORS.CORAL} size={16} />
                </View>
                <Text className="text-2xl font-bold text-petrol">{techniciansCount}</Text>
                <Text className="text-xs text-steel">Técnicos</Text>
              </View>

              <View className="flex-1 rounded-2xl border border-sky/40 bg-white p-4">
                <View className="mb-2 h-8 w-8 items-center justify-center rounded-xl bg-sky/30">
                  <Users color={COLORS.STEEL} size={16} />
                </View>
                <Text className="text-2xl font-bold text-petrol">{totalUsersCount}</Text>
                <Text className="text-xs text-steel">Usuarios</Text>
              </View>
            </View>
          </View>

          {/* Sección de Gestión de Usuarios y Roles */}
          <View className="mt-7">
            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <UserCog color={COLORS.STEEL} size={16} />
                <Text className="text-[11px] font-bold tracking-[2px] text-steel">
                  GESTIÓN DE USUARIOS Y ROLES ({usersList.length})
                </Text>
              </View>
              {loading ? <ActivityIndicator color={COLORS.PETROL} size="small" /> : null}
            </View>

            {/* Barra de búsqueda rápida */}
            <View className="mb-3 flex-row items-center rounded-2xl border border-sky/40 bg-white px-3.5 py-2.5">
              <Search color={COLORS.STEEL} size={16} />
              <TextInput
                className="ml-2 flex-1 text-xs text-petrol"
                onChangeText={setSearchQuery}
                placeholder="Buscar por nombre, correo o rol..."
                placeholderTextColor={COLORS.STEEL}
                value={searchQuery}
              />
            </View>

            {loading && usersList.length === 0 ? (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator color={COLORS.PETROL} size="large" />
                <Text className="mt-3 text-xs text-steel">Cargando directorio de usuarios...</Text>
              </View>
            ) : filteredUsers.length === 0 ? (
              <View className="rounded-2xl border border-sky/30 bg-white p-6 items-center">
                <Text className="text-xs text-steel">
                  No se encontraron usuarios que coincidan con la búsqueda.
                </Text>
              </View>
            ) : (
              <View className="gap-2.5">
                {filteredUsers.map((u) => {
                  const isCurrentUser = u.id === user?.id;
                  const isAdmin = u.role === 'admin';
                  const isSupport = u.role === 'support';
                  const initial = (u.full_name?.charAt(0) || u.email?.charAt(0) || 'U').toUpperCase();

                  const roleBadgeBg = isAdmin
                    ? 'bg-petrol text-white'
                    : isSupport
                      ? 'bg-coral/15 text-coral border border-coral/30'
                      : 'bg-sky/30 text-steel border border-sky/50';

                  const roleLabel = isAdmin
                    ? 'ADMINISTRADOR'
                    : isSupport
                      ? 'SOPORTE'
                      : 'SOLICITANTE';

                  return (
                    <View
                      key={u.id}
                      className="rounded-2xl border border-sky/40 bg-white p-4 shadow-sm">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3 flex-1 mr-2">
                          <View className="h-10 w-10 items-center justify-center rounded-xl bg-petrol/10">
                            <Text className="text-base font-bold text-petrol">{initial}</Text>
                          </View>

                          <View className="flex-1">
                            <View className="flex-row items-center gap-1.5 flex-wrap">
                              <Text className="text-sm font-bold text-petrol" numberOfLines={1}>
                                {u.full_name || 'Sin nombre registrado'}
                              </Text>
                              {isCurrentUser ? (
                                <View className="rounded bg-steel/20 px-1.5 py-0.2">
                                  <Text className="text-[9px] font-semibold text-steel">
                                    TÚ
                                  </Text>
                                </View>
                              ) : null}
                            </View>
                            <Text className="text-xs text-steel mt-0.5" numberOfLines={1}>
                              {u.email}
                            </Text>
                          </View>
                        </View>

                        {/* Píldora de rol actual */}
                        <View className={`rounded-full px-2.5 py-1 ${roleBadgeBg}`}>
                          <Text className="text-[9px] font-bold tracking-wider">
                            {roleLabel}
                          </Text>
                        </View>
                      </View>

                      {/* Botón de acción para cambiar rol */}
                      <View className="mt-3 border-t border-sky/20 pt-2.5 flex-row justify-end items-center">
                        {isCurrentUser ? (
                          <Text className="text-[11px] text-steel italic">
                            Tu cuenta principal de administrador
                          </Text>
                        ) : isAdmin ? (
                          <Text className="text-[11px] text-steel italic">
                            Cuenta de administrador protegida
                          </Text>
                        ) : (
                          <Pressable
                            accessibilityRole="button"
                            className="h-8 px-3.5 flex-row items-center justify-center gap-1.5 rounded-xl border border-petrol/30 bg-petrol/5 active:bg-petrol/15"
                            onPress={() => {
                              setSelectedUserForRole(u);
                              setIsRoleModalVisible(true);
                            }}>
                            <Shield color={COLORS.PETROL} size={12} />
                            <Text className="text-xs font-semibold text-petrol">
                              Cambiar a {isSupport ? 'Solicitante' : 'Soporte'}
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Botón de cierre de sesión con confirmación */}
          <Pressable
            accessibilityHint="Cierra tu sesión actual y regresa a la pantalla de ingreso."
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

      {/* Modal para cambiar rol de usuario */}
      <ChangeRoleModal
        targetUser={selectedUserForRole}
        visible={isRoleModalVisible}
        onClose={() => {
          setIsRoleModalVisible(false);
          setSelectedUserForRole(null);
        }}
        onSuccess={(userId, newRole: UserRole) => {
          setUsersList((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
          );
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
