import { Tabs } from 'expo-router';
import { PlatformPressable } from 'expo-router/build/react-navigation/elements';
import { FiBell, FiFileText, FiHome, FiList, FiUser } from 'react-icons/fi';
import { Platform, useWindowDimensions } from 'react-native';

import { ReactIcon } from '@/components/digiwa';
import { RoleGuard } from '@/components/RoleGuard';
import { DESKTOP_BREAKPOINT, WebDesktopLayout, type WebNavItem } from '@/components/WebLayout';
import { colors, radius, spacing } from '@/constants/theme';

const WARGA_NAV: WebNavItem[] = [
  { label: 'Beranda', icon: FiHome, href: '/(warga)/', segment: '' },
  { label: 'Pengajuan', icon: FiFileText, href: '/(warga)/pengajuan', segment: 'pengajuan' },
  { label: 'Status', icon: FiList, href: '/(warga)/status', segment: 'status' },
  { label: 'Notifikasi', icon: FiBell, href: '/(warga)/notifikasi', segment: 'notifikasi' },
  { label: 'Profil', icon: FiUser, href: '/(warga)/profil', segment: 'profil' },
];

export default function WargaTabsLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > DESKTOP_BREAKPOINT;

  return (
    <RoleGuard role="warga">
      <WebDesktopLayout navItems={WARGA_NAV}>
        <Tabs
          screenOptions={{
            headerShown: false,
            sceneStyle: {
              backgroundColor: colors.primaryLight,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.neutral,
            tabBarButton: isDesktop
              ? () => null
              : ({ children, android_ripple, ...props }: any) => (
                <PlatformPressable
                  {...props}
                  pressOpacity={1}
                  pressColor="transparent"
                  android_ripple={{
                    ...(android_ripple ?? {}),
                    color: 'transparent',
                    borderless: false,
                    radius: 0,
                  }}
                >
                  {children}
                </PlatformPressable>
              ),
            tabBarLabelStyle: { fontWeight: '800', fontSize: 11 },
            tabBarStyle: isDesktop
              ? { display: 'none' }
              : {
                backgroundColor: colors.primaryLight,
                borderTopWidth: 0,
                elevation: 0,
                shadowColor: 'transparent',
                shadowOpacity: 0,
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
      </WebDesktopLayout>
    </RoleGuard>
  );
}
