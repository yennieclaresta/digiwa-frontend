import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { serviceLabel, statusLabel } from '@/utils/format';
import type { CitizenRequest } from '@/types';

export async function generateMockPDF(request: CitizenRequest) {
  const content = [
    'DIGIWA - Digitalisasi Data Warga',
    '',
    `Layanan: ${serviceLabel(request.serviceType)}`,
    `Nomor Tracking: ${request.trackingNumber}`,
    `Nama Pemohon: ${request.applicantName}`,
    `NIK: ${request.nik || 'Belum tersedia'}`,
    `Tanggal Pengajuan: ${new Date(request.submittedAt).toLocaleString('id-ID')}`,
    `Status: ${statusLabel(request.status)}`,
    request.adminNote ? `Catatan Admin: ${request.adminNote}` : 'Catatan Admin: -',
    '',
    'Tanda Tangan Petugas:',
    '',
    '(________________________)',
    '',
    'Dokumen ini dihasilkan secara digital melalui DIGIWA.',
  ].join('\n');

  const safeName = request.trackingNumber.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  const file = new File(Paths.cache, `${safeName}.pdf`);

  if (file.exists) {
    file.delete();
  }

  file.create();
  file.write(content);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      dialogTitle: 'Download PDF DIGIWA',
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
    });
  }

  return file.uri;
}
