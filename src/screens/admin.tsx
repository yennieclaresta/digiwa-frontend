import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  FiActivity,
  FiArchive,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiLogOut,
  FiPrinter,
  FiSearch,
  FiShield,
  FiUser,
  FiXCircle,
} from 'react-icons/fi';

import {
  AppHeader,
  DashboardStatCard,
  EmptyState,
  PrimaryButton,
  ReactIcon,
  RequestCard,
  Screen,
  SecondaryButton,
  SectionTitle,
  SelectField,
  StatusBadge,
  TextInputField,
} from '@/components/digiwa';
import { serviceIcons, serviceOptions, services, statusOptions } from '@/constants/services';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import type { RequestStatus, ServiceType } from '@/types';
import { formatDateTime, serviceLabel, sortByNewest } from '@/utils/format';

export function AdminDashboardScreen() {
  const router = useRouter();
  const { requests, activities } = useApp();
  const [serviceFilter, setServiceFilter] = useState<ServiceType | 'semua'>('semua');
  const filteredRequests = serviceFilter === 'semua' ? requests : requests.filter((request) => request.serviceType === serviceFilter);
  const recentRequests = sortByNewest(filteredRequests).slice(0, 4);

  const stats = {
    total: requests.length,
    pending: requests.filter((request) => request.status === 'pending').length,
    diproses: requests.filter((request) => request.status === 'diproses').length,
    selesai: requests.filter((request) => request.status === 'selesai').length,
    ditolak: requests.filter((request) => request.status === 'ditolak').length,
  };

  return (
    <Screen>
      <View style={styles.adminHero}>
        <View style={styles.adminHeroIcon}>
          <ReactIcon icon={FiShield} color={colors.textInverse} size={28} />
        </View>
        <Text style={styles.adminHeroTitle}>Halo, Admin</Text>
        <Text style={styles.adminHeroSubtitle}>Kelola verifikasi, status, notifikasi, dan dokumen warga.</Text>
      </View>

      <View style={styles.statsGrid}>
        <DashboardStatCard title="Total Permohonan" value={stats.total} icon={FiArchive} />
        <DashboardStatCard title="Pending" value={stats.pending} icon={FiClock} tone="warning" />
        <DashboardStatCard title="Diproses" value={stats.diproses} icon={FiActivity} tone="info" />
        <DashboardStatCard title="Selesai" value={stats.selesai} icon={FiCheckCircle} tone="success" />
        <DashboardStatCard title="Ditolak" value={stats.ditolak} icon={FiXCircle} tone="danger" />
      </View>

      <SectionTitle title="Filter Layanan" />
      <FilterRow
        options={[{ label: 'Semua', value: 'semua' }, ...serviceOptions]}
        value={serviceFilter}
        onChange={(value) => setServiceFilter(value as ServiceType | 'semua')}
      />

      <SectionTitle title="Permohonan Terbaru" />
      {recentRequests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          adminMode
          onPress={() => router.push({ pathname: '/admin-request/[id]', params: { id: request.id } })}
        />
      ))}

      <SectionTitle title="Aktivitas Terbaru" />
      {sortByNewest(activities).slice(0, 5).map((activity) => (
        <View key={activity.id} style={styles.activityCard}>
          <View style={styles.activityIcon}>
            <ReactIcon icon={FiActivity} color={colors.primary} size={18} />
          </View>
          <View style={styles.activityText}>
            <Text style={styles.activityTitle}>{activity.action}</Text>
            <Text style={styles.activityMeta}>{formatDateTime(activity.createdAt)}</Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}

export function AdminRequestManagementScreen() {
  const router = useRouter();
  const { requests } = useApp();
  const [search, setSearch] = useState('');
  const [service, setService] = useState<ServiceType | 'semua'>('semua');
  const [status, setStatus] = useState<RequestStatus | 'semua'>('semua');
  const [date, setDate] = useState('');
  const [rtRw, setRtRw] = useState('');

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return sortByNewest(requests).filter((request) => {
      const matchesSearch =
        !normalizedSearch ||
        request.applicantName.toLowerCase().includes(normalizedSearch) ||
        request.nik.includes(normalizedSearch) ||
        request.trackingNumber.toLowerCase().includes(normalizedSearch);
      const matchesService = service === 'semua' || request.serviceType === service;
      const matchesStatus = status === 'semua' || request.status === status;
      const matchesDate = !date || request.submittedAt.slice(0, 10).includes(date);
      const matchesRtRw =
        !rtRw ||
        `${request.formData.rt ?? ''}/${request.formData.rw ?? ''}`.includes(rtRw) ||
        `${request.formData.rt ?? ''}${request.formData.rw ?? ''}`.includes(rtRw);
      return matchesSearch && matchesService && matchesStatus && matchesDate && matchesRtRw;
    });
  }, [date, requests, rtRw, search, service, status]);

  return (
    <Screen>
      <AppHeader title="Permohonan" subtitle="Daftar terpusat seluruh permohonan masuk dari warga." />
      <View style={styles.filterPanel}>
        <TextInputField label="Cari Nama / NIK / Tracking" value={search} onChangeText={setSearch} placeholder="Contoh: Siti atau DGW-KTP" />
        <SelectField
          label="Filter Layanan"
          value={service}
          onChange={(value) => setService((value || 'semua') as ServiceType | 'semua')}
          options={[{ label: 'Semua Layanan', value: 'semua' }, ...serviceOptions]}
        />
        <SelectField
          label="Filter Status"
          value={status}
          onChange={(value) => setStatus((value || 'semua') as RequestStatus | 'semua')}
          options={[{ label: 'Semua Status', value: 'semua' }, ...statusOptions]}
        />
        <View style={styles.inlineFields}>
          <View style={styles.inlineField}>
            <TextInputField label="Tanggal" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={styles.inlineField}>
            <TextInputField label="RT/RW" value={rtRw} onChangeText={setRtRw} placeholder="03/05" />
          </View>
        </View>
      </View>

      {filteredRequests.length ? (
        filteredRequests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            adminMode
            onPress={() => router.push({ pathname: '/admin-request/[id]', params: { id: request.id } })}
          />
        ))
      ) : (
        <EmptyState title="Permohonan tidak ditemukan" message="Coba ubah kata kunci atau filter pencarian." icon={FiSearch} />
      )}
    </Screen>
  );
}

export function AdminVerificationScreen() {
  const router = useRouter();
  const { requests } = useApp();
  const queue = sortByNewest(requests.filter((request) => ['pending', 'diproses', 'revisi'].includes(request.status)));

  return (
    <Screen>
      <AppHeader title="Verifikasi" subtitle="Review dokumen dan perbarui status pengajuan warga." />
      {queue.length ? (
        queue.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            adminMode
            onPress={() => router.push({ pathname: '/admin-request/[id]', params: { id: request.id } })}
          />
        ))
      ) : (
        <EmptyState title="Tidak ada antrean" message="Semua permohonan aktif sudah selesai diproses." />
      )}
    </Screen>
  );
}

export function AdminPrintScreen() {
  const { requests, generateDocument } = useApp();
  const completedRequests = sortByNewest(requests.filter((request) => request.status === 'selesai'));

  async function handleGenerate(requestId: string) {
    const request = requests.find((item) => item.id === requestId);
    if (!request) {
      return;
    }
    try {
      const document = request.generatedDocuments[0] ?? (await generateDocument(requestId));
      await Linking.openURL(document.downloadUrl || document.publicUrl);
    } catch (caught) {
      Alert.alert(caught instanceof Error ? caught.message : 'Gagal menyimpan data. Silakan coba lagi.');
    }
  }

  return (
    <Screen>
      <AppHeader title="Cetak" subtitle="Generate dan download PDF untuk permohonan selesai." />
      {completedRequests.length ? (
        completedRequests.map((request) => (
          <View key={request.id} style={styles.printCard}>
            <View style={styles.printTop}>
              <View style={styles.printIcon}>
                <ReactIcon icon={serviceIcons[request.serviceType]} color={colors.primary} size={22} />
              </View>
              <View style={styles.printText}>
                <Text style={styles.printTitle}>{request.applicantName}</Text>
                <Text style={styles.printMeta}>{serviceLabel(request.serviceType)}</Text>
                <Text style={styles.printMeta}>{request.trackingNumber}</Text>
              </View>
              <StatusBadge status={request.status} />
            </View>
            <View style={styles.printActions}>
              <SecondaryButton title="Generate PDF" icon={FiPrinter} onPress={() => handleGenerate(request.id)} style={styles.printButton} />
              <PrimaryButton title="Download" icon={FiDownload} onPress={() => handleGenerate(request.id)} style={styles.printButton} />
            </View>
          </View>
        ))
      ) : (
        <EmptyState title="Belum ada dokumen" message="Dokumen dapat di-generate setelah status pengajuan Selesai." />
      )}
    </Screen>
  );
}

export function AdminProfileScreen() {
  const router = useRouter();
  const { currentUser, logout } = useApp();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <Screen>
      <AppHeader title="Profil Admin" subtitle="Akun pengelola layanan administrasi warga." />
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <ReactIcon icon={FiUser} color={colors.textInverse} size={30} />
        </View>
        <Text style={styles.profileName}>{currentUser?.name}</Text>
        <Text style={styles.profileMeta}>Role: Admin</Text>
        <Text style={styles.profileMeta}>{currentUser?.email}</Text>
      </View>
      <PrimaryButton title="Keluar" icon={FiLogOut} onPress={handleLogout} />
    </Screen>
  );
}

function FilterRow({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.serviceFilterRow}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable key={option.value} onPress={() => onChange(option.value)} style={[styles.filterChip, active && styles.filterChipActive]}>
            {option.value !== 'semua' && services.some((service) => service.type === option.value) ? (
              <ReactIcon icon={serviceIcons[option.value as ServiceType]} color={active ? colors.textInverse : colors.primary} size={15} />
            ) : null}
            <Text style={[styles.filterText, active && styles.filterTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
