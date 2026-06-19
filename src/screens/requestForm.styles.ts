import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

export const styles = StyleSheet.create({
  formSection: {
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  summaryRow: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  summaryValue: {
    color: colors.textPrimary,
    lineHeight: 20,
    fontWeight: '700',
  },
  uploadSummaryTitle: {
    padding: spacing.md,
    color: colors.textPrimary,
    fontWeight: '900',
  },
  uploadSummaryRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  uploadSummaryName: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  uploadSummaryMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  successCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  successIcon: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
  },
  successTitle: {
    color: colors.textPrimary,
    fontSize: typography.h2,
    fontWeight: '900',
    textAlign: 'center',
  },
  successMessage: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  trackingNumber: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: typography.h3,
    textAlign: 'center',
  },
});
