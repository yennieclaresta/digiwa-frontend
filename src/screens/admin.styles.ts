import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

export const styles = StyleSheet.create({
  adminHero: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  adminHeroIcon: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminHeroTitle: {
    color: colors.textInverse,
    fontSize: typography.h1,
    fontWeight: '900',
  },
  adminHeroSubtitle: {
    color: colors.textInverse,
    lineHeight: 21,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  serviceFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontWeight: '800',
    fontSize: typography.caption,
  },
  filterTextActive: {
    color: colors.textInverse,
  },
  activityCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: {
    flex: 1,
    gap: spacing.xs,
  },
  activityTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  activityMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  filterPanel: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
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
  printCard: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  printTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  printIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  printText: {
    flex: 1,
    gap: spacing.xs,
  },
  printTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '900',
  },
  printMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  printActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  printButton: {
    flex: 1,
  },
  profileCard: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    color: colors.textPrimary,
    fontSize: typography.h2,
    fontWeight: '900',
  },
  profileMeta: {
    color: colors.textSecondary,
  },
});
