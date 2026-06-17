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
    { publicId: 'mock-akta-kematian_ydczbz', fileName: 'cetak-akta-kematian.pdf', documentLabel: 'Cetak Akta Kematian' },
    { publicId: 'mock-surat-akta-kematian_pf4sfz', fileName: 'surat-akta-kematian.pdf', documentLabel: 'Surat Akta Kematian' },
  ],
  akta_kelahiran: [
    { publicId: 'mock-akta-kelahiran_gznhxh', fileName: 'cetak-akta-kelahiran.pdf', documentLabel: 'Cetak Akta Kelahiran' },
    { publicId: 'mock-surat-akta-kelahiran_outupk', fileName: 'surat-akta-kelahiran.pdf', documentLabel: 'Surat Akta Kelahiran' },
  ],
  surat_rt_rw: [
    { publicId: 'mock-surat-pengantar-rtrw_qzh1ve', fileName: 'surat-pengantar-rtrw.pdf', documentLabel: 'Surat Pengantar RT/RW' },
  ],
};

export function getDispatchDocuments(serviceType: ServiceType): DispatchDocument[] {
  return DISPATCH_MAP[serviceType] ?? [];
}
