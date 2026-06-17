import {
  FiArchive,
  FiCreditCard,
  FiFileText,
  FiHome,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';

import type { RequestStatus, ServiceConfig, ServiceType } from '@/types';

export const serviceIcons: Record<ServiceType, IconType> = {
  ktp: FiCreditCard,
  akta_kelahiran: FiFileText,
  akta_kematian: FiArchive,
  surat_rt_rw: FiHome,
};

export const serviceLabels: Record<ServiceType, string> = {
  ktp: 'Pengajuan KTP',
  akta_kelahiran: 'Akta Kelahiran',
  akta_kematian: 'Akta Kematian',
  surat_rt_rw: 'Surat RT/RW',
};

export const statusLabels: Record<RequestStatus, string> = {
  pending: 'Pending',
  diproses: 'Diproses',
  revisi: 'Revisi',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

export const statusMeaning: Record<RequestStatus, string> = {
  pending: 'Request has been submitted but not yet reviewed',
  diproses: 'Request is being reviewed or processed',
  revisi: 'Citizen must revise or re-upload data/documents',
  selesai: 'Request has been completed',
  ditolak: 'Request rejected',
};

export const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Diproses', value: 'diproses' },
  { label: 'Revisi', value: 'revisi' },
  { label: 'Selesai', value: 'selesai' },
  { label: 'Ditolak', value: 'ditolak' },
] as const;

export const serviceOptions = [
  { label: 'KTP', value: 'ktp' },
  { label: 'Akta Kelahiran', value: 'akta_kelahiran' },
  { label: 'Akta Kematian', value: 'akta_kematian' },
  { label: 'Surat RT/RW', value: 'surat_rt_rw' },
] as const;

const genderOptions = [
  { label: 'Laki-laki', value: 'Laki-laki' },
  { label: 'Perempuan', value: 'Perempuan' },
];

const yesNoStatement = 'Saya menyatakan bahwa data yang saya isi adalah benar.';

export const statementText = yesNoStatement;

export const services: ServiceConfig[] = [
  {
    type: 'ktp',
    shortTitle: 'Pengajuan KTP',
    title: 'Pengajuan Pembuatan KTP',
    description: 'Ajukan KTP baru, perubahan data, penggantian hilang, rusak, atau cetak ulang.',
    requiredDocuments: [
      'Kartu Keluarga',
      'Surat Pengantar RT/RW',
      'Pas Foto',
      'KTP Lama untuk perubahan/rusak',
      'Surat Kehilangan untuk KTP hilang',
    ],
    formTitle: 'Form Pengajuan KTP',
    sections: [
      {
        id: 'data-pemohon',
        title: 'Data Pemohon',
        fields: [
          { name: 'namaLengkap', label: 'Nama Lengkap', required: true },
          { name: 'nik', label: 'NIK', required: true, validation: 'nik', type: 'number' },
          { name: 'nomorKk', label: 'Nomor KK', required: true, validation: 'kk', type: 'number' },
          { name: 'tempatLahir', label: 'Tempat Lahir', required: true },
          { name: 'tanggalLahir', label: 'Tanggal Lahir', required: true, validation: 'date', type: 'date' },
          { name: 'jenisKelamin', label: 'Jenis Kelamin', required: true, type: 'select', options: genderOptions },
          { name: 'agama', label: 'Agama', required: true },
          { name: 'statusPerkawinan', label: 'Status Perkawinan', required: true, type: 'select', options: [
            { label: 'Belum Kawin', value: 'Belum Kawin' },
            { label: 'Kawin', value: 'Kawin' },
            { label: 'Cerai Hidup', value: 'Cerai Hidup' },
            { label: 'Cerai Mati', value: 'Cerai Mati' },
          ] },
          { name: 'pekerjaan', label: 'Pekerjaan', required: true },
          { name: 'kewarganegaraan', label: 'Kewarganegaraan', required: true },
          { name: 'alamatLengkap', label: 'Alamat Lengkap', required: true, type: 'textarea' },
          { name: 'rt', label: 'RT', required: true, type: 'number' },
          { name: 'rw', label: 'RW', required: true, type: 'number' },
          { name: 'kelurahan', label: 'Kelurahan', required: true },
          { name: 'kecamatan', label: 'Kecamatan', required: true },
          { name: 'kotaKabupaten', label: 'Kota/Kabupaten', required: true },
          { name: 'provinsi', label: 'Provinsi', required: true },
        ],
      },
      {
        id: 'jenis-pengajuan',
        title: 'Jenis Pengajuan',
        fields: [
          { name: 'jenisPengajuan', label: 'Jenis Pengajuan', required: true, type: 'select', options: [
            { label: 'KTP Baru', value: 'KTP Baru' },
            { label: 'Perubahan Data', value: 'Perubahan Data' },
            { label: 'KTP Hilang', value: 'KTP Hilang' },
            { label: 'KTP Rusak', value: 'KTP Rusak' },
            { label: 'Cetak Ulang', value: 'Cetak Ulang' },
          ] },
          {
            name: 'alasanKtpBaru',
            label: 'Jenis Permohonan KTP Baru',
            required: true,
            type: 'select',
            visibleWhen: { field: 'jenisPengajuan', values: ['KTP Baru'] },
            options: [
              { label: 'KTP Pertama (belum pernah punya KTP)', value: 'baru' },
              { label: 'Kehilangan KTP (ingin membuat baru)', value: 'kehilangan' },
            ],
          },
        ],
      },
      {
        id: 'upload-berkas',
        title: 'Upload Berkas',
        uploads: [
          { key: 'kartuKeluarga', label: 'Kartu Keluarga', required: true },
          { key: 'suratPengantar', label: 'Surat Pengantar RT/RW', required: true },
          { key: 'pasFoto', label: 'Pas Foto', required: true },
          {
            key: 'ktpLama',
            label: 'KTP Lama',
            requiredWhen: [
              { field: 'jenisPengajuan', values: ['Perubahan Data', 'KTP Rusak'] },
              { field: 'alasanKtpBaru', values: ['kehilangan'] },
            ],
            showWhen: [
              { field: 'jenisPengajuan', values: ['Perubahan Data', 'KTP Rusak'] },
              { field: 'alasanKtpBaru', values: ['kehilangan'] },
            ],
          },
          {
            key: 'suratKehilangan',
            label: 'Surat Kehilangan dari Kepolisian',
            requiredWhen: [
              { field: 'jenisPengajuan', values: ['KTP Hilang'] },
              { field: 'alasanKtpBaru', values: ['kehilangan'] },
            ],
            showWhen: [
              { field: 'jenisPengajuan', values: ['KTP Hilang'] },
              { field: 'alasanKtpBaru', values: ['kehilangan'] },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'akta_kelahiran',
    shortTitle: 'Akta Kelahiran',
    title: 'Permohonan Pembuatan Akta Kelahiran',
    description: 'Daftarkan kelahiran anak dengan data orang tua, pelapor, dan dokumen pendukung.',
    requiredDocuments: [
      'Surat Keterangan Lahir dari RS/Bidan',
      'Kartu Keluarga',
      'KTP Ayah',
      'KTP Ibu',
      'Buku Nikah / Akta Perkawinan',
      'Surat Pengantar RT/RW',
    ],
    formTitle: 'Form Akta Kelahiran',
    sections: [
      {
        id: 'data-anak',
        title: 'Data Anak',
        fields: [
          { name: 'namaAnak', label: 'Nama Anak', required: true },
          { name: 'jenisKelaminAnak', label: 'Jenis Kelamin', required: true, type: 'select', options: genderOptions },
          { name: 'tempatLahirAnak', label: 'Tempat Lahir', required: true },
          { name: 'tanggalLahirAnak', label: 'Tanggal Lahir', required: true, validation: 'date', type: 'date' },
          { name: 'waktuLahir', label: 'Waktu Lahir', required: true, type: 'time' },
          { name: 'anakKe', label: 'Anak Ke', required: true, type: 'number' },
          { name: 'tempatDilahirkan', label: 'Tempat Dilahirkan', required: true, type: 'select', options: [
            { label: 'Rumah Sakit', value: 'Rumah Sakit' },
            { label: 'Klinik', value: 'Klinik' },
            { label: 'Rumah', value: 'Rumah' },
            { label: 'Lainnya', value: 'Lainnya' },
          ] },
        ],
      },
      {
        id: 'data-ayah',
        title: 'Data Ayah',
        fields: [
          { name: 'namaAyah', label: 'Nama Ayah', required: true },
          { name: 'nikAyah', label: 'NIK Ayah', required: true, validation: 'nik', type: 'number' },
          { name: 'tempatLahirAyah', label: 'Tempat Lahir Ayah', required: true },
          { name: 'tanggalLahirAyah', label: 'Tanggal Lahir Ayah', required: true, validation: 'date', type: 'date' },
          { name: 'pekerjaanAyah', label: 'Pekerjaan Ayah', required: true },
          { name: 'alamatAyah', label: 'Alamat Ayah', required: true, type: 'textarea' },
        ],
      },
      {
        id: 'data-ibu',
        title: 'Data Ibu',
        fields: [
          { name: 'namaIbu', label: 'Nama Ibu', required: true },
          { name: 'nikIbu', label: 'NIK Ibu', required: true, validation: 'nik', type: 'number' },
          { name: 'tempatLahirIbu', label: 'Tempat Lahir Ibu', required: true },
          { name: 'tanggalLahirIbu', label: 'Tanggal Lahir Ibu', required: true, validation: 'date', type: 'date' },
          { name: 'pekerjaanIbu', label: 'Pekerjaan Ibu', required: true },
          { name: 'alamatIbu', label: 'Alamat Ibu', required: true, type: 'textarea' },
        ],
      },
      {
        id: 'data-pelapor',
        title: 'Data Pelapor',
        fields: [
          { name: 'namaPelapor', label: 'Nama Pelapor', required: true },
          { name: 'nikPelapor', label: 'NIK Pelapor', required: true, validation: 'nik', type: 'number' },
          { name: 'hubunganPelapor', label: 'Hubungan dengan Anak', required: true },
          { name: 'nomorHpPelapor', label: 'Nomor HP Pelapor', required: true, validation: 'phone', type: 'number' },
          { name: 'alamatPelapor', label: 'Alamat Pelapor', required: true, type: 'textarea' },
        ],
      },
      {
        id: 'upload-berkas',
        title: 'Upload Berkas',
        uploads: [
          { key: 'suratLahir', label: 'Surat Keterangan Lahir dari RS/Bidan', required: true },
          { key: 'kartuKeluarga', label: 'Kartu Keluarga', required: true },
          { key: 'ktpAyah', label: 'KTP Ayah', required: true },
          { key: 'ktpIbu', label: 'KTP Ibu', required: true },
          { key: 'bukuNikah', label: 'Buku Nikah / Akta Perkawinan', required: true },
          { key: 'suratPengantar', label: 'Surat Pengantar RT/RW', required: true },
        ],
      },
    ],
  },
  {
    type: 'akta_kematian',
    shortTitle: 'Akta Kematian',
    title: 'Permohonan Pembuatan Akta Kematian',
    description: 'Ajukan akta kematian dengan data almarhum/almarhumah, kejadian, dan pelapor.',
    requiredDocuments: [
      'KTP Almarhum/Almarhumah',
      'Kartu Keluarga',
      'Surat Keterangan Kematian',
      'KTP Pelapor',
      'Surat Pengantar RT/RW',
    ],
    formTitle: 'Form Akta Kematian',
    sections: [
      {
        id: 'data-almarhum',
        title: 'Data Almarhum/Almarhumah',
        fields: [
          { name: 'namaAlmarhum', label: 'Nama Lengkap', required: true },
          { name: 'nikAlmarhum', label: 'NIK', required: true, validation: 'nik', type: 'number' },
          { name: 'nomorKk', label: 'Nomor KK', required: true, validation: 'kk', type: 'number' },
          { name: 'jenisKelamin', label: 'Jenis Kelamin', required: true, type: 'select', options: genderOptions },
          { name: 'tempatLahir', label: 'Tempat Lahir', required: true },
          { name: 'tanggalLahir', label: 'Tanggal Lahir', required: true, validation: 'date', type: 'date' },
          { name: 'agama', label: 'Agama', required: true },
          { name: 'statusPerkawinan', label: 'Status Perkawinan', required: true, type: 'select', options: [
            { label: 'Belum Kawin', value: 'Belum Kawin' },
            { label: 'Kawin', value: 'Kawin' },
            { label: 'Cerai Hidup', value: 'Cerai Hidup' },
            { label: 'Cerai Mati', value: 'Cerai Mati' },
          ] },
          { name: 'pekerjaan', label: 'Pekerjaan', required: true },
          { name: 'alamatTerakhir', label: 'Alamat Terakhir', required: true, type: 'textarea' },
        ],
      },
      {
        id: 'data-kematian',
        title: 'Data Kematian',
        fields: [
          { name: 'tanggalMeninggal', label: 'Tanggal Meninggal', required: true, validation: 'date', type: 'date' },
          { name: 'waktuMeninggal', label: 'Waktu Meninggal', required: true, type: 'time' },
          { name: 'tempatMeninggal', label: 'Tempat Meninggal', required: true },
          { name: 'penyebabKematian', label: 'Penyebab Kematian', required: true, type: 'textarea' },
          { name: 'lokasiPemakaman', label: 'Lokasi Pemakaman', required: true },
        ],
      },
      {
        id: 'data-pelapor',
        title: 'Data Pelapor',
        fields: [
          { name: 'namaPelapor', label: 'Nama Pelapor', required: true },
          { name: 'nikPelapor', label: 'NIK Pelapor', required: true, validation: 'nik', type: 'number' },
          { name: 'hubunganPelapor', label: 'Hubungan dengan Almarhum/Almarhumah', required: true },
          { name: 'nomorHpPelapor', label: 'Nomor HP', required: true, validation: 'phone', type: 'number' },
          { name: 'alamatPelapor', label: 'Alamat', required: true, type: 'textarea' },
        ],
      },
      {
        id: 'upload-berkas',
        title: 'Upload Berkas',
        uploads: [
          { key: 'ktpAlmarhum', label: 'KTP Almarhum/Almarhumah', required: true },
          { key: 'kartuKeluarga', label: 'Kartu Keluarga', required: true },
          { key: 'suratKematian', label: 'Surat Keterangan Kematian dari RS/Dokter/RT/RW', required: true },
          { key: 'ktpPelapor', label: 'KTP Pelapor', required: true },
          { key: 'suratPengantar', label: 'Surat Pengantar RT/RW', required: true },
        ],
      },
    ],
  },
  {
    type: 'surat_rt_rw',
    shortTitle: 'Surat RT/RW',
    title: 'Surat Permohonan RT/RW',
    description: 'Buat surat pengantar atau keterangan untuk berbagai kebutuhan warga.',
    requiredDocuments: ['KTP', 'Kartu Keluarga', 'Dokumen pendukung jika ada'],
    formTitle: 'Form Surat RT/RW',
    sections: [
      {
        id: 'data-pemohon',
        title: 'Data Pemohon',
        fields: [
          { name: 'namaLengkap', label: 'Nama Lengkap', required: true },
          { name: 'nik', label: 'NIK', required: true, validation: 'nik', type: 'number' },
          { name: 'nomorKk', label: 'Nomor KK', required: true, validation: 'kk', type: 'number' },
          { name: 'nomorHp', label: 'Nomor HP', required: true, validation: 'phone', type: 'number' },
          { name: 'alamat', label: 'Alamat', required: true, type: 'textarea' },
          { name: 'rt', label: 'RT', required: true, type: 'number' },
          { name: 'rw', label: 'RW', required: true, type: 'number' },
        ],
      },
      {
        id: 'jenis-surat',
        title: 'Jenis Surat',
        fields: [
          { name: 'jenisSurat', label: 'Jenis Surat', required: true, type: 'select', options: [
            { label: 'Surat Pengantar KTP', value: 'Surat Pengantar KTP' },
            { label: 'Surat Pengantar KK', value: 'Surat Pengantar KK' },
            { label: 'Surat Keterangan Domisili', value: 'Surat Keterangan Domisili' },
            { label: 'Surat Keterangan Usaha', value: 'Surat Keterangan Usaha' },
            { label: 'Surat Keterangan Tidak Mampu', value: 'Surat Keterangan Tidak Mampu' },
            { label: 'Surat Pengantar Nikah', value: 'Surat Pengantar Nikah' },
            { label: 'Surat Keterangan Kelahiran', value: 'Surat Keterangan Kelahiran' },
            { label: 'Surat Keterangan Kematian', value: 'Surat Keterangan Kematian' },
            { label: 'Lainnya', value: 'Lainnya' },
          ] },
        ],
      },
      {
        id: 'detail-keperluan',
        title: 'Detail Keperluan',
        fields: [
          { name: 'keperluanSurat', label: 'Keperluan Surat', required: true, type: 'textarea' },
          { name: 'instansiTujuan', label: 'Instansi Tujuan', required: true },
          { name: 'catatanTambahan', label: 'Catatan Tambahan', type: 'textarea' },
        ],
      },
      {
        id: 'upload-berkas',
        title: 'Upload Berkas',
        uploads: [
          { key: 'ktp', label: 'KTP', required: true },
          { key: 'kartuKeluarga', label: 'Kartu Keluarga', required: true },
          { key: 'dokumenPendukung', label: 'Dokumen Pendukung jika ada' },
        ],
      },
    ],
  },
];

export function getServiceConfig(type: ServiceType) {
  return services.find((service) => service.type === type);
}
