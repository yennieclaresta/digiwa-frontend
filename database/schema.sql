-- ============================================================
-- DIGIWA - DIGITALISASI DATA WARGA
-- COMPLETE POSTGRESQL DATABASE SCRIPT
-- ============================================================

-- Optional:
-- Create your database manually first if needed:
-- CREATE DATABASE digiwa-database;

-- Use this script inside your selected database.

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- RESET EXISTING DIGIWA OBJECTS
-- WARNING: This will delete existing DIGIWA tables and data.
-- ============================================================

DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS admin_activity_logs CASCADE;
DROP TABLE IF EXISTS generated_documents CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS request_timeline CASCADE;
DROP TABLE IF EXISTS uploaded_files CASCADE;
DROP TABLE IF EXISTS service_required_documents CASCADE;
DROP TABLE IF EXISTS service_templates CASCADE;
DROP TABLE IF EXISTS rt_rw_letter_request_details CASCADE;
DROP TABLE IF EXISTS death_certificate_request_details CASCADE;
DROP TABLE IF EXISTS birth_certificate_request_details CASCADE;
DROP TABLE IF EXISTS ktp_request_details CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS admin_profiles CASCADE;
DROP TABLE IF EXISTS warga_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS account_status CASCADE;
DROP TYPE IF EXISTS request_service_type CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;
DROP TYPE IF EXISTS gender_type CASCADE;
DROP TYPE IF EXISTS ktp_application_type CASCADE;
DROP TYPE IF EXISTS rt_rw_letter_type CASCADE;
DROP TYPE IF EXISTS uploaded_file_category CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS support_ticket_status CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_tracking_number(request_service_type) CASCADE;
DROP FUNCTION IF EXISTS set_service_request_tracking_number() CASCADE;
DROP FUNCTION IF EXISTS handle_new_request() CASCADE;
DROP FUNCTION IF EXISTS handle_request_status_update() CASCADE;
DROP FUNCTION IF EXISTS update_request_status(UUID, UUID, request_status, TEXT) CASCADE;

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'warga',
  'admin',
  'super_admin'
);

CREATE TYPE account_status AS ENUM (
  'active',
  'inactive',
  'suspended'
);

CREATE TYPE request_service_type AS ENUM (
  'ktp',
  'akta_kelahiran',
  'akta_kematian',
  'surat_rt_rw'
);

CREATE TYPE request_status AS ENUM (
  'pending',
  'diproses',
  'revisi',
  'selesai',
  'ditolak'
);

CREATE TYPE gender_type AS ENUM (
  'laki_laki',
  'perempuan'
);

CREATE TYPE ktp_application_type AS ENUM (
  'ktp_baru',
  'perubahan_data',
  'ktp_hilang',
  'ktp_rusak',
  'cetak_ulang'
);

CREATE TYPE rt_rw_letter_type AS ENUM (
  'surat_pengantar_ktp',
  'surat_pengantar_kk',
  'surat_keterangan_domisili',
  'surat_keterangan_usaha',
  'surat_keterangan_tidak_mampu',
  'surat_pengantar_nikah',
  'surat_keterangan_kelahiran',
  'surat_keterangan_kematian',
  'lainnya'
);

CREATE TYPE uploaded_file_category AS ENUM (
  'kartu_keluarga',
  'ktp',
  'ktp_lama',
  'pas_foto',
  'surat_pengantar_rt_rw',
  'surat_keterangan_lahir',
  'surat_keterangan_kematian',
  'buku_nikah',
  'akta_perkawinan',
  'surat_kehilangan',
  'dokumen_pendukung',
  'generated_pdf'
);

CREATE TYPE notification_type AS ENUM (
  'status_update',
  'request_completed',
  'request_rejected',
  'revision_required',
  'general'
);

CREATE TYPE support_ticket_status AS ENUM (
  'open',
  'in_progress',
  'resolved',
  'closed'
);

-- ============================================================
-- USERS TABLE
-- Main authentication and identity table
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  role user_role NOT NULL DEFAULT 'warga',
  account_status account_status NOT NULL DEFAULT 'active',

  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE,
  phone_number VARCHAR(30),

  password_hash TEXT,

  avatar_url TEXT,

  last_login_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_email_format CHECK (
    email IS NULL OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  )
);

-- ============================================================
-- WARGA PROFILE TABLE
-- Additional citizen profile data
-- ============================================================

CREATE TABLE warga_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  nik VARCHAR(16) NOT NULL UNIQUE,
  kk_number VARCHAR(16) NOT NULL,

  address TEXT NOT NULL,
  rt VARCHAR(5) NOT NULL,
  rw VARCHAR(5) NOT NULL,

  kelurahan VARCHAR(100),
  kecamatan VARCHAR(100),
  city VARCHAR(100),
  province VARCHAR(100),

  birth_place VARCHAR(100),
  birth_date DATE,
  gender gender_type,

  religion VARCHAR(50),
  marital_status VARCHAR(50),
  occupation VARCHAR(100),
  citizenship VARCHAR(50) DEFAULT 'WNI',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_warga_nik CHECK (nik ~ '^[0-9]{16}$'),
  CONSTRAINT valid_warga_kk CHECK (kk_number ~ '^[0-9]{16}$')
);

-- ============================================================
-- ADMIN PROFILE TABLE
-- Additional admin profile data
-- ============================================================

CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  admin_code VARCHAR(50) UNIQUE,
  position VARCHAR(100),

  assigned_rt VARCHAR(5),
  assigned_rw VARCHAR(5),

  permissions JSONB NOT NULL DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SERVICE TEMPLATES TABLE
-- Master list of DIGIWA services
-- ============================================================

CREATE TABLE service_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  service_type request_service_type NOT NULL UNIQUE,

  display_name VARCHAR(150) NOT NULL,
  description TEXT,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SERVICE REQUIRED DOCUMENTS TABLE
-- Required file upload rules per service
-- ============================================================

CREATE TABLE service_required_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  service_type request_service_type NOT NULL,
  file_category uploaded_file_category NOT NULL,

  document_name VARCHAR(150) NOT NULL,
  description TEXT,

  is_required BOOLEAN NOT NULL DEFAULT TRUE,

  accepted_mime_types TEXT[] NOT NULL DEFAULT ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png'
  ],

  max_file_size_mb INTEGER NOT NULL DEFAULT 5,

  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_required_document_per_service UNIQUE (
    service_type,
    file_category,
    document_name
  )
);

-- ============================================================
-- SERVICE REQUESTS TABLE
-- Main request table for all services
-- ============================================================

CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  tracking_number VARCHAR(60) UNIQUE NOT NULL,

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  service_type request_service_type NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',

  applicant_name VARCHAR(150) NOT NULL,
  applicant_nik VARCHAR(16) NOT NULL,

  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  admin_note TEXT,

  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,

  submission_channel VARCHAR(50) NOT NULL DEFAULT 'mobile_app',

  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,

  is_archived BOOLEAN NOT NULL DEFAULT FALSE,

  CONSTRAINT valid_applicant_nik CHECK (applicant_nik ~ '^[0-9]{16}$')
);

-- ============================================================
-- KTP REQUEST DETAILS TABLE
-- ============================================================

CREATE TABLE ktp_request_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  request_id UUID NOT NULL UNIQUE REFERENCES service_requests(id) ON DELETE CASCADE,

  full_name VARCHAR(150) NOT NULL,
  nik VARCHAR(16) NOT NULL,
  kk_number VARCHAR(16) NOT NULL,

  birth_place VARCHAR(100),
  birth_date DATE,
  gender gender_type,

  religion VARCHAR(50),
  marital_status VARCHAR(50),
  occupation VARCHAR(100),
  citizenship VARCHAR(50) DEFAULT 'WNI',

  full_address TEXT,
  rt VARCHAR(5),
  rw VARCHAR(5),
  kelurahan VARCHAR(100),
  kecamatan VARCHAR(100),
  city VARCHAR(100),
  province VARCHAR(100),

  application_type ktp_application_type NOT NULL,

  statement_accepted BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_ktp_nik CHECK (nik ~ '^[0-9]{16}$'),
  CONSTRAINT valid_ktp_kk CHECK (kk_number ~ '^[0-9]{16}$')
);

-- ============================================================
-- AKTA KELAHIRAN REQUEST DETAILS TABLE
-- ============================================================

CREATE TABLE birth_certificate_request_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  request_id UUID NOT NULL UNIQUE REFERENCES service_requests(id) ON DELETE CASCADE,

  child_name VARCHAR(150) NOT NULL,
  child_gender gender_type NOT NULL,
  birth_place VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME,
  child_order INTEGER,
  birth_location_type VARCHAR(100),

  father_name VARCHAR(150) NOT NULL,
  father_nik VARCHAR(16) NOT NULL,
  father_birth_place VARCHAR(100),
  father_birth_date DATE,
  father_occupation VARCHAR(100),
  father_address TEXT,

  mother_name VARCHAR(150) NOT NULL,
  mother_nik VARCHAR(16) NOT NULL,
  mother_birth_place VARCHAR(100),
  mother_birth_date DATE,
  mother_occupation VARCHAR(100),
  mother_address TEXT,

  reporter_name VARCHAR(150) NOT NULL,
  reporter_nik VARCHAR(16) NOT NULL,
  reporter_relationship VARCHAR(100),
  reporter_phone VARCHAR(30),
  reporter_address TEXT,

  statement_accepted BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_father_nik CHECK (father_nik ~ '^[0-9]{16}$'),
  CONSTRAINT valid_mother_nik CHECK (mother_nik ~ '^[0-9]{16}$'),
  CONSTRAINT valid_birth_reporter_nik CHECK (reporter_nik ~ '^[0-9]{16}$')
);

-- ============================================================
-- AKTA KEMATIAN REQUEST DETAILS TABLE
-- ============================================================

CREATE TABLE death_certificate_request_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  request_id UUID NOT NULL UNIQUE REFERENCES service_requests(id) ON DELETE CASCADE,

  deceased_name VARCHAR(150) NOT NULL,
  deceased_nik VARCHAR(16) NOT NULL,
  kk_number VARCHAR(16),

  deceased_gender gender_type,
  birth_place VARCHAR(100),
  birth_date DATE,

  religion VARCHAR(50),
  marital_status VARCHAR(50),
  occupation VARCHAR(100),

  last_address TEXT,

  death_date DATE NOT NULL,
  death_time TIME,
  death_place VARCHAR(150),
  cause_of_death TEXT,
  burial_location TEXT,

  reporter_name VARCHAR(150) NOT NULL,
  reporter_nik VARCHAR(16) NOT NULL,
  reporter_relationship VARCHAR(100),
  reporter_phone VARCHAR(30),
  reporter_address TEXT,

  statement_accepted BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_deceased_nik CHECK (deceased_nik ~ '^[0-9]{16}$'),
  CONSTRAINT valid_death_kk CHECK (kk_number IS NULL OR kk_number ~ '^[0-9]{16}$'),
  CONSTRAINT valid_death_reporter_nik CHECK (reporter_nik ~ '^[0-9]{16}$')
);

-- ============================================================
-- SURAT RT/RW REQUEST DETAILS TABLE
-- ============================================================

CREATE TABLE rt_rw_letter_request_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  request_id UUID NOT NULL UNIQUE REFERENCES service_requests(id) ON DELETE CASCADE,

  applicant_name VARCHAR(150) NOT NULL,
  nik VARCHAR(16) NOT NULL,
  kk_number VARCHAR(16),

  phone_number VARCHAR(30),

  address TEXT NOT NULL,
  rt VARCHAR(5),
  rw VARCHAR(5),

  letter_type rt_rw_letter_type NOT NULL,
  letter_type_other VARCHAR(150),

  purpose TEXT NOT NULL,
  destination_agency VARCHAR(150),
  additional_note TEXT,

  statement_accepted BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_rt_rw_nik CHECK (nik ~ '^[0-9]{16}$'),
  CONSTRAINT valid_rt_rw_kk CHECK (kk_number IS NULL OR kk_number ~ '^[0-9]{16}$')
);

-- ============================================================
-- UPLOADED FILES TABLE
-- Stores file metadata only.
-- Actual files should be stored in Supabase Storage, S3, Firebase Storage, or Cloudflare R2.
-- ============================================================

CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  file_category uploaded_file_category NOT NULL,

  original_file_name VARCHAR(255) NOT NULL,
  stored_file_name VARCHAR(255) NOT NULL,

  storage_bucket VARCHAR(100) NOT NULL DEFAULT 'request-files',
  storage_path TEXT NOT NULL,

  public_url TEXT,

  mime_type VARCHAR(100),
  file_size_bytes BIGINT,

  is_required BOOLEAN NOT NULL DEFAULT TRUE,

  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_note TEXT,

  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REQUEST TIMELINE TABLE
-- Tracks every status movement
-- ============================================================

CREATE TABLE request_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,

  status request_status NOT NULL,

  title VARCHAR(150) NOT NULL,
  description TEXT,

  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,

  notification_type notification_type NOT NULL DEFAULT 'general',

  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,

  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  deep_link TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GENERATED DOCUMENTS TABLE
-- Stores generated PDF metadata
-- ============================================================

CREATE TABLE generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,

  generated_by UUID REFERENCES users(id) ON DELETE SET NULL,

  document_type request_service_type NOT NULL,

  file_name VARCHAR(255) NOT NULL,

  storage_bucket VARCHAR(100) NOT NULL DEFAULT 'generated-documents',
  storage_path TEXT NOT NULL,
  public_url TEXT,

  mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
  file_size_bytes BIGINT,

  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ADMIN ACTIVITY LOGS TABLE
-- ============================================================

CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  request_id UUID REFERENCES service_requests(id) ON DELETE SET NULL,

  action VARCHAR(150) NOT NULL,
  description TEXT,

  old_value JSONB,
  new_value JSONB,

  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUPPORT TICKETS TABLE
-- Optional help/support feature
-- ============================================================

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  subject VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,

  status support_ticket_status NOT NULL DEFAULT 'open',

  admin_response TEXT,
  responded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone_number ON users(phone_number);

CREATE INDEX idx_warga_profiles_user_id ON warga_profiles(user_id);
CREATE INDEX idx_warga_profiles_nik ON warga_profiles(nik);
CREATE INDEX idx_warga_profiles_rt_rw ON warga_profiles(rt, rw);

CREATE INDEX idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX idx_admin_profiles_admin_code ON admin_profiles(admin_code);

CREATE INDEX idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX idx_service_requests_tracking_number ON service_requests(tracking_number);
CREATE INDEX idx_service_requests_service_type ON service_requests(service_type);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_submitted_at ON service_requests(submitted_at);
CREATE INDEX idx_service_requests_applicant_nik ON service_requests(applicant_nik);
CREATE INDEX idx_service_requests_reviewed_by ON service_requests(reviewed_by);

CREATE INDEX idx_uploaded_files_request_id ON uploaded_files(request_id);
CREATE INDEX idx_uploaded_files_uploaded_by ON uploaded_files(uploaded_by);
CREATE INDEX idx_uploaded_files_file_category ON uploaded_files(file_category);

CREATE INDEX idx_request_timeline_request_id ON request_timeline(request_id);
CREATE INDEX idx_request_timeline_created_at ON request_timeline(created_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_request_id ON notifications(request_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_generated_documents_request_id ON generated_documents(request_id);
CREATE INDEX idx_generated_documents_document_type ON generated_documents(document_type);

CREATE INDEX idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_request_id ON admin_activity_logs(request_id);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);

CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- ============================================================
-- AUTO UPDATE updated_at FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_warga_profiles_updated_at
BEFORE UPDATE ON warga_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_admin_profiles_updated_at
BEFORE UPDATE ON admin_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_service_templates_updated_at
BEFORE UPDATE ON service_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_service_requests_updated_at
BEFORE UPDATE ON service_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ktp_request_details_updated_at
BEFORE UPDATE ON ktp_request_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_birth_certificate_request_details_updated_at
BEFORE UPDATE ON birth_certificate_request_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_death_certificate_request_details_updated_at
BEFORE UPDATE ON death_certificate_request_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_rt_rw_letter_request_details_updated_at
BEFORE UPDATE ON rt_rw_letter_request_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_uploaded_files_updated_at
BEFORE UPDATE ON uploaded_files
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_support_tickets_updated_at
BEFORE UPDATE ON support_tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TRACKING NUMBER GENERATOR
-- Format example:
-- DIGIWA-KTP-20260614-123456
-- DIGIWA-AK-20260614-123456
-- DIGIWA-AM-20260614-123456
-- DIGIWA-RTRW-20260614-123456
-- ============================================================

CREATE OR REPLACE FUNCTION generate_tracking_number(service request_service_type)
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  today TEXT;
  random_number TEXT;
BEGIN
  IF service = 'ktp' THEN
    prefix := 'DIGIWA-KTP';
  ELSIF service = 'akta_kelahiran' THEN
    prefix := 'DIGIWA-AK';
  ELSIF service = 'akta_kematian' THEN
    prefix := 'DIGIWA-AM';
  ELSIF service = 'surat_rt_rw' THEN
    prefix := 'DIGIWA-RTRW';
  ELSE
    prefix := 'DIGIWA';
  END IF;

  today := TO_CHAR(NOW(), 'YYYYMMDD');
  random_number := LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');

  RETURN prefix || '-' || today || '-' || random_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- AUTO SET TRACKING NUMBER BEFORE INSERT
-- ============================================================

CREATE OR REPLACE FUNCTION set_service_request_tracking_number()
RETURNS TRIGGER AS $$
DECLARE
  generated_number TEXT;
  attempt_count INTEGER := 0;
BEGIN
  IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
    LOOP
      attempt_count := attempt_count + 1;
      generated_number := generate_tracking_number(NEW.service_type);

      IF NOT EXISTS (
        SELECT 1 FROM service_requests
        WHERE tracking_number = generated_number
      ) THEN
        NEW.tracking_number := generated_number;
        EXIT;
      END IF;

      IF attempt_count >= 10 THEN
        RAISE EXCEPTION 'Failed to generate unique tracking number after 10 attempts';
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_service_request_tracking_number
BEFORE INSERT ON service_requests
FOR EACH ROW
EXECUTE FUNCTION set_service_request_tracking_number();

-- ============================================================
-- HANDLE NEW REQUEST
-- Automatically creates timeline and notification
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_request()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO request_timeline (
    request_id,
    status,
    title,
    description,
    created_by
  )
  VALUES (
    NEW.id,
    NEW.status,
    'Pengajuan Dikirim',
    'Pengajuan berhasil dikirim dan sedang menunggu verifikasi admin.',
    NEW.user_id
  );

  INSERT INTO notifications (
    user_id,
    request_id,
    notification_type,
    title,
    message,
    deep_link
  )
  VALUES (
    NEW.user_id,
    NEW.id,
    'status_update',
    'Pengajuan Berhasil Dikirim',
    'Pengajuan Anda berhasil dikirim dan sedang menunggu verifikasi admin.',
    '/requests/' || NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_handle_new_request
AFTER INSERT ON service_requests
FOR EACH ROW
EXECUTE FUNCTION handle_new_request();

-- ============================================================
-- HANDLE REQUEST STATUS UPDATE
-- Automatically creates timeline, notification, and admin log
-- ============================================================

CREATE OR REPLACE FUNCTION handle_request_status_update()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notif_type notification_type;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN

    IF NEW.status = 'pending' THEN
      notification_title := 'Pengajuan Diterima';
      notification_message := 'Pengajuan Anda telah diterima dan sedang menunggu verifikasi admin.';
      notif_type := 'status_update';

    ELSIF NEW.status = 'diproses' THEN
      notification_title := 'Pengajuan Diproses';
      notification_message := 'Pengajuan Anda sedang diproses oleh admin.';
      notif_type := 'status_update';

    ELSIF NEW.status = 'revisi' THEN
      notification_title := 'Pengajuan Membutuhkan Revisi';
      notification_message := 'Pengajuan Anda membutuhkan revisi. Silakan cek catatan admin pada detail pengajuan.';
      notif_type := 'revision_required';

    ELSIF NEW.status = 'selesai' THEN
      notification_title := 'Pengajuan Selesai';
      notification_message := 'Pengajuan Anda telah selesai diproses.';
      notif_type := 'request_completed';

    ELSIF NEW.status = 'ditolak' THEN
      notification_title := 'Pengajuan Ditolak';
      notification_message := 'Pengajuan Anda ditolak. Silakan cek alasan penolakan pada detail pengajuan.';
      notif_type := 'request_rejected';
    END IF;

    INSERT INTO request_timeline (
      request_id,
      status,
      title,
      description,
      created_by
    )
    VALUES (
      NEW.id,
      NEW.status,
      notification_title,
      COALESCE(NEW.admin_note, notification_message),
      NEW.reviewed_by
    );

    INSERT INTO notifications (
      user_id,
      request_id,
      notification_type,
      title,
      message,
      deep_link
    )
    VALUES (
      NEW.user_id,
      NEW.id,
      notif_type,
      notification_title,
      notification_message,
      '/requests/' || NEW.id
    );

    INSERT INTO admin_activity_logs (
      admin_id,
      request_id,
      action,
      description,
      old_value,
      new_value
    )
    VALUES (
      NEW.reviewed_by,
      NEW.id,
      'UPDATE_REQUEST_STATUS',
      'Status pengajuan diubah dari ' || OLD.status::TEXT || ' menjadi ' || NEW.status::TEXT,
      jsonb_build_object(
        'status', OLD.status,
        'admin_note', OLD.admin_note
      ),
      jsonb_build_object(
        'status', NEW.status,
        'admin_note', NEW.admin_note
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_handle_request_status_update
AFTER UPDATE OF status ON service_requests
FOR EACH ROW
EXECUTE FUNCTION handle_request_status_update();

-- ============================================================
-- MANUAL STATUS UPDATE FUNCTION
-- Recommended function for backend/admin usage
-- ============================================================

CREATE OR REPLACE FUNCTION update_request_status(
  p_request_id UUID,
  p_admin_id UUID,
  p_new_status request_status,
  p_admin_note TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM users
    WHERE id = p_admin_id
    AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Only admin or super_admin can update request status';
  END IF;

  IF p_new_status IN ('revisi'::request_status, 'ditolak'::request_status)
     AND (p_admin_note IS NULL OR LENGTH(TRIM(p_admin_note)) = 0) THEN
    RAISE EXCEPTION 'Admin note is required for status revisi or ditolak';
  END IF;

  UPDATE service_requests
  SET
    status = p_new_status,
    admin_note = p_admin_note,
    reviewed_by = p_admin_id,
    reviewed_at = NOW(),
    completed_at = CASE
      WHEN p_new_status = 'selesai'::request_status THEN NOW()
      ELSE NULL
    END
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- DEFAULT SERVICE TEMPLATES
-- ============================================================

INSERT INTO service_templates (
  service_type,
  display_name,
  description,
  sort_order
)
VALUES
(
  'ktp',
  'Pengajuan Pembuatan KTP',
  'Layanan pengajuan KTP baru, perubahan data, KTP hilang, KTP rusak, dan cetak ulang.',
  1
),
(
  'akta_kelahiran',
  'Permohonan Akta Kelahiran',
  'Layanan permohonan dokumen akta kelahiran anak.',
  2
),
(
  'akta_kematian',
  'Permohonan Akta Kematian',
  'Layanan permohonan dokumen akta kematian.',
  3
),
(
  'surat_rt_rw',
  'Surat Permohonan RT/RW',
  'Layanan permohonan surat pengantar dan surat keterangan RT/RW.',
  4
);

-- ============================================================
-- DEFAULT REQUIRED DOCUMENTS
-- ============================================================

-- KTP
INSERT INTO service_required_documents (
  service_type,
  file_category,
  document_name,
  description,
  is_required,
  sort_order
)
VALUES
('ktp', 'kartu_keluarga', 'Kartu Keluarga', 'Upload scan atau foto Kartu Keluarga.', TRUE, 1),
('ktp', 'surat_pengantar_rt_rw', 'Surat Pengantar RT/RW', 'Upload surat pengantar dari RT/RW.', TRUE, 2),
('ktp', 'pas_foto', 'Pas Foto', 'Upload pas foto terbaru.', TRUE, 3),
('ktp', 'ktp_lama', 'KTP Lama', 'Wajib untuk perubahan data, KTP rusak, atau cetak ulang.', FALSE, 4),
('ktp', 'surat_kehilangan', 'Surat Kehilangan', 'Wajib jika pengajuan karena KTP hilang.', FALSE, 5);

-- Akta Kelahiran
INSERT INTO service_required_documents (
  service_type,
  file_category,
  document_name,
  description,
  is_required,
  sort_order
)
VALUES
('akta_kelahiran', 'surat_keterangan_lahir', 'Surat Keterangan Lahir', 'Upload surat keterangan lahir dari rumah sakit, bidan, atau fasilitas kesehatan.', TRUE, 1),
('akta_kelahiran', 'kartu_keluarga', 'Kartu Keluarga', 'Upload Kartu Keluarga.', TRUE, 2),
('akta_kelahiran', 'ktp', 'KTP Ayah dan Ibu', 'Upload KTP orang tua.', TRUE, 3),
('akta_kelahiran', 'buku_nikah', 'Buku Nikah', 'Upload buku nikah orang tua.', TRUE, 4),
('akta_kelahiran', 'akta_perkawinan', 'Akta Perkawinan', 'Upload akta perkawinan jika tersedia.', FALSE, 5),
('akta_kelahiran', 'surat_pengantar_rt_rw', 'Surat Pengantar RT/RW', 'Upload surat pengantar RT/RW.', TRUE, 6);

-- Akta Kematian
INSERT INTO service_required_documents (
  service_type,
  file_category,
  document_name,
  description,
  is_required,
  sort_order
)
VALUES
('akta_kematian', 'ktp', 'KTP Almarhum/Almarhumah', 'Upload KTP almarhum/almarhumah.', TRUE, 1),
('akta_kematian', 'kartu_keluarga', 'Kartu Keluarga', 'Upload Kartu Keluarga.', TRUE, 2),
('akta_kematian', 'surat_keterangan_kematian', 'Surat Keterangan Kematian', 'Upload surat keterangan kematian dari rumah sakit, dokter, RT, atau RW.', TRUE, 3),
('akta_kematian', 'dokumen_pendukung', 'KTP Pelapor', 'Upload KTP pelapor.', TRUE, 4),
('akta_kematian', 'surat_pengantar_rt_rw', 'Surat Pengantar RT/RW', 'Upload surat pengantar RT/RW.', TRUE, 5);

-- Surat RT/RW
INSERT INTO service_required_documents (
  service_type,
  file_category,
  document_name,
  description,
  is_required,
  sort_order
)
VALUES
('surat_rt_rw', 'ktp', 'KTP Pemohon', 'Upload KTP pemohon.', TRUE, 1),
('surat_rt_rw', 'kartu_keluarga', 'Kartu Keluarga', 'Upload Kartu Keluarga.', TRUE, 2),
('surat_rt_rw', 'dokumen_pendukung', 'Dokumen Pendukung', 'Upload dokumen pendukung jika diperlukan.', FALSE, 3);

-- ============================================================
-- OPTIONAL SAMPLE ADMIN USER
-- Password should be hashed properly in real backend.
-- This is only a placeholder for development.
-- ============================================================

INSERT INTO users (
  id,
  role,
  account_status,
  full_name,
  email,
  phone_number,
  password_hash
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'super_admin',
  'active',
  'Admin DIGIWA',
  'admin@digiwa.id',
  '080000000000',
  'CHANGE_THIS_TO_HASHED_PASSWORD'
);

INSERT INTO admin_profiles (
  user_id,
  admin_code,
  position,
  permissions
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ADM-001',
  'Super Admin',
  '{"can_manage_all_requests": true, "can_manage_users": true, "can_generate_documents": true}'::JSONB
);

-- ============================================================
-- OPTIONAL HELPFUL VIEWS
-- ============================================================

CREATE OR REPLACE VIEW view_request_summary AS
SELECT
  sr.id,
  sr.tracking_number,
  sr.user_id,
  u.full_name AS user_full_name,
  u.email AS user_email,
  u.phone_number AS user_phone_number,
  sr.service_type,
  st.display_name AS service_display_name,
  sr.status,
  sr.applicant_name,
  sr.applicant_nik,
  sr.submitted_at,
  sr.updated_at,
  sr.completed_at,
  sr.admin_note,
  sr.reviewed_by,
  reviewer.full_name AS reviewed_by_name
FROM service_requests sr
JOIN users u ON u.id = sr.user_id
LEFT JOIN users reviewer ON reviewer.id = sr.reviewed_by
LEFT JOIN service_templates st ON st.service_type = sr.service_type
WHERE sr.is_archived = FALSE;

CREATE OR REPLACE VIEW view_admin_dashboard_stats AS
SELECT
  COUNT(*) AS total_requests,
  COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
  COUNT(*) FILTER (WHERE status = 'diproses') AS total_diproses,
  COUNT(*) FILTER (WHERE status = 'revisi') AS total_revisi,
  COUNT(*) FILTER (WHERE status = 'selesai') AS total_selesai,
  COUNT(*) FILTER (WHERE status = 'ditolak') AS total_ditolak,
  COUNT(*) FILTER (WHERE service_type = 'ktp') AS total_ktp,
  COUNT(*) FILTER (WHERE service_type = 'akta_kelahiran') AS total_akta_kelahiran,
  COUNT(*) FILTER (WHERE service_type = 'akta_kematian') AS total_akta_kematian,
  COUNT(*) FILTER (WHERE service_type = 'surat_rt_rw') AS total_surat_rt_rw
FROM service_requests
WHERE is_archived = FALSE;

-- ============================================================
-- DONE
-- ============================================================

-- Database is ready.
-- Main tables:
-- users
-- warga_profiles
-- admin_profiles
-- service_templates
-- service_required_documents
-- service_requests
-- ktp_request_details
-- birth_certificate_request_details
-- death_certificate_request_details
-- rt_rw_letter_request_details
-- uploaded_files
-- request_timeline
-- notifications
-- generated_documents
-- admin_activity_logs
-- support_tickets