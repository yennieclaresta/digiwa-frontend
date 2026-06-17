import { usePathname, useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { ReactIcon } from '@/components/digiwa';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

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
      <View style={styles.desktopContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  sidebar: {
    width: 240,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: spacing.xxl,
    ...(shadows.subtle ?? {}),
  },
  sidebarLogo: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  sidebarLogoTitle: {
    color: colors.primary,
    fontSize: typography.h2,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  sidebarLogoSub: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 16,
  },
  sidebarNav: {
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  navItemActive: {
    backgroundColor: colors.primaryLight,
  },
  navLabel: {
    color: colors.textSecondary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  navLabelActive: {
    color: colors.primary,
  },
  desktopContent: {
    flex: 1,
  },
});
