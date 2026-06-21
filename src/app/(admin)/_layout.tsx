import { Tabs } from 'expo-router';
import { PlatformPressable } from 'expo-router/build/react-navigation/elements';
import { FiArchive, FiCheckSquare, FiGrid, FiPrinter, FiUser } from 'react-icons/fi';
import { Platform, useWindowDimensions } from 'react-native';

import { ReactIcon } from '@/components/digiwa';
import { RoleGuard } from '@/components/RoleGuard';
import { DESKTOP_BREAKPOINT, WebDesktopLayout, type WebNavItem } from '@/components/WebLayout';
import { colors, radius, spacing } from '@/constants/theme';

const ADMIN_NAV: WebNavItem[] = [
  { label: 'Dashboard', icon: FiGrid, href: '/(admin)/', segment: '' },
  { label: 'Permohonan', icon: FiArchive, href: '/(admin)/permohonan', segment: 'permohonan' },
  { label: 'Verifikasi', icon: FiCheckSquare, href: '/(admin)/verifikasi', segment: 'verifikasi' },
  { label: 'Cetak', icon: FiPrinter, href: '/(admin)/cetak', segment: 'cetak' },
  { label: 'Profil', icon: FiUser, href: '/(admin)/profil', segment: 'profil' },
];

export default function AdminTabsLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > DESKTOP_BREAKPOINT;

  return (
    <RoleGuard role="admin">
      <WebDesktopLayout navItems={ADMIN_NAV}>
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
              title: 'Dashboard',
              tabBarIcon: ({ color, size }) => <ReactIcon icon={FiGrid} color={String(color)} size={size} />,
            }}
          />
          <Tabs.Screen
            name="permohonan"
            options={{
              title: 'Permohonan',
              tabBarIcon: ({ color, size }) => <ReactIcon icon={FiArchive} color={String(color)} size={size} />,
            }}
          />
          <Tabs.Screen
            name="verifikasi"
            options={{
              title: 'Verifikasi',
              tabBarIcon: ({ color, size }) => <ReactIcon icon={FiCheckSquare} color={String(color)} size={size} />,
            }}
          />
          <Tabs.Screen
            name="cetak"
            options={{
              title: 'Cetak',
              tabBarIcon: ({ color, size }) => <ReactIcon icon={FiPrinter} color={String(color)} size={size} />,
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
