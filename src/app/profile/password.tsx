import { Redirect } from 'expo-router';

import { LoadingState } from '@/components/digiwa';
import { useApp } from '@/context/AppContext';
import { ChangePasswordScreen } from '@/screens/profile';

export default function ChangePasswordRoute() {
  const { currentUser, sessionLoading } = useApp();

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!currentUser) {
    return <Redirect href="/login" />;
  }

  return <ChangePasswordScreen />;
}
