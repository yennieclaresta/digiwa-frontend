import { usePathname, useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { Image, Platform, Pressable, Text, View, useWindowDimensions } from 'react-native';

import { ReactIcon } from '@/components/digiwa';
import { colors } from '@/constants/theme';

import { styles } from './WebLayout.styles';

export const DESKTOP_BREAKPOINT = 768;

export type WebNavItem = {
  label: string;
  icon: IconType;
  href: string;
  segment: string;
};

function SidebarNav({ items }: { items: WebNavItem[] }) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(item: WebNavItem): boolean {
    if (item.segment) {
      return pathname.includes('/' + item.segment);
    }
    return !items.some((other) => other.segment && pathname.includes('/' + other.segment));
  }

  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarLogo}>
        <Image
          source={require('../../assets/digiwa.png')}
          style={styles.sidebarLogoImage}
          resizeMode="contain"
        />
        <Text style={styles.sidebarLogoTitle}>DIGIWA</Text>
        <Text style={styles.sidebarLogoSub}>Digitalisasi Data Warga</Text>
      </View>
      <View style={styles.sidebarNav}>
        {items.map((item) => {
          const active = isActive(item);
          return (
            <Pressable
              key={item.href}
              style={[styles.navItem, active ? styles.navItemActive : undefined]}
              onPress={() => router.push(item.href as Parameters<typeof router.push>[0])}
            >
              <ReactIcon icon={item.icon} size={19} color={active ? colors.primary : colors.textSecondary} />
              <Text style={[styles.navLabel, active ? styles.navLabelActive : undefined]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function WebDesktopLayout({ children, navItems }: { children: ReactNode; navItems: WebNavItem[] }) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > DESKTOP_BREAKPOINT;

  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <View style={styles.desktopContainer}>
      <SidebarNav items={navItems} />
      <View style={styles.desktopContent}>
        <View style={styles.desktopContentInner}>{children}</View>
      </View>
    </View>
  );
}
