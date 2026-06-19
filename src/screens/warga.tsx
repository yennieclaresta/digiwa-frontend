import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { styles } from './warga.styles';
import {
  FiBell,
  FiCheckCircle,
  FiChevronDown,
  FiChevronRight,
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

      <SectionTitle title="FAQ" subtitle="Pertanyaan umum seputar layanan DIGIWA." />
      <FaqSection />
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
      <AppHeader title="Notifikasi" subtitle="Perubahan status dan catatan petugas akan muncul di sini." />
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
        <SecondaryButton title="Bantuan" icon={FiHelpCircle} onPress={() => Alert.alert('Bantuan', 'Hubungi petugas kelurahan untuk bantuan penggunaan DIGIWA.')} />
        <PrimaryButton title="Keluar" icon={FiLogOut} onPress={handleLogout} />
      </View>
    </Screen>
  );
}

const faqItems = [
  {
    question: 'Apa itu Pengajuan KTP?',
    answer:
      'Layanan pengajuan Kartu Tanda Penduduk (KTP) secara digital. Digunakan untuk membuat KTP pertama, mengganti KTP yang hilang/rusak, atau memperbarui data. Dokumen yang diperlukan: Kartu Keluarga, Surat Pengantar RT/RW, Pas Foto, dan KTP Lama (jika ada).',
  },
  {
    question: 'Apa itu Permohonan Akta Kelahiran?',
    answer:
      'Layanan pendaftaran kelahiran anak secara resmi. Diperlukan dalam 60 hari sejak kelahiran. Dokumen: Surat Keterangan Lahir dari RS/Bidan, Kartu Keluarga, KTP Ayah & Ibu, dan Buku Nikah/Akta Perkawinan.',
  },
  {
    question: 'Apa itu Permohonan Akta Kematian?',
    answer:
      'Layanan pencatatan kematian warga secara resmi. Dokumen: KTP Almarhum/Almarhumah, Kartu Keluarga, Surat Keterangan Kematian dari RS atau petugas RT/RW, KTP Pelapor, dan Surat Pengantar RT/RW.',
  },
  {
    question: 'Apa itu Surat Permohonan RT/RW?',
    answer:
      'Layanan pembuatan berbagai surat keterangan dari RT/RW, antara lain: Surat Pengantar KTP/KK, Surat Keterangan Domisili, Surat Keterangan Usaha, Surat Keterangan Tidak Mampu, Surat Pengantar Nikah, dan lainnya. Dokumen: KTP dan Kartu Keluarga.',
  },
  {
    question: 'Berapa lama proses pengajuan?',
    answer:
      'KTP: 3–7 hari kerja setelah berkas lengkap. Akta Kelahiran & Kematian: 3–5 hari kerja. Surat RT/RW: 1–2 hari kerja. Durasi dapat berubah tergantung kelengkapan dokumen dan antrean.',
  },
  {
    question: 'Jam Kerja Petugas (Jam Operasional)',
    answer:
      'Senin – Jumat: 08.00 – 16.00 WIB\nSabtu: 08.00 – 12.00 WIB\nMinggu & Hari Libur Nasional: Tutup\n\nPengajuan online dapat dilakukan kapan saja. Verifikasi dan proses dilakukan pada jam kerja.',
  },
];

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <View style={styles.faqWrap}>
      {faqItems.map((item, index) => (
        <FaqItem
          key={index}
          question={item.question}
          answer={item.answer}
          open={openIndex === index}
          onPress={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </View>
  );
}

function FaqItem({
  question,
  answer,
  open,
  onPress,
}: {
  question: string;
  answer: string;
  open: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.faqCard}>
      <Pressable onPress={onPress} style={styles.faqQuestion}>
        <Text style={styles.faqQuestionText}>{question}</Text>
        <ReactIcon icon={open ? FiChevronDown : FiChevronRight} color={colors.primary} size={18} />
      </Pressable>
      {open ? <Text style={styles.faqAnswer}>{answer}</Text> : null}
    </View>
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
