import { Tabs } from 'expo-router';
import { PlatformPressable } from 'expo-router/build/react-navigation/elements';
import { FiBell, FiFileText, FiHome, FiList, FiUser } from 'react-icons/fi';

import { ReactIcon } from '@/components/digiwa';
import { RoleGuard } from '@/components/RoleGuard';
import { colors } from '@/constants/theme';

export default function WargaTabsLayout() {
  return (
    <RoleGuard role="warga">
      <Tabs
        screenOptions={{
          headerShown: true,
          sceneStyle: {
            backgroundColor: colors.primaryLight,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.neutral,
          tabBarButton: ({ children, android_ripple, ...props }: any) => (
            <PlatformPressable
              {...props}
              pressOpacity={1}
              android_ripple={{
                color: colors.neutral,
                borderless: true,
                ...(android_ripple ?? {}),
              }}
            >
              {children}
            </PlatformPressable>
          ),
          tabBarLabelStyle: { fontWeight: '800', fontSize: 10 },
          tabBarStyle: {
            backgroundColor: colors.primaryLight,
            elevation: 0,
            minHeight: 60,
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
