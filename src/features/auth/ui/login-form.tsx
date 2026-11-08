import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { TextField } from '@/shared/ui/text-field';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View>
      <TextField
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        label="Correo electrónico"
        onChangeText={setEmail}
        placeholder="tu@empresa.com"
        textContentType="emailAddress"
        value={email}
      />

      <View className="mt-5">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-petrol">Contraseña</Text>
          <Text className="text-xs font-semibold text-steel">¿La olvidaste?</Text>
        </View>
        <TextField
          autoCapitalize="none"
          autoComplete="password"
          onChangeText={setPassword}
          placeholder="Ingresa tu contraseña"
          secureTextEntry
          textContentType="password"
          value={password}
        />
      </View>

      <Pressable
        accessibilityHint="La autenticación aún no está implementada."
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        className="mt-7 h-14 items-center justify-center rounded-2xl bg-coral"
        disabled>
        <Text className="text-[15px] font-semibold text-white">Iniciar sesión</Text>
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
        <Text className="text-sm font-semibold text-petrol">Crear cuenta</Text>
      </View>
    </View>
  );
}
