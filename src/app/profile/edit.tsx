import { Redirect } from 'expo-router';

import { LoadingState } from '@/components/digiwa';
import { useApp } from '@/context/AppContext';
import { EditProfileScreen } from '@/screens/profile';

export default function EditProfileRoute() {
  const { currentUser, sessionLoading } = useApp();

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!currentUser) {
    return <Redirect href="/login" />;
  }

  return <EditProfileScreen />;
}
