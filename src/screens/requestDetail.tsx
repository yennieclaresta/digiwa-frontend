import { useLocalSearchParams } from 'expo-router';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';

import { styles } from './requestDetail.styles';
import { FiDownload, FiEye, FiFileText, FiPrinter, FiSave } from 'react-icons/fi';

import {
  AppHeader,
  EmptyState,
  InfoBox,
  LoadingState,
  PrimaryButton,
  ReactIcon,
  Screen,
  SecondaryButton,
  SectionTitle,
  SelectField,
  StatusBadge,
  TextInputField,
} from '@/components/digiwa';
import { serviceIcons, statusOptions } from '@/constants/services';
import { colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import type { CitizenRequest, GeneratedDocument, RequestStatus, UploadedFile } from '@/types';
import { formatDateTime, humanizeKey, serviceLabel } from '@/utils/format';

function useRequestDetail() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { requests, getRequestById } = useApp();
  const requestId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [request, setRequest] = useState<CitizenRequest | null>(
    requestId ? requests.find((item) => item.id === requestId) ?? null : null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!requestId) {
        if (active) {
          setRequest(null);
          setLoading(false);
        }
        return;
      }

      try {
        const detail = await getRequestById(requestId);
        if (active) {
          setRequest(detail);
        }
      } catch {
        if (active) {
          setRequest(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  return {
    requestId: requestId ?? '',
    request,
    setRequest,
    loading,
  };
}

function resolveOpenUrl(url: string): string {
  if (url.includes('res.cloudinary.com') && url.includes('/raw/upload/')) {
    url = url.replace('/raw/upload/', '/image/upload/');
  }
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    const tail = url.split('/image/upload/')[1] || '';
    const lastSegment = tail.split('/').pop() || '';
    if (!lastSegment.includes('.')) {
      return `${url}.pdf`;
    }
  }
  return url;
}

function resolveUploadedFileUrl(file: UploadedFile): string {
  return resolveOpenUrl(file.downloadUrl || file.publicUrl || file.uri || '');
}

async function openRemoteFile(url?: string) {
  if (!url) {
    Alert.alert('File belum tersedia', 'Tautan dokumen belum tersedia.');
    return;
  }

  const resolved = resolveOpenUrl(url);
  const supported = await Linking.canOpenURL(resolved);
  if (!supported) {
    Alert.alert('Tautan tidak valid', 'Dokumen tidak dapat dibuka dari perangkat ini.');
    return;
  }

  await Linking.openURL(resolved);
}

function latestDocument(request: CitizenRequest) {
  return request.generatedDocuments[0];
}

export function StatusDetailScreen() {
  const { currentUser } = useApp();
  const { request, loading } = useRequestDetail();

  if (loading) {
    return <LoadingState />;
  }

  if (!request || (currentUser?.role === 'warga' && request.userId !== currentUser.id)) {
    return (
      <Screen>
        <EmptyState title="Pengajuan tidak ditemukan" message="Data pengajuan tidak tersedia atau tidak dapat diakses." />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader title="Detail Pengajuan" subtitle={request.trackingNumber} showBack />
      <RequestSummary request={request} />

      <SectionTitle title="Timeline Status" />
      <Timeline request={request} />

      {request.adminNote ? (
        <>
          <SectionTitle title="Catatan Petugas" />
          <InfoBox>{request.adminNote}</InfoBox>
        </>
      ) : null}

      <SectionTitle title="Data Pengajuan" />
      <DataCard data={request.formData} />

      <SectionTitle title="Berkas Diunggah" />
      <DocumentList files={request.uploadedFiles} />

      {request.status === 'selesai' && request.generatedDocuments.length > 0 ? (
        <>
          <SectionTitle title="Dokumen Tersedia" subtitle="Klik tombol di bawah untuk mengunduh dokumen Anda." />
          {request.generatedDocuments.map((doc) => (
            <PrimaryButton
              key={doc.id}
              title={`Download ${doc.documentLabel || doc.fileName}`}
              icon={FiDownload}
              onPress={() => void openRemoteFile(doc.publicUrl || doc.downloadUrl)}
            />
          ))}
        </>
      ) : request.status === 'selesai' ? (
        <InfoBox>Surat selesai diproses. Silakan ambil sesuai arahan petugas atau unduh jika tersedia.</InfoBox>
      ) : null}
    </Screen>
  );
}

export function AdminRequestDetailScreen() {
  const { updateRequestStatus, generateDocument } = useApp();
  const { request, setRequest, loading } = useRequestDetail();

  if (loading) {
    return <LoadingState />;
  }

  if (!request) {
    return (
      <Screen>
        <EmptyState title="Permohonan tidak ditemukan" message="Data permohonan tidak tersedia." />
      </Screen>
    );
  }

  return (
    <AdminRequestDetailContent
      key={`${request.id}-${request.updatedAt}`}
      request={request}
      setRequest={setRequest}
      updateRequestStatus={updateRequestStatus}
      generateDocument={generateDocument}
    />
  );
}

function AdminRequestDetailContent({
  request,
  setRequest,
  updateRequestStatus,
  generateDocument,
}: {
  request: CitizenRequest;
  setRequest: Dispatch<SetStateAction<CitizenRequest | null>>;
  updateRequestStatus: (requestId: string, status: RequestStatus, adminNote?: string) => Promise<CitizenRequest>;
  generateDocument: (requestId: string) => Promise<GeneratedDocument>;
}) {
  const [status, setStatus] = useState<RequestStatus>(request.status);
  const [adminNote, setAdminNote] = useState(request.adminNote ?? '');
  const [noteError, setNoteError] = useState('');
  const [saving, setSaving] = useState(false);
  const [documentBusy, setDocumentBusy] = useState(false);

  async function handleSave() {
    if ((status === 'revisi' || status === 'ditolak') && !adminNote.trim()) {
      setNoteError('Catatan Petugas wajib diisi untuk status Revisi atau Ditolak.');
      return;
    }

    setSaving(true);
    setNoteError('');
    try {
      const updated = await updateRequestStatus(request.id, status, adminNote);
      setRequest(updated);
      Alert.alert('Status berhasil diperbarui.');
    } catch (caught) {
      Alert.alert(caught instanceof Error ? caught.message : 'Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  async function ensureDocument() {
    if (latestDocument(request)) {
      return latestDocument(request);
    }
    const document = await generateDocument(request.id);
    setRequest((previous) =>
      previous
        ? {
          ...previous,
          generatedDocuments: [document, ...previous.generatedDocuments],
        }
        : previous,
    );
    return document;
  }

  async function handleGeneratePDF() {
    if (request.status !== 'selesai' && status !== 'selesai') {
      Alert.alert('Dokumen belum siap', 'PDF hanya dapat dibuat untuk status Selesai.');
      return;
    }

    setDocumentBusy(true);
    try {
      const document = await ensureDocument();
      await openRemoteFile(document.publicUrl || document.downloadUrl);
    } catch (caught) {
      Alert.alert(caught instanceof Error ? caught.message : 'Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setDocumentBusy(false);
    }
  }

  return (
    <Screen>
      <AppHeader title="Review Permohonan" subtitle={request.trackingNumber} showBack />
      <RequestSummary request={request} />

      <SectionTitle title="Data Warga" />
      <DataCard data={request.formData} />

      <SectionTitle title="Berkas Diunggah" />
      <DocumentList files={request.uploadedFiles} adminMode />

      <SectionTitle title="Update Status" subtitle="Catatan wajib diisi jika status Revisi atau Ditolak." />
      <View style={styles.reviewCard}>
        <SelectField
          label="Status Verifikasi"
          value={status}
          onChange={(value) => setStatus(value as RequestStatus)}
          options={statusOptions}
        />
        <TextInputField
          label="Catatan Petugas"
          value={adminNote}
          onChangeText={(value) => {
            setAdminNote(value);
            setNoteError('');
          }}
          multiline
          placeholder="Contoh: Mohon unggah ulang Kartu Keluarga dengan gambar yang lebih jelas."
          error={noteError}
        />
        <PrimaryButton title="Simpan Status" icon={FiSave} onPress={handleSave} loading={saving} />
      </View>

      <SectionTitle title="Cetak Dokumen" />
      {request.generatedDocuments.length > 0 ? (
        <View style={styles.printActions}>
          {request.generatedDocuments.map((doc) => (
            <SecondaryButton
              key={doc.id}
              title={doc.documentLabel || doc.fileName}
              icon={FiDownload}
              onPress={() => void openRemoteFile(doc.publicUrl || doc.downloadUrl)}
              style={styles.printButton}
            />
          ))}
        </View>
      ) : (
        <View style={styles.printActions}>
          <SecondaryButton title="Generate PDF" icon={FiPrinter} onPress={handleGeneratePDF} loading={documentBusy} style={styles.printButton} />
          <PrimaryButton title="Download" icon={FiDownload} onPress={handleGeneratePDF} loading={documentBusy} style={styles.printButton} />
        </View>
      )}
    </Screen>
  );
}

function RequestSummary({ request }: { request: CitizenRequest }) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <ReactIcon icon={serviceIcons[request.serviceType]} color={colors.primary} size={26} />
      </View>
      <View style={styles.summaryText}>
        <Text style={styles.summaryTitle}>{serviceLabel(request.serviceType)}</Text>
        <Text style={styles.summaryMeta}>{request.applicantName}</Text>
        <Text style={styles.summaryMeta}>NIK {request.nik || 'Belum tersedia'}</Text>
        <Text style={styles.summaryMeta}>Diajukan {formatDateTime(request.submittedAt)}</Text>
      </View>
      <StatusBadge status={request.status} />
    </View>
  );
}

function Timeline({ request }: { request: CitizenRequest }) {
  return (
    <View style={styles.timelineCard}>
      {request.timeline.map((item, index) => (
        <View key={item.id} style={styles.timelineItem}>
          <View style={styles.timelineMarkerWrap}>
            <View style={styles.timelineMarker} />
            {index < request.timeline.length - 1 ? <View style={styles.timelineLine} /> : null}
          </View>
          <View style={styles.timelineText}>
            <Text style={styles.timelineTitle}>{item.title}</Text>
            <Text style={styles.timelineDescription}>{item.description}</Text>
            <Text style={styles.timelineDate}>{formatDateTime(item.createdAt)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function DataCard({ data }: { data: Record<string, string> }) {
  const entries = Object.entries(data).filter(([, value]) => Boolean(value));

  return (
    <View style={styles.dataCard}>
      {entries.map(([key, value]) => (
        <View key={key} style={styles.dataRow}>
          <Text style={styles.dataLabel}>{humanizeKey(key)}</Text>
          <Text style={styles.dataValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function DocumentList({ files, adminMode }: { files?: UploadedFile[]; adminMode?: boolean }) {
  if (!files?.length) {
    return <View style={styles.documentList} />;
  }
  return (
    <View style={styles.documentList}>
      {files.map((file) => (
        <View key={file.id} style={styles.documentRow}>
          <View style={styles.documentIcon}>
            <ReactIcon icon={FiFileText} color={colors.secondary} size={19} />
          </View>
          <View style={styles.documentText}>
            <Text style={styles.documentName}>{file.name}</Text>
            <Text style={styles.documentMeta}>{file.type}</Text>
          </View>
          {adminMode ? (
            <View style={styles.documentActions}>
              <Pressable onPress={() => void openRemoteFile(resolveUploadedFileUrl(file))} style={styles.documentAction}>
                <ReactIcon icon={FiEye} color={colors.primary} size={18} />
              </Pressable>
              <Pressable onPress={() => void openRemoteFile(resolveUploadedFileUrl(file))} style={styles.documentAction}>
                <ReactIcon icon={FiDownload} color={colors.primary} size={18} />
              </Pressable>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}
