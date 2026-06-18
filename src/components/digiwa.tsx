import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { ReactNode, useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiArrowLeft, FiCalendar, FiCheck, FiChevronDown, FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronsLeft, FiChevronsRight, FiClock, FiFileText, FiInbox, FiUpload } from 'react-icons/fi';
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
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
            style={styles.backButton}
            hitSlop={10}
          >
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
  value,
  secureTextEntry,
  ...props
}: TextInputProps & {
  label: string;
  error?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {secureTextEntry ? (
        <View style={[styles.inputWrapper, error ? styles.inputWrapperError : undefined]}>
          <TextInput
            placeholderTextColor={colors.neutral}
            style={styles.inputInner}
            secureTextEntry={!showPassword}
            {...props}
            value={value ?? ''}
          />
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.eyeButton}
            hitSlop={8}
          >
            <ReactIcon icon={showPassword ? FaEyeSlash : FaEye} color={colors.textSecondary} size={20} />
          </Pressable>
        </View>
      ) : (
        <TextInput
          placeholderTextColor={colors.neutral}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[styles.input, multiline && styles.textarea, error && styles.inputError]}
          {...props}
          value={value ?? ''}
        />
      )}
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
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? '';
  const isWeb = Platform.OS === 'web';

  function handleSelect(val: string) {
    onChange(val);
    setOpen(false);
  }

  const trigger = (
    <Pressable
      onPress={() => setOpen((prev) => !prev)}
      style={[styles.selectTrigger, error ? styles.inputError : undefined]}
    >
      <Text style={[styles.selectTriggerText, !value ? styles.selectPlaceholder : undefined]} numberOfLines={1}>
        {selectedLabel || placeholder}
      </Text>
      <ReactIcon icon={FiChevronDown} size={16} color={colors.textSecondary} />
    </Pressable>
  );

  if (isWeb) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          onPress={() => setOpen((prev) => !prev)}
          style={[
            styles.selectTrigger,
            open ? styles.selectTriggerOpen : undefined,
            error ? styles.inputError : undefined,
          ]}
        >
          <Text style={[styles.selectTriggerText, !value ? styles.selectPlaceholder : undefined]} numberOfLines={1}>
            {selectedLabel || placeholder}
          </Text>
          <ReactIcon icon={FiChevronDown} size={16} color={colors.textSecondary} />
        </Pressable>
        {open ? (
          <View style={styles.webInlineOptions}>
            <ScrollView style={{ maxHeight: 240 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  style={[styles.webOption, option.value === value ? styles.webOptionSelected : undefined]}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text style={[styles.webOptionText, option.value === value ? styles.webOptionTextSelected : undefined]}>
                    {option.label}
                  </Text>
                  {option.value === value ? <ReactIcon icon={FiCheck} size={14} color={colors.primary} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {trigger}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.bottomSheet} onPress={() => { }}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>{label}</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  style={[styles.sheetOption, option.value === value ? styles.sheetOptionSelected : undefined]}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text style={[styles.sheetOptionText, option.value === value ? styles.sheetOptionTextSelected : undefined]}>
                    {option.label}
                  </Text>
                  {option.value === value ? <ReactIcon icon={FiCheck} size={18} color={colors.primary} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const DAY_HEADERS_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOffset(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

function buildCalWeeks(year: number, month: number): (number | null)[][] {
  const totalDays = getDaysInMonth(year, month);
  const offset = getFirstDayOffset(year, month);
  const cells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function todayParts() {
  const d = new Date();
  return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
}

type CalendarViewProps = {
  year: number;
  month: number;
  selectedDay: number | null;
  onNavigate: (year: number, month: number) => void;
  onSelect: (day: number) => void;
};

function CalendarView({ year, month, selectedDay, onNavigate, onSelect }: CalendarViewProps) {
  const today = todayParts();
  const weeks = buildCalWeeks(year, month);

  function prevMonth() {
    if (month === 0) onNavigate(year - 1, 11);
    else onNavigate(year, month - 1);
  }
  function nextMonth() {
    if (month === 11) onNavigate(year + 1, 0);
    else onNavigate(year, month + 1);
  }

  return (
    <View style={styles.calendarWrap}>
      <View style={styles.calHeader}>
        <Pressable onPress={() => onNavigate(year - 1, month)} style={styles.calNavBtn} hitSlop={8}>
          <ReactIcon icon={FiChevronsLeft} size={16} color={colors.primary} />
        </Pressable>
        <Pressable onPress={prevMonth} style={styles.calNavBtn} hitSlop={8}>
          <ReactIcon icon={FiChevronLeft} size={16} color={colors.primary} />
        </Pressable>
        <Text style={styles.calMonthLabel}>{MONTH_NAMES_ID[month]} {year}</Text>
        <Pressable onPress={nextMonth} style={styles.calNavBtn} hitSlop={8}>
          <ReactIcon icon={FiChevronRight} size={16} color={colors.primary} />
        </Pressable>
        <Pressable onPress={() => onNavigate(year + 1, month)} style={styles.calNavBtn} hitSlop={8}>
          <ReactIcon icon={FiChevronsRight} size={16} color={colors.primary} />
        </Pressable>
      </View>
      <View style={styles.calDayHeaders}>
        {DAY_HEADERS_ID.map((d) => (
          <Text key={d} style={styles.calDayHeader}>{d}</Text>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.calWeekRow}>
          {week.map((day, di) => {
            if (day === null) return <View key={di} style={styles.calCell} />;
            const isSelected = day === selectedDay;
            const isToday = year === today.y && month === today.m && day === today.d;
            return (
              <Pressable
                key={di}
                style={[styles.calCell, isSelected ? styles.calCellSelected : isToday ? styles.calCellToday : undefined]}
                onPress={() => onSelect(day)}
              >
                <Text style={[styles.calCellText, isSelected ? styles.calCellTextSelected : isToday ? styles.calCellTextToday : undefined]}>
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function DatePickerField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const isWeb = Platform.OS === 'web';

  const [cal, setCal] = useState(() => {
    const parsed = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return {
      year: parsed ? parseInt(parsed[1], 10) : new Date().getFullYear(),
      month: parsed ? parseInt(parsed[2], 10) - 1 : new Date().getMonth(),
      selectedDay: parsed ? parseInt(parsed[3], 10) : null as number | null,
    };
  });

  useEffect(() => {
    const p = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    // eslint-disable-next-line
    setCal({
      year: p ? parseInt(p[1], 10) : new Date().getFullYear(),
      month: p ? parseInt(p[2], 10) - 1 : new Date().getMonth(),
      selectedDay: p ? parseInt(p[3], 10) : null,
    });
  }, [value]);

  function handleSelect(day: number) {
    const mm = String(cal.month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${cal.year}-${mm}-${dd}`);
    setCal((prev) => ({ ...prev, selectedDay: day }));
    setOpen(false);
  }

  function handleNavigate(y: number, m: number) {
    setCal((prev) => ({ ...prev, year: y, month: m }));
  }

  const trigger = (
    <Pressable
      onPress={() => setOpen((prev) => !prev)}
      style={[styles.dateTrigger, open ? styles.dateTriggerOpen : undefined, error ? styles.inputError : undefined]}
    >
      <Text style={[styles.dateTriggerText, !value ? styles.datePlaceholder : undefined]} numberOfLines={1}>
        {value || 'Pilih tanggal'}
      </Text>
      <ReactIcon icon={FiCalendar} size={16} color={colors.textSecondary} />
    </Pressable>
  );

  const calendar = (
    <CalendarView
      year={cal.year}
      month={cal.month}
      selectedDay={cal.selectedDay}
      onNavigate={handleNavigate}
      onSelect={handleSelect}
    />
  );

  if (isWeb) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        {trigger}
        {open ? <View style={styles.webDatePanel}>{calendar}</View> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {trigger}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.calendarSheet} onPress={() => { }}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>{label}</Text>
            <ScrollView keyboardShouldPersistTaps="handled">{calendar}</ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

type TimeSpinnerProps = {
  value: number;
  min: number;
  max: number;
  label: string;
  onChange: (v: number) => void;
};

function TimeSpinner({ value, min, max, label, onChange }: TimeSpinnerProps) {
  return (
    <View style={styles.timeSpinner}>
      <Pressable onPress={() => onChange(value >= max ? min : value + 1)} style={styles.timeSpinBtn} hitSlop={8}>
        <ReactIcon icon={FiChevronUp} size={22} color={colors.primary} />
      </Pressable>
      <Text style={styles.timeSpinValue}>{String(value).padStart(2, '0')}</Text>
      <Pressable onPress={() => onChange(value <= min ? max : value - 1)} style={styles.timeSpinBtn} hitSlop={8}>
        <ReactIcon icon={FiChevronDown} size={22} color={colors.primary} />
      </Pressable>
      <Text style={styles.timeSpinLabel}>{label}</Text>
    </View>
  );
}

export function TimePickerField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const isWeb = Platform.OS === 'web';

  const [time, setTime] = useState(() => {
    const parsed = value?.match(/^(\d{1,2}):(\d{2})$/);
    return {
      hour: parsed ? parseInt(parsed[1], 10) : 0,
      minute: parsed ? parseInt(parsed[2], 10) : 0,
    };
  });

  useEffect(() => {
    const p = value?.match(/^(\d{1,2}):(\d{2})$/);
    // eslint-disable-next-line
    setTime({
      hour: p ? parseInt(p[1], 10) : 0,
      minute: p ? parseInt(p[2], 10) : 0,
    });
  }, [value]);

  function handleConfirm() {
    const hh = String(time.hour).padStart(2, '0');
    const mm = String(time.minute).padStart(2, '0');
    onChange(`${hh}:${mm}`);
    setOpen(false);
  }

  const picker = (
    <View style={styles.timePickerBody}>
      <TimeSpinner value={time.hour} min={0} max={23} label="Jam" onChange={(h) => setTime((prev) => ({ ...prev, hour: h }))} />
      <Text style={styles.timeColon}>:</Text>
      <TimeSpinner value={time.minute} min={0} max={59} label="Menit" onChange={(m) => setTime((prev) => ({ ...prev, minute: m }))} />
    </View>
  );

  const confirmBtn = (
    <View style={styles.timeConfirmWrap}>
      <PrimaryButton title="Pilih Waktu" onPress={handleConfirm} />
    </View>
  );

  const trigger = (
    <Pressable
      onPress={() => setOpen((prev) => !prev)}
      style={[styles.dateTrigger, open ? styles.dateTriggerOpen : undefined, error ? styles.inputError : undefined]}
    >
      <Text style={[styles.dateTriggerText, !value ? styles.datePlaceholder : undefined]} numberOfLines={1}>
        {value || 'Pilih waktu'}
      </Text>
      <ReactIcon icon={FiClock} size={16} color={colors.textSecondary} />
    </Pressable>
  );

  if (isWeb) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        {trigger}
        {open ? (
          <View style={styles.webDatePanel}>
            {picker}
            {confirmBtn}
          </View>
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {trigger}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.timePickerSheet} onPress={() => { }}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>{label}</Text>
            {picker}
            {confirmBtn}
          </Pressable>
        </Pressable>
      </Modal>
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
  inputWrapper: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapperError: {
    borderColor: colors.danger,
  },
  inputInner: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  eyeButton: {
    paddingHorizontal: spacing.md,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.caption,
  },
  selectTrigger: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  selectTriggerText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  selectPlaceholder: {
    color: colors.neutral,
  },
  selectTriggerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  webInlineOptions: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    overflow: 'hidden',
  },
  webOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  webOptionSelected: {
    backgroundColor: colors.primaryLight,
  },
  webOptionText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  webOptionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xxxl,
    maxHeight: '80%',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  bottomSheetTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3,
    fontWeight: '900',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  sheetOptionSelected: {
    backgroundColor: colors.primaryLight,
  },
  sheetOptionText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  sheetOptionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
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
  dateTrigger: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dateTriggerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dateTriggerText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  datePlaceholder: {
    color: colors.neutral,
  },
  webDatePanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    padding: spacing.md,
  },
  calendarWrap: {
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  calNavBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
  },
  calMonthLabel: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontWeight: '900',
    fontSize: typography.body,
  },
  calDayHeaders: {
    flexDirection: 'row',
  },
  calDayHeader: {
    flex: 1,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '700',
    paddingVertical: spacing.xs,
  },
  calWeekRow: {
    flexDirection: 'row',
  },
  calCell: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  calCellSelected: {
    backgroundColor: colors.primary,
  },
  calCellToday: {
    backgroundColor: colors.primaryLight,
  },
  calCellText: {
    color: colors.textPrimary,
    fontSize: typography.bodySmall,
  },
  calCellTextSelected: {
    color: colors.textInverse,
    fontWeight: '900',
  },
  calCellTextToday: {
    color: colors.primary,
    fontWeight: '800',
  },
  calendarSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xxxl,
    maxHeight: '85%',
  },
  timePickerBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  timeColon: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '900',
    marginBottom: spacing.xxl,
  },
  timeSpinner: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeSpinBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSpinValue: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '900',
    minWidth: 64,
    textAlign: 'center',
  },
  timeSpinLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  timeConfirmWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  timePickerSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xxxl,
  },
});