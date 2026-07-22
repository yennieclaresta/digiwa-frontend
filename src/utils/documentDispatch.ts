import type { ServiceType } from '@/types';

export type DispatchDocument = {
  publicId: string;
  fileName: string;
  documentLabel: string;
};

// Akta kelahiran/kematian are absent on purpose: the backend fills the official
// PDF template with the warga's own data and publishes it when an admin marks
// the request `selesai`, so a static mock would shadow the real letter.
const DISPATCH_MAP: Record<ServiceType, DispatchDocument[]> = {
  ktp: [
    { publicId: 'mock-ktp_hhqcib', fileName: 'cetak-ktp.pdf', documentLabel: 'Cetak KTP' },
    { publicId: 'mock-surat-ktp_mlurvb', fileName: 'surat-ktp.pdf', documentLabel: 'Surat KTP' },
  ],
  akta_kematian: [],
  akta_kelahiran: [],
  surat_rt_rw: [
    { publicId: 'mock-surat-pengantar-rtrw_qzh1ve', fileName: 'surat-pengantar-rtrw.pdf', documentLabel: 'Surat Pengantar RT/RW' },
  ],
};

export function getDispatchDocuments(serviceType: ServiceType): DispatchDocument[] {
  return DISPATCH_MAP[serviceType] ?? [];
}

const TEMPLATE_SERVICES: ServiceType[] = ['akta_kelahiran', 'akta_kematian'];

/** Services whose letter is produced from an official PDF template. */
export function hasFilledTemplate(serviceType?: ServiceType) {
  return !!serviceType && TEMPLATE_SERVICES.includes(serviceType);
}
