import type {
  AdminActivity,
  CitizenRequest,
  GeneratedDocument,
  Notification,
  TimelineItem,
  UploadedFile,
  User,
} from '@/types';

type RawRecord = Record<string, unknown>;

const FILE_LABEL_MAP: Record<string, string> = {
  'cetak-ktp.pdf': 'Cetak KTP',
  'surat-ktp.pdf': 'Surat KTP',
  'cetak-akta-kematian.pdf': 'Cetak Akta Kematian',
  'surat-akta-kematian.pdf': 'Surat Akta Kematian',
  'cetak-akta-kelahiran.pdf': 'Cetak Akta Kelahiran',
  'surat-akta-kelahiran.pdf': 'Surat Akta Kelahiran',
  'surat-pengantar-rtrw.pdf': 'Surat Pengantar RT/RW',
};

function asRecord(value: unknown): RawRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as RawRecord) : {};
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function mapFormData(value: unknown) {
  return Object.fromEntries(
    Object.entries(asRecord(value)).map(([key, item]) => [key, asString(item)]),
  );
}

export function mapUser(raw: unknown): User {
  const row = asRecord(raw);
  const role = asString(row.role);
  return {
    id: asString(row.id),
    role: role === 'admin' || role === 'super_admin' ? 'admin' : 'warga',
    name: asString(row.name),
    nik: asString(row.nik),
    kkNumber: asString(row.kkNumber),
    email: asString(row.email),
    phone: asString(row.phone),
    address: asString(row.address),
    rt: asString(row.rt),
    rw: asString(row.rw),
    adminCode: asString(row.adminCode),
    position: asString(row.position),
  };
}

export function mapUploadedFile(raw: unknown): UploadedFile {
  const row = asRecord(raw);
  return {
    id: asString(row.id),
    name: asString(row.original_file_name || row.name),
    uri: asString(row.public_url || row.uri),
    type: asString(row.mime_type || row.type),
    size: Number(row.file_size_bytes || row.size || 0),
    uploadedAt: asString(row.created_at || row.uploadedAt),
    publicUrl: asString(row.public_url || row.publicUrl),
    storagePath: asString(row.storage_path || row.storagePath),
    fileCategory: asString(row.file_category || row.fileCategory),
    downloadUrl: asString(row.download_url || row.downloadUrl),
  };
}

export function mapTimelineItem(raw: unknown): TimelineItem {
  const row = asRecord(raw);
  return {
    id: asString(row.id),
    status: asString(row.status) as TimelineItem['status'],
    title: asString(row.title),
    description: asString(row.description),
    createdAt: asString(row.created_at || row.createdAt),
  };
}

export function mapGeneratedDocument(raw: unknown): GeneratedDocument {
  const row = asRecord(raw);
  const fileName = asString(row.file_name || row.fileName);
  const documentLabel =
    asString(row.document_label || row.documentLabel) || FILE_LABEL_MAP[fileName] || fileName;
  return {
    id: asString(row.id),
    requestId: asString(row.request_id || row.requestId),
    documentType: asString(row.document_type || row.documentType) as GeneratedDocument['documentType'],
    documentLabel,
    fileName,
    publicUrl: asString(row.public_url || row.publicUrl),
    downloadUrl: asString(row.download_url || row.downloadUrl),
    generatedAt: asString(row.generated_at || row.generatedAt || row.created_at),
  };
}

function baseRequest(raw: RawRecord): CitizenRequest {
  return {
    id: asString(raw.id),
    trackingNumber: asString(raw.tracking_number || raw.trackingNumber),
    userId: asString(raw.user_id || raw.userId),
    applicantName: asString(raw.applicant_name || raw.applicantName || raw.user_full_name),
    nik: asString(raw.applicant_nik || raw.nik),
    serviceType: asString(raw.service_type || raw.serviceType) as CitizenRequest['serviceType'],
    status: asString(raw.status) as CitizenRequest['status'],
    submittedAt: asString(raw.submitted_at || raw.submittedAt),
    updatedAt: asString(raw.updated_at || raw.updatedAt || raw.submitted_at),
    formData: {},
    uploadedFiles: [],
    adminNote: asString(raw.admin_note || raw.adminNote) || undefined,
    timeline: [],
    generatedDocuments: [],
    detail: undefined,
    serviceDisplayName: asString(raw.service_display_name || raw.serviceDisplayName) || undefined,
  };
}

export function mapRequestSummary(raw: unknown): CitizenRequest {
  return baseRequest(asRecord(raw));
}

export function mapRequestDetail(raw: unknown): CitizenRequest {
  const row = asRecord(raw);
  return {
    ...baseRequest(row),
    formData: mapFormData(row.metadata || row.formData),
    uploadedFiles: Array.isArray(row.uploaded_files)
      ? row.uploaded_files.map(mapUploadedFile)
      : Array.isArray(row.uploadedFiles)
        ? row.uploadedFiles.map(mapUploadedFile)
        : [],
    timeline: Array.isArray(row.timeline) ? row.timeline.map(mapTimelineItem) : [],
    generatedDocuments: Array.isArray(row.generated_documents)
      ? row.generated_documents.map(mapGeneratedDocument)
      : Array.isArray(row.generatedDocuments)
        ? row.generatedDocuments.map(mapGeneratedDocument)
        : [],
    detail: asRecord(row.detail),
  };
}

export function mapNotification(raw: unknown): Notification {
  const row = asRecord(raw);
  return {
    id: asString(row.id),
    userId: asString(row.user_id || row.userId),
    requestId: asString(row.request_id || row.requestId),
    title: asString(row.title),
    message: asString(row.message),
    isRead: Boolean(row.is_read ?? row.isRead),
    createdAt: asString(row.created_at || row.createdAt),
  };
}

export function mapAdminActivity(raw: unknown): AdminActivity {
  const row = asRecord(raw);
  return {
    id: asString(row.id),
    adminId: asString(row.admin_id || row.adminId),
    action: asString(row.description || row.action),
    requestId: asString(row.request_id || row.requestId),
    createdAt: asString(row.created_at || row.createdAt),
  };
}
