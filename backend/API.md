# DIGIWA Backend API

REST API untuk **DIGIWA – Digitalisasi Data Warga**. Backend Flask ini melayani
aplikasi mobile (Expo/React Native) dan sepenuhnya selaras dengan
[`PROMPT-ID.md`](../PROMPT-ID.md), [`AGENTS.md`](../AGENTS.md), dan skema database
[`database/schema.sql`](../database/schema.sql).

- **Base URL (lokal):** `http://127.0.0.1:5000`
- **Format:** JSON (`Content-Type: application/json`) untuk semua request body.
- **CORS:** terbuka (`Access-Control-Allow-Origin: *`), method `GET, POST, PATCH, OPTIONS`.
- **Backend database:** dipilih otomatis (`supabase` atau `postgres`) lewat `DB_BACKEND`.
  Kedua backend mengekspos endpoint dan response yang identik.

---

## 1. Pemetaan Fitur → Endpoint

Tabel ini memetakan setiap fitur di `PROMPT-ID.md` ke endpoint yang melayaninya.

### Sisi User / Warga

| Fitur (PROMPT-ID) | Endpoint |
| --- | --- |
| Form pengajuan digital (KTP, Akta Kelahiran, Akta Kematian, Surat RT/RW) | `POST /requests` |
| Monitoring status pengajuan | `GET /requests`, `GET /requests/{id}` |
| Notifikasi penyelesaian | `GET /notifications`, `PATCH /notifications/{id}/read` |
| Cetak mandiri (khusus KTP) | `GET /documents/{id}/download` (dokumen muncul di `generated_documents` pada detail pengajuan) |

### Sisi Admin / Petugas

| Fitur (PROMPT-ID) | Endpoint |
| --- | --- |
| Manajemen data terpusat (dashboard semua permohonan) | `GET /admin/dashboard`, `GET /requests` |
| Verifikasi & update status (otomatis kirim notifikasi) | `PATCH /admin/requests/{id}/status` |
| Akses cetak penuh (generate PDF semua layanan) | `POST /documents/mock`, `GET /documents/{id}/download` |
| Rekapitulasi data (laporan jumlah pengajuan) | `GET /admin/dashboard` (`stats`) |

### 4 Layanan Inti

Semua endpoint pengajuan memakai field `serviceType` dengan nilai enum:

| `serviceType` | Layanan | Tabel detail |
| --- | --- | --- |
| `ktp` | Pengajuan Pembuatan KTP | `ktp_request_details` |
| `akta_kelahiran` | Permohonan Akta Kelahiran | `birth_certificate_request_details` |
| `akta_kematian` | Permohonan Akta Kematian | `death_certificate_request_details` |
| `surat_rt_rw` | Surat Permohonan RT/RW | `rt_rw_letter_request_details` |

---

## 2. Autentikasi

- Token berupa **Bearer token** ber-signature (`itsdangerous.URLSafeTimedSerializer`).
- Kirim pada header: `Authorization: Bearer <token>`.
- Masa berlaku default: **7 hari** (`TOKEN_MAX_AGE_SECONDS = 604800`).
- Token diterbitkan oleh `POST /auth/login` dan `POST /auth/register`.

### Aturan peran

| Peran | `role` | Cara login |
| --- | --- | --- |
| Warga | `warga` | Email **atau** NIK + password |
| Admin | `admin` | Email berakhiran `@digiwa.id` + password |
| Super Admin | `super_admin` | Email berakhiran `@digiwa.id` + password |

- Registrasi publik (`/auth/register`) **hanya** untuk warga. Email `@digiwa.id` ditolak.
- Identifier yang berakhiran `@digiwa.id` saat login hanya cocok dengan akun admin/super_admin.

### Kontrol akses (role-based)

| Aturan | Implementasi |
| --- | --- |
| Warga tidak bisa akses layar admin | Endpoint `/admin/*` & `POST /documents/mock` memakai `require_auth("admin", "super_admin")` |
| Admin tidak bisa submit pengajuan warga | `POST /requests` memakai `require_auth("warga")` |
| Warga hanya melihat pengajuannya sendiri | `GET /requests` & `GET /requests/{id}` difilter `user_id`; akses lintas-user → `403` |
| Logout | Sisi klien membuang token (stateless) |

---

## 3. Format Error

Semua error mengembalikan JSON:

```json
{ "error": "Pesan dalam Bahasa Indonesia." }
```

| HTTP | Makna umum | Contoh pesan |
| --- | --- | --- |
| `400` | Data tidak lengkap / tidak valid | `"Data belum lengkap."`, `"Format NIK tidak valid."` |
| `401` | Token hilang/invalid atau kredensial salah | `"Unauthorized."`, `"Email/NIK atau password tidak sesuai."` |
| `403` | Peran tidak diizinkan / bukan pemilik | `"Akses tidak diizinkan."` |
| `404` | Resource tidak ditemukan | `"Pengajuan tidak ditemukan."` |
| `409` | Duplikat | `"Email sudah terdaftar."` |
| `500` | Konfigurasi server (mis. Cloudinary) | `"Cloudinary belum dikonfigurasi."` |

---

## 4. Daftar Endpoint

Ringkasan (🔓 publik, 🔑 perlu token, 👮 admin/super_admin, 🧑 warga):

| Method | Path | Akses | Keterangan |
| --- | --- | --- | --- |
| GET | `/health` | 🔓 | Status server & konfigurasi |
| GET | `/services` | 🔓 | Daftar layanan + dokumen wajib |
| POST | `/auth/register` | 🔓 | Registrasi warga |
| POST | `/auth/login` | 🔓 | Login warga/admin |
| GET | `/me` | 🔑 | Profil pengguna saat ini |
| PATCH | `/me` | 🔑 | Update profil |
| POST | `/me/password` | 🔑 | Ganti password |
| GET | `/requests` | 🔑 | Daftar pengajuan (warga: miliknya; admin: semua) |
| POST | `/requests` | 🧑 | Buat pengajuan baru |
| GET | `/requests/{id}` | 🔑 | Detail pengajuan |
| GET | `/notifications` | 🔑 | Daftar notifikasi |
| PATCH | `/notifications/{id}/read` | 🔑 | Tandai notifikasi dibaca |
| GET | `/admin/dashboard` | 👮 | Statistik + aktivitas terbaru |
| PATCH | `/admin/requests/{id}/status` | 👮 | Update status pengajuan |
| POST | `/uploads/signature` | 🔑 | Tanda tangan upload Cloudinary |
| POST | `/documents/mock` | 👮 | Generate dokumen PDF (mock) |
| GET | `/documents/{id}/download` | 🔑 | Unduh dokumen PDF |

---

### 4.1 `GET /health` 🔓

Memastikan server hidup dan menampilkan konfigurasi backend.

**Response `200`**

```json
{
  "ok": true,
  "app": "DIGIWA Backend",
  "databaseBackend": "postgres",
  "supabaseConfigured": false,
  "postgresConfigured": true,
  "cloudinaryConfigured": false
}
```

---

### 4.2 `GET /services` 🔓

Daftar 4 layanan aktif beserta dokumen yang diperlukan (dari
`service_templates` + `service_required_documents`).

**Response `200`**

```json
{
  "services": [
    {
      "id": "…",
      "service_type": "ktp",
      "display_name": "Pengajuan Pembuatan KTP",
      "description": "Layanan pengajuan KTP baru, perubahan data, …",
      "is_active": true,
      "sort_order": 1,
      "required_documents": [
        {
          "service_type": "ktp",
          "file_category": "kartu_keluarga",
          "document_name": "Kartu Keluarga",
          "is_required": true,
          "sort_order": 1
        }
      ]
    }
  ]
}
```

---

### 4.3 `POST /auth/register` 🔓

Registrasi warga baru. Mengembalikan token siap pakai.

**Body**

| Field | Wajib | Aturan |
| --- | --- | --- |
| `name` | ✅ | — |
| `email` | ✅ | format email valid; **tidak boleh** `@digiwa.id` |
| `kkNumber` | ✅ | 16 digit angka |
| `phone` | ✅ | — |
| `address` | ✅ | — |
| `password` | ✅ | minimal 6 karakter |
| `nik` | ➖ | opsional; bila diisi harus 16 digit angka |
| `rt`, `rw` | ➖ | default `"00"` |

```json
{
  "name": "Siti Aminah",
  "nik": "3275014401900001",
  "kkNumber": "3275011201200001",
  "email": "siti@example.com",
  "phone": "081234567890",
  "address": "Jl. Melati No. 12",
  "rt": "03",
  "rw": "05",
  "password": "password123"
}
```

**Response `201`**

```json
{
  "token": "…",
  "user": {
    "id": "…", "role": "warga", "name": "Siti Aminah",
    "email": "siti@example.com", "phone": "081234567890",
    "nik": "3275014401900001", "kkNumber": "3275011201200001",
    "address": "Jl. Melati No. 12", "rt": "03", "rw": "05"
  }
}
```

**Error:** `400` data tidak lengkap / format salah, `409` email atau NIK sudah terdaftar.

---

### 4.4 `POST /auth/login` 🔓

**Body**

```json
{ "identifier": "siti@example.com", "password": "password123" }
```

- `identifier` boleh **email** atau **NIK** (untuk warga). Admin harus pakai email `@digiwa.id`.

**Response `200`** — bentuk sama dengan register (`token` + `user`). Untuk admin,
objek `user` juga memuat `adminCode` dan `position`.

**Error:** `400` data belum lengkap, `401` `"Email/NIK atau password tidak sesuai."`

---

### 4.5 `GET /me` 🔑

**Response `200`**

```json
{ "user": { "id": "…", "role": "warga", "name": "…", "email": "…", "nik": "…", "kkNumber": "…", "address": "…", "rt": "…", "rw": "…" } }
```

---

### 4.6 `PATCH /me` 🔑

Update profil. Untuk warga, `address` wajib.

**Body**

```json
{ "name": "…", "email": "…", "phone": "…", "address": "…", "rt": "03", "rw": "05" }
```

**Response `200`**

```json
{ "user": { "…": "…" }, "message": "Profil berhasil diperbarui." }
```

**Error:** `400` data belum lengkap / email tidak valid, `409` email sudah dipakai.

---

### 4.7 `POST /me/password` 🔑

**Body**

```json
{ "currentPassword": "password123", "newPassword": "password456" }
```

**Response `200`**: `{ "message": "Password berhasil diperbarui." }`

**Error:** `400` data belum lengkap / password < 6 / `"Password saat ini tidak sesuai."`

---

### 4.8 `GET /requests` 🔑

Daftar pengajuan. **Warga** hanya melihat miliknya; **admin** melihat semua
(memenuhi *manajemen data terpusat*).

**Query params (opsional)**

| Param | Contoh | Keterangan |
| --- | --- | --- |
| `serviceType` | `ktp` | filter layanan |
| `status` | `pending` | `pending\|diproses\|revisi\|selesai\|ditolak` |
| `q` | `Siti` | cari di nama pemohon, nama user, NIK, atau nomor tracking |

**Response `200`** (dari `view_request_summary`)

```json
{
  "requests": [
    {
      "id": "…", "tracking_number": "DIGIWA-KTP-20260615-123456",
      "user_id": "…", "user_full_name": "Siti Aminah",
      "service_type": "ktp", "service_display_name": "Pengajuan Pembuatan KTP",
      "status": "pending", "applicant_name": "Siti Aminah", "applicant_nik": "…",
      "submitted_at": "…", "updated_at": "…", "completed_at": null, "admin_note": null
    }
  ]
}
```

---

### 4.9 `POST /requests` 🧑

Buat pengajuan baru. Hanya warga. Status awal selalu `pending`; nomor tracking
dibuat otomatis oleh trigger database (mis. `DIGIWA-KTP-YYYYMMDD-NNNNNN`).

**Body umum**

| Field | Wajib | Keterangan |
| --- | --- | --- |
| `serviceType` | ✅ | salah satu dari 4 enum layanan |
| `statementAccepted` | ✅ | harus `true` (checkbox pernyataan) |
| `formData` | ✅ | objek data form (lihat per layanan di bawah) |
| `uploadedFiles` | ➖ | array metadata berkas yang sudah diunggah |

**Validasi:** `applicant_name` harus terisi; `applicant_nik` wajib untuk semua
layanan **kecuali** `ktp`; NIK bila ada harus 16 digit. Nama & NIK pemohon
diturunkan otomatis dari `formData` (mis. `namaLengkap`/`namaPelapor`/`namaAyah`/
`namaAnak`/`namaAlmarhum` dan `nik`/`nikPelapor`/`nikAyah`/…).

**Item `uploadedFiles[]`**

```json
{
  "name": "kk-siti.pdf",
  "type": "application/pdf",
  "size": 420000,
  "publicUrl": "https://res.cloudinary.com/…/kk-siti.pdf",
  "storagePath": "digiwa/ktp/kk-siti.pdf",
  "fileCategory": "kartu_keluarga",
  "isRequired": true
}
```

`fileCategory` mengikuti enum `uploaded_file_category`
(`kartu_keluarga`, `ktp`, `ktp_lama`, `pas_foto`, `surat_pengantar_rt_rw`,
`surat_keterangan_lahir`, `surat_keterangan_kematian`, `buku_nikah`,
`akta_perkawinan`, `surat_kehilangan`, `dokumen_pendukung`).

**Response `201`**

```json
{ "request": { "id": "…", "tracking_number": "DIGIWA-KTP-20260615-123456", "status": "pending", "…": "…" } }
```

#### `formData` per layanan

Kunci ditulis dalam camelCase (Bahasa Indonesia) dan dipetakan ke kolom tabel detail.

**KTP (`ktp`)** — pemetaan ke `ktp_request_details`:
`namaLengkap, nik, nomorKk, tempatLahir, tanggalLahir, jenisKelamin (Laki-laki|Perempuan),
agama, statusPerkawinan, pekerjaan, kewarganegaraan, alamatLengkap, rt, rw, kelurahan,
kecamatan, kotaKabupaten, provinsi, jenisPengajuan (KTP Baru|Perubahan Data|KTP Hilang|KTP Rusak|Cetak Ulang)`.

**Akta Kelahiran (`akta_kelahiran`)** — ke `birth_certificate_request_details`:
`namaAnak, jenisKelaminAnak, tempatLahirAnak, tanggalLahirAnak, waktuLahir, anakKe,
tempatDilahirkan, namaAyah, nikAyah, tempatLahirAyah, tanggalLahirAyah, pekerjaanAyah,
alamatAyah, namaIbu, nikIbu, tempatLahirIbu, tanggalLahirIbu, pekerjaanIbu, alamatIbu,
namaPelapor, nikPelapor, hubunganPelapor, nomorHpPelapor, alamatPelapor`.

**Akta Kematian (`akta_kematian`)** — ke `death_certificate_request_details`:
`namaAlmarhum, nikAlmarhum, nomorKk, jenisKelamin, tempatLahir, tanggalLahir, agama,
statusPerkawinan, pekerjaan, alamatTerakhir, tanggalMeninggal, waktuMeninggal,
tempatMeninggal, penyebabKematian, lokasiPemakaman, namaPelapor, nikPelapor,
hubunganPelapor, nomorHpPelapor, alamatPelapor`.

**Surat RT/RW (`surat_rt_rw`)** — ke `rt_rw_letter_request_details`:
`namaLengkap, nik, nomorKk, nomorHp, alamat, rt, rw,
jenisSurat (Surat Pengantar KTP|Surat Pengantar KK|Surat Keterangan Domisili|
Surat Keterangan Usaha|Surat Keterangan Tidak Mampu|Surat Pengantar Nikah|
Surat Keterangan Kelahiran|Surat Keterangan Kematian|Lainnya), jenisSuratLainnya,
keperluanSurat, instansiTujuan, catatanTambahan`.

> Seluruh isi `formData` juga disimpan apa adanya pada kolom `metadata` (JSONB)
> di `service_requests`, sehingga field tambahan tidak akan hilang.

---

### 4.10 `GET /requests/{id}` 🔑

Detail lengkap satu pengajuan. Warga hanya boleh mengakses miliknya (`403` jika bukan pemilik).

**Response `200`**

```json
{
  "request": {
    "id": "…", "tracking_number": "…", "service_type": "ktp", "status": "selesai",
    "applicant_name": "…", "applicant_nik": "…", "admin_note": null, "metadata": { "…": "…" },
    "detail": { "…": "kolom tabel detail layanan" },
    "timeline": [ { "status": "pending", "title": "Pengajuan Dikirim", "description": "…", "created_at": "…" } ],
    "uploaded_files": [ { "file_category": "kartu_keluarga", "original_file_name": "kk-siti.pdf", "public_url": "…" } ],
    "generated_documents": [
      { "id": "…", "file_name": "DIGIWA-KTP-….pdf", "download_url": "http://127.0.0.1:5000/documents/…/download", "public_url": "…" }
    ]
  }
}
```

> **Cetak mandiri KTP:** ketika status `selesai` dan admin sudah men-generate
> dokumen, warga melihatnya di `generated_documents[].download_url` dan dapat
> mengunduhnya lewat `GET /documents/{id}/download`.

---

### 4.11 `GET /notifications` 🔑

Notifikasi milik pengguna, terbaru dulu. Notifikasi dibuat otomatis oleh trigger
database setiap pengajuan dibuat atau status berubah.

**Response `200`**

```json
{
  "notifications": [
    {
      "id": "…", "request_id": "…", "notification_type": "request_completed",
      "title": "Pengajuan Selesai", "message": "Pengajuan Anda telah selesai diproses.",
      "is_read": false, "deep_link": "/requests/…", "created_at": "…"
    }
  ]
}
```

---

### 4.12 `PATCH /notifications/{id}/read` 🔑

Menandai satu notifikasi sebagai sudah dibaca (hanya milik sendiri).

**Response `200`**: `{ "ok": true }`

---

### 4.13 `GET /admin/dashboard` 👮

Statistik rekapitulasi + permohonan & aktivitas terbaru.

**Response `200`**

```json
{
  "stats": {
    "total_requests": 12, "total_pending": 3, "total_diproses": 2,
    "total_revisi": 1, "total_selesai": 5, "total_ditolak": 1,
    "total_ktp": 6, "total_akta_kelahiran": 3, "total_akta_kematian": 1, "total_surat_rt_rw": 2
  },
  "recentRequests": [ { "id": "…", "tracking_number": "…", "status": "pending", "…": "…" } ],
  "recentActivity": [ { "action": "UPDATE_REQUEST_STATUS", "description": "…", "created_at": "…" } ]
}
```

---

### 4.14 `PATCH /admin/requests/{id}/status` 👮

Update status pengajuan. Memanggil fungsi DB `update_request_status`, yang
otomatis menulis timeline, notifikasi ke warga, dan log aktivitas admin.

**Body**

```json
{ "status": "revisi", "adminNote": "Mohon unggah ulang Kartu Keluarga yang lebih jelas." }
```

| Field | Aturan |
| --- | --- |
| `status` | wajib; `pending\|diproses\|revisi\|selesai\|ditolak` |
| `adminNote` | **wajib** bila status `revisi` atau `ditolak`; opsional selain itu |

**Response `200`**

```json
{ "request": { "id": "…", "status": "revisi", "admin_note": "…", "timeline": [ "…" ] }, "message": "Status berhasil diperbarui." }
```

**Error:** `400` status tidak valid / catatan admin wajib diisi.

---

### 4.15 `POST /uploads/signature` 🔑

Menghasilkan tanda tangan signed-upload Cloudinary untuk unggah langsung dari klien.
Memerlukan konfigurasi Cloudinary di server.

**Body**: `{ "serviceType": "ktp" }` (opsional, default `general`)

**Response `200`**

```json
{
  "cloudName": "…", "apiKey": "…", "timestamp": 1718000000,
  "folder": "digiwa/ktp", "signature": "…",
  "uploadUrl": "https://api.cloudinary.com/v1_1/<cloud>/auto/upload"
}
```

**Error:** `500` `"Cloudinary belum dikonfigurasi."`

---

### 4.16 `POST /documents/mock` 👮

Generate dokumen PDF (mock) untuk pengajuan yang sudah `selesai` — *akses cetak
penuh admin* untuk semua layanan. Menyimpan metadata di `generated_documents`.

**Body**: `{ "requestId": "…" }`

**Response `200`**

```json
{
  "document": {
    "id": "…", "request_id": "…", "document_type": "ktp",
    "file_name": "DIGIWA-KTP-20260615-123456.pdf",
    "download_url": "http://127.0.0.1:5000/documents/…/download", "public_url": "…"
  }
}
```

**Error:** `404` pengajuan tidak ditemukan, `400` `"Dokumen hanya dapat dibuat untuk pengajuan selesai."`

---

### 4.17 `GET /documents/{id}/download` 🔑

Mengunduh dokumen sebagai file PDF (`Content-Type: application/pdf`,
`Content-Disposition: attachment`). Warga hanya boleh mengunduh dokumen pengajuannya
sendiri. Isi dokumen memuat judul DIGIWA, jenis layanan, nomor tracking, nama & NIK
pemohon, tanggal pengajuan, status, catatan admin, dan placeholder tanda tangan.

**Error:** `404` dokumen tidak ditemukan, `403` bukan pemilik.

---

## 5. Alur Pengujian (urutan disarankan)

1. `GET /health` → pastikan `ok: true` dan `databaseBackend` benar.
2. `POST /auth/register` **atau** `POST /auth/login` (warga) → simpan `wargaToken`.
3. `POST /auth/login` (admin `@digiwa.id`) → simpan `adminToken`.
4. `POST /requests` (warga) → simpan `requestId` dari response.
5. `GET /requests` & `GET /requests/{id}` (warga) → verifikasi status `pending`.
6. `PATCH /admin/requests/{id}/status` (admin) → set `diproses`, lalu `selesai`.
7. `GET /notifications` (warga) → cek notifikasi otomatis muncul.
8. `POST /documents/mock` (admin, status `selesai`) → simpan `documentId`.
9. `GET /documents/{id}/download` → unduh PDF.

> Postman collection [`postman/DIGIWA.postman_collection.json`](../postman/DIGIWA.postman_collection.json)
> sudah memuat seluruh request di atas dengan test script yang otomatis menyimpan
> token & id ke environment. Import juga
> [`postman/DIGIWA.local.postman_environment.json`](../postman/DIGIWA.local.postman_environment.json).

### Kredensial demo (dari `backend/seed_demo.py`)

| Peran | Identifier | Password |
| --- | --- | --- |
| Warga | `demo.warga@example.com` (atau NIK `3275014401900001`) | `password123` |
| Admin | `admin@digiwa.id` | `admin123` |

Jalankan `python seed_demo.py` di folder `backend/` untuk membuat akun demo.

---

## 6. Catatan Kesesuaian & Cakupan

- ✅ Keempat layanan inti (`ktp`, `akta_kelahiran`, `akta_kematian`, `surat_rt_rw`)
  dilayani penuh oleh `POST /requests` dan tabel detail masing-masing di `schema.sql`.
- ✅ Status, notifikasi, timeline, dan log admin dibuat otomatis lewat trigger &
  fungsi `update_request_status` di database — endpoint hanya memanggilnya.
- ✅ Kontrol akses berbasis peran sesuai `AGENTS.md` (warga ≠ admin, kepemilikan data).
- ✅ Cetak mandiri KTP: dokumen yang di-generate admin tampil pada detail pengajuan
  warga (`generated_documents`) dan dapat diunduh warga sendiri.
- ℹ️ **Generate dokumen** (`POST /documents/mock`) hanya untuk admin (sesuai *akses
  cetak penuh*). Warga tidak men-generate, hanya mengunduh dokumen yang sudah ada.
- ℹ️ Tabel `support_tickets` (fitur Bantuan) dan verifikasi per-berkas
  (`uploaded_files.is_verified`) tersedia di skema namun **belum** punya endpoint —
  kandidat pengembangan berikutnya, di luar 4 fitur inti `PROMPT-ID.md`.
