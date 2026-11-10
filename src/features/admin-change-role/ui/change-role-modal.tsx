import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { Shield, ShieldAlert, X } from 'lucide-react-native';

import type { Profile, UserRole } from '@/entities/session';
import { supabase } from '@/shared/lib/supabase';
import { COLORS } from '@/shared/theme';

type ChangeRoleModalProps = {
  targetUser: Profile | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: (userId: string, newRole: UserRole) => void;
};

export function ChangeRoleModal({
  targetUser,
  visible,
  onClose,
  onSuccess,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<'requester' | 'support'>('requester');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!targetUser) return null;

  const currentRole = targetUser.role;
  const isTargetAdmin = currentRole === 'admin';

  const handleConfirm = async () => {
    if (loading) return;

    if (isTargetAdmin) {
      setErrorMessage('No está permitido modificar el rol de un administrador.');
      return;
    }

    if (selectedRole === currentRole) {
      onClose();
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.rpc('admin_set_user_role', {
        p_user_id: targetUser.id,
        p_new_role: selectedRole,
      });

      if (error) {
        console.error('Error al cambiar rol en Supabase:', error);
        setErrorMessage(error.message || 'No se pudo actualizar el rol del usuario.');
        return;
      }

      onSuccess(targetUser.id, selectedRole);
      onClose();
    } catch (err) {
      console.error('Excepción al cambiar rol:', err);
      setErrorMessage('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}>
      <View className="flex-1 items-center justify-center bg-petrol/60 px-6">
        <Pressable
          accessibilityLabel="Cerrar modal"
          className="absolute inset-0"
          disabled={loading}
          onPress={onClose}
        />

        <View className="w-full max-w-[400px] rounded-3xl border border-sky/40 bg-white p-6 shadow-2xl">
          {/* Cabecera */}
          <View className="flex-row items-center justify-between border-b border-sky/20 pb-3">
            <View className="flex-row items-center gap-2.5">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-petrol/10">
                <Shield color={COLORS.PETROL} size={18} />
              </View>
              <Text className="text-base font-bold text-petrol">
                Asignar rol de usuario
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              className="h-8 w-8 items-center justify-center rounded-full bg-canvas"
              disabled={loading}
              onPress={onClose}>
              <X color={COLORS.STEEL} size={18} />
            </Pressable>
          </View>

          {/* Información del usuario */}
          <View className="mt-4 rounded-2xl border border-sky/30 bg-canvas p-3.5">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-steel">
              Usuario seleccionado
            </Text>
            <Text className="mt-0.5 text-sm font-bold text-petrol" numberOfLines={1}>
              {targetUser.full_name || 'Sin nombre registrado'}
            </Text>
            <Text className="text-xs text-steel" numberOfLines={1}>
              {targetUser.email}
            </Text>
            <View className="mt-2 self-start rounded-full bg-sky/30 px-2 py-0.5">
              <Text className="text-[10px] font-semibold text-petrol">
                Rol actual: {currentRole === 'admin' ? 'Administrador' : currentRole === 'support' ? 'Soporte' : 'Solicitante'}
              </Text>
            </View>
          </View>

          {isTargetAdmin ? (
            <View className="mt-4 rounded-xl border border-coral/30 bg-coral/10 p-3 flex-row items-center gap-2">
              <ShieldAlert color={COLORS.CORAL} size={16} />
              <Text className="flex-1 text-xs text-coral font-medium">
                Las cuentas de administrador no pueden ser modificadas desde este panel.
              </Text>
            </View>
          ) : (
            <View className="mt-4 gap-2">
              <Text className="text-xs font-semibold text-petrol">
                Selecciona el nuevo rol:
              </Text>

              {/* Selector entre requester y support */}
              {(['requester', 'support'] as const).map((r) => {
                const isSelected = selectedRole === r;
                const label = r === 'requester' ? 'Solicitante' : 'Especialista de Soporte';
                const desc =
                  r === 'requester'
                    ? 'Puede crear tickets e interactuar en sus incidencias.'
                    : 'Puede reclamar, atender y resolver tickets de la cola.';

                return (
                  <Pressable
                    key={r}
                    accessibilityRole="button"
                    className={`rounded-2xl border p-3 ${
                      isSelected
                        ? 'border-petrol bg-petrol/5'
                        : 'border-sky/40 bg-white active:bg-canvas'
                    }`}
                    disabled={loading}
                    onPress={() => setSelectedRole(r)}>
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`text-sm font-bold ${
                          isSelected ? 'text-petrol' : 'text-steel'
                        }`}>
                        {label}
                      </Text>
                      <View
                        className={`h-4 w-4 rounded-full border items-center justify-center ${
                          isSelected ? 'border-petrol bg-petrol' : 'border-sky'
                        }`}>
                        {isSelected ? (
                          <View className="h-1.5 w-1.5 rounded-full bg-white" />
                        ) : null}
                      </View>
                    </View>
                    <Text className="mt-1 text-[11px] text-steel">
                      {desc}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {errorMessage ? (
            <View className="mt-3 rounded-xl border border-coral/30 bg-coral/10 p-2.5">
              <Text className="text-center text-xs font-medium text-coral">
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Botones de acción */}
          <View className="mt-5 gap-2.5">
            {!isTargetAdmin ? (
              <Pressable
                accessibilityRole="button"
                className={`h-12 w-full items-center justify-center rounded-2xl bg-petrol shadow-sm ${
                  loading ? 'opacity-70' : 'active:bg-petrol/90'
                }`}
                disabled={loading}
                onPress={handleConfirm}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-sm font-semibold text-white">
                    Confirmar cambio de rol
                  </Text>
                )}
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              className="h-10 w-full items-center justify-center rounded-xl border border-sky/40 bg-white"
              disabled={loading}
              onPress={onClose}>
              <Text className="text-xs font-semibold text-steel">Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
