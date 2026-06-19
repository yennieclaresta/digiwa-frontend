import { Platform } from 'react-native';

export const colors = {
  primary: '#0D3B82',
  primaryDark: '#082B61',
  primaryLight: '#E7F0FF',
  secondary: '#0E9384',
  secondaryLight: '#E7F8F5',
  accent: '#F6C445',
  accentSoft: '#FFF7DB',
  background: '#F7FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF4F8',
  textPrimary: '#102033',
  textSecondary: '#5C6B7A',
  textInverse: '#FFFFFF',
  border: '#D8E2EA',
  success: '#1E9E5A',
  successSoft: '#E6F7EE',
  warning: '#F0A51A',
  warningSoft: '#FFF3D8',
  danger: '#DC3D3D',
  dangerSoft: '#FDEAEA',
  info: '#2D7FE5',
  infoSoft: '#E7F1FF',
  orange: '#F47B20',
  orangeSoft: '#FFF0E5',
  neutral: '#8A98A8',
  neutralSoft: '#F0F3F6',
  overlay: 'rgba(16, 32, 51, 0.42)',
  shadow: 'rgba(13, 59, 130, 0.14)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const typography = {
  title: 30,
  h1: 26,
  h2: 21,
  h3: 18,
  body: 15,
  bodySmall: 13,
  caption: 12,
  button: 15,
} as const;

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 18,
    },
    android: {
      elevation: 3,
    },
    web: {
      boxShadow: `0 8px 18px ${colors.shadow}`,
    } as any,
    default: {
      boxShadow: `0 8px 18px ${colors.shadow}`,
    } as any,
  }),
  subtle: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 8,
    },
    android: {
      elevation: 1,
    },
    web: {
      boxShadow: `0 3px 8px ${colors.shadow}`,
    } as any,
    default: {
      boxShadow: `0 3px 8px ${colors.shadow}`,
    } as any,
  }),
} as const;

export const statusTheme = {
  pending: {
    label: 'Pending',
    background: colors.warningSoft,
    text: '#7A4A00',
    border: '#F8D78A',
  },
  diproses: {
    label: 'Diproses',
    background: colors.infoSoft,
    text: colors.info,
    border: '#BCD7FF',
  },
  revisi: {
    label: 'Revisi',
    background: colors.orangeSoft,
    text: colors.orange,
    border: '#FFC89E',
  },
  selesai: {
    label: 'Selesai',
    background: colors.successSoft,
    text: colors.success,
    border: '#BCE8CE',
  },
  ditolak: {
    label: 'Ditolak',
    background: colors.dangerSoft,
    text: colors.danger,
    border: '#F5B7B7',
  },
} as const;

export const layout = {
  screenPadding: spacing.lg,
  bottomTabHeight: Platform.select({ ios: 82, android: 70, default: 74 }),
  maxContentWidth: 520,
} as const;

export const Colors = {
  light: {
    text: colors.textPrimary,
    background: colors.background,
    backgroundElement: colors.surfaceMuted,
    backgroundSelected: colors.primaryLight,
    textSecondary: colors.textSecondary,
  },
  dark: {
    text: colors.textPrimary,
    background: colors.background,
    backgroundElement: colors.surfaceMuted,
    backgroundSelected: colors.primaryLight,
    textSecondary: colors.textSecondary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  web: {
    sans: 'system-ui',
    serif: 'Georgia',
    rounded: 'system-ui',
    mono: 'monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: spacing.xs / 2,
  one: spacing.xs,
  two: spacing.sm,
  three: spacing.lg,
  four: spacing.xxl,
  five: spacing.xxxl,
  six: 64,
} as const;

export const BottomTabInset = layout.bottomTabHeight ?? 0;
export const MaxContentWidth = layout.maxContentWidth;
