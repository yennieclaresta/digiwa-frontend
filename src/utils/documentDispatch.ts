import type { ServiceType } from '@/types';

export type DispatchDocument = {
  publicId: string;
  fileName: string;
  documentLabel: string;
};

// Dispatching static placeholder files is disabled: every warga received the
// same document regardless of what they submitted. Akta letters are produced
// by the backend from the official PDF template filled with the request's own
// data; the remaining services simply have no generated document yet.
//
// The old catalogue is kept commented for reference until each service gets a
// real template of its own.
//
// const DISPATCH_MAP: Record<ServiceType, DispatchDocument[]> = {
//   ktp: [
//     { publicId: 'mock-ktp_hhqcib', fileName: 'cetak-ktp.pdf', documentLabel: 'Cetak KTP' },
//     { publicId: 'mock-surat-ktp_mlurvb', fileName: 'surat-ktp.pdf', documentLabel: 'Surat KTP' },
//   ],
//   akta_kematian: [],
//   akta_kelahiran: [],
//   surat_rt_rw: [
//     { publicId: 'mock-surat-pengantar-rtrw_qzh1ve', fileName: 'surat-pengantar-rtrw.pdf', documentLabel: 'Surat Pengantar RT/RW' },
//   ],
// };
const DISPATCH_MAP: Partial<Record<ServiceType, DispatchDocument[]>> = {};

export function getDispatchDocuments(serviceType: ServiceType): DispatchDocument[] {
  return DISPATCH_MAP[serviceType] ?? [];
}

const TEMPLATE_SERVICES: ServiceType[] = ['akta_kelahiran', 'akta_kematian'];

/** Services whose letter is produced from an official PDF template. */
export function hasFilledTemplate(serviceType?: ServiceType) {
  return !!serviceType && TEMPLATE_SERVICES.includes(serviceType);
}
