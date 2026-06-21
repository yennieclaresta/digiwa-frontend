import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

export const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: colors.textInverse,
    fontSize: typography.h1,
    fontWeight: '900',
  },
  heroSubtitle: {
    color: colors.textInverse,
    lineHeight: 21,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  serviceMiniCard: {
    width: '48%',
    minWidth: 140,
    minHeight: 128,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  serviceMiniIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceMiniTitle: {
    width: '100%',
    color: colors.textPrimary,
    fontWeight: '900',
    lineHeight: 20,
    textAlign: 'left',
  },
  latestCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  latestTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  latestText: {
    flex: 1,
  },
  latestTitle: {
    color: colors.textPrimary,
    fontWeight: '900',
  },
  latestMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  latestDesc: {
    color: colors.textSecondary,
  },
  quickActions: {
    gap: spacing.md,
  },
  filterWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
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
  notificationCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notificationUnread: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  notificationIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    flex: 1,
    gap: spacing.xs,
  },
  notificationTitle: {
    color: colors.textPrimary,
    fontWeight: '900',
  },
  notificationMessage: {
    color: colors.textSecondary,
    lineHeight: 19,
  },
  notificationDate: {
    color: colors.neutral,
    fontSize: typography.caption,
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
  profileNik: {
    color: colors.textSecondary,
  },
  infoList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  infoRow: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  infoValue: {
    color: colors.textPrimary,
    fontWeight: '800',
    lineHeight: 20,
  },
  faqWrap: {
    gap: spacing.sm,
  },
  faqCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    gap: spacing.md,
  },
  faqQuestionText: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: '800',
    lineHeight: 20,
  },
  faqAnswer: {
    color: colors.textSecondary,
    lineHeight: 21,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
