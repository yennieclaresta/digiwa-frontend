import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

export const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  summaryIcon: {
    width: 50,
    height: 50,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    flex: 1,
    gap: spacing.xs,
  },
  summaryTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3,
    fontWeight: '900',
  },
  summaryMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  timelineCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineMarkerWrap: {
    alignItems: 'center',
  },
  timelineMarker: {
    width: 14,
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  timelineLine: {
    width: 2,
    minHeight: 54,
    backgroundColor: colors.border,
  },
  timelineText: {
    flex: 1,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  timelineTitle: {
    color: colors.textPrimary,
    fontWeight: '900',
  },
  timelineDescription: {
    color: colors.textSecondary,
    lineHeight: 19,
  },
  timelineDate: {
    color: colors.neutral,
    fontSize: typography.caption,
  },
  dataCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dataRow: {
    padding: spacing.lg,
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dataLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '900',
  },
  dataValue: {
    color: colors.textPrimary,
    fontWeight: '700',
    lineHeight: 20,
  },
  documentList: {
    gap: spacing.md,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryLight,
  },
  documentText: {
    flex: 1,
    gap: spacing.xs,
  },
  documentName: {
    color: colors.textPrimary,
    fontWeight: '900',
  },
  documentMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  documentActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  documentAction: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCard: {
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  printActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  printButton: {
    flex: 1,
  },
});
