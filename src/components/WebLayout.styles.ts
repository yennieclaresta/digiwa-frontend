import { Platform, StyleSheet } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

export const styles = StyleSheet.create({
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
  sidebarLogoImage: {
    width: 48,
    height: 48,
    marginBottom: spacing.xs,
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
    alignItems: 'center',
  },
  desktopContentInner: {
    flex: 1,
    width: '100%',
    maxWidth: 900,
  },
});
