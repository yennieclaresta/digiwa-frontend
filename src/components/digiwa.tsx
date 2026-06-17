import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { FiArrowLeft, FiCheck, FiChevronRight, FiClock, FiFileText, FiInbox, FiUpload } from 'react-icons/fi';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

import { colors, layout, radius, shadows, spacing, statusTheme, typography } from '@/constants/theme';
import type { CitizenRequest, RequestStatus, UploadedFile } from '@/types';
import { formatDate, serviceLabel } from '@/utils/format';

type IconProps = {
  icon: IconType;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

function resolveSvgValue(value: unknown, color: string) {
  return value === 'currentColor' ? color : value;
}

function cleanSvgProps(rawProps: Record<string, unknown>, color: string, strokeWidth?: number) {
  const nextProps: Record<string, unknown> = {};
  Object.entries(rawProps).forEach(([key, value]) => {
    if (key === 'children' || key === 'key' || key === 'ref' || key === 'className' || key === 'style') {
      return;
    }
    nextProps[key] = resolveSvgValue(value, color);
  });
  if (strokeWidth && !nextProps.strokeWidth) {
    nextProps.strokeWidth = strokeWidth;
  }
  return nextProps;
}

function renderIconNode(node: ReactNode, color: string, strokeWidth?: number): ReactNode {
  if (!node || typeof node !== 'object' || !('type' in node) || !('props' in node)) {
    return null;
  }

  const element = node as { type: string; props: Record<string, unknown> };
  const props = cleanSvgProps(element.props, color, strokeWidth);
  const children = (element.props.children as ReactNode[] | ReactNode | undefined) ?? null;
  const renderedChildren = Array.isArray(children)
    ? children.map((child, index) => <G key={index}>{renderIconNode(child, color, strokeWidth)}</G>)
    : renderIconNode(children, color, strokeWidth);

  switch (element.type) {
    case 'path':
      return <Path {...props} />;
    case 'circle':
      return <Circle {...props} />;
    case 'line':
      return <Line {...props} />;
    case 'polyline':
      return <Polyline {...props} />;
    case 'polygon':
      return <Polygon {...props} />;
    case 'rect':
      return <Rect {...props} />;
    case 'ellipse':
      return <Ellipse {...props} />;
    case 'g':
      return <G {...props}>{renderedChildren}</G>;
    default:
      return null;
  }
}

export function ReactIcon({ icon, size = 22, color = colors.textPrimary, strokeWidth, style }: IconProps) {
  const element = icon({}) as { props?: { attr?: Record<string, unknown>; children?: ReactNode } };
  const attr = element.props?.attr ?? {};
  const iconStrokeWidth = strokeWidth ?? Number(attr.strokeWidth ?? 2);
  const children = element.props?.children;

  return (
    <Svg
      width={size}
      height={size}
      viewBox={(attr.viewBox as string) ?? '0 0 24 24'}
      fill={(resolveSvgValue(attr.fill ?? 'none', color) as string) ?? 'none'}
      stroke={(resolveSvgValue(attr.stroke ?? 'currentColor', color) as string) ?? color}
      strokeWidth={iconStrokeWidth}
      strokeLinecap={(attr.strokeLinecap as 'round' | 'butt' | 'square' | undefined) ?? 'round'}
      strokeLinejoin={(attr.strokeLinejoin as 'round' | 'miter' | 'bevel' | undefined) ?? 'round'}
      style={style}
    >
      {Array.isArray(children)
        ? children.map((child, index) => <G key={index}>{renderIconNode(child, color, iconStrokeWidth)}</G>)
        : renderIconNode(children, color, iconStrokeWidth)}
    </Svg>
  );
}

export function Screen({
  children,
  scroll = true,
  padded = true,
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
}) {
  const contentStyle = [
    styles.screenContent,
    padded && styles.screenPadded,
    !scroll && styles.screenNoScroll,
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {scroll ? (
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={contentStyle}>
            {children}
          </ScrollView>
        ) : (
          <View style={contentStyle}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AppHeader({
  title,
  subtitle,
  showBack,
  right,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {showBack ? (
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
            <ReactIcon icon={FiArrowLeft} size={22} color={colors.primary} />
          </Pressable>
        ) : null}
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {right}
    </View>
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  icon?: IconType;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ title, onPress, icon, disabled, loading, style }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.pressed,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={colors.textInverse} /> : icon ? <ReactIcon icon={icon} color={colors.textInverse} size={20} /> : null}
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ title, onPress, icon, disabled, loading, style }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.secondaryButton,
        pressed && styles.pressed,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={colors.primary} /> : icon ? <ReactIcon icon={icon} color={colors.primary} size={20} /> : null}
      <Text style={styles.secondaryButtonText}>{title}</Text>
    </Pressable>
  );
}

export function TextInputField({
  label,
  error,
  multiline,
  ...props
}: TextInputProps & {
  label: string;
  error?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.neutral}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.textarea, error && styles.inputError]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  error,
  placeholder = 'Pilih salah satu',
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: readonly { label: string; value: string }[];
  error?: string;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.pickerWrap, error && styles.inputError]}>
        <Picker selectedValue={value ?? ''} onValueChange={onChange} style={styles.picker}>
          <Picker.Item label={placeholder} value="" color={colors.neutral} />
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function FileUploadField({
  label,
  value,
  onChange,
  error,
  required,
}: {
  label: string;
  value?: UploadedFile;
  onChange: (file: UploadedFile) => void;
  error?: string;
  required?: boolean;
}) {
  async function pickFile() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: '*/*',
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    onChange({
      id: `${Date.now()}-${asset.name}`,
      name: asset.name,
      uri: asset.uri,
      type: asset.mimeType ?? 'application/octet-stream',
      size: asset.size ?? 0,
      uploadedAt: new Date().toISOString(),
      // On Expo Web, asset.file is the native File object needed for proper multipart upload
      file: (asset as { file?: File }).file,
    });
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <Pressable onPress={pickFile} style={[styles.uploadBox, error && styles.inputError]}>
        <View style={styles.uploadIcon}>
          <ReactIcon icon={FiUpload} color={colors.primary} size={20} />
        </View>
        <View style={styles.uploadTextWrap}>
          <Text style={styles.uploadTitle}>{value ? value.name : 'Unggah Berkas'}</Text>
          <Text style={styles.uploadSubtitle}>{value ? 'Berkas siap dikirim' : 'PDF, JPG, atau PNG'}</Text>
        </View>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const theme = statusTheme[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <Text style={[styles.statusBadgeText, { color: theme.text }]}>{theme.label}</Text>
    </View>
  );
}

export function ServiceCard({
  icon,
  title,
  description,
  documents,
  onPress,
}: {
  icon: IconType;
  title: string;
  description: string;
  documents?: string[];
  onPress: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.serviceIconWrap}>
          <ReactIcon icon={icon} color={colors.primary} size={24} />
        </View>
        <Pressable onPress={onPress} style={styles.cardChevron} hitSlop={10}>
          <ReactIcon icon={FiChevronRight} color={colors.primary} size={22} />
        </Pressable>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      {documents?.length ? (
        <Text style={styles.cardMeta}>Berkas: {documents.slice(0, 3).join(', ')}{documents.length > 3 ? ', ...' : ''}</Text>
      ) : null}
      <PrimaryButton title="Ajukan Sekarang" onPress={onPress} style={styles.cardButton} />
    </View>
  );
}

export function RequestCard({
  request,
  onPress,
  adminMode,
}: {
  request: CitizenRequest;
  onPress: () => void;
  adminMode?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.requestCard, pressed && styles.pressed]}>
      <View style={styles.requestTopRow}>
        <View style={styles.requestIconWrap}>
          <ReactIcon icon={FiFileText} color={colors.secondary} size={20} />
        </View>
        <View style={styles.requestMain}>
          <Text style={styles.requestTitle}>{serviceLabel(request.serviceType)}</Text>
          <Text style={styles.requestTracking}>{request.trackingNumber}</Text>
          {adminMode ? <Text style={styles.requestMeta}>{request.applicantName} - NIK {request.nik || 'Belum tersedia'}</Text> : null}
        </View>
        <StatusBadge status={request.status} />
      </View>
      <View style={styles.requestBottomRow}>
        <Text style={styles.requestMeta}>Diajukan {formatDate(request.submittedAt)}</Text>
        <Text style={styles.requestMeta}>Update {formatDate(request.updatedAt)}</Text>
      </View>
      <Text style={styles.detailLink}>{adminMode ? 'Review' : 'Detail'}</Text>
    </Pressable>
  );
}

export function EmptyState({
  title,
  message,
  icon = FiInbox,
}: {
  title: string;
  message: string;
  icon?: IconType;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <ReactIcon icon={icon} color={colors.primary} size={28} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

export function LoadingState({ message = 'Memuat data...' }: { message?: string }) {
  return (
    <View style={styles.loadingState}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = 'Ya, lanjutkan',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
  loading,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <View style={styles.modalActions}>
            <SecondaryButton title={cancelText} onPress={onCancel} style={styles.modalButton} />
            <PrimaryButton title={confirmText} onPress={onConfirm} loading={loading} style={styles.modalButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <View style={styles.infoBox}>
      <View style={styles.infoIconWrap}>
        <ReactIcon icon={FiClock} color={colors.primary} size={18} />
      </View>
      <Text style={styles.infoText}>{children}</Text>
    </View>
  );
}

export function ProgressIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.progressWrap}>
      {Array.from({ length: total }).map((_, index) => {
        const active = index <= current;
        return <View key={index} style={[styles.progressDot, active && styles.progressDotActive]} />;
      })}
      <Text style={styles.progressText}>Langkah {current + 1} dari {total}</Text>
    </View>
  );
}

export function DashboardStatCard({
  title,
  value,
  icon,
  tone = 'primary',
}: {
  title: string;
  value: string | number;
  icon: IconType;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const toneColor = {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    info: colors.info,
  }[tone];

  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: tone === 'primary' ? colors.primaryLight : colors.neutralSoft }]}>
        <ReactIcon icon={icon} color={toneColor} size={22} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

export function CheckRow({
  checked,
  onPress,
  label,
  error,
}: {
  checked: boolean;
  onPress: () => void;
  label: string;
  error?: string;
}) {
  return (
    <View style={styles.field}>
      <Pressable onPress={onPress} style={styles.checkRow}>
        <View style={[styles.checkBox, checked && styles.checkBoxActive]}>
          {checked ? <ReactIcon icon={FiCheck} color={colors.textInverse} size={16} /> : null}
        </View>
        <Text style={styles.checkLabel}>{label}</Text>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  screenContent: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  screenPadded: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
  },
  screenNoScroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.bodySmall,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: typography.button,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: typography.button,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.78,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: typography.bodySmall,
  },
  required: {
    color: colors.danger,
  },
  input: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  textarea: {
    minHeight: 96,
    paddingTop: spacing.md,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.caption,
  },
  pickerWrap: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    color: colors.textPrimary,
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  uploadIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  uploadTextWrap: {
    flex: 1,
  },
  uploadTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  uploadSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: typography.caption,
    fontWeight: '900',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...(shadows.card ?? {}),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardChevron: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3,
    fontWeight: '900',
  },
  cardDescription: {
    color: colors.textSecondary,
    fontSize: typography.bodySmall,
    lineHeight: 19,
  },
  cardMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  cardButton: {
    marginTop: spacing.sm,
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  requestIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestMain: {
    flex: 1,
    gap: spacing.xs,
  },
  requestTitle: {
    color: colors.textPrimary,
    fontWeight: '900',
    fontSize: typography.body,
  },
  requestTracking: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  requestMeta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  requestBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailLink: {
    color: colors.primary,
    fontWeight: '900',
    alignSelf: 'flex-end',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  emptyIconWrap: {
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyMessage: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    padding: spacing.xxxl,
  },
  loadingText: {
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: typography.h2,
    fontWeight: '900',
  },
  modalMessage: {
    color: colors.textSecondary,
    lineHeight: 21,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  sectionTitleWrap: {
    gap: spacing.xs,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  progressDot: {
    height: 7,
    flex: 1,
    minWidth: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressText: {
    width: '100%',
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  statCard: {
    flex: 1,
    minWidth: 138,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.h1,
    fontWeight: '900',
  },
  statTitle: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkLabel: {
    flex: 1,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});
