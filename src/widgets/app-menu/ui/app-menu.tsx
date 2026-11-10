import { useEffect, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight,
  Headphones,
  KeyRound,
  LogOut,
  Menu,
  Shield,
  ShieldCheck,
  User,
  X,
} from 'lucide-react-native';

import { useSession } from '@/entities/session';
import { SignOutConfirmModal } from '@/features/auth';
import { ChangePasswordModal } from '@/features/change-password';
import { COLORS } from '@/shared/theme';
import { AppLogo } from '@/shared/ui/app-logo';

type AppMenuProps = {
  visible: boolean;
  onClose: () => void;
};

type AppMenuButtonProps = {
  onPress: () => void;
};

export function AppMenuButton({ onPress }: AppMenuButtonProps) {
  return (
    <Pressable
      accessibilityHint="Abre el menú de opciones y configuración de la cuenta."
      accessibilityLabel="Abrir menú"
      accessibilityRole="button"
      className="h-10 w-10 items-center justify-center rounded-2xl border border-sky/60 bg-white shadow-sm active:scale-95 active:bg-sky/20 active:border-petrol/40"
      hitSlop={6}
      onPress={onPress}>
      <Menu color={COLORS.PETROL} size={20} />
    </Pressable>
  );
}

export function AppMenu({ visible, onClose }: AppMenuProps) {
  const { user, profile } = useSession();

  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isSignOutModalVisible, setIsSignOutModalVisible] = useState(false);

  const [slideAnim] = useState(() => new Animated.Value(340));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(340);
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleClose = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 340,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      if (callback) {
        callback();
      }
    });
  };

  const displayName =
    profile?.full_name?.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    user?.email ||
    'Usuario';
  const displayEmail = user?.email || profile?.email || '';
  const userInitial = displayName.charAt(0).toUpperCase();

  const roleLabel =
    profile?.role === 'admin'
      ? 'ADMINISTRADOR'
      : profile?.role === 'support'
        ? 'SOPORTE TÉCNICO'
        : 'SOLICITANTE';

  const roleColorStyle =
    profile?.role === 'admin'
      ? 'border-coral/40 bg-coral/10 text-coral'
      : profile?.role === 'support'
        ? 'border-petrol/30 bg-petrol/10 text-petrol'
        : 'border-sky/70 bg-sky/30 text-steel';

  const RoleIcon =
    profile?.role === 'admin'
      ? Shield
      : profile?.role === 'support'
        ? Headphones
        : User;

  return (
    <>
      <Modal
        animationType="none"
        onRequestClose={() => handleClose()}
        transparent
        visible={visible}>
        <View className="flex-1 flex-row justify-end" style={{ flex: 1 }}>
          {/* Fondo oscuro traslúcido para cerrar al pulsar fuera */}
          <Animated.View
            className="absolute inset-0 bg-petrol/60"
            style={{ opacity: fadeAnim }}>
            <Pressable
              accessibilityLabel="Cerrar menú"
              className="flex-1"
              onPress={() => handleClose()}
            />
          </Animated.View>

          {/* Panel lateral con ancho acotado y altura total garantizada */}
          <Animated.View
            className="bg-canvas shadow-2xl"
            style={{
              width: '84%',
              maxWidth: 320,
              height: '100%',
              transform: [{ translateX: slideAnim }],
            }}>
            <View className="flex-1 bg-canvas" style={{ flex: 1 }}>
              {/* Encabezado con fondo Petrol que se extiende hasta la barra de estado */}
              <SafeAreaView
                className="bg-petrol"
                edges={['top']}
                style={{ backgroundColor: COLORS.PETROL }}>
                <View className="px-5 pb-5 pt-3">
                  <View className="flex-row items-center justify-between">
                    <AppLogo size="sm" variant="inverted" />

                    <Pressable
                      accessibilityHint="Cierra el menú lateral."
                      accessibilityLabel="Cerrar menú"
                      accessibilityRole="button"
                      className="h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/15 active:bg-white/30"
                      hitSlop={8}
                      onPress={() => handleClose()}>
                      <X color="#FFFFFF" size={18} />
                    </Pressable>
                  </View>
                </View>
              </SafeAreaView>

              {/* Contenido principal con ScrollView garantizando visualización completa */}
              <ScrollView
                contentContainerStyle={{ padding: 16, gap: 14 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}>
                {/* Tarjeta de perfil del usuario */}
                <View className="rounded-3xl border border-sky/40 bg-white p-4 shadow-sm">
                  <View className="flex-row items-center gap-3">
                    <View className="h-12 w-12 items-center justify-center rounded-2xl border border-petrol/15 bg-petrol/10">
                      <Text className="text-2xl font-bold text-petrol">{userInitial}</Text>
                    </View>

                    <View className="flex-1">
                      <Text className="text-[10px] font-bold uppercase tracking-wider text-steel">
                        Cuenta activa
                      </Text>
                      <Text
                        className="mt-0.5 text-sm font-bold tracking-tight text-petrol"
                        numberOfLines={1}>
                        {displayName}
                      </Text>
                      <Text
                        className="text-xs text-steel"
                        numberOfLines={1}>
                        {displayEmail}
                      </Text>
                    </View>
                  </View>

                  {/* Insignia del rol */}
                  <View
                    className={`mt-3.5 flex-row items-center gap-1.5 self-start rounded-full border px-3 py-1 ${roleColorStyle}`}>
                    <RoleIcon
                      color={profile?.role === 'admin' ? COLORS.CORAL : COLORS.PETROL}
                      size={12}
                    />
                    <Text className="text-[10px] font-bold tracking-wider">
                      {roleLabel}
                    </Text>
                  </View>
                </View>

                {/* Sección de Opciones de cuenta */}
                <View>
                  <Text className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[1.5px] text-steel">
                    Opciones de cuenta
                  </Text>

                  <View className="gap-2.5">
                    {/* Opción: Cambiar contraseña */}
                    <Pressable
                      accessibilityHint="Abre la ventana para modificar tu contraseña actual."
                      accessibilityRole="button"
                      className="flex-row items-center justify-between rounded-2xl border border-sky/40 bg-white p-3.5 shadow-sm active:scale-[0.98] active:bg-canvas"
                      onPress={() => handleClose(() => setIsPasswordModalVisible(true))}>
                      <View className="flex-1 flex-row items-center gap-3">
                        <View className="h-10 w-10 items-center justify-center rounded-xl border border-petrol/15 bg-petrol/10">
                          <KeyRound color={COLORS.PETROL} size={18} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-bold text-petrol">
                            Cambiar contraseña
                          </Text>
                          <Text className="text-[11px] text-steel" numberOfLines={1}>
                            Actualiza tu clave de acceso segura
                          </Text>
                        </View>
                      </View>
                      <ChevronRight color={COLORS.STEEL} size={16} />
                    </Pressable>

                    {/* Opción: Cerrar sesión */}
                    <Pressable
                      accessibilityHint="Abre el diálogo de confirmación para cerrar tu sesión."
                      accessibilityRole="button"
                      className="flex-row items-center justify-between rounded-2xl border border-coral/30 bg-white p-3.5 shadow-sm active:scale-[0.98] active:bg-coral/5"
                      onPress={() => handleClose(() => setIsSignOutModalVisible(true))}>
                      <View className="flex-1 flex-row items-center gap-3">
                        <View className="h-10 w-10 items-center justify-center rounded-xl border border-coral/20 bg-coral/10">
                          <LogOut color={COLORS.CORAL} size={18} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-bold text-coral">
                            Cerrar sesión
                          </Text>
                          <Text className="text-[11px] text-steel" numberOfLines={1}>
                            Finaliza tu sesión en este dispositivo
                          </Text>
                        </View>
                      </View>
                      <ChevronRight color={COLORS.CORAL} size={16} />
                    </Pressable>
                  </View>
                </View>

                {/* Tarjeta de información de seguridad del sistema */}
                <View className="flex-row items-center gap-3 rounded-2xl border border-sky/35 bg-white p-3.5 shadow-sm">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-sky/30">
                    <ShieldCheck color={COLORS.PETROL} size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-petrol">
                      Conexión segura y cifrada
                    </Text>
                    <Text className="text-[10px] text-steel">
                      Autenticación activa protegida por Supabase SSL
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Área segura inferior para la barra de navegación de Android */}
              <SafeAreaView className="bg-canvas" edges={['bottom']} />
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal para cambiar contraseña */}
      <ChangePasswordModal
        visible={isPasswordModalVisible}
        onClose={() => setIsPasswordModalVisible(false)}
      />

      {/* Diálogo para confirmación de cierre de sesión */}
      <SignOutConfirmModal
        visible={isSignOutModalVisible}
        onClose={() => setIsSignOutModalVisible(false)}
      />
    </>
  );
}
