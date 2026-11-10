import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useSession, type UserRole } from '@/entities/session';
import { COLORS } from '@/shared/theme';

export default function DashboardRoute() {
  const { profile, isLoading } = useSession();
  const { welcome } = useLocalSearchParams<{ welcome?: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && profile?.role) {
      const targetPath: `/${UserRole}` = `/${profile.role}`;
      router.replace({
        pathname: targetPath,
        params: welcome === '1' ? { welcome: '1' } : undefined,
      });
    }
  }, [profile, isLoading, welcome, router]);

  return (
    <View className="flex-1 items-center justify-center bg-canvas">
      <ActivityIndicator color={COLORS.PETROL} size="large" />
    </View>
  );
}
