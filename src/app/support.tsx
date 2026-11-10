import { useLocalSearchParams } from 'expo-router';
import { SupportPage } from '@/pages/support';

export default function SupportRoute() {
  const { welcome } = useLocalSearchParams<{ welcome?: string }>();
  return <SupportPage welcome={welcome} />;
}
