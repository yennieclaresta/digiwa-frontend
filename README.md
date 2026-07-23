# DIGIWA Frontend

Aplikasi **DIGIWA – Digitalisasi Data Warga**, dibangun dengan Expo dan React
Native. Satu kode sumber berjalan di Android, iOS, dan browser web.

Aplikasi ini terhubung ke REST API pada repositori `digiwa-backend`.

Dokumen ini disusun agar bisa dipelajari dari nol: bagian 1–7 menjelaskan cara
kerja aplikasi, bagian 8–10 berisi panduan menjalankan dan membangun APK.

---

## Daftar Isi

1. [Apa yang dikerjakan aplikasi ini](#1-apa-yang-dikerjakan-aplikasi-ini)
2. [Arsitektur aplikasi](#2-arsitektur-aplikasi)
3. [Teknologi yang dipakai](#3-teknologi-yang-dipakai)
4. [Struktur folder](#4-struktur-folder)
5. [Konsep penting](#5-konsep-penting)
6. [Alur pengguna](#6-alur-pengguna)
7. [Model data](#7-model-data)
8. [Cara menjalankan](#8-cara-menjalankan)
9. [Membangun APK Android](#9-membangun-apk-android)
10. [Pertanyaan yang mungkin muncul saat sidang](#10-pertanyaan-yang-mungkin-muncul-saat-sidang)

---

## 1. Apa yang dikerjakan aplikasi ini

Aplikasi ini adalah antarmuka yang dipakai dua jenis pengguna:

**Warga** — mendaftar, mengisi formulir pengajuan dokumen, mengunggah berkas
pendukung, memantau status pengajuan, membaca notifikasi, dan mengunduh surat
yang sudah selesai.

**Petugas (admin)** — melihat semua pengajuan yang masuk, memeriksa berkas,
mengubah status pengajuan, dan menerbitkan surat.

Empat layanan yang tersedia:

| Layanan | Kode |
| --- | --- |
| Pengajuan Pembuatan KTP | `ktp` |
| Permohonan Akta Kelahiran | `akta_kelahiran` |
| Permohonan Akta Kematian | `akta_kematian` |
| Surat Pengantar RT/RW | `surat_rt_rw` |

Aplikasi **tidak menyimpan data sendiri**. Semua data diambil dari dan dikirim
ke backend. Yang disimpan di perangkat hanya token login.

---

## 2. Arsitektur aplikasi

```
┌───────────────────────────────────────────────┐
│                  Layar (screens)              │
│   warga.tsx · admin.tsx · requestForm.tsx     │
│   requestDetail.tsx · auth.tsx · profile.tsx  │
└───────────────────┬───────────────────────────┘
                    │  membaca data & memanggil aksi
                    ▼
┌───────────────────────────────────────────────┐
│              AppContext.tsx                   │
│   Menyimpan state global:                     │
│   currentUser · requests · notifications      │
│   Menyediakan aksi:                           │
│   login · submitRequest · updateRequestStatus │
└───────────────────┬───────────────────────────┘
                    │
        ┌───────────┴────────────┐
        ▼                        ▼
┌────────────────┐      ┌──────────────────┐
│  services/     │      │  services/       │
│  api.ts        │      │  uploadService   │
│  (ke backend)  │      │  (ke Cloudinary) │
└───────┬────────┘      └────────┬─────────┘
        │                        │
        ▼                        ▼
┌────────────────┐      ┌──────────────────┐
│ Backend Flask  │      │    Cloudinary    │
└────────────────┘      └──────────────────┘
```

Aturan pembagiannya:

- **Layar** hanya mengurus tampilan. Tidak memanggil `fetch` langsung.
- **AppContext** menyimpan state dan menjadi satu-satunya tempat memanggil API.
- **services/** hanya mengurus komunikasi jaringan. Tidak tahu soal tampilan.

Manfaatnya: bila alamat API berubah atau format response berubah, perubahan
cukup dilakukan di `services/`, tidak menyebar ke banyak layar.

---

## 3. Teknologi yang dipakai

| Teknologi | Versi | Fungsi |
| --- | --- | --- |
| Expo | ~56.0 | Kerangka kerja React Native, menyediakan build & API perangkat |
| React Native | 0.85.3 | Membuat aplikasi native memakai React |
| React | 19.2.3 | Pustaka antarmuka |
| TypeScript | ~5.9 | JavaScript dengan pemeriksaan tipe |
| Expo Router | ~56.2 | Navigasi berbasis struktur folder |
| React Hook Form | ^7.79 | Mengelola state formulir dan validasinya |
| AsyncStorage | 2.2.0 | Menyimpan token login di perangkat |
| Expo Document Picker | ~56.0 | Memilih berkas dari perangkat |
| Expo File System | ~56.0 | Mengunggah dan menyimpan berkas |
| React Icons | ^5.6 | Ikon antarmuka |

**Mengapa Expo, bukan React Native murni?**
Expo menyediakan konfigurasi build, akses kamera/berkas, dan dukungan web tanpa
perlu mengatur Xcode/Android Studio secara manual sejak awal. Untuk membangun
APK, folder native tetap bisa dihasilkan lewat `expo prebuild`.

**Mengapa TypeScript?**
Kesalahan seperti salah nama field (`nomorKK` vs `nomorKk`) terdeteksi saat
menulis kode, bukan saat aplikasi dijalankan pengguna.

---

## 4. Struktur folder

```
digiwa-frontend/
├── app.json                    Konfigurasi Expo (nama, ikon, splash)
├── package.json                Daftar dependensi & perintah npm
├── .env.example                Contoh konfigurasi
│
├── assets/images/              Ikon aplikasi & splash screen
│
└── src/
    ├── app/                    Halaman — struktur folder = struktur URL
    │   ├── _layout.tsx         Pembungkus semua halaman (pasang AppContext)
    │   ├── index.tsx           Splash screen
    │   ├── login.tsx
    │   ├── register.tsx
    │   ├── success.tsx
    │   ├── (warga)/            Tab bawah untuk warga
    │   │   ├── _layout.tsx     Definisi tab + RoleGuard
    │   │   ├── index.tsx       Beranda
    │   │   ├── pengajuan.tsx   Daftar layanan
    │   │   ├── status.tsx      Daftar pengajuan
    │   │   ├── notifikasi.tsx
    │   │   └── profil.tsx
    │   ├── (admin)/            Tab bawah untuk petugas
    │   │   ├── _layout.tsx
    │   │   ├── index.tsx       Dashboard
    │   │   ├── permohonan.tsx  Semua pengajuan
    │   │   ├── verifikasi.tsx
    │   │   ├── cetak.tsx
    │   │   └── profil.tsx
    │   ├── form/[service].tsx        Formulir pengajuan (dinamis per layanan)
    │   ├── request/[id].tsx          Detail pengajuan (sisi warga)
    │   ├── admin-request/[id].tsx    Detail pengajuan (sisi petugas)
    │   └── profile/
    │       ├── edit.tsx
    │       └── password.tsx
    │
    ├── screens/                Isi tampilan sebenarnya
    │   ├── auth.tsx            Login & registrasi
    │   ├── warga.tsx           Layar-layar warga
    │   ├── admin.tsx           Layar-layar petugas
    │   ├── requestForm.tsx     Formulir bertahap
    │   ├── requestDetail.tsx   Detail pengajuan (warga & petugas)
    │   ├── profile.tsx
    │   └── *.styles.ts         Gaya tampilan, dipisah dari logika
    │
    ├── components/
    │   ├── digiwa.tsx          Semua komponen yang dipakai ulang
    │   ├── RoleGuard.tsx       Pembatas akses berdasarkan peran
    │   └── WebLayout.tsx       Penyesuaian tampilan untuk browser
    │
    ├── constants/
    │   ├── services.ts         Definisi 4 layanan + field formulirnya
    │   └── theme.ts            Warna, jarak, radius, bayangan
    │
    ├── context/
    │   └── AppContext.tsx      State global + semua aksi
    │
    ├── services/
    │   ├── api.ts              Semua panggilan ke backend
    │   ├── apiMappers.ts       Mengubah response backend ke tipe aplikasi
    │   └── uploadService.ts    Unggah berkas ke Cloudinary
    │
    ├── types/index.ts          Definisi tipe TypeScript
    │
    └── utils/
        ├── documentDispatch.ts Menentukan layanan mana yang punya template
        ├── format.ts           Format tanggal, label, pengurutan
        └── validation.ts       Aturan validasi formulir
```

### Mengapa `app/` dan `screens/` dipisah?

`app/` menentukan **alamat halaman**, `screens/` berisi **isi tampilannya**.

```tsx
// src/app/(warga)/status.tsx — hanya menentukan alamat & pembatas akses
export default function Page() {
  return (
    <RoleGuard role="warga">
      <StatusScreen />
    </RoleGuard>
  );
}
```

Dengan pemisahan ini, satu layar bisa dipakai di beberapa alamat, dan pengaturan
navigasi tidak tercampur dengan kode tampilan.

---

## 5. Konsep penting

### 5.1 Navigasi berbasis folder (Expo Router)

Nama file menentukan alamat halaman:

| File | Alamat |
| --- | --- |
| `src/app/login.tsx` | `/login` |
| `src/app/(warga)/status.tsx` | `/status` |
| `src/app/request/[id].tsx` | `/request/123` |
| `src/app/form/[service].tsx` | `/form/akta_kelahiran` |

- Nama dalam kurung `(warga)` dan `(admin)` **tidak muncul di alamat**. Fungsinya
  mengelompokkan halaman agar bisa memakai tata letak (tab bawah) yang sama.
- Nama dalam kurung siku `[id]` berarti bagian alamat yang berubah-ubah. Nilainya
  dibaca dengan `useLocalSearchParams()`.

Contoh membaca parameter:

```tsx
const params = useLocalSearchParams<{ id?: string }>();
const requestId = Array.isArray(params.id) ? params.id[0] : params.id;
```

### 5.2 State global dengan Context

Data yang dipakai banyak layar disimpan di satu tempat, `AppContext.tsx`:

| Isi state | Keterangan |
| --- | --- |
| `currentUser` | Pengguna yang sedang login (`null` jika belum) |
| `token` | Token dari backend |
| `sessionLoading` | Sedang memeriksa token tersimpan atau tidak |
| `requests` | Daftar pengajuan |
| `notifications` | Daftar notifikasi |
| `services` | Daftar layanan dari backend |

Aksi yang disediakan:

```
login · register · logout · refreshData · getRequestById
submitRequest · updateRequestStatus · generateDocument
downloadFilledForm · updateProfile · changePassword
```

Cara memakainya di layar mana pun:

```tsx
const { currentUser, requests, submitRequest } = useApp();
```

**Mengapa tidak memakai Redux?**
Jumlah state global di aplikasi ini sedikit dan perubahannya sederhana. Context
bawaan React sudah mencukupi tanpa menambah pustaka dan boilerplate.

### 5.3 Sesi login yang bertahan

Saat login berhasil, token disimpan di AsyncStorage dengan kunci
`DIGIWA_SESSION_TOKEN`. Ketika aplikasi dibuka lagi, token dibaca dan divalidasi
ke backend lewat `GET /me`:

```
Aplikasi dibuka
   └→ baca token dari AsyncStorage
        ├→ tidak ada           → tampilkan layar login
        └→ ada                 → panggil GET /me
              ├→ berhasil      → masuk sesuai peran
              └→ gagal/expired → hapus token, tampilkan login
```

Selama pemeriksaan berlangsung, `sessionLoading` bernilai `true` dan aplikasi
menampilkan indikator memuat. Tanpa ini, layar login akan berkedip sesaat
walaupun pengguna sebenarnya masih login.

### 5.4 Pembatasan akses berdasarkan peran

`RoleGuard` membungkus halaman dan memeriksa peran sebelum menampilkan isinya:

```tsx
export function RoleGuard({ role, children }) {
  const { currentUser, sessionLoading } = useApp();

  if (sessionLoading) return <LoadingState />;
  if (!currentUser) return <Redirect href="/login" />;
  if (currentUser.role !== role) {
    return <Redirect href={currentUser.role === 'admin' ? '/(admin)' : '/(warga)'} />;
  }
  return children;
}
```

Warga yang membuka alamat halaman admin akan dialihkan ke berandanya sendiri.

**Catatan penting:** pembatasan ini hanya mengatur tampilan. Keamanan
sesungguhnya ada di backend, yang memeriksa peran pada setiap permintaan. Warga
yang memodifikasi aplikasi tetap tidak bisa mengakses data admin karena backend
menolaknya.

### 5.5 Formulir yang didefinisikan sebagai data

Empat layanan memiliki formulir berbeda. Alih-alih membuat empat komponen
terpisah, seluruh struktur formulir ditulis sebagai data di
`constants/services.ts`:

```ts
{
  type: 'akta_kelahiran',
  title: 'Permohonan Pembuatan Akta Kelahiran',
  sections: [
    {
      id: 'data-anak',
      title: 'Data Anak',
      fields: [
        { name: 'namaAnak', label: 'Nama Anak', required: true },
        { name: 'tanggalLahirAnak', label: 'Tanggal Lahir', type: 'date', required: true },
        { name: 'jenisKelaminAnak', label: 'Jenis Kelamin', type: 'select', options: genderOptions },
      ],
    },
    {
      id: 'upload-berkas',
      title: 'Upload Berkas',
      uploads: [
        { key: 'suratLahir', label: 'Surat Keterangan Lahir', required: true },
      ],
    },
  ],
}
```

Satu komponen `requestForm.tsx` membaca definisi ini dan membangun tampilannya.

**Manfaatnya:** menambah field baru cukup menambah satu baris di file ini. Tidak
perlu mengubah komponen formulir. Contoh nyata: saat template surat RT/RW
membutuhkan Tempat/Tgl. Lahir, Jenis Kelamin, Pekerjaan, dan Agama, perubahan
yang dilakukan hanya menambah lima baris di definisi tersebut.

Jenis field yang didukung: teks biasa, `number`, `date`, `time`, `select`,
`textarea`.

### 5.6 Validasi formulir

Aturan validasi ada di `utils/validation.ts`:

| Aturan | Ketentuan |
| --- | --- |
| `required` | Tidak boleh kosong |
| `nik` | Tepat 16 digit angka |
| `kk` | Tepat 16 digit angka |
| `phone` | Angka, panjang wajar |
| `email` | Mengandung `@` dan domain |
| `date` | Format tanggal valid |

Validasi berjalan di dua tempat: di aplikasi (agar pengguna langsung tahu
kesalahannya) dan di backend (agar data tetap benar walaupun aplikasi
dimodifikasi). Validasi di aplikasi saja tidak cukup untuk menjamin kebenaran
data.

### 5.7 Pengunggahan berkas

Berkas **tidak dikirim ke backend**, melainkan langsung ke Cloudinary. Backend
hanya memberi izin berupa tanda tangan digital.

```
1. Warga memilih berkas (Expo Document Picker)
2. Aplikasi minta izin unggah:  POST /uploads/signature
   Backend balas: signature, timestamp, folder, apiKey
3. Aplikasi unggah langsung ke Cloudinary memakai izin tersebut
4. Cloudinary balas dengan URL berkas
5. Aplikasi kirim URL itu ke backend saat submit: POST /requests
```

Alasannya: berkas berukuran besar tidak membebani server backend, dan kunci
rahasia Cloudinary tidak pernah disimpan di aplikasi.

`uploadService.ts` menangani perbedaan antara web dan perangkat native:

- **Web:** memakai objek `File`/`Blob` dari browser.
- **Android/iOS:** memakai `expo-file-system` dengan URI berkas.

Perbedaan ini perlu ditangani terpisah karena cara browser dan perangkat native
merepresentasikan berkas memang berbeda.

### 5.8 Pengunduhan surat hasil

Untuk layanan yang punya template resmi (akta kelahiran, akta kematian, surat
RT/RW), backend menerbitkan surat otomatis saat petugas menyetujui pengajuan.

Aplikasi mengetahui layanan mana yang punya template lewat
`utils/documentDispatch.ts`:

```ts
const TEMPLATE_SERVICES: ServiceType[] = ['akta_kelahiran', 'akta_kematian', 'surat_rt_rw'];

export function hasFilledTemplate(serviceType?: ServiceType) {
  return !!serviceType && TEMPLATE_SERVICES.includes(serviceType);
}
```

Ada dua cara mengambil surat:

1. **`generatedDocuments[].publicUrl`** — tautan Cloudinary, dipakai secara
   normal.
2. **`GET /requests/{id}/filled-form`** — meminta backend membuat PDF saat itu
   juga, dipakai sebagai cadangan bila penerbitan otomatis gagal.

### 5.9 Sistem tema

Seluruh warna, jarak, dan radius ada di `constants/theme.ts`. Tidak ada nilai
warna yang ditulis langsung di komponen.

```ts
export const colors = {
  primary: '#0D3B82',        // biru tua, warna utama DIGIWA
  primaryDark: '#082B61',
  primaryLight: '#E7F0FF',
  secondary: '#0E9384',      // hijau kebiruan
  accent: '#F6C445',         // kuning
  background: '#F7FAFC',
  surface: '#FFFFFF',
  textPrimary: '#102033',
  textSecondary: '#5C6B7A',
  border: '#C7DDFB',
  success: '#1E9E5A',
  warning: '#F0A51A',
  danger: '#DC3D3D',
  info: '#2D7FE5',
  orange: '#F47B20',
  // ...beserta varian "Soft" untuk latar belakang badge
} as const;
```

Selain `colors`, file ini juga memuat `spacing` (jarak), `radius` (kelengkungan
sudut), `typography` (ukuran huruf), dan `shadows` (bayangan).

Warna status pengajuan:

| Status | Warna | Arti |
| --- | --- | --- |
| `pending` | Kuning | Sudah dikirim, menunggu diperiksa |
| `diproses` | Biru | Sedang diperiksa petugas |
| `revisi` | Oranye | Warga perlu memperbaiki data/berkas |
| `selesai` | Hijau | Selesai, surat bisa diunduh |
| `ditolak` | Merah | Ditolak, alasan ada di catatan petugas |

Mengubah identitas warna aplikasi cukup dilakukan di satu file ini.

---

## 6. Alur pengguna

### Alur warga

```
Splash → Login / Daftar
   └→ Beranda
        ├→ Pengajuan → pilih layanan → isi formulir bertahap
        │     ├→ isi data per bagian (validasi tiap bagian)
        │     ├→ unggah berkas
        │     ├→ periksa ringkasan + centang pernyataan
        │     └→ Kirim → layar sukses (menampilkan nomor tracking)
        ├→ Status → daftar pengajuan → Detail
        │     ├→ lihat timeline status
        │     ├→ baca catatan petugas
        │     └→ unduh surat (jika status "selesai")
        ├→ Notifikasi → ketuk → membuka detail pengajuan terkait
        └→ Profil → ubah profil / ganti password / keluar
```

### Alur petugas

```
Splash → Login (email @digiwa.id)
   └→ Dashboard (statistik + pengajuan terbaru)
        ├→ Permohonan → cari & saring → Review
        │     ├→ periksa data warga
        │     ├→ periksa berkas unggahan
        │     ├→ pilih status baru + tulis catatan
        │     └→ Simpan
        │          └→ jika "selesai" dan layanan punya template:
        │             surat otomatis dibuat & diunggah
        ├→ Verifikasi → daftar yang perlu diperiksa
        ├→ Cetak → daftar pengajuan selesai → unduh surat
        └→ Profil
```

### Formulir bertahap

`requestForm.tsx` menampilkan formulir per bagian, bukan sekaligus:

```
Bagian 1  →  Bagian 2  →  Bagian 3  →  Unggah Berkas  →  Konfirmasi
```

Tombol "Lanjut" hanya aktif bila bagian yang sedang dibuka sudah valid. Cara ini
mengurangi kesalahan dibanding menampilkan puluhan field sekaligus, dan pengguna
mendapat umpan balik lebih awal.

---

## 7. Model data

Definisi lengkap ada di `src/types/index.ts`.

```ts
type Role = 'warga' | 'admin';

type ServiceType = 'ktp' | 'akta_kelahiran' | 'akta_kematian' | 'surat_rt_rw';

type RequestStatus = 'pending' | 'diproses' | 'revisi' | 'selesai' | 'ditolak';

type User = {
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
};

type CitizenRequest = {
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
  generatedDocuments: GeneratedDocument[];
  adminNote?: string;
  timeline: TimelineItem[];
};
```

### Mengapa ada `apiMappers.ts`?

Backend memakai penamaan `snake_case` (`tracking_number`), aplikasi memakai
`camelCase` (`trackingNumber`). `apiMappers.ts` menerjemahkan keduanya:

```ts
export function mapRequestDetail(raw: unknown): CitizenRequest {
  const row = asRecord(raw);
  return {
    id: asString(row.id),
    trackingNumber: asString(row.tracking_number),
    serviceType: asString(row.service_type) as ServiceType,
    ...
  };
}
```

Fungsi ini juga memberi nilai default bila suatu field tidak ada, sehingga
tampilan tidak error karena data yang tidak lengkap. Tanpa lapisan ini,
perubahan nama kolom di backend akan menyebar ke banyak berkas di aplikasi.

---

## 8. Cara menjalankan

### Yang perlu disiapkan

- **Node.js** 18 atau lebih baru
- **npm** 9 atau lebih baru
- **Java JDK 17 atau 21 LTS** — hanya untuk membangun APK
- **Android Studio** — hanya untuk Android SDK
- **Git**

### Pemasangan

```bash
git clone <url-repositori>
cd digiwa-frontend
npm install
cp .env.example .env
```

Isi `.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:5000
```

Gunakan **alamat IP jaringan lokal** komputer, bukan `127.0.0.1`. Bagi perangkat
Android, `127.0.0.1` menunjuk ke perangkat itu sendiri, bukan ke komputer tempat
backend berjalan.

Cara melihat IP komputer:

```bash
ipconfig            # Windows, lihat "IPv4 Address"
ifconfig            # macOS / Linux
```

Awalan `EXPO_PUBLIC_` wajib ada agar nilainya terbaca oleh aplikasi.

### Menjalankan

```bash
npm run start          # server pengembangan, pindai QR lewat Expo Go
npm run android        # jalankan di emulator / perangkat Android
npm run web            # jalankan versi web di browser
npm run start-clean    # jalankan ulang dengan cache dibersihkan
```

### Bila aplikasi tidak terhubung ke backend

Periksa berurutan:

1. Backend berjalan? Buka `http://IP_KOMPUTER:5000/health` dari browser ponsel.
2. Backend berjalan di `0.0.0.0`, bukan `127.0.0.1`? Atur `FLASK_HOST=0.0.0.0`.
3. Ponsel dan komputer berada di jaringan Wi-Fi yang sama?
4. Firewall Windows memblokir port 5000?
5. `EXPO_PUBLIC_API_BASE_URL` sudah benar? Setelah mengubah `.env`, jalankan
   ulang dengan `npm run start-clean`.

---

## 9. Membangun APK Android

**Langkah 1 — Hasilkan folder native**

```bash
npm run android-prebuild
```

Perintah ini menjalankan `expo prebuild -p android`, membaca `app.json`, dan
menghasilkan ulang seluruh folder `android/` termasuk ikon dan splash screen.

**Langkah 2 — Tentukan lokasi Android SDK**

Buat berkas `android/local.properties`:

```
sdk.dir=C:\\Users\\NamaAnda\\AppData\\Local\\Android\\Sdk
```

**Langkah 3 — Bersihkan cache**

```bash
cd android
.\gradlew --no-daemon clean
```

**Langkah 4 — Bangun APK**

```bash
.\gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Hasilnya:

```
android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
```

> **Penting:** jalankan `android-prebuild` setiap kali `app.json` diubah.
> Perintah itu menimpa folder `android/`, jadi perubahan manual di dalamnya akan
> hilang.

`arm64-v8a` adalah arsitektur prosesor yang dipakai hampir semua ponsel Android
keluaran terbaru. Membatasi ke satu arsitektur membuat ukuran APK lebih kecil
dan proses build lebih cepat.

---

## 10. Pertanyaan yang mungkin muncul saat sidang

**Mengapa memilih React Native, bukan Android native (Kotlin)?**
Satu kode sumber menghasilkan aplikasi Android, iOS, sekaligus web. Untuk
pengerjaan skripsi dengan waktu terbatas, ini menghemat pekerjaan dibanding
menulis aplikasi terpisah untuk setiap platform.

**Mengapa Context, bukan Redux?**
State global aplikasi ini sedikit: pengguna, daftar pengajuan, dan notifikasi.
Context bawaan React sudah cukup. Redux menambah pustaka dan kode tambahan yang
manfaatnya baru terasa pada aplikasi dengan state jauh lebih kompleks.

**Bagaimana keamanan aplikasinya?**
Pembatasan di aplikasi (`RoleGuard`) hanya mengatur tampilan. Keamanan
sesungguhnya ada di backend: setiap permintaan diperiksa token dan perannya, dan
warga hanya bisa membuka pengajuan miliknya sendiri. Aplikasi yang dimodifikasi
tetap tidak bisa menembus pemeriksaan di server.

**Mengapa berkas diunggah langsung ke Cloudinary, tidak lewat backend?**
Agar server backend tidak menerima beban berkas besar. Backend hanya membuat
tanda tangan digital yang berlaku sesaat, sehingga kunci rahasia Cloudinary
tidak perlu disimpan di aplikasi.

**Bagaimana cara menambah layanan baru?**
Tambahkan satu entri di `constants/services.ts` yang berisi judul, dokumen yang
diperlukan, dan daftar bagian formulirnya. Komponen formulir, layar daftar
layanan, dan validasi akan menyesuaikan otomatis karena semuanya membaca dari
definisi tersebut.

**Bagaimana aplikasi tahu suatu layanan punya template surat?**
Lewat `hasFilledTemplate()` di `utils/documentDispatch.ts`, yang memuat daftar
layanan bertemplate. Bila layanan tidak ada dalam daftar, tombol penerbitan
surat tidak ditampilkan.

**Apa perbedaan folder `app/` dan `screens/`?**
`app/` menentukan alamat halaman dan pembatasan aksesnya; `screens/` berisi isi
tampilannya. Pemisahan ini membuat pengaturan navigasi tidak bercampur dengan
kode tampilan.

**Mengapa formulir dibuat bertahap, tidak satu halaman?**
Formulir akta kelahiran memiliki lebih dari 20 field. Menampilkan semuanya
sekaligus membuat pengguna kewalahan dan kesalahan baru diketahui di akhir.
Dengan bertahap, validasi terjadi per bagian dan pengguna langsung tahu bagian
mana yang perlu diperbaiki.

**Apa kelemahan aplikasi ini?**
- Notifikasi hanya terlihat saat aplikasi dibuka, belum ada push notification.
- Tidak ada mode luring; seluruh data memerlukan koneksi internet.
- Belum ada pratinjau berkas di dalam aplikasi; berkas dibuka lewat peramban.
- Belum ada unggah ulang berkas langsung dari layar detail saat status "revisi".

**Apa rencana pengembangan selanjutnya?**
Push notification, pratinjau berkas dalam aplikasi, penyimpanan sementara draf
pengajuan, dan penyaringan lanjutan pada dashboard petugas.
