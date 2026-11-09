import { useLocalSearchParams } from 'expo-router';
import { DashboardPage } from '@/pages/dashboard';

export default function DashboardRoute() {
  const { welcome } = useLocalSearchParams<{ welcome?: string }>();
  return <DashboardPage welcome={welcome} />;
}
