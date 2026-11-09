import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import type { AuthError } from '@supabase/supabase-js';
import { Eye, EyeOff } from 'lucide-react-native';

import { supabase } from '@/shared/lib/supabase';
import { TextField } from '@/shared/ui/text-field';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFriendlyRegisterError(error: AuthError): string {
  const message = error.message.toLowerCase();
  if (message.includes('user already registered') || message.includes('already exists')) {
    return 'Ya existe una cuenta registrada con este correo electrónico.';
  }
  if (
    message.includes('password') &&
    (message.includes('least') ||
      message.includes('short') ||
      message.includes('weak') ||
      message.includes('characters'))
  ) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  if (message.includes('valid email')) {
    return 'Ingresa un correo electrónico válido.';
  }
  return error.message || 'Ocurrió un error al registrar la cuenta. Inténtalo de nuevo.';
}

export function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (loading) return;

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage('Por favor, ingresa tu nombre completo.');
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage('Por favor, ingresa tu correo electrónico.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMessage('Ingresa un correo electrónico válido (ej. usuario@empresa.com).');
      return;
    }

    if (!password) {
      setErrorMessage('Por favor, ingresa una contraseña.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const webUrl = process.env.EXPO_PUBLIC_WEB_URL;
    const emailRedirectTo = webUrl ? `${webUrl}/auth/confirm` : Linking.createURL('/');

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: trimmedName,
        },
      },
    });

    setLoading(false);

    if (error) {
      setErrorMessage(getFriendlyRegisterError(error));
      return;
    }

    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setErrorMessage('Ya existe una cuenta registrada con este correo electrónico.');
      return;
    }

    if (data.session) {
      // Si la confirmación de email no es requerida en Supabase, la sesión se inicia directamente.
      router.replace('/');
    } else {
      // Si Supabase requiere confirmación por email
      setSuccessMessage(
        '¡Cuenta creada con éxito! Hemos enviado un enlace de confirmación a tu correo. Por favor, revisa tu bandeja de entrada antes de iniciar sesión.'
      );
    }
  };

  if (successMessage) {
    return (
      <View className="rounded-2xl border border-sky bg-white p-6">
        <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-petrol/10">
          <Text className="text-lg font-bold text-petrol">✓</Text>
        </View>
        <Text className="text-lg font-bold text-petrol">Registro exitoso</Text>
        <Text className="mt-2 text-sm leading-6 text-steel">{successMessage}</Text>
        <Pressable
          accessibilityRole="button"
          className="mt-6 h-12 items-center justify-center rounded-xl bg-petrol active:opacity-90"
          onPress={() => router.replace('/')}>
          <Text className="text-sm font-semibold text-white">Ir al inicio de sesión</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <TextField
        autoCapitalize="words"
        autoComplete="name"
        label="Nombre completo"
        onChangeText={(val) => {
          setFullName(val);
          if (errorMessage) setErrorMessage(null);
        }}
        placeholder="Ej. Ana Martínez"
        textContentType="name"
        value={fullName}
      />

      <View className="mt-5">
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
      </View>

      <View className="mt-5">
        <TextField
          autoCapitalize="none"
          autoComplete="new-password"
          label="Contraseña"
          onChangeText={(val) => {
            setPassword(val);
            if (errorMessage) setErrorMessage(null);
          }}
          placeholder="Mínimo 8 caracteres"
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
          textContentType="newPassword"
          value={password}
        />
      </View>

      <View className="mt-5">
        <TextField
          autoCapitalize="none"
          autoComplete="new-password"
          label="Confirmar contraseña"
          onChangeText={(val) => {
            setConfirmPassword(val);
            if (errorMessage) setErrorMessage(null);
          }}
          placeholder="Repite tu contraseña"
          rightElement={
            <Pressable
              accessibilityLabel={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setShowConfirmPassword((prev) => !prev)}>
              {showConfirmPassword ? (
                <EyeOff color="#5B91A5" size={19} />
              ) : (
                <Eye color="#5B91A5" size={19} />
              )}
            </Pressable>
          }
          secureTextEntry={!showConfirmPassword}
          textContentType="newPassword"
          value={confirmPassword}
        />
      </View>

      {errorMessage ? (
        <View className="mt-4 rounded-xl border border-coral/30 bg-coral/10 p-3">
          <Text className="text-xs font-medium text-coral">{errorMessage}</Text>
        </View>
      ) : null}

      <Pressable
        accessibilityHint="Crea una cuenta nueva con los datos ingresados."
        accessibilityRole="button"
        className={`mt-7 h-14 items-center justify-center rounded-2xl bg-coral ${
          loading ? 'opacity-70' : 'active:opacity-90'
        }`}
        disabled={loading}
        onPress={handleRegister}>
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text className="text-[15px] font-semibold text-white">Crear cuenta</Text>
        )}
      </Pressable>

      <View className="mt-7 flex-row items-center justify-center gap-1">
        <Text className="text-sm text-steel">¿Ya tienes una cuenta?</Text>
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.back()}>
          <Text className="text-sm font-semibold text-petrol">Iniciar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}
