import { useLocalSearchParams } from 'expo-router';
import { AdminPage } from '@/pages/admin';

export default function AdminRoute() {
  const { welcome } = useLocalSearchParams<{ welcome?: string }>();
  return <AdminPage welcome={welcome} />;
}
