ALTER TABLE warga_profiles
  ALTER COLUMN nik DROP NOT NULL;

ALTER TABLE warga_profiles
  DROP CONSTRAINT IF EXISTS valid_warga_nik;

ALTER TABLE warga_profiles
  ADD CONSTRAINT valid_warga_nik CHECK (nik IS NULL OR nik ~ '^[0-9]{16}$');

ALTER TABLE service_requests
  ALTER COLUMN applicant_nik DROP NOT NULL;

ALTER TABLE service_requests
  DROP CONSTRAINT IF EXISTS valid_applicant_nik;

ALTER TABLE service_requests
  ADD CONSTRAINT valid_applicant_nik CHECK (applicant_nik IS NULL OR applicant_nik ~ '^[0-9]{16}$');

ALTER TABLE ktp_request_details
  ALTER COLUMN nik DROP NOT NULL;

ALTER TABLE ktp_request_details
  DROP CONSTRAINT IF EXISTS valid_ktp_nik;

ALTER TABLE ktp_request_details
  ADD CONSTRAINT valid_ktp_nik CHECK (nik IS NULL OR nik ~ '^[0-9]{16}$');
