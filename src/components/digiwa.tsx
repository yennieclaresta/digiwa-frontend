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
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

import { colors, statusTheme } from '@/constants/theme';

import type { CitizenRequest, RequestStatus, UploadedFile } from '@/types';
import { formatDate, serviceLabel } from '@/utils/format';
import { styles } from './digiwa.styles';

type IconProps = {
  icon: IconType;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

const hiddenScrollIndicatorProps = {
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
  persistentScrollbar: false,
} as const;

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
  const hasFillAttr = Object.prototype.hasOwnProperty.call(attr, 'fill');
  const hasStrokeAttr = Object.prototype.hasOwnProperty.call(attr, 'stroke');
  const svgFill = hasFillAttr
    ? ((resolveSvgValue(attr.fill, color) as string) ?? color)
    : hasStrokeAttr
      ? 'none'
      : color;
  const svgStroke = hasStrokeAttr
    ? ((resolveSvgValue(attr.stroke, color) as string) ?? color)
    : 'none';

  return (
    <Svg
      width={size}
      height={size}
      viewBox={(attr.viewBox as string) ?? '0 0 24 24'}
      fill={svgFill}
      stroke={svgStroke}
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
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const contentStyle = [
    styles.screenContent,
    isDesktop && styles.screenContentDesktop,
    padded && styles.screenPadded,
    !scroll && styles.screenNoScroll,
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={contentStyle}
            {...hiddenScrollIndicatorProps}
          >
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
  required,
  ...props
}: TextInputProps & {
  label: string;
  error?: string;
  required?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{required ? <Text style={styles.required}> *</Text> : null}</Text>
      {secureTextEntry ? (
        <View style={[styles.inputWrapper, error ? styles.inputWrapperError : undefined, focused && styles.inputWrapperFocus]}>
          <TextInput
            placeholderTextColor={colors.neutral}
            style={styles.inputInner}
            secureTextEntry={!showPassword}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
            value={value ?? ''}
          />
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.eyeButton}
            hitSlop={8}
          >
            <ReactIcon icon={showPassword ? FaEyeSlash : FaEye} color={colors.primary} size={20} />
          </Pressable>
        </View>
      ) : (
        <TextInput
          placeholderTextColor={colors.neutral}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[styles.input, multiline && styles.textarea, error && styles.inputError, focused && styles.inputFocus]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
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
  required,
  placeholder = 'Pilih salah satu',
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: readonly { label: string; value: string }[];
  error?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? '';

  function handleSelect(val: string) {
    onChange(val);
    setOpen(false);
  }

  return (
    <View style={[styles.field, open ? styles.fieldDropdownOpen : undefined]}>
      <Text style={styles.label}>{label}{required ? <Text style={styles.required}> *</Text> : null}</Text>
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
        <ReactIcon icon={open ? FiChevronUp : FiChevronDown} size={16} color={colors.textSecondary} />
      </Pressable>
      {open ? (
        <View style={styles.dropdownList}>
          <ScrollView
            style={styles.dropdownScroll}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            {...hiddenScrollIndicatorProps}
          >
            {options.map((option) => (
              <Pressable
                key={option.value}
                style={[styles.dropdownOption, option.value === value ? styles.dropdownOptionSelected : undefined]}
                onPress={() => handleSelect(option.value)}
              >
                <Text style={[styles.dropdownOptionText, option.value === value ? styles.dropdownOptionTextSelected : undefined]}>
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

export function FileUploadField({
  label,
  value,
  onChange,
  error,
  required,
  onPickStart,
  onPickEnd,
}: {
  label: string;
  value?: UploadedFile;
  onChange: (file: UploadedFile) => void;
  error?: string;
  required?: boolean;
  onPickStart?: () => Promise<void> | void;
  onPickEnd?: () => Promise<void> | void;
}) {
  async function pickFile() {
    await onPickStart?.();
    try {
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
        // On Expo Web, asset.file is the native File object needed for proper multipart upload.
        file: (asset as { file?: File }).file,
      });
    } finally {
      await onPickEnd?.();
    }
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
  const [yearEdit, setYearEdit] = useState(false);
  const [yearInput, setYearInput] = useState(String(year));

  function prevMonth() {
    if (month === 0) onNavigate(year - 1, 11);
    else onNavigate(year, month - 1);
  }
  function nextMonth() {
    if (month === 11) onNavigate(year + 1, 0);
    else onNavigate(year, month + 1);
  }

  function commitYearInput() {
    const parsed = parseInt(yearInput, 10);
    if (!isNaN(parsed) && parsed >= 1900 && parsed <= today.y) {
      onNavigate(parsed, month);
    } else {
      setYearInput(String(year));
    }
    setYearEdit(false);
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
        <Pressable
          style={{ flex: 1, alignItems: 'center' }}
          onPress={() => { setYearInput(String(year)); setYearEdit(true); }}
        >
          {yearEdit ? (
            <TextInput
              value={yearInput}
              onChangeText={setYearInput}
              onBlur={commitYearInput}
              onSubmitEditing={commitYearInput}
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
              style={[styles.calMonthLabel, { borderBottomWidth: 1, borderColor: colors.primary, minWidth: 60, textAlign: 'center' }]}
            />
          ) : (
            <Text style={styles.calMonthLabel}>{MONTH_NAMES_ID[month]} {year}</Text>
          )}
        </Pressable>
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
  required,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);

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

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{required ? <Text style={styles.required}> *</Text> : null}</Text>
      {trigger}
      {open ? <View style={styles.webDatePanel}>{calendar}</View> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  required,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);

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

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{required ? <Text style={styles.required}> *</Text> : null}</Text>
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
