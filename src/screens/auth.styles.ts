import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

export const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  logo: {
    width: 118,
    height: 118,
  },
  appName: {
    color: colors.primary,
    fontSize: typography.title,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  splashLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  splashLoadingText: {
    color: colors.textSecondary,
    fontSize: typography.bodySmall,
  },
  authBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
  },
  brandLogo: {
    width: 58,
    height: 58,
  },
  appNameSmall: {
    color: colors.primary,
    fontSize: typography.h2,
    fontWeight: '900',
  },
  subtitleSmall: {
    color: colors.textSecondary,
  },
  formCard: {
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inlineFields: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inlineField: {
    flex: 1,
  },
  error: {
    color: colors.danger,
    fontWeight: '700',
  },
  authLink: {
    alignItems: 'center',
    padding: spacing.md,
  },
  authLinkText: {
    color: colors.primary,
    fontWeight: '900',
  },
});
