import { Redirect } from 'expo-router';
import { ReactNode } from 'react';

import { LoadingState } from '@/components/digiwa';
import { useApp } from '@/context/AppContext';
import type { Role } from '@/types';

export function RoleGuard({ role, children }: { role: Role; children: ReactNode }) {
  const { currentUser, sessionLoading } = useApp();

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!currentUser) {
    return <Redirect href="/login" />;
  }

  if (currentUser.role !== role) {
    return <Redirect href={(currentUser.role === 'admin' ? '/(admin)' : '/(warga)') as never} />;
  }

  return children;
}
