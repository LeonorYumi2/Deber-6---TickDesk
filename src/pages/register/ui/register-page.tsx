import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RegisterForm } from '@/features/auth';
import { AppLogo } from '@/shared/ui/app-logo';
import { SupportIllustration } from '@/widgets/support-illustration/ui/support-illustration';

export function RegisterPage() {
  return (
    <SafeAreaView className="flex-1 bg-canvas" style={{ flex: 1 }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled">
        <View className="mx-auto w-full max-w-[440px] flex-1 px-6 pb-8">
          <View className="flex-row items-center justify-between pb-6 pt-3">
            <AppLogo />

            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-coral" />
              <Text className="text-[10px] font-semibold tracking-[1.4px] text-steel">
                REGISTRO
              </Text>
            </View>
          </View>

          <SupportIllustration compact />

          <View className="pb-4 pt-5">
            <Text className="mb-1 text-[11px] font-semibold tracking-[2px] text-steel">
              NUEVA CUENTA
            </Text>
            <Text className="text-[28px] font-semibold leading-[34px] tracking-tight text-petrol">
              Comienza con{'\n'}TickDesk.
            </Text>
            <Text className="mt-2 text-sm leading-5 text-steel">
              Crea tu cuenta para gestionar y dar seguimiento a tus tickets.
            </Text>
          </View>

          <RegisterForm />

          <View className="mt-auto items-center pt-8">
            <Text className="text-xs text-steel">TickDesk · Soporte técnico</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
