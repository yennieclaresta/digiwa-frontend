import { Redirect } from 'expo-router';

import { LoadingState } from '@/components/digiwa';
import { useApp } from '@/context/AppContext';
import { StatusDetailScreen } from '@/screens/requestDetail';

export default function RequestDetailRoute() {
  const { currentUser, sessionLoading } = useApp();

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!currentUser) {
    return <Redirect href="/login" />;
  }

  return <StatusDetailScreen />;
}
