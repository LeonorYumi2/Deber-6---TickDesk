import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RegisterForm } from '@/features/auth';
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

            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-coral" />
              <Text className="text-[10px] font-semibold tracking-[1.4px] text-steel">
                REGISTRO
              </Text>
            </View>
          </View>

          <SupportIllustration />

          <View className="pb-6 pt-7">
            <Text className="mb-2 text-[11px] font-semibold tracking-[2px] text-steel">
              NUEVA CUENTA
            </Text>
            <Text className="text-[32px] font-semibold leading-[38px] tracking-tight text-petrol">
              Comienza con{'\n'}TickDesk.
            </Text>
            <Text className="mt-3 text-[15px] leading-6 text-steel">
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
