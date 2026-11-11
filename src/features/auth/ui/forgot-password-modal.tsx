import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';

import emailSentAnimation from '@/shared/assets/animations/email-sent.json';
import { supabase } from '@/shared/lib/supabase';
import { COLORS } from '@/shared/theme';
import { AppLogo } from '@/shared/ui/app-logo';
import { LottieState } from '@/shared/ui/lottie-state';
import { TextField } from '@/shared/ui/text-field';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ForgotPasswordModalProps = {
  visible: boolean;
  onClose: () => void;
  initialEmail?: string;
};

export function ForgotPasswordModal({
  visible,
  onClose,
  initialEmail = '',
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClose = () => {
    if (loading) return;
    setErrorMessage(null);
    setIsSuccess(false);
    onClose();
  };

  const handleResetPassword = async () => {
    if (loading) return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Por favor, ingresa tu correo electrónico.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMessage('Ingresa un correo electrónico válido (ej. usuario@empresa.com).');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const webUrl = process.env.EXPO_PUBLIC_WEB_URL;
    const redirectTo = `${webUrl}/auth/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('rate limit') || msg.includes('too many requests')) {
        setErrorMessage(
          'Demasiadas solicitudes. Por favor, espera unos momentos antes de intentar de nuevo.'
        );
      } else {
        setErrorMessage(error.message || 'No se pudo enviar el correo de recuperación.');
      }
      return;
    }

    setIsSuccess(true);
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleClose}
      transparent
      visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 items-center justify-center bg-petrol/60 px-5">
        <Pressable
          accessibilityLabel="Cerrar modal"
          className="absolute inset-0"
          onPress={handleClose}
        />

        <View className="w-full max-w-[420px] rounded-3xl border border-sky/40 bg-white p-6 shadow-lg">
          {isSuccess ? (
            <View className="items-center py-2">
              <LottieState className="mb-2" size={100} source={emailSentAnimation} />

              <Text className="text-[11px] font-bold tracking-[2px] text-steel">
                ENLACE ENVIADO
              </Text>

              <Text className="mt-1 text-center text-xl font-bold text-petrol">
                Revisa tu correo
              </Text>

              <Text className="mt-3 text-center text-sm leading-6 text-steel">
                Hemos enviado las instrucciones para restablecer tu contraseña a{' '}
                <Text className="font-semibold text-petrol">{email.trim()}</Text>. Sigue el
                enlace recibido para crear tu nueva contraseña.
              </Text>

              <Pressable
                accessibilityRole="button"
                className="mt-6 h-14 w-full items-center justify-center rounded-2xl bg-petrol active:opacity-90"
                onPress={handleClose}>
                <Text className="text-sm font-semibold text-white">
                  Volver al inicio de sesión
                </Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <View className="mb-4 flex-row items-center justify-between">
                <AppLogo size="sm" />

                <Pressable
                  accessibilityLabel="Cerrar"
                  accessibilityRole="button"
                  className="h-8 w-8 items-center justify-center rounded-full bg-canvas active:opacity-70"
                  hitSlop={8}
                  onPress={handleClose}>
                  <X color={COLORS.STEEL} size={18} />
                </Pressable>
              </View>

              <View className="mb-3">
                <Text className="text-[11px] font-semibold tracking-[2px] text-steel">
                  RECUPERACIÓN
                </Text>
                <Text className="text-xl font-bold text-petrol">
                  Restablecer contraseña
                </Text>
              </View>

              <Text className="mb-5 text-sm leading-5 text-steel">
                Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace
                seguro para crear una nueva contraseña.
              </Text>

              <TextField
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                label="Correo electrónico"
                onChangeText={(val) => {
                  setEmail(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="tu@empresa.com"
                textContentType="emailAddress"
                value={email}
              />

              {errorMessage ? (
                <View className="mt-4 rounded-xl border border-coral/30 bg-coral/10 p-3">
                  <Text className="text-xs font-medium text-coral">{errorMessage}</Text>
                </View>
              ) : null}

              <Pressable
                accessibilityHint="Envía el correo de recuperación a tu dirección."
                accessibilityRole="button"
                className={`mt-6 h-14 items-center justify-center rounded-2xl bg-petrol ${
                  loading ? 'opacity-70' : 'active:bg-petrol/90'
                }`}
                disabled={loading}
                onPress={handleResetPassword}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-[15px] font-semibold text-white">
                    Enviar enlace de recuperación
                  </Text>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                className="mt-3 h-11 items-center justify-center rounded-2xl active:opacity-70"
                disabled={loading}
                onPress={handleClose}>
                <Text className="text-sm font-semibold text-steel">Cancelar</Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
