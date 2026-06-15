import hashlib

from datetime import date, datetime, time, timezone
from typing import Any
from uuid import UUID

def first_nested(value: Any) -> dict[str, Any]:
    if isinstance(value, list):
        return value[0] if value else {}
    if isinstance(value, dict):
        return value
    return {}

def digits_only(value: Any) -> str:
    return "".join(ch for ch in str(value or "") if ch.isdigit())

def nullable_text(value: Any) -> str | None:
    text = str(value or "").strip()
    return text or None

def nullable_date(value: Any) -> str | None:
    return nullable_text(value)

def nullable_int(value: Any) -> int | None:
    text = str(value or "").strip()
    return int(text) if text.isdigit() else None

def nullable_digits(value: Any) -> str | None:
    value = digits_only(value)
    return value or None

def is_valid_email(value: str) -> bool:
    return "@" in value and "." in value.split("@")[-1]

def is_valid_nik(value: str) -> bool:
    return len(value) == 16 and value.isdigit()

def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()

def resolve_applicant_name(form_data: dict[str, Any]) -> str:
    for key in ["namaLengkap", "namaPelapor", "namaAyah", "namaAnak", "namaAlmarhum"]:
        value = str(form_data.get(key, "")).strip()
        if value:
            return value
    return ""

def resolve_applicant_nik(form_data: dict[str, Any]) -> str:
    for key in ["nik", "nikPelapor", "nikAyah", "nikIbu", "nikAlmarhum"]:
        value = digits_only(form_data.get(key))
        if value:
            return value
    return ""

def map_gender(value: Any) -> str | None:
    normalized = str(value or "").strip().lower()
    mapping = {"laki-laki": "laki_laki", "laki laki": "laki_laki", "perempuan": "perempuan"}
    return mapping.get(normalized)

def map_ktp_application_type(value: Any) -> str | None:
    normalized = str(value or "").strip().lower()
    mapping = {
        "ktp baru": "ktp_baru",
        "perubahan data": "perubahan_data",
        "ktp hilang": "ktp_hilang",
        "ktp rusak": "ktp_rusak",
        "cetak ulang": "cetak_ulang",
    }
    return mapping.get(normalized)

def map_letter_type(value: Any) -> str | None:
    normalized = str(value or "").strip().lower()
    mapping = {
        "surat pengantar ktp": "surat_pengantar_ktp",
        "surat pengantar kk": "surat_pengantar_kk",
        "surat keterangan domisili": "surat_keterangan_domisili",
        "surat keterangan usaha": "surat_keterangan_usaha",
        "surat keterangan tidak mampu": "surat_keterangan_tidak_mampu",
        "surat pengantar nikah": "surat_pengantar_nikah",
        "surat keterangan kelahiran": "surat_keterangan_kelahiran",
        "surat keterangan kematian": "surat_keterangan_kematian",
        "lainnya": "lainnya",
    }
    return mapping.get(normalized)

def detail_table_name(service_type: str) -> str:
    return {
        "ktp": "ktp_request_details",
        "akta_kelahiran": "birth_certificate_request_details",
        "akta_kematian": "death_certificate_request_details",
        "surat_rt_rw": "rt_rw_letter_request_details",
    }.get(service_type, "")

def build_detail_payload(*, service_type: str, request_id: str, form_data: dict[str, Any], statement_accepted: bool) -> tuple[str, dict[str, Any]]:
    if service_type == "ktp":
        return "ktp_request_details", {
            "request_id": request_id,
            "full_name": str(form_data.get("namaLengkap", "")).strip(),
            "nik": nullable_digits(form_data.get("nik")),
            "kk_number": digits_only(form_data.get("nomorKk")),
            "birth_place": nullable_text(form_data.get("tempatLahir")),
            "birth_date": nullable_date(form_data.get("tanggalLahir")),
            "gender": map_gender(form_data.get("jenisKelamin")),
            "religion": nullable_text(form_data.get("agama")),
            "marital_status": nullable_text(form_data.get("statusPerkawinan")),
            "occupation": nullable_text(form_data.get("pekerjaan")),
            "citizenship": nullable_text(form_data.get("kewarganegaraan")) or "WNI",
            "full_address": nullable_text(form_data.get("alamatLengkap")),
            "rt": nullable_text(form_data.get("rt")),
            "rw": nullable_text(form_data.get("rw")),
            "kelurahan": nullable_text(form_data.get("kelurahan")),
            "kecamatan": nullable_text(form_data.get("kecamatan")),
            "city": nullable_text(form_data.get("kotaKabupaten")),
            "province": nullable_text(form_data.get("provinsi")),
            "application_type": map_ktp_application_type(form_data.get("jenisPengajuan")),
            "statement_accepted": statement_accepted,
        }
    if service_type == "akta_kelahiran":
        return "birth_certificate_request_details", {
            "request_id": request_id,
            "child_name": str(form_data.get("namaAnak", "")).strip(),
            "child_gender": map_gender(form_data.get("jenisKelaminAnak")),
            "birth_place": str(form_data.get("tempatLahirAnak", "")).strip(),
            "birth_date": nullable_date(form_data.get("tanggalLahirAnak")),
            "birth_time": nullable_text(form_data.get("waktuLahir")),
            "child_order": nullable_int(form_data.get("anakKe")),
            "birth_location_type": nullable_text(form_data.get("tempatDilahirkan")),
            "father_name": str(form_data.get("namaAyah", "")).strip(),
            "father_nik": digits_only(form_data.get("nikAyah")),
            "father_birth_place": nullable_text(form_data.get("tempatLahirAyah")),
            "father_birth_date": nullable_date(form_data.get("tanggalLahirAyah")),
            "father_occupation": nullable_text(form_data.get("pekerjaanAyah")),
            "father_address": nullable_text(form_data.get("alamatAyah")),
            "mother_name": str(form_data.get("namaIbu", "")).strip(),
            "mother_nik": digits_only(form_data.get("nikIbu")),
            "mother_birth_place": nullable_text(form_data.get("tempatLahirIbu")),
            "mother_birth_date": nullable_date(form_data.get("tanggalLahirIbu")),
            "mother_occupation": nullable_text(form_data.get("pekerjaanIbu")),
            "mother_address": nullable_text(form_data.get("alamatIbu")),
            "reporter_name": str(form_data.get("namaPelapor", "")).strip(),
            "reporter_nik": digits_only(form_data.get("nikPelapor")),
            "reporter_relationship": nullable_text(form_data.get("hubunganPelapor")),
            "reporter_phone": nullable_text(form_data.get("nomorHpPelapor")),
            "reporter_address": nullable_text(form_data.get("alamatPelapor")),
            "statement_accepted": statement_accepted,
        }
    if service_type == "akta_kematian":
        return "death_certificate_request_details", {
            "request_id": request_id,
            "deceased_name": str(form_data.get("namaAlmarhum", "")).strip(),
            "deceased_nik": digits_only(form_data.get("nikAlmarhum") or form_data.get("nik")),
            "kk_number": nullable_digits(form_data.get("nomorKk")),
            "deceased_gender": map_gender(form_data.get("jenisKelamin")),
            "birth_place": nullable_text(form_data.get("tempatLahir")),
            "birth_date": nullable_date(form_data.get("tanggalLahir")),
            "religion": nullable_text(form_data.get("agama")),
            "marital_status": nullable_text(form_data.get("statusPerkawinan")),
            "occupation": nullable_text(form_data.get("pekerjaan")),
            "last_address": nullable_text(form_data.get("alamatTerakhir")),
            "death_date": nullable_date(form_data.get("tanggalMeninggal")),
            "death_time": nullable_text(form_data.get("waktuMeninggal")),
            "death_place": nullable_text(form_data.get("tempatMeninggal")),
            "cause_of_death": nullable_text(form_data.get("penyebabKematian")),
            "burial_location": nullable_text(form_data.get("lokasiPemakaman")),
            "reporter_name": str(form_data.get("namaPelapor", "")).strip(),
            "reporter_nik": digits_only(form_data.get("nikPelapor")),
            "reporter_relationship": nullable_text(form_data.get("hubunganPelapor")),
            "reporter_phone": nullable_text(form_data.get("nomorHpPelapor") or form_data.get("nomorHp")),
            "reporter_address": nullable_text(form_data.get("alamatPelapor") or form_data.get("alamat")),
            "statement_accepted": statement_accepted,
        }
    if service_type == "surat_rt_rw":
        return "rt_rw_letter_request_details", {
            "request_id": request_id,
            "applicant_name": str(form_data.get("namaLengkap", "")).strip(),
            "nik": digits_only(form_data.get("nik")),
            "kk_number": nullable_digits(form_data.get("nomorKk")),
            "phone_number": nullable_text(form_data.get("nomorHp")),
            "address": str(form_data.get("alamat", "")).strip(),
            "rt": nullable_text(form_data.get("rt")),
            "rw": nullable_text(form_data.get("rw")),
            "letter_type": map_letter_type(form_data.get("jenisSurat")),
            "letter_type_other": nullable_text(form_data.get("jenisSuratLainnya")),
            "purpose": str(form_data.get("keperluanSurat", "")).strip(),
            "destination_agency": nullable_text(form_data.get("instansiTujuan")),
            "additional_note": nullable_text(form_data.get("catatanTambahan")),
            "statement_accepted": statement_accepted,
        }
    return "", {}

def build_uploaded_files(request_id: str, user_id: str, uploaded_files: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = []
    for item in uploaded_files:
        if not isinstance(item, dict):
            continue
        public_url = str(item.get("publicUrl") or item.get("public_url") or item.get("uri") or "").strip()
        file_name = str(item.get("name") or item.get("original_file_name") or "").strip()
        storage_path = str(item.get("storagePath") or item.get("storage_path") or item.get("publicId") or public_url).strip()
        if not public_url or not file_name:
            continue
        rows.append(
            {
                "request_id": request_id,
                "uploaded_by": user_id,
                "file_category": str(item.get("fileCategory") or item.get("file_category") or "dokumen_pendukung"),
                "original_file_name": file_name,
                "stored_file_name": str(item.get("stored_file_name") or file_name),
                "storage_bucket": str(item.get("storage_bucket") or "cloudinary"),
                "storage_path": storage_path,
                "public_url": public_url,
                "mime_type": str(item.get("type") or item.get("mime_type") or ""),
                "file_size_bytes": int(item.get("size") or item.get("file_size_bytes") or 0),
                "is_required": bool(item.get("isRequired", True)),
            }
        )
    return rows

def build_cloudinary_signature(params: dict[str, Any], api_secret: str) -> str:
    base = "&".join(f"{key}={params[key]}" for key in sorted(params) if params[key] not in (None, ""))
    return hashlib.sha1(f"{base}{api_secret}".encode("utf-8")).hexdigest()

def to_plain_data(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: to_plain_data(item) for key, item in value.items()}
    if isinstance(value, list):
        return [to_plain_data(item) for item in value]
    if isinstance(value, UUID):
        return str(value)
    if isinstance(value, (datetime, date, time)):
        return value.isoformat()
    return value