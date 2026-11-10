import { useLocalSearchParams } from 'expo-router';
import { RequesterPage } from '@/pages/requester';

export default function RequesterRoute() {
  const { welcome } = useLocalSearchParams<{ welcome?: string }>();
  return <RequesterPage welcome={welcome} />;
}
