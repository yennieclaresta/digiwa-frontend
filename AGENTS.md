# DIGIWA (Digitalisasi Data Warga) - Expo Mobile Project

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Role

You are an expert mobile app developer. Build a complete mobile application called DIGIWA – Digitalisasi Data Warga using Expo JS with React Native.
The app is a digital citizen service platform for neighborhood/community administration. It allows residents to submit document requests digitally and allows admins to manage, verify, update status, notify users, and generate/download documents.

Use React Native + Expo, preferably with TypeScript. Build a clean, modern, mobile-first app with reusable components, clear folder structure, and mock backend data first. The app must be easy to later connect to Firebase, Supabase, or a REST API.

## Task

### User & Features
The application has two main roles:
1. User / Warga
2. Admin

The system has 4 main service features:
1. Pengajuan Pembuatan KTP
2. Permohonan Pembuatan Akta Kelahiran
3. Permohonan Pembuatan Akta Kematian
4. Surat Permohonan RT/RW

### App Design

Use app colors that follow the provided DIGIWA logo. Since the logo color should guide the visual identity, create a centralized theme file where primary, secondary, accent, background, text, border, success, warning, danger, and neutral colors can easily be changed. Use the logo-inspired palette consistently across buttons, headers, cards, tabs, badges, forms, and status labels.

Use a modern civic-tech visual style:
- Clean
- Friendly
- Trustworthy
- Simple for warga
- Professional for admin
- Rounded cards
- Soft shadows
- Clear typography
- Large readable buttons
- Status badges with different colors
- Mobile-first layout

### Tech Stacks

Use the following technology stack:
- Expo
- React Native
- TypeScript
- Expo Router or React Navigation
- React Hook Form for forms
- AsyncStorage for mock auth/session
- Expo Document Picker for uploading documents
- Expo Image Picker if needed
- Expo File System / Sharing for mock PDF download
- Optional: React Native Paper or NativeWind, but keep the UI clean and consistent
- Use mock data stored locally for now

### Components

Create reusable components:
1. AppHeader
2. PrimaryButton
3. SecondaryButton
4. TextInputField
5. SelectField
6. FileUploadField
7. StatusBadge
8. ServiceCard
9. RequestCard
10. EmptyState
11. LoadingState
12. ConfirmationModal
13. SectionTitle
14. InfoBox
15. FormStepper or ProgressIndicator
16. DashboardStatCard

Create the following main screens:

#### Auth Screens

1. Splash Screen
- Show DIGIWA logo or placeholder logo
- App name: “DIGIWA”
- Subtitle: “Digitalisasi Data Warga”
- Auto-navigate to login after short delay

2. Login Screen
- User can login as Warga or Admin using role selector
- Use mock authentication
- Fields:
  - Email / NIK
  - Password
  - Role: Warga / Admin
- Button: Masuk
- Link: Belum punya akun? Daftar
- Validation:
  - Required email/NIK
  - Required password
  - Required role

3. Register Screen for Warga
- Fields:
  - Nama Lengkap
  - NIK
  - Nomor KK
  - Email
  - Nomor HP
  - Alamat
  - RT
  - RW
  - Password
  - Konfirmasi Password
- Button: Daftar
- After registration, navigate to Warga Home

#### User / Warga Side

Create a bottom tab navigation for warga:
1. Beranda
2. Pengajuan
3. Status
4. Notifikasi
5. Profil

Warga Home Screen:
- Greeting: “Halo, [Nama Warga]”
- Short description: “Ajukan dan pantau layanan administrasi warga secara digital.”
- Show 4 service cards:
  1. Pengajuan KTP
  2. Akta Kelahiran
  3. Akta Kematian
  4. Surat RT/RW
- Show latest request status summary
- Show quick actions:

  - Buat Pengajuan Baru
  - Cek Status
  - Lihat Notifikasi
- Show info box:
  “Pastikan data dan dokumen yang diunggah sudah benar agar proses verifikasi lebih cepat.”

Service List / Pengajuan Screen:
- Display the 4 services as cards
- Each card contains:
  - Icon
  - Title
  - Short description
  - Required documents summary
  - Button: Ajukan Sekarang
- On click, navigate to the specific application form

FORM 1: Pengajuan Pembuatan KTP

Create a multi-section form:
Section A: Data Pemohon
- Nama Lengkap
- NIK
- Nomor KK
- Tempat Lahir
- Tanggal Lahir
- Jenis Kelamin
- Agama
- Status Perkawinan
- Pekerjaan
- Kewarganegaraan
- Alamat Lengkap
- RT
- RW
- Kelurahan
- Kecamatan
- Kota/Kabupaten
- Provinsi

Section B: Jenis Pengajuan
- KTP Baru
- Perubahan Data
- KTP Hilang
- KTP Rusak
- Cetak Ulang

Section C: Upload Berkas
- Kartu Keluarga
- Surat Pengantar RT/RW
- Pas Foto
- KTP Lama jika perubahan/rusak
- Surat Kehilangan jika hilang

Section D: Confirmation
- Show summary of entered data
- Checkbox:
  “Saya menyatakan bahwa data yang saya isi adalah benar.”
- Button: Kirim Pengajuan

After submit:
- Save mock request data
- Status default: Pending
- Show success screen:
  “Pengajuan KTP berhasil dikirim.”
- Show tracking number
- Button: Cek Status Pengajuan

Special KTP Feature:
- If admin later updates status to “Selesai”, warga can download PDF result
- Add button: Download PDF KTP
- Mock PDF generation is acceptable
- Use placeholder generated PDF or downloadable mock file

FORM 2: Permohonan Akta Kelahiran

Section A: Data Anak
- Nama Anak
- Jenis Kelamin
- Tempat Lahir
- Tanggal Lahir
- Waktu Lahir
- Anak Ke
- Tempat Dilahirkan: Rumah Sakit / Klinik / Rumah / Lainnya

Section B: Data Ayah
- Nama Ayah
- NIK Ayah
- Tempat Lahir Ayah
- Tanggal Lahir Ayah
- Pekerjaan Ayah
- Alamat Ayah

Section C: Data Ibu
- Nama Ibu
- NIK Ibu
- Tempat Lahir Ibu
- Tanggal Lahir Ibu
- Pekerjaan Ibu
- Alamat Ibu

Section D: Data Pelapor
- Nama Pelapor
- NIK Pelapor
- Hubungan dengan Anak
- Nomor HP Pelapor
- Alamat Pelapor

Section E: Upload Berkas
- Surat Keterangan Lahir dari RS/Bidan
- Kartu Keluarga
- KTP Ayah
- KTP Ibu
- Buku Nikah / Akta Perkawinan
- Surat Pengantar RT/RW

Section F: Confirmation
- Summary
- Statement checkbox
- Submit button

After submit:
- Status default: Pending
- Show tracking number

FORM 3: Permohonan Akta Kematian

Section A: Data Almarhum/Almarhumah
- Nama Lengkap
- NIK
- Nomor KK
- Jenis Kelamin
- Tempat Lahir
- Tanggal Lahir
- Agama
- Status Perkawinan
- Pekerjaan
- Alamat Terakhir

Section B: Data Kematian
- Tanggal Meninggal
- Waktu Meninggal
- Tempat Meninggal
- Penyebab Kematian
- Lokasi Pemakaman

Section C: Data Pelapor
- Nama Pelapor
- NIK Pelapor
- Hubungan dengan Almarhum/Almarhumah
- Nomor HP
- Alamat

Section D: Upload Berkas
- KTP Almarhum/Almarhumah
- Kartu Keluarga
- Surat Keterangan Kematian dari RS/Dokter/RT/RW
- KTP Pelapor
- Surat Pengantar RT/RW

Section E: Confirmation
- Summary
- Statement checkbox
- Submit button

After submit:
- Status default: Pending
- Show tracking number

FORM 4: Surat Permohonan RT/RW

Section A: Data Pemohon
- Nama Lengkap
- NIK
- Nomor KK
- Nomor HP
- Alamat
- RT
- RW

Section B: Jenis Surat
Options:
- Surat Pengantar KTP
- Surat Pengantar KK
- Surat Keterangan Domisili
- Surat Keterangan Usaha
- Surat Keterangan Tidak Mampu
- Surat Pengantar Nikah
- Surat Keterangan Kelahiran
- Surat Keterangan Kematian
- Lainnya

Section C: Detail Keperluan
- Keperluan Surat
- Instansi Tujuan
- Catatan Tambahan

Section D: Upload Berkas
- KTP
- Kartu Keluarga
- Dokumen Pendukung jika ada

Section E: Confirmation
- Summary
- Statement checkbox
- Submit button

After submit:
- Status default: Pending
- Show tracking number

Monitoring Status Screen:
- Show list of user’s requests
- Each request card includes:
  - Service type
  - Tracking number
  - Submission date
  - Current status
  - Last updated date
  - Button: Detail
- Filter by status:
  - Semua
  - Pending
  - Diproses
  - Revisi
  - Selesai
  - Ditolak

Status Detail Screen:
- Show full detail of selected request
- Show status timeline:
  1. Pengajuan Dikirim
  2. Menunggu Verifikasi
  3. Diproses Admin
  4. Selesai / Ditolak / Revisi
- Show admin notes if available
- Show uploaded document list
- For KTP only:
  - If status is Selesai, show “Download PDF KTP”
- For other services:
  - If status is Selesai, show “Surat selesai diproses. Silakan ambil sesuai arahan admin atau unduh jika tersedia.”

Notification Screen:
- List notifications:
  - Status updated
  - Request completed
  - Request rejected
  - Revision required
- Each notification has:
  - Title
  - Message
  - Date/time
  - Read/unread state
- When clicked, navigate to related request detail
- Example notification:
  “Pengajuan KTP Anda sudah selesai diproses. Silakan unduh dokumen PDF pada halaman detail pengajuan.”

Profile Screen:
- Show resident information:
  - Name
  - NIK
  - KK
  - Phone
  - Address
  - RT/RW
  - Email
- Buttons:
  - Edit Profil
  - Ubah Password
  - Bantuan
  - Keluar

#### Admin Side

Create a bottom tab navigation for admin:
1. Dashboard
2. Permohonan
3. Verifikasi
4. Cetak
5. Profil

Admin Dashboard Screen:
- Greeting: “Halo, Admin”
- Show statistics cards:
  - Total Permohonan
  - Pending
  - Diproses
  - Selesai
  - Ditolak
- Show recent requests list
- Show quick filter by service:
  - KTP
  - Akta Kelahiran
  - Akta Kematian
  - Surat RT/RW
- Show recent activity log:

  - Admin updated request status
  - Admin verified document
  - Admin generated PDF

Admin Request Management Screen:

- Show centralized list of all incoming requests from warga
- Search by:
  - Name
  - NIK
  - Tracking number
- Filter by:
  - Service type
  - Status
  - Date
  - RT/RW
- Each request card includes:
  - Applicant name
  - NIK
  - Service type
  - Tracking number
  - Submission date
  - Status badge
  - Button: Review

Admin Request Detail / Verification Screen:

- Show all citizen submitted data
- Show uploaded document list
- Each document should have:
  - File name
  - File type
  - Preview button placeholder
  - Download button placeholder
- Admin can update verification status:
  - Pending
  - Diproses
  - Revisi
  - Selesai
  - Ditolak
- Admin note field:
  - Required if status is Revisi or Ditolak
  - Optional for other statuses
- Button: Simpan Status
- When status is updated:
  - Update request status
  - Create notification for warga
  - Add timeline entry
- Example admin note:
  “Mohon unggah ulang Kartu Keluarga dengan gambar yang lebih jelas.”

Admin Print / Generate Document Screen:

- Admin has full print access
- Show completed requests
- Admin can generate/download PDF documents for all services:
  - KTP
  - Akta Kelahiran
  - Akta Kematian
  - Surat RT/RW
- Each item has:
  - Applicant name
  - Service type
  - Tracking number
  - Status
  - Button: Generate PDF
  - Button: Download
- PDF can be mocked with a generated template screen or simple file output

Admin Profile Screen:

- Show admin name
- Role
- Email
- Logout button

#### Status System

Use these statuses consistently:

1. Pending
- Meaning: Request has been submitted but not yet reviewed
- Color: warning/yellow

2. Diproses
- Meaning: Request is being reviewed or processed
- Color: info/blue

3. Revisi
- Meaning: Citizen must revise or re-upload data/documents
- Color: orange

4. Selesai
- Meaning: Request has been completed
- Color: success/green

5. Ditolak
- Meaning: Request rejected
- Color: danger/red

#### Notification Logic

Whenever admin updates a request status, create a notification for the user.

Notification examples:
- Pending: “Pengajuan Anda telah diterima dan sedang menunggu verifikasi admin.”
- Diproses: “Pengajuan Anda sedang diproses oleh admin.”
- Revisi: “Pengajuan Anda membutuhkan revisi. Silakan cek catatan admin pada detail pengajuan.”
- Selesai: “Pengajuan Anda telah selesai diproses.”
- Ditolak: “Pengajuan Anda ditolak. Silakan cek alasan penolakan pada detail pengajuan.”

### Data Model

Create TypeScript types:

User:
- id
- role: warga | admin
- name
- nik
- kkNumber
- email
- phone
- address
- rt
- rw
- password

Request:
- id
- trackingNumber
- userId
- applicantName
- nik
- serviceType: ktp | akta_kelahiran | akta_kematian | surat_rt_rw
- status: pending | diproses | revisi | selesai | ditolak
- submittedAt
- updatedAt
- formData
- uploadedFiles
- adminNote
- timeline

UploadedFile:
- id
- name
- uri
- type
- size
- uploadedAt

TimelineItem:
- id
- status
- title
- description
- createdAt

Notification:
- id
- userId
- requestId
- title
- message
- isRead
- createdAt

AdminActivity:
- id
- adminId
- action
- requestId
- createdAt

### Validation Requirements

All forms must have validation:
- Required fields
- NIK must be numeric and 16 digits
- Nomor KK must be numeric and 16 digits
- Phone number required
- Email format validation
- Date required where applicable
- File upload required for mandatory documents
- Password confirmation must match
- Statement checkbox must be checked before submit
- Admin note required when status is Revisi or Ditolak

### UI/UX Requirements

1. Use consistent spacing
2. Use rounded cards
3. Use readable font sizes
4. Make buttons large enough for mobile users
5. Use clear icons for each service
6. Use status badges
7. Use empty states for no data
8. Use loading states for async actions
9. Use confirmation modal before submit
10. Use success screen after submission
11. Avoid cluttered screens
12. Keep admin views more data-oriented
13. Keep warga views simple and guided
14. Make forms scrollable
15. Use keyboard-aware behavior
16. Use safe area view

### User Flow

Warga Flow:
- Splash → Login/Register → Warga Home → Choose Service → Fill Form → Upload Documents → Confirm → Submit → Success → Monitoring Status → Detail → Notification / Download PDF if completed

Admin Flow:
- Splash → Login as Admin → Dashboard → Request Management → Review Request → Update Status → Citizen receives notification → Admin can generate/download document

### PDF Feature

For now, implement PDF functionality:
- For KTP: warga can download PDF only when request status is Selesai
- For all services: admin can generate/download PDF when status is Selesai
- Use a placeholder function called generateMockPDF(request)
- The generated document should include:
  - DIGIWA title
  - Service type
  - Tracking number
  - Applicant name
  - NIK
  - Submission date
  - Status
  - Admin note if any
  - Signature placeholder
  - “Dokumen ini dihasilkan secara digital melalui DIGIWA.”

### Security / Access Control

Implement role-based access:
- Warga cannot access admin screens
- Admin cannot submit citizen request forms
- Warga can only see their own requests
- Admin can see all requests
- Logout clears session
- On app start, check stored session

### Error Handling

Add user-friendly error messages:
- “Data belum lengkap.”
- “Format NIK tidak valid.”
- “Mohon unggah dokumen yang diperlukan.”
- “Gagal menyimpan data. Silakan coba lagi.”
- “Status berhasil diperbarui.”
- “Pengajuan berhasil dikirim.”

### Design System

Create /constants/theme.ts containing:
- colors
- spacing
- radius
- typography
- shadows

Use colors based on the DIGIWA logo. If logo colors are unavailable in the code environment, create a default palette that can easily be changed later:

- primary: deep blue or logo main color
- secondary: teal or logo secondary color
- accent: yellow or logo accent color
- background: off-white
- surface: white
- textPrimary: dark navy
- textSecondary: gray
- success: green
- warning: yellow/orange
- danger: red
- info: blue
- border: light gray

Important: all color values must be centralized in the theme file.

### Screen Copy / Language

Use Bahasa Indonesia for all user-facing text. Examples:
- “Ajukan Sekarang”
- “Cek Status”
- “Kirim Pengajuan”
- “Unggah Berkas”
- “Data Pemohon”
- “Data Pelapor”
- “Konfirmasi Pengajuan”
- “Pengajuan berhasil dikirim”
- “Menunggu Verifikasi”
- “Diproses Admin”
- “Selesai Diproses”
- “Catatan Admin”
- “Download PDF”
- “Keluar”

### Deliverable

Generate the full working Expo React Native application code with:
- Navigation
- Role-based authentication
- Warga screens
- Admin screens
- Forms for all 4 services
- Mock data
- Status updates
- Notifications
- PDF mock download
- Reusable components
- Theme system
- TypeScript types
- Clear comments where backend integration should be added later

Make the code production-ready in structure

After generating the app, also include:
1. Installation steps
2. How to run the app
3. Mock login credentials
4. Explanation of folder structure
5. Notes for future backend integration
6. Suggested Supabase database tables