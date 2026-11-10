import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { LogOut } from 'lucide-react-native';

import { useSession } from '@/entities/session';
import { COLORS } from '@/shared/theme';

type SignOutConfirmModalProps = {
  visible: boolean;
  onClose: () => void;
  onSignOut?: () => Promise<void>;
};

export function SignOutConfirmModal({
  visible,
  onClose,
  onSignOut,
}: SignOutConfirmModalProps) {
  const { signOut } = useSession();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    if (loading) return;
    setErrorMessage(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (loading) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      if (onSignOut) {
        await onSignOut();
      } else {
        await signOut();
      }
      onClose();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setErrorMessage(
        err instanceof Error && err.message
          ? err.message
          : 'Ocurrió un error al intentar cerrar la sesión. Inténtalo de nuevo.'
      );
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleClose}
      transparent
      visible={visible}>
      <View className="flex-1 items-center justify-center bg-petrol/60 px-6">
        <Pressable
          accessibilityLabel="Cerrar ventana de confirmación"
          className="absolute inset-0"
          disabled={loading}
          onPress={handleClose}
        />

        <View className="w-full max-w-[380px] items-center rounded-3xl border border-sky/40 bg-white p-6 shadow-xl">
          {/* Icono de advertencia / cierre de sesión */}
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-coral/10">
            <LogOut color={COLORS.CORAL} size={24} />
          </View>

          {/* Título */}
          <Text className="mt-4 text-center text-xl font-bold tracking-tight text-petrol">
            ¿Cerrar sesión?
          </Text>

          {/* Mensaje */}
          <Text className="mt-2 text-center text-sm leading-6 text-steel">
            ¿Estás seguro de que deseas cerrar tu sesión?
          </Text>

          {/* Mensaje de error en caso de fallo */}
          {errorMessage ? (
            <View className="mt-4 w-full rounded-xl border border-coral/30 bg-coral/10 p-3">
              <Text className="text-center text-xs font-medium text-coral">
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Botones de acción */}
          <View className="mt-6 w-full gap-3">
            <Pressable
              accessibilityHint="Confirma el cierre de tu sesión y vuelve a la pantalla de ingreso."
              accessibilityRole="button"
              className={`h-13 w-full items-center justify-center rounded-2xl bg-coral shadow-sm ${
                loading ? 'opacity-70' : 'active:opacity-90'
              }`}
              disabled={loading}
              onPress={handleConfirm}>
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text className="text-[15px] font-semibold text-white">
                  Sí, cerrar sesión
                </Text>
              )}
            </Pressable>

            <Pressable
              accessibilityHint="Cancela el cierre de sesión y permanece en la aplicación."
              accessibilityRole="button"
              className={`h-11 w-full items-center justify-center rounded-2xl border border-sky/50 bg-white active:bg-canvas ${
                loading ? 'opacity-50' : ''
              }`}
              disabled={loading}
              onPress={handleClose}>
              <Text className="text-sm font-semibold text-steel">Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
