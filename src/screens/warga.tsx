import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  FiBell,
  FiCheckCircle,
  FiEdit3,
  FiFileText,
  FiHelpCircle,
  FiLogOut,
  FiPlusCircle,
  FiSearch,
  FiShield,
  FiUser,
} from 'react-icons/fi';

import {
  AppHeader,
  DashboardStatCard,
  EmptyState,
  InfoBox,
  PrimaryButton,
  ReactIcon,
  RequestCard,
  Screen,
  SecondaryButton,
  SectionTitle,
  ServiceCard,
  StatusBadge,
} from '@/components/digiwa';
import { serviceIcons, services, statusOptions } from '@/constants/services';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import type { RequestStatus } from '@/types';
import { formatDateTime, sortByNewest } from '@/utils/format';

const allStatusFilters = [{ label: 'Semua', value: 'semua' }, ...statusOptions] as const;

export function WargaHomeScreen() {
  const router = useRouter();
  const { currentUser, requests, notifications } = useApp();
  const userRequests = sortByNewest(requests.filter((request) => request.userId === currentUser?.id));
  const latestRequest = userRequests[0];
  const unreadNotifications = notifications.filter((notification) => notification.userId === currentUser?.id && !notification.isRead).length;

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <ReactIcon icon={FiShield} color={colors.textInverse} size={28} />
        </View>
        <Text style={styles.heroTitle}>Halo, {currentUser?.name}</Text>
        <Text style={styles.heroSubtitle}>Ajukan dan pantau layanan administrasi warga secara digital.</Text>
      </View>

      <View style={styles.statsGrid}>
        <DashboardStatCard title="Total Pengajuan" value={userRequests.length} icon={FiFileText} />
        <DashboardStatCard title="Notifikasi Baru" value={unreadNotifications} icon={FiBell} tone="warning" />
      </View>

      <SectionTitle title="Layanan Warga" />
      <View style={styles.serviceGrid}>
        {services.map((service) => (
          <Pressable
            key={service.type}
            onPress={() => router.push({ pathname: '/form/[service]', params: { service: service.type } })}
            style={styles.serviceMiniCard}
          >
            <View style={styles.serviceMiniIcon}>
              <ReactIcon icon={serviceIcons[service.type]} color={colors.primary} size={22} />
            </View>
            <Text style={styles.serviceMiniTitle}>{service.shortTitle}</Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle title="Status Terbaru" />
      {latestRequest ? (
        <View style={styles.latestCard}>
          <View style={styles.latestTop}>
            <View style={styles.latestText}>
              <Text style={styles.latestTitle}>{latestRequest.trackingNumber}</Text>
              <Text style={styles.latestMeta}>{formatDateTime(latestRequest.updatedAt)}</Text>
            </View>
            <StatusBadge status={latestRequest.status} />
          </View>
          <Text style={styles.latestDesc}>{services.find((service) => service.type === latestRequest.serviceType)?.title}</Text>
          <SecondaryButton title="Detail Pengajuan" onPress={() => router.push({ pathname: '/request/[id]', params: { id: latestRequest.id } })} />
        </View>
      ) : (
        <EmptyState title="Belum ada pengajuan" message="Mulai ajukan layanan administrasi warga dari menu Pengajuan." />
      )}

      <SectionTitle title="Aksi Cepat" />
      <View style={styles.quickActions}>
        <PrimaryButton title="Buat Pengajuan Baru" icon={FiPlusCircle} onPress={() => router.push('/(warga)/pengajuan')} />
        <SecondaryButton title="Cek Status" icon={FiSearch} onPress={() => router.push('/(warga)/status')} />
        <SecondaryButton title="Lihat Notifikasi" icon={FiBell} onPress={() => router.push('/(warga)/notifikasi')} />
      </View>

      <InfoBox>Pastikan data dan dokumen yang diunggah sudah benar agar proses verifikasi lebih cepat.</InfoBox>
    </Screen>
  );
}

export function ServiceListScreen() {
  const router = useRouter();

  return (
    <Screen>
      <AppHeader title="Pengajuan" subtitle="Pilih layanan administrasi yang ingin diajukan." />
      {services.map((service) => (
        <ServiceCard
          key={service.type}
          icon={serviceIcons[service.type]}
          title={service.title}
          description={service.description}
          documents={service.requiredDocuments}
          onPress={() => router.push({ pathname: '/form/[service]', params: { service: service.type } })}
        />
      ))}
    </Screen>
  );
}

export function StatusListScreen() {
  const router = useRouter();
  const { currentUser, requests } = useApp();
  const [filter, setFilter] = useState<'semua' | RequestStatus>('semua');
  const userRequests = sortByNewest(requests.filter((request) => request.userId === currentUser?.id));
  const filteredRequests = filter === 'semua' ? userRequests : userRequests.filter((request) => request.status === filter);

  return (
    <Screen>
      <AppHeader title="Status" subtitle="Pantau seluruh pengajuan Anda." />
      <ScrollFilter
        options={allStatusFilters.map((item) => ({ label: item.label, value: item.value }))}
        value={filter}
        onChange={(next) => setFilter(next as 'semua' | RequestStatus)}
      />
      {filteredRequests.length ? (
        filteredRequests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            onPress={() => router.push({ pathname: '/request/[id]', params: { id: request.id } })}
          />
        ))
      ) : (
        <EmptyState title="Tidak ada data" message="Belum ada pengajuan dengan filter status ini." />
      )}
    </Screen>
  );
}

export function NotificationScreen() {
  const router = useRouter();
  const { currentUser, notifications, markNotificationRead } = useApp();
  const userNotifications = sortByNewest(notifications.filter((notification) => notification.userId === currentUser?.id));

  async function openNotification(notificationId: string, requestId: string) {
    await markNotificationRead(notificationId);
    router.push({ pathname: '/request/[id]', params: { id: requestId } });
  }

  return (
    <Screen>
      <AppHeader title="Notifikasi" subtitle="Perubahan status dan catatan admin akan muncul di sini." />
      {userNotifications.length ? (
        userNotifications.map((notification) => (
          <Pressable
            key={notification.id}
            onPress={() => openNotification(notification.id, notification.requestId)}
            style={[styles.notificationCard, !notification.isRead && styles.notificationUnread]}
          >
            <View style={styles.notificationIcon}>
              <ReactIcon icon={FiBell} color={notification.isRead ? colors.neutral : colors.primary} size={20} />
            </View>
            <View style={styles.notificationText}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationDate}>{formatDateTime(notification.createdAt)}</Text>
            </View>
          </Pressable>
        ))
      ) : (
        <EmptyState title="Belum ada notifikasi" message="Notifikasi status pengajuan akan muncul di sini." />
      )}
    </Screen>
  );
}

export function WargaProfileScreen() {
  const router = useRouter();
  const { currentUser, logout } = useApp();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <Screen>
      <AppHeader title="Profil" subtitle="Data warga yang digunakan untuk pengajuan layanan." />
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <ReactIcon icon={FiUser} color={colors.textInverse} size={30} />
        </View>
        <Text style={styles.profileName}>{currentUser?.name}</Text>
        <Text style={styles.profileNik}>NIK {currentUser?.nik || 'Belum tersedia'}</Text>
      </View>
      <View style={styles.infoList}>
        <InfoRow label="NIK" value={currentUser?.nik || 'Belum tersedia'} />
        <InfoRow label="Nomor KK" value={currentUser?.kkNumber} />
        <InfoRow label="Nomor HP" value={currentUser?.phone} />
        <InfoRow label="Alamat" value={currentUser?.address} />
        <InfoRow label="RT/RW" value={`${currentUser?.rt}/${currentUser?.rw}`} />
        <InfoRow label="Email" value={currentUser?.email} />
      </View>
      <View style={styles.quickActions}>
        <SecondaryButton title="Edit Profil" icon={FiEdit3} onPress={() => router.push('/profile/edit')} />
        <SecondaryButton title="Ubah Password" icon={FiCheckCircle} onPress={() => router.push('/profile/password')} />
        <SecondaryButton title="Bantuan" icon={FiHelpCircle} onPress={() => Alert.alert('Bantuan', 'Hubungi admin kelurahan untuk bantuan penggunaan DIGIWA.')} />
        <PrimaryButton title="Keluar" icon={FiLogOut} onPress={handleLogout} />
      </View>
    </Screen>
  );
}

function ScrollFilter({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.filterWrap}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <Pressable key={option.value} onPress={() => onChange(option.value)} style={[styles.filterChip, active && styles.filterChipActive]}>
            <Text style={[styles.filterText, active && styles.filterTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  serviceMiniCard: {
    width: '47%',
    minHeight: 128,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    justifyContent: 'space-between',
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
    color: colors.textPrimary,
    fontWeight: '900',
    lineHeight: 20,
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
});
