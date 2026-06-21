import type { ServiceType } from '@/types';

export type DispatchDocument = {
  publicId: string;
  fileName: string;
  documentLabel: string;
};

const DISPATCH_MAP: Record<ServiceType, DispatchDocument[]> = {
  ktp: [
    { publicId: 'mock-ktp_hhqcib', fileName: 'cetak-ktp.pdf', documentLabel: 'Cetak KTP' },
    { publicId: 'mock-surat-ktp_mlurvb', fileName: 'surat-ktp.pdf', documentLabel: 'Surat KTP' },
  ],
  akta_kematian: [
    { publicId: 'mock-surat-akta-kematian_pf4sfz', fileName: 'surat-akta-kematian.pdf', documentLabel: 'Surat Pengantar Akta Kematian' },
  ],
  akta_kelahiran: [
    { publicId: 'mock-surat-akta-kelahiran_outupk', fileName: 'surat-akta-kelahiran.pdf', documentLabel: 'Surat Pengantar Akta Kelahiran' },
  ],
  surat_rt_rw: [
    { publicId: 'mock-surat-pengantar-rtrw_qzh1ve', fileName: 'surat-pengantar-rtrw.pdf', documentLabel: 'Surat Pengantar RT/RW' },
  ],
};

export function getDispatchDocuments(serviceType: ServiceType): DispatchDocument[] {
  return DISPATCH_MAP[serviceType] ?? [];
}
