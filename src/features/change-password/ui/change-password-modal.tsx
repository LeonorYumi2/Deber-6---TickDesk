import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Eye, EyeOff, KeyRound, ShieldCheck, X } from 'lucide-react-native';

import { useSession } from '@/entities/session';
import { supabase } from '@/shared/lib/supabase';
import { COLORS } from '@/shared/theme';
import { TextField } from '@/shared/ui/text-field';

type ChangePasswordModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const { user } = useSession();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const handleChangePassword = async () => {
    if (loading) return;

    if (!user?.email) {
      setErrorMessage('No se encontró el correo de la sesión activa.');
      return;
    }

    // 1. Validación de campos vacíos
    if (!currentPassword) {
      setErrorMessage('Por favor, ingresa tu contraseña actual.');
      return;
    }

    if (!newPassword) {
      setErrorMessage('Por favor, ingresa la nueva contraseña.');
      return;
    }

    if (!confirmPassword) {
      setErrorMessage('Por favor, confirma la nueva contraseña.');
      return;
    }

    // 2. Validación de longitud mínima y seguridad
    if (newPassword.length < 8) {
      setErrorMessage('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    // 3. Comprobar que sea distinta a la actual
    if (newPassword === currentPassword) {
      setErrorMessage('La nueva contraseña debe ser diferente a la contraseña actual.');
      return;
    }

    // 4. Comprobación de coincidencia
    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas nuevas no coinciden.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Mecanismo seguro de Supabase: re-autenticar con la contraseña actual antes de actualizar
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        console.warn('Fallo de verificación de contraseña actual:', signInError.message);
        setErrorMessage('La contraseña actual es incorrecta. Verifícala e intenta nuevamente.');
        return;
      }

      // Actualizar a la nueva contraseña mediante Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('Error al actualizar contraseña:', updateError);
        setErrorMessage(updateError.message || 'No se pudo actualizar la contraseña.');
        return;
      }

      // Éxito: limpiar campos y mostrar mensaje positivo
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('¡Tu contraseña ha sido actualizada con éxito! Tu nueva clave de acceso ya está activa.');
    } catch (err) {
      console.error('Excepción al cambiar contraseña:', err);
      setErrorMessage('Error de conexión al procesar el cambio de contraseña.');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleClose}
      transparent
      visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 items-center justify-center bg-petrol/60 px-5 py-6">
        <Pressable
          accessibilityLabel="Cerrar modal"
          className="absolute inset-0"
          onPress={handleClose}
        />

        <View className="w-full max-w-[460px] max-h-[92%] rounded-3xl border border-sky/40 bg-white p-6 shadow-2xl">
          {/* Cabecera */}
          <View className="mb-4 flex-row items-center justify-between border-b border-sky/30 pb-3">
            <View className="flex-row items-center gap-2.5">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-petrol/10">
                <KeyRound color={COLORS.PETROL} size={18} />
              </View>
              <View>
                <Text className="text-base font-bold text-petrol">
                  Cambiar contraseña
                </Text>
                <Text className="text-[10px] font-semibold tracking-wider text-steel">
                  SEGURIDAD DE LA CUENTA
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              className="h-8 w-8 items-center justify-center rounded-full bg-canvas"
              disabled={loading}
              onPress={handleClose}>
              <X color={COLORS.STEEL} size={18} />
            </Pressable>
          </View>

          {successMessage ? (
            <View className="py-4 items-center">
              <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-petrol/10">
                <ShieldCheck color={COLORS.PETROL} size={32} />
              </View>
              <Text className="text-base font-bold text-petrol text-center">
                Contraseña modificada
              </Text>
              <Text className="mt-2 text-center text-xs leading-5 text-steel max-w-[280px]">
                {successMessage}
              </Text>

              <Pressable
                accessibilityRole="button"
                className="mt-6 h-12 w-full items-center justify-center rounded-2xl bg-petrol active:bg-petrol/90"
                onPress={handleClose}>
                <Text className="text-sm font-semibold text-white">
                  Entendido
                </Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView
              className="flex-grow-0"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View className="gap-3.5 pb-2">
                <Text className="text-xs leading-5 text-steel">
                  Para actualizar tu contraseña, confirma tu contraseña actual y define una nueva que tenga al menos 8 caracteres.
                </Text>

                <TextField
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  label="Contraseña actual *"
                  onChangeText={(val) => {
                    setCurrentPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Tu contraseña actual"
                  rightElement={
                    <Pressable
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => setShowCurrentPassword((prev) => !prev)}>
                      {showCurrentPassword ? (
                        <EyeOff color={COLORS.STEEL} size={18} />
                      ) : (
                        <Eye color={COLORS.STEEL} size={18} />
                      )}
                    </Pressable>
                  }
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                />

                <TextField
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  label="Nueva contraseña *"
                  onChangeText={(val) => {
                    setNewPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Mínimo 8 caracteres"
                  rightElement={
                    <Pressable
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => setShowNewPassword((prev) => !prev)}>
                      {showNewPassword ? (
                        <EyeOff color={COLORS.STEEL} size={18} />
                      ) : (
                        <Eye color={COLORS.STEEL} size={18} />
                      )}
                    </Pressable>
                  }
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                />

                <TextField
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  label="Confirmar nueva contraseña *"
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Repite la nueva contraseña"
                  rightElement={
                    <Pressable
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => setShowConfirmPassword((prev) => !prev)}>
                      {showConfirmPassword ? (
                        <EyeOff color={COLORS.STEEL} size={18} />
                      ) : (
                        <Eye color={COLORS.STEEL} size={18} />
                      )}
                    </Pressable>
                  }
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                />

                {errorMessage ? (
                  <View className="rounded-xl border border-coral/30 bg-coral/10 p-2.5">
                    <Text className="text-center text-xs font-medium text-coral">
                      {errorMessage}
                    </Text>
                  </View>
                ) : null}

                <View className="mt-2 gap-2">
                  <Pressable
                    accessibilityRole="button"
                    className={`h-12 w-full items-center justify-center rounded-2xl bg-petrol ${
                      loading ? 'opacity-70' : 'active:bg-petrol/90'
                    }`}
                    disabled={loading}
                    onPress={handleChangePassword}>
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text className="text-sm font-semibold text-white">
                        Actualizar contraseña
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    className="h-10 w-full items-center justify-center rounded-xl border border-sky/50 bg-white active:bg-canvas"
                    disabled={loading}
                    onPress={handleClose}>
                    <Text className="text-xs font-semibold text-steel">
                      Cancelar
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
