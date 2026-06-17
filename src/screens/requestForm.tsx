import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiSend } from 'react-icons/fi';

import {
  AppHeader,
  CheckRow,
  ConfirmationModal,
  DatePickerField,
  EmptyState,
  FileUploadField,
  InfoBox,
  ProgressIndicator,
  PrimaryButton,
  ReactIcon,
  Screen,
  SecondaryButton,
  SectionTitle,
  SelectField,
  TextInputField,
  TimePickerField,
} from '@/components/digiwa';
import { getServiceConfig, statementText } from '@/constants/services';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import type { FormField, ServiceType, UploadedFile, UploadRequirement } from '@/types';
import { humanizeKey } from '@/utils/format';

type FormValues = Record<string, string>;

const requiredMessage = 'Data belum lengkap.';
const nikPattern = /^\d{16}$/;
const phonePattern = /^[0-9+]{9,15}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function fileCategoryForUpload(serviceType: ServiceType, fieldKey: string) {
  const categories: Record<ServiceType, Record<string, string>> = {
    ktp: {
      kartuKeluarga: 'kartu_keluarga',
      suratPengantar: 'surat_pengantar_rt_rw',
      pasFoto: 'pas_foto',
      ktpLama: 'ktp_lama',
      suratKehilangan: 'surat_kehilangan',
    },
    akta_kelahiran: {
      suratLahir: 'surat_keterangan_lahir',
      kartuKeluarga: 'kartu_keluarga',
      ktpAyah: 'ktp',
      ktpIbu: 'ktp',
      bukuNikah: 'buku_nikah',
      suratPengantar: 'surat_pengantar_rt_rw',
    },
    akta_kematian: {
      ktpAlmarhum: 'ktp',
      kartuKeluarga: 'kartu_keluarga',
      suratKematian: 'surat_keterangan_kematian',
      ktpPelapor: 'dokumen_pendukung',
      suratPengantar: 'surat_pengantar_rt_rw',
    },
    surat_rt_rw: {
      ktp: 'ktp',
      kartuKeluarga: 'kartu_keluarga',
      dokumenPendukung: 'dokumen_pendukung',
    },
  };

  return categories[serviceType][fieldKey] || 'dokumen_pendukung';
}

export function RequestFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ service?: string }>();
  const { currentUser, submitRequest } = useApp();
  const serviceType = Array.isArray(params.service) ? params.service[0] : params.service;
  const config = getServiceConfig(serviceType as ServiceType);

  const [step, setStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [statementChecked, setStatementChecked] = useState(false);
  const [statementError, setStatementError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Shown only on KTP form when account has no NIK. Checked = user declares no NIK.
  const [nikDisabledForKtp, setNikDisabledForKtp] = useState(!currentUser?.nik);

  const defaultValues = useMemo<FormValues>(() => {
    return {
      namaLengkap: currentUser?.name ?? '',
      nik: currentUser?.nik ?? '',
      nomorKk: currentUser?.kkNumber ?? '',
      nomorHp: currentUser?.phone ?? '',
      alamat: currentUser?.address ?? '',
      alamatLengkap: currentUser?.address ?? '',
      rt: currentUser?.rt ?? '',
      rw: currentUser?.rw ?? '',
      namaPelapor: currentUser?.name ?? '',
      nikPelapor: currentUser?.nik ?? '',
      nomorHpPelapor: currentUser?.phone ?? '',
      alamatPelapor: currentUser?.address ?? '',
    };
  }, [currentUser]);

  const {
    control,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues });
  const watchedValues = useWatch({ control });

  // Sync NIK from profile whenever it becomes available (e.g., after KTP request is completed)
  useEffect(() => {
    if (!currentUser?.nik) return;
    setValue('nik', currentUser.nik);
    setValue('nikPelapor', currentUser.nik);
    setNikDisabledForKtp(false);
  }, [currentUser?.nik, setValue]);

  // Clear alasanKtpBaru when the user switches away from "KTP Baru"
  useEffect(() => {
    if (config?.type !== 'ktp') return;
    if (watchedValues?.jenisPengajuan !== 'KTP Baru') {
      setValue('alasanKtpBaru', '');
    }
  }, [watchedValues?.jenisPengajuan, config?.type, setValue]);

  if (!config || !currentUser) {
    return (
      <Screen>
        <EmptyState title="Layanan tidak tersedia" message="Jenis layanan tidak ditemukan atau akses tidak valid." />
      </Screen>
    );
  }
  const activeConfig = config;
  const activeUser = currentUser;

  const sections = activeConfig.sections;
  const totalSteps = sections.length + 1;
  const isConfirmationStep = step === sections.length;
  const currentSection = sections[step];

  // --- visibility helpers ---

  function isFieldVisible(field: FormField) {
    if (!field.visibleWhen) return true;
    const val = watchedValues?.[field.visibleWhen.field] ?? '';
    return field.visibleWhen.values.includes(val);
  }

  function isUploadVisible(upload: UploadRequirement) {
    if (!upload.showWhen) return true;
    return upload.showWhen.some(({ field, values }) => {
      const val = watchedValues?.[field] ?? '';
      return values.includes(val);
    });
  }

  function isUploadRequired(upload: UploadRequirement) {
    if (!isUploadVisible(upload)) return false;
    if (upload.required) return true;
    if (!upload.requiredWhen) return false;
    return upload.requiredWhen.some(({ field, values }) => {
      const val = watchedValues?.[field] ?? '';
      return values.includes(val);
    });
  }

  // --- NIK-related guards ---

  const nikDisabledThisForm = activeConfig.type === 'ktp' && nikDisabledForKtp;

  const hasInvalidNikInput = (fields: FormField[] = []) =>
    fields.filter(isFieldVisible).some((field) => {
      if (field.validation !== 'nik') return false;
      const isNikOptional = activeConfig.type === 'ktp' && field.name === 'nik' && nikDisabledForKtp;
      const required = field.required && !isNikOptional;
      const value = (watchedValues?.[field.name] ?? '').trim();
      if (!required && !value) return false;
      return !nikPattern.test(value);
    });

  const nikActionDisabled = isConfirmationStep
    ? sections.some((section) => hasInvalidNikInput(section.fields))
    : hasInvalidNikInput(currentSection.fields);

  // --- field rules ---

  function fieldRules(field: FormField) {
    const isNikOptional = activeConfig.type === 'ktp' && field.name === 'nik' && nikDisabledForKtp;
    const required = field.required && !isNikOptional;

    return {
      required: required ? requiredMessage : false,
      validate: (value?: string) => {
        const v = value ?? '';
        if (!required && !v) return true;
        if (field.validation === 'nik' && !nikPattern.test(v)) return 'Format NIK tidak valid.';
        if (field.validation === 'kk' && !nikPattern.test(v)) return 'Nomor KK harus 16 digit.';
        if (field.validation === 'email' && !emailPattern.test(v)) return 'Format email tidak valid.';
        if (field.validation === 'phone' && !phonePattern.test(v)) return 'Nomor HP tidak valid.';
        if (field.validation === 'date' && !datePattern.test(v)) return 'Tanggal wajib menggunakan format YYYY-MM-DD.';
        return true;
      },
    };
  }

  function keyboardType(field: FormField) {
    if (field.type === 'number') return 'number-pad' as const;
    if (field.type === 'email') return 'email-address' as const;
    return 'default' as const;
  }

  // --- upload validation ---

  function validateUploads(uploads: UploadRequirement[] = []) {
    const nextErrors: Record<string, string> = {};
    uploads.forEach((upload) => {
      if (!isUploadVisible(upload)) return;
      if (isUploadRequired(upload) && !uploadedFiles[upload.key]) {
        nextErrors[upload.key] = 'Mohon unggah dokumen yang diperlukan.';
      }
    });
    setFileErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  // --- step navigation ---

  async function validateCurrentStep() {
    if (isConfirmationStep) {
      if (!statementChecked) {
        setStatementError('Pernyataan wajib disetujui sebelum submit.');
        return false;
      }
      setStatementError('');
      return true;
    }

    const visibleFieldNames = (currentSection.fields ?? []).filter(isFieldVisible).map((f) => f.name);
    const fieldsValid = visibleFieldNames.length ? await trigger(visibleFieldNames) : true;
    const uploadsValid = validateUploads(currentSection.uploads);

    if (!fieldsValid || !uploadsValid) {
      Alert.alert('Data belum lengkap.', 'Periksa kembali data dan dokumen yang wajib diisi.');
      return false;
    }
    return true;
  }

  async function goNext() {
    if (await validateCurrentStep()) {
      setStep((current) => Math.min(current + 1, totalSteps - 1));
    }
  }

  async function openConfirmation() {
    if (await validateCurrentStep()) {
      setModalVisible(true);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const allVisibleFieldNames = sections.flatMap((section) =>
        (section.fields ?? []).filter(isFieldVisible).map((f) => f.name),
      );
      const allUploads = sections.flatMap((section) => section.uploads ?? []);
      const fieldsValid = await trigger(allVisibleFieldNames);
      const uploadsValid = validateUploads(allUploads);

      if (!fieldsValid || !uploadsValid || !statementChecked) {
        setModalVisible(false);
        Alert.alert('Data belum lengkap.', 'Periksa kembali data dan dokumen yang wajib diisi.');
        return;
      }

      const request = await submitRequest(activeConfig.type, getValues(), Object.values(uploadedFiles));
      setModalVisible(false);
      router.replace({ pathname: '/success', params: { requestId: request.id } });
    } catch {
      Alert.alert('Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  // --- render ---

  // currentSection is undefined on the confirmation step — guard with optional chaining
  const visibleSectionUploads = currentSection?.uploads?.filter(isUploadVisible) ?? [];

  return (
    <Screen>
      <AppHeader title={activeConfig.formTitle} subtitle={activeConfig.description} showBack />
      <ProgressIndicator current={step} total={totalSteps} />

      {!isConfirmationStep ? (
        <View style={styles.formSection}>
          <SectionTitle title={currentSection.title} subtitle={currentSection.description} />

          {activeConfig.type === 'ktp' && currentSection.id === 'data-pemohon' && !activeUser.nik ? (
            <InfoBox>Anda dapat membuat akun tanpa NIK. Untuk kondisi ini, pengajuan yang dapat diproses adalah KTP Baru berdasarkan Nomor KK dan dokumen pendukung.</InfoBox>
          ) : null}

          {currentSection.fields?.flatMap((field) => {
            const elements = [];

            // NIK disable toggle — only on KTP data-pemohon for accounts without NIK
            if (
              activeConfig.type === 'ktp' &&
              !activeUser.nik &&
              field.name === 'nik' &&
              currentSection.id === 'data-pemohon'
            ) {
              elements.push(
                <CheckRow
                  key="nik-disable-toggle"
                  checked={nikDisabledForKtp}
                  onPress={() => {
                    const next = !nikDisabledForKtp;
                    setNikDisabledForKtp(next);
                    if (next) setValue('nik', '');
                  }}
                  label="Saya belum memiliki NIK"
                />,
              );
            }

            // Skip fields whose visibleWhen condition is not met
            if (!isFieldVisible(field)) return elements;

            elements.push(
              <Controller
                key={field.name}
                control={control}
                name={field.name}
                rules={fieldRules(field)}
                render={({ field: { onChange, value } }) =>
                  field.type === 'select' && field.options ? (
                    <SelectField
                      label={field.label}
                      value={value}
                      onChange={onChange}
                      options={
                        nikDisabledThisForm && field.name === 'jenisPengajuan'
                          ? field.options.filter((opt) => opt.value === 'KTP Baru')
                          : field.options
                      }
                      error={errors[field.name]?.message as string | undefined}
                    />
                  ) : field.type === 'date' ? (
                    <DatePickerField
                      label={field.label}
                      value={value}
                      onChange={onChange}
                      error={errors[field.name]?.message as string | undefined}
                    />
                  ) : field.type === 'time' ? (
                    <TimePickerField
                      label={field.label}
                      value={value}
                      onChange={onChange}
                      error={errors[field.name]?.message as string | undefined}
                    />
                  ) : (
                    <TextInputField
                      label={nikDisabledThisForm && field.name === 'nik' ? 'NIK (belum tersedia)' : field.label}
                      value={value}
                      onChangeText={onChange}
                      placeholder={field.placeholder}
                      keyboardType={keyboardType(field)}
                      multiline={field.type === 'textarea'}
                      autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
                      editable={!(nikDisabledThisForm && field.name === 'nik')}
                      error={errors[field.name]?.message as string | undefined}
                    />
                  )
                }
              />,
            );

            return elements;
          })}

          {visibleSectionUploads.map((upload) => (
            <FileUploadField
              key={upload.key}
              label={upload.label}
              required={isUploadRequired(upload)}
              value={uploadedFiles[upload.key]}
              error={fileErrors[upload.key]}
              onChange={(file) => {
                setUploadedFiles((previous) => ({
                  ...previous,
                  [upload.key]: {
                    ...file,
                    fileCategory: fileCategoryForUpload(activeConfig.type, upload.key),
                  },
                }));
                setFileErrors((previous) => ({ ...previous, [upload.key]: '' }));
              }}
            />
          ))}
        </View>
      ) : (
        <View style={styles.formSection}>
          <SectionTitle title="Konfirmasi Pengajuan" subtitle="Pastikan ringkasan data dan dokumen sudah benar." />
          <View style={styles.summaryCard}>
            {Object.entries(getValues())
              .filter(([, value]) => Boolean(value))
              .map(([key, value]) => (
                <View key={key} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{humanizeKey(key)}</Text>
                  <Text style={styles.summaryValue}>{value}</Text>
                </View>
              ))}
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.uploadSummaryTitle}>Berkas Diunggah</Text>
            {Object.values(uploadedFiles).length ? (
              Object.values(uploadedFiles).map((file) => (
                <View key={file.id} style={styles.uploadSummaryRow}>
                  <Text style={styles.uploadSummaryName}>{file.name}</Text>
                  <Text style={styles.uploadSummaryMeta}>{file.type}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.uploadSummaryMeta}>Belum ada berkas.</Text>
            )}
          </View>
          <CheckRow
            checked={statementChecked}
            onPress={() => {
              setStatementChecked((checked) => !checked);
              setStatementError('');
            }}
            label={statementText}
            error={statementError}
          />
        </View>
      )}

      <View style={styles.actions}>
        {step > 0 ? (
          <SecondaryButton
            title="Kembali"
            icon={FiArrowLeft}
            onPress={() => setStep((current) => current - 1)}
            style={styles.actionButton}
          />
        ) : null}
        {isConfirmationStep ? (
          <PrimaryButton
            title="Kirim Pengajuan"
            icon={FiSend}
            onPress={openConfirmation}
            style={styles.actionButton}
            disabled={nikActionDisabled}
          />
        ) : (
          <PrimaryButton
            title="Lanjut"
            icon={FiArrowRight}
            onPress={goNext}
            style={styles.actionButton}
            disabled={nikActionDisabled}
          />
        )}
      </View>

      <ConfirmationModal
        visible={modalVisible}
        title="Kirim Pengajuan"
        message="Apakah Anda yakin data dan dokumen yang diisi sudah benar?"
        confirmText="Kirim Pengajuan"
        onConfirm={handleSubmit}
        onCancel={() => setModalVisible(false)}
        loading={submitting}
      />
    </Screen>
  );
}

export function RequestSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ requestId?: string }>();
  const { requests } = useApp();
  const requestId = Array.isArray(params.requestId) ? params.requestId[0] : params.requestId;
  const request = requests.find((item) => item.id === requestId);

  return (
    <Screen>
      <View style={styles.successCard}>
        <View style={styles.successIcon}>
          <ReactIcon icon={FiCheckCircle} color={colors.textInverse} size={38} />
        </View>
        <Text style={styles.successTitle}>
          {request?.serviceType === 'ktp' ? 'Pengajuan KTP berhasil dikirim.' : 'Pengajuan berhasil dikirim.'}
        </Text>
        <Text style={styles.successMessage}>Nomor tracking pengajuan Anda:</Text>
        <Text style={styles.trackingNumber}>{request?.trackingNumber ?? '-'}</Text>
        <PrimaryButton title="Cek Status Pengajuan" onPress={() => router.replace('/(warga)/status')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
