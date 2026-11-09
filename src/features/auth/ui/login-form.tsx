import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { AuthError } from '@supabase/supabase-js';
import { Eye, EyeOff } from 'lucide-react-native';

import { supabase } from '@/shared/lib/supabase';
import { TextField } from '@/shared/ui/text-field';
import { ForgotPasswordModal } from './forgot-password-modal';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFriendlyErrorMessage(error: AuthError): string {
  const message = error.message.toLowerCase();
  if (message.includes('invalid login credentials')) {
    return 'Credenciales incorrectas. Verifica tu correo y contraseña.';
  }
  if (message.includes('email not confirmed')) {
    return 'Tu correo electrónico no ha sido confirmado. Revisa tu bandeja de entrada.';
  }
  if (message.includes('too many requests')) {
    return 'Demasiados intentos fallidos. Espera unos momentos antes de reintentar.';
  }
  return error.message || 'Ocurrió un error al iniciar sesión. Inténtalo de nuevo.';
}

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
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

    if (!password) {
      setErrorMessage('Por favor, ingresa tu contraseña.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessInfo(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
      return;
    }

    // Sesión iniciada con éxito.
    // La pantalla de dashboard aún no está creada en src/app, por lo que conservamos
    // una navegación segura mostrando confirmación en vez de forzar una ruta inexistente.
    setSuccessInfo('¡Inicio de sesión exitoso! (La pantalla de dashboard aún está en desarrollo).');
  };

  return (
    <View>
      <TextField
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        label="Correo electrónico"
        onChangeText={(val) => {
          setEmail(val);
          if (errorMessage) setErrorMessage(null);
          if (successInfo) setSuccessInfo(null);
        }}
        placeholder="tu@empresa.com"
        textContentType="emailAddress"
        value={email}
      />

      <View className="mt-5">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-petrol">Contraseña</Text>
          <Pressable
            accessibilityHint="Abre la ventana para restablecer tu contraseña."
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setForgotModalVisible(true)}>
            <Text className="text-xs font-semibold text-steel active:text-petrol">
              ¿La olvidaste?
            </Text>
          </Pressable>
        </View>
        <TextField
          autoCapitalize="none"
          autoComplete="password"
          onChangeText={(val) => {
            setPassword(val);
            if (errorMessage) setErrorMessage(null);
            if (successInfo) setSuccessInfo(null);
          }}
          placeholder="Ingresa tu contraseña"
          rightElement={
            <Pressable
              accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setShowPassword((prev) => !prev)}>
              {showPassword ? (
                <EyeOff color="#5B91A5" size={19} />
              ) : (
                <Eye color="#5B91A5" size={19} />
              )}
            </Pressable>
          }
          secureTextEntry={!showPassword}
          textContentType="password"
          value={password}
        />
      </View>

      {errorMessage ? (
        <View className="mt-4 rounded-xl border border-coral/30 bg-coral/10 p-3">
          <Text className="text-xs font-medium text-coral">{errorMessage}</Text>
        </View>
      ) : null}

      {successInfo ? (
        <View className="mt-4 rounded-xl border border-sky bg-sky/20 p-3">
          <Text className="text-xs font-medium text-petrol">{successInfo}</Text>
        </View>
      ) : null}

      <Pressable
        accessibilityHint="Inicia sesión con tus credenciales."
        accessibilityRole="button"
        className={`mt-7 h-14 items-center justify-center rounded-2xl bg-coral ${
          loading ? 'opacity-70' : 'active:opacity-90'
        }`}
        disabled={loading}
        onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-[15px] font-semibold text-white">Iniciar sesión</Text>
        )}
      </Pressable>

      <View className="my-6 flex-row items-center gap-4">
        <View className="h-px flex-1 bg-sky" />
        <Text className="text-[11px] font-medium tracking-[1px] text-steel">O CONTINÚA CON</Text>
        <View className="h-px flex-1 bg-sky" />
      </View>

      <Pressable
        accessibilityHint="El acceso con Google es solo visual en esta etapa."
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        className="h-14 flex-row items-center justify-center gap-3 rounded-2xl border border-sky bg-white"
        disabled>
        <Text className="text-base font-bold text-petrol">G</Text>
        <Text className="text-sm font-semibold text-petrol">Continuar con Google</Text>
      </Pressable>

      <View className="mt-7 flex-row items-center justify-center gap-1">
        <Text className="text-sm text-steel">¿Aún no tienes una cuenta?</Text>
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.push('/register')}>
          <Text className="text-sm font-semibold text-petrol">Crear cuenta</Text>
        </Pressable>
      </View>

      {forgotModalVisible ? (
        <ForgotPasswordModal
          initialEmail={email}
          onClose={() => setForgotModalVisible(false)}
          visible={forgotModalVisible}
        />
      ) : null}
    </View>
  );
}
