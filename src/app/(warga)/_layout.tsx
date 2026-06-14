import { Tabs } from 'expo-router';
import { FiBell, FiFileText, FiHome, FiList, FiUser } from 'react-icons/fi';

import { ReactIcon } from '@/components/digiwa';
import { RoleGuard } from '@/components/RoleGuard';
import { colors, radius, spacing } from '@/constants/theme';

export default function WargaTabsLayout() {
  return (
    <RoleGuard role="warga">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.neutral,
          tabBarLabelStyle: { fontWeight: '800', fontSize: 11 },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            minHeight: 70,
            paddingTop: spacing.xs,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Beranda',
            tabBarIcon: ({ color, size }) => <ReactIcon icon={FiHome} color={String(color)} size={size} />,
          }}
        />
        <Tabs.Screen
          name="pengajuan"
          options={{
            title: 'Pengajuan',
            tabBarIcon: ({ color, size }) => <ReactIcon icon={FiFileText} color={String(color)} size={size} />,
          }}
        />
        <Tabs.Screen
          name="status"
          options={{
            title: 'Status',
            tabBarIcon: ({ color, size }) => <ReactIcon icon={FiList} color={String(color)} size={size} />,
          }}
        />
        <Tabs.Screen
          name="notifikasi"
          options={{
            title: 'Notifikasi',
            tabBarIcon: ({ color, size }) => <ReactIcon icon={FiBell} color={String(color)} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profil"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => <ReactIcon icon={FiUser} color={String(color)} size={size} />,
          }}
        />
      </Tabs>
    </RoleGuard>
  );
}
