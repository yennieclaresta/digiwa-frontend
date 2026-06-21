

  <img src="https://img.shields.io/badge/Expo-56.0.12-000020?&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/React_Native-0.85.3-61DAFB?&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/React-19.2.3-61DAFB?&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6.0.3-3178C6?&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Expo_Router-56.2.11-000020?&logo=expo" alt="Expo Router" />
  <img src="https://img.shields.io/badge/React_Hook_Form-7.79.0-EC5990?" alt="React Hook Form" />
  <img src="https://img.shields.io/badge/AsyncStorage-2.2.0-4CAF50?" alt="AsyncStorage" />
  <img src="https://img.shields.io/badge/Expo_Splash_Screen-56.0.10-000020?&logo=expo" alt="Expo Splash Screen" />
  <img src="https://img.shields.io/badge/Expo_Document_Picker-56.0.4-000020?&logo=expo" alt="Expo Document Picker" />
  <img src="https://img.shields.io/badge/Expo_File_System-56.0.8-000020?&logo=expo" alt="Expo File System" />
  <img src="https://img.shields.io/badge/Expo_Sharing-56.0.18-000020?&logo=expo" alt="Expo Sharing" />
  <img src="https://img.shields.io/badge/Expo_Image-56.0.11-000020?&logo=expo" alt="Expo Image" />
  <img src="https://img.shields.io/badge/RN_Gesture_Handler-2.31.1-blue?" alt="Gesture Handler" />
  <img src="https://img.shields.io/badge/RN_Reanimated-4.3.1-purple?" alt="Reanimated" />
  <img src="https://img.shields.io/badge/RN_Safe_Area_Context-5.7.0-orange?" alt="Safe Area Context" />
  <img src="https://img.shields.io/badge/RN_SVG-15.15.4-FFB13B?" alt="React Native SVG" />
  <img src="https://img.shields.io/badge/React_Icons-5.6.0-e91e63?" alt="React Icons" />
  <img src="https://img.shields.io/badge/RN_Screens-4.25.2-green?" alt="RN Screens" />
  <img src="https://img.shields.io/badge/RN_Web-0.21.0-61DAFB?" alt="React Native Web" />
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20Web-lightgrey?" alt="Platform" />
</p>

<p align="center">
  <img src="./assets//digiwa.png" alt="Logo DIGIWA" width=150 height=150 />
</p>

<h3 align="center">DIGIWA - Digitalisasi Data Warga</h3>

<p align="center">
  Platform digital untuk pengajuan dan pemantauan layanan administrasi warga secara online,
  dibangun menggunakan Expo React Native dengan dukungan Android dan web.
</p>

### Project Overview

DIGIWA adalah aplikasi mobile dan web yang memungkinkan warga untuk mengajukan layanan administrasi kependudukan secara digital, tanpa perlu datang langsung ke kantor RT/RW. Proses pengajuan, pemantauan status, hingga pengunduhan dokumen hasil dilakukan dalam satu aplikasi.

Aplikasi ini memiliki dua peran utama:

- **Warga** - mengajukan permohonan, mengunggah berkas, memantau status, dan menerima notifikasi
- **Admin (Petugas)** - menerima dan mengelola permohonan, memverifikasi data, memperbarui status, dan menghasilkan dokumen

Proyek ini dibuat sebagai sistem informasi berbasis mobile untuk kebutuhan administrasi tingkat kelurahan atau RT/RW, dan berfungsi sebagai bahan penelitian skripsi.

---

### Tech Stack

| Lapisan | Teknologi | Versi |
|---|---|---|
| Kerangka Kerja | Expo | 56.0.12 |
| Antarmuka Mobile | React Native | 0.85.3 |
| Antarmuka Web | React Native Web | 0.21.0 |
| Bahasa Pemrograman | TypeScript | 6.0.3 |
| Navigasi | Expo Router | 56.2.11 |
| Manajemen Formulir | React Hook Form | 7.79.0 |
| Penyimpanan Sesi | AsyncStorage | 2.2.0 |
| Unggah Berkas | Expo Document Picker | 56.0.4 |
| Sistem Berkas | Expo File System | 56.0.8 |
| Berbagi Berkas | Expo Sharing | 56.0.18 |
| Gambar | Expo Image | 56.0.11 |
| Splash Screen | Expo Splash Screen | 56.0.10 |
| Animasi | React Native Reanimated | 4.3.1 |
| Gesture | React Native Gesture Handler | 2.31.1 |
| Safe Area | React Native Safe Area Context | 5.7.0 |
| SVG | React Native SVG | 15.15.4 |
| Ikon | React Icons | 5.6.0 |
| Backend | Flask (Python) | Terpisah |
| Database | PostgreSQL / Supabase | Terpisah |
| Unggah File | Cloudinary | Terpisah |

---

### Prerequisites

Sebelum memulai, pastikan perangkat sudah memiliki perangkat lunak berikut:

- **Node.js** versi 18 atau lebih baru
- **npm** versi 9 atau lebih baru
- **Expo CLI** - `npm install -g expo-cli` (opsional, bisa menggunakan npx)
- **Java JDK 17 atau 21 LTS** - wajib untuk membangun APK Android
- **Android Studio** - wajib untuk Android SDK
- **Git** - untuk mengambil kode sumber

Untuk membangun APK, tambahkan path SDK Android di file `android/local.properties`:

```
sdk.dir=C:\Users\NamaAnda\AppData\Local\Android\Sdk
```

### Installation

**Langkah 1 - Salin repositori**

```bash
git clone <url-repositori>
cd digiwa-frontend
```

**Langkah 2 — Pasang dependensi**

```bash
npm install
```

**Langkah 3 — Salin dan isi file konfigurasi lingkungan**

```bash
cp .env.example .env
```

Kemudian buka file `.env` dan isi variabel berikut:

```env
EXPO_PUBLIC_API_BASE_URL=http://IP_MESIN_LOKAL:5000
```

Gunakan IP jaringan lokal mesin (bukan `127.0.0.1`) agar aplikasi di perangkat fisik dapat terhubung ke server backend yang berjalan di komputer.

### Running the Application

**Menjalankan di perangkat fisik atau emulator Android**

```bash
npm run android
```

**Menjalankan versi web di browser**

```bash
npm run web
```

**Menjalankan Expo development server (scan QR via Expo Go)**

```bash
npm run start
```

**Menjalankan ulang dengan cache bersih jika ada masalah**

```bash
npm run start-clean
```

### Building the Android APK

Proses ini menghasilkan file `.apk` yang dapat dipasang langsung di perangkat Android.

**Langkah 1 — Jalankan prebuild untuk menghasilkan folder native Android**

```bash
npm run android-prebuild
```

Perintah ini menjalankan `expo prebuild -p android` yang membaca `app.json` dan menghasilkan ulang seluruh folder `android/` termasuk konfigurasi splash screen dan ikon.

**Langkah 2 — Masuk ke folder android dan bersihkan cache build**

```bash
cd android
.\gradlew --no-daemon clean
```

**Langkah 3 — Bangun APK untuk arsitektur arm64**

```bash
.\gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

File APK hasil build tersedia di:

```
android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
```

> Catatan penting: Selalu jalankan `android-prebuild` terlebih dahulu sebelum `gradlew assembleRelease`. Perintah prebuild akan menimpa folder `android/` dan memperbarui aset splash screen dari konfigurasi `app.json`.

### Folder Structure

```
digiwa-frontend/
|
+-- assets/                       Aset statis (gambar, ikon)
|   +-- images/
|       +-- icon.png              Ikon aplikasi dan ikon adaptif Android
|       +-- splash-icon.png       Gambar splash screen native Android
|
+-- src/
|   +-- app/                      Halaman berbasis file-routing Expo Router
|   |   +-- _layout.tsx           Root layout, provider global
|   |   +-- index.tsx             Titik masuk, menampilkan splash screen
|   |   +-- login.tsx             Halaman login
|   |   +-- register.tsx          Halaman pendaftaran warga
|   |   +-- success.tsx           Halaman konfirmasi berhasil
|   |   +-- form/[service].tsx    Formulir dinamis per jenis layanan
|   |   +-- request/[id].tsx      Detail permohonan warga
|   |   +-- admin-request/[id].tsx Detail permohonan untuk admin
|   |   +-- profile/edit.tsx      Edit profil pengguna
|   |   +-- profile/password.tsx  Ganti kata sandi
|   |   +-- (warga)/              Grup tab navigasi warga
|   |   |   +-- _layout.tsx       Konfigurasi tab bar warga
|   |   |   +-- index.tsx         Beranda warga
|   |   |   +-- pengajuan.tsx     Daftar layanan
|   |   |   +-- status.tsx        Pemantauan status permohonan
|   |   |   +-- notifikasi.tsx    Notifikasi warga
|   |   |   +-- profil.tsx        Profil warga
|   |   +-- (admin)/              Grup tab navigasi admin
|   |       +-- _layout.tsx       Konfigurasi tab bar admin
|   |       +-- index.tsx         Dashboard admin
|   |       +-- permohonan.tsx    Manajemen permohonan
|   |       +-- verifikasi.tsx    Verifikasi dan pembaruan status
|   |       +-- cetak.tsx         Cetak dan unduh dokumen
|   |       +-- profil.tsx        Profil admin
|   |
|   +-- components/               Komponen antarmuka yang dapat digunakan ulang
|   |   +-- digiwa.tsx            Kumpulan komponen utama aplikasi
|   |   +-- digiwa.styles.ts      Gaya untuk komponen utama
|   |   +-- RoleGuard.tsx         Komponen penjaga akses berbasis peran
|   |   +-- WebLayout.tsx         Pembungkus tata letak khusus web
|   |   +-- animated-icon.tsx     Animasi ikon splash (native)
|   |   +-- animated-icon.web.tsx Animasi ikon splash (web)
|   |
|   +-- screens/                  Logika dan tampilan layar utama
|   |   +-- auth.tsx              SplashScreen, LoginScreen, RegisterScreen
|   |   +-- auth.styles.ts
|   |   +-- warga.tsx             Layar beranda, pengajuan, status, notifikasi warga
|   |   +-- warga.styles.ts
|   |   +-- admin.tsx             Layar dashboard, permohonan, verifikasi, cetak admin
|   |   +-- admin.styles.ts
|   |   +-- requestForm.tsx       Mesin render formulir dinamis
|   |   +-- requestForm.styles.ts
|   |   +-- requestDetail.tsx     Tampilan detail dan riwayat permohonan
|   |   +-- requestDetail.styles.ts
|   |   +-- profile.tsx           Layar profil, edit, dan ganti sandi
|   |
|   +-- constants/
|   |   +-- theme.ts              Sistem desain: warna, jarak, tipografi, bayangan
|   |   +-- services.ts           Konfigurasi lengkap 4 jenis layanan dan field formulir
|   |
|   +-- context/
|   |   +-- AppContext.tsx         State global: sesi pengguna, data, notifikasi
|   |
|   +-- services/
|   |   +-- api.ts                 Fungsi pemanggilan API ke backend Flask
|   |   +-- apiMappers.ts          Konverter format data antara API dan aplikasi
|   |   +-- uploadService.ts       Layanan unggah berkas ke Cloudinary
|   |
|   +-- types/
|   |   +-- index.ts               Definisi tipe TypeScript seluruh aplikasi
|   |
|   +-- hooks/
|   |   +-- use-color-scheme.ts    Hook deteksi mode gelap/terang
|   |   +-- use-theme.ts           Hook akses tema aktif
|   |
|   +-- utils/
|       +-- format.ts              Fungsi format tanggal, label layanan
|       +-- documentDispatch.ts    Fungsi distribusi dan pengunduhan dokumen
|
+-- android/                      Folder native Android (dihasilkan oleh prebuild)
+-- app.json                      Konfigurasi aplikasi Expo
+-- package.json                  Daftar dependensi
+-- tsconfig.json                 Konfigurasi TypeScript
```

### Available UI Components

Semua komponen berada di `src/components/digiwa.tsx` dan dapat digunakan ulang di seluruh layar.

| Nama Komponen | Kegunaan |
|---|---|
| `Screen` | Pembungkus layar dengan SafeAreaView, KeyboardAvoidingView, dan ScrollView |
| `AppHeader` | Header halaman dengan judul, subjudul, dan tombol kembali |
| `PrimaryButton` | Tombol utama warna biru primer |
| `SecondaryButton` | Tombol sekunder dengan latar terang dan bingkai |
| `TextInputField` | Input teks dengan label, validasi, dan mode sandi |
| `SelectField` | Dropdown pilihan inline yang terbuka ke bawah tanpa modal |
| `DatePickerField` | Pemilih tanggal dengan tampilan kalender |
| `TimePickerField` | Pemilih waktu dengan kontrol jam dan menit |
| `FileUploadField` | Tombol unggah berkas dari penyimpanan perangkat |
| `StatusBadge` | Label warna status permohonan |
| `ServiceCard` | Kartu informasi layanan dengan tombol pengajuan |
| `RequestCard` | Kartu ringkasan permohonan warga |
| `EmptyState` | Tampilan ketika data kosong |
| `LoadingState` | Tampilan saat data sedang dimuat |
| `ConfirmationModal` | Dialog konfirmasi dengan dua tombol |
| `SectionTitle` | Judul dan deskripsi bagian formulir |
| `InfoBox` | Kotak informasi berwarna kuning muda |
| `ProgressIndicator` | Indikator langkah formulir multi-bagian |
| `DashboardStatCard` | Kartu statistik untuk dashboard admin |
| `CheckRow` | Baris centang pernyataan konfirmasi |
| `ReactIcon` | Penyaji ikon dari pustaka React Icons ke SVG native |

### Pages and Screens

#### Authentication Screens

| Layar | File | Keterangan |
|---|---|---|
| Splash Screen | `src/screens/auth.tsx` | Layar pembuka dengan logo, nama aplikasi, dan indikator muat |
| Login | `src/app/login.tsx` | Masuk menggunakan email atau NIK dan kata sandi |
| Daftar | `src/app/register.tsx` | Pendaftaran akun warga baru |

#### Warga Screens

| Layar | Rute | Keterangan |
|---|---|---|
| Beranda | `/(warga)/` | Sambutan, kartu layanan, ringkasan permohonan terbaru |
| Daftar Layanan | `/(warga)/pengajuan` | Pilihan 4 jenis layanan yang tersedia |
| Formulir Permohonan | `/form/[service]` | Formulir dinamis sesuai jenis layanan |
| Status Permohonan | `/(warga)/status` | Daftar seluruh permohonan warga dengan filter |
| Detail Permohonan | `/request/[id]` | Riwayat status, catatan admin, dan unduh dokumen |
| Notifikasi | `/(warga)/notifikasi` | Daftar pemberitahuan dari admin |
| Profil | `/(warga)/profil` | Data pribadi, edit profil, ganti sandi, keluar |

#### Admin Screens

| Layar | Rute | Keterangan |
|---|---|---|
| Dashboard | `/(admin)/` | Statistik, permohonan terbaru, log aktivitas |
| Manajemen Permohonan | `/(admin)/permohonan` | Daftar dan pencarian seluruh permohonan warga |
| Verifikasi | `/(admin)/verifikasi` | Pembaruan status dan catatan admin |
| Detail Permohonan | `/admin-request/[id]` | Tinjauan data, berkas, dan riwayat permohonan |
| Cetak Dokumen | `/(admin)/cetak` | Penghasilan dan pengunduhan dokumen layanan |
| Profil Admin | `/(admin)/profil` | Informasi petugas dan tombol keluar |

### Available Services

Aplikasi mendukung empat jenis layanan administrasi kependudukan.

#### Service 1 - KTP Application

Untuk pembuatan KTP baru, perubahan data, penggantian hilang atau rusak, dan cetak ulang.

Bagian formulir:
- Data Pemohon (nama, NIK, KK, tempat/tanggal lahir, jenis kelamin, agama, status kawin, pekerjaan, kewarganegaraan, alamat, RT, RW, kelurahan, kecamatan, kota, provinsi)
- Jenis Pengajuan (KTP Baru, Perubahan Data, KTP Hilang, KTP Rusak, Cetak Ulang)
- Upload Berkas (KK, Surat Pengantar RT/RW, Pas Foto, KTP Lama jika berlaku, Surat Kehilangan jika hilang)

#### Service 2 - Birth Certificate

Untuk pendaftaran kelahiran anak dengan data lengkap orang tua dan pelapor.

Bagian formulir:
- Data Anak (nama, jenis kelamin, tempat/tanggal lahir, waktu lahir, anak ke, tempat dilahirkan)
- Data Ayah (nama, NIK, tempat/tanggal lahir, pekerjaan)
- Data Ibu (nama, NIK, tempat/tanggal lahir, pekerjaan)
- Data Pelapor (nama, NIK, hubungan, nomor HP, alamat)
- Upload Berkas (Surat Keterangan Lahir, KK, KTP Ayah, KTP Ibu, Buku Nikah, Surat Pengantar RT/RW)

#### Service 3 - Death Certificate

Untuk pengurusan akta kematian dengan data almarhum, kejadian, dan pelapor.

Bagian formulir:
- Data Almarhum/Almarhumah (nama, NIK, KK, jenis kelamin, tempat/tanggal lahir, agama, status kawin, pekerjaan, alamat terakhir)
- Data Kematian (tanggal, waktu, tempat, penyebab, lokasi pemakaman)
- Data Pelapor (nama, NIK, hubungan, nomor HP, alamat)
- Upload Berkas (KTP Almarhum, KK, Surat Keterangan Kematian, KTP Pelapor, Surat Pengantar RT/RW)

#### Service 4 - RT/RW Letter

Untuk berbagai keperluan surat pengantar atau keterangan dari RT/RW.

Jenis surat yang tersedia:
- Surat Pengantar KTP
- Surat Pengantar KK
- Surat Keterangan Domisili
- Surat Keterangan Usaha
- Surat Keterangan Tidak Mampu
- Surat Pengantar Nikah
- Surat Keterangan Kelahiran
- Surat Keterangan Kematian
- Lainnya

Bagian formulir:
- Data Pemohon (nama, NIK, KK, nomor HP, alamat, RT, RW)
- Jenis Surat (pilihan dari daftar di atas)
- Detail Keperluan (keperluan, instansi tujuan, catatan tambahan)
- Upload Berkas (KTP, KK, Dokumen Pendukung opsional)

### Data Model

Seluruh tipe data didefinisikan di `src/types/index.ts`.

#### User

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | string | Identitas unik pengguna |
| role | `'warga'` atau `'admin'` | Peran pengguna dalam sistem |
| name | string | Nama lengkap |
| nik | string | Nomor Induk Kependudukan (16 digit) |
| kkNumber | string | Nomor Kartu Keluarga (16 digit) |
| email | string | Alamat email |
| phone | string | Nomor telepon |
| address | string | Alamat lengkap |
| rt | string | Nomor RT |
| rw | string | Nomor RW |

#### CitizenRequest (Citizen Request)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | string | Identitas unik permohonan |
| trackingNumber | string | Nomor pelacakan permohonan |
| userId | string | ID pemilik permohonan |
| applicantName | string | Nama pemohon |
| nik | string | NIK pemohon |
| serviceType | ServiceType | Jenis layanan yang diajukan |
| status | RequestStatus | Status permohonan saat ini |
| submittedAt | string | Waktu pengajuan (ISO 8601) |
| updatedAt | string | Waktu pembaruan terakhir |
| formData | Record | Data isian formulir |
| uploadedFiles | UploadedFile[] | Daftar berkas yang diunggah |
| adminNote | string | Catatan dari admin (opsional) |
| timeline | TimelineItem[] | Riwayat perubahan status |
| generatedDocuments | GeneratedDocument[] | Dokumen hasil yang dihasilkan admin |

#### UploadedFile (Uploaded File)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | string | Identitas unik berkas |
| name | string | Nama berkas |
| uri | string | Lokasi berkas di perangkat atau server |
| type | string | Tipe MIME berkas |
| size | number | Ukuran berkas dalam byte |
| uploadedAt | string | Waktu pengunggahan |
| publicUrl | string | URL publik di Cloudinary (jika sudah diunggah) |

#### Notification

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | string | Identitas unik notifikasi |
| userId | string | Penerima notifikasi |
| requestId | string | Permohonan terkait |
| title | string | Judul notifikasi |
| message | string | Isi pesan |
| isRead | boolean | Status sudah dibaca atau belum |
| createdAt | string | Waktu pembuatan |

#### TimelineItem (Status History)

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | string | Identitas unik entri |
| status | RequestStatus | Status pada entri ini |
| title | string | Judul entri riwayat |
| description | string | Penjelasan perubahan |
| createdAt | string | Waktu perubahan |

### Request Status System

Setiap permohonan memiliki satu dari lima kemungkinan status berikut:

| Status | Warna | Arti |
|---|---|---|
| Pending | Kuning | Permohonan diterima, belum ditinjau admin |
| Diproses | Biru | Permohonan sedang ditinjau atau dikerjakan admin |
| Revisi | Oranye | Warga perlu memperbaiki data atau mengunggah ulang berkas |
| Selesai | Hijau | Permohonan telah selesai diproses |
| Ditolak | Merah | Permohonan ditolak, alasan tersedia di catatan admin |

Perubahan status oleh admin secara otomatis memicu notifikasi untuk warga.

### Notification System

Notifikasi dibuat secara otomatis setiap kali admin mengubah status permohonan.

| Status Baru | Isi Notifikasi |
|---|---|
| Pending | Permohonan Anda telah diterima dan sedang menunggu verifikasi admin. |
| Diproses | Permohonan Anda sedang diproses oleh admin. |
| Revisi | Permohonan Anda membutuhkan revisi. Silakan cek catatan admin pada detail permohonan. |
| Selesai | Permohonan Anda telah selesai diproses. |
| Ditolak | Permohonan Anda ditolak. Silakan cek alasan penolakan pada detail permohonan. |

### Form Validation

Seluruh formulir menggunakan React Hook Form dengan aturan validasi berikut:

| Aturan | Keterangan |
|---|---|
| Wajib diisi | Semua kolom bertanda wajib harus diisi sebelum dapat dikirim |
| Format NIK | Harus berupa angka dan tepat 16 digit |
| Format KK | Harus berupa angka dan tepat 16 digit |
| Format email | Harus memiliki format `nama@domain.tld` |
| Nomor HP | Harus berupa angka dengan panjang 9 hingga 15 karakter |
| Konfirmasi sandi | Harus sama persis dengan kolom kata sandi |
| Unggah berkas wajib | Berkas tertentu wajib diunggah sebelum formulir dapat dikirim |
| Pernyataan kebenaran | Kotak centang pernyataan harus dicentang sebelum mengirim |
| Catatan admin wajib | Kolom catatan wajib diisi jika status diubah ke Revisi atau Ditolak |

Beberapa kolom unggahan muncul atau diwajibkan hanya berdasarkan pilihan sebelumnya — misalnya Surat Kehilangan hanya muncul jika jenis pengajuan KTP adalah "KTP Hilang".

### User Flow

#### Warga Flow

```
Splash Screen
    |
    v
Login / Daftar Akun
    |
    v
Beranda Warga
    |
    +-- Pilih Layanan (4 pilihan)
    |       |
    |       v
    |   Isi Formulir Multi-Bagian
    |       |
    |       v
    |   Unggah Berkas
    |       |
    |       v
    |   Konfirmasi dan Kirim
    |       |
    |       v
    |   Layar Berhasil + Nomor Pelacakan
    |
    +-- Pantau Status Permohonan
    |       |
    |       v
    |   Detail Permohonan + Riwayat
    |       |
    |       v
    |   Unduh Dokumen (jika Selesai)
    |
    +-- Notifikasi dari Admin
```

#### Admin Flow

```
Login sebagai Admin
    |
    v
Dashboard (Statistik dan Ringkasan)
    |
    +-- Daftar Permohonan Masuk
    |       |
    |       v
    |   Tinjau Data dan Berkas Warga
    |       |
    |       v
    |   Perbarui Status + Tulis Catatan
    |       |
    |       v
    |   Notifikasi Otomatis Terkirim ke Warga
    |
    +-- Cetak / Unduh Dokumen (jika Selesai)
```

### Environment Configuration

File `.env` di root proyek mendefinisikan variabel berikut:

| Variabel | Contoh Nilai | Keterangan |
|---|---|---|
| EXPO_PUBLIC_API_BASE_URL | `http://192.168.1.5:5000` | URL dasar server backend Flask |

Variabel dengan awalan `EXPO_PUBLIC_` secara otomatis tersedia di seluruh kode JavaScript. Nilai ini dibaca di `src/services/api.ts` oleh fungsi `getApiBaseUrl()`.