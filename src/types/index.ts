export type Role = 'warga' | 'admin';

export type ServiceType = 'ktp' | 'akta_kelahiran' | 'akta_kematian' | 'surat_rt_rw';

export type RequestStatus = 'pending' | 'diproses' | 'revisi' | 'selesai' | 'ditolak';

export type User = {
  id: string;
  role: Role;
  name: string;
  nik: string;
  kkNumber: string;
  email: string;
  phone: string;
  address: string;
  rt: string;
  rw: string;
  adminCode?: string;
  position?: string;
};

export type UploadedFile = {
  id: string;
  name: string;
  uri: string;
  type: string;
  size: number;
  uploadedAt: string;
  publicUrl?: string;
  storagePath?: string;
  fileCategory?: string;
  downloadUrl?: string;
  /** Web only — raw File object from document picker, not sent to backend */
  file?: File;
};

export type TimelineItem = {
  id: string;
  status: RequestStatus;
  title: string;
  description: string;
  createdAt: string;
};

export type GeneratedDocument = {
  id: string;
  requestId: string;
  documentType: ServiceType;
  fileName: string;
  publicUrl: string;
  downloadUrl?: string;
  generatedAt: string;
};

export type CitizenRequest = {
  id: string;
  trackingNumber: string;
  userId: string;
  applicantName: string;
  nik: string;
  serviceType: ServiceType;
  status: RequestStatus;
  submittedAt: string;
  updatedAt: string;
  formData: Record<string, string>;
  uploadedFiles: UploadedFile[];
  adminNote?: string;
  timeline: TimelineItem[];
  generatedDocuments: GeneratedDocument[];
  detail?: Record<string, unknown>;
  serviceDisplayName?: string;
};

export type Notification = {
  id: string;
  userId: string;
  requestId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type AdminActivity = {
  id: string;
  adminId: string;
  action: string;
  requestId: string;
  createdAt: string;
};

export type FormFieldType = 'text' | 'email' | 'number' | 'date' | 'time' | 'textarea' | 'select';

export type SelectOption = {
  label: string;
  value: string;
};

export type FormField = {
  name: string;
  label: string;
  type?: FormFieldType;
  required?: boolean;
  validation?: 'nik' | 'kk' | 'email' | 'phone' | 'date';
  options?: SelectOption[];
  placeholder?: string;
  /** Field is only shown (and validated) when the referenced field has one of the given values */
  visibleWhen?: {
    field: string;
    values: string[];
  };
};

export type UploadRequirement = {
  key: string;
  label: string;
  required?: boolean;
  /** OR conditions: upload is required when ANY condition matches */
  requiredWhen?: Array<{ field: string; values: string[] }>;
  /** OR conditions: upload is shown only when ANY condition matches; always shown when absent */
  showWhen?: Array<{ field: string; values: string[] }>;
};

export type FormSection = {
  id: string;
  title: string;
  description?: string;
  fields?: FormField[];
  uploads?: UploadRequirement[];
};

export type ServiceConfig = {
  type: ServiceType;
  shortTitle: string;
  title: string;
  description: string;
  requiredDocuments: string[];
  formTitle: string;
  sections: FormSection[];
};
