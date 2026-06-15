import time

from flask import Blueprint, Response, current_app, g, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from .auth import issue_token, require_auth
from .config import ADMIN_DOMAIN, ROLE_ADMIN, ROLE_WARGA, SERVICE_TYPES, STATUS_VALUES, resolve_database_backend
from .domain import (
    build_cloudinary_signature,
    first_nested,
    is_valid_email,
    is_valid_nik,
    resolve_applicant_name,
    resolve_applicant_nik,
)
from .repository import get_repository

api = Blueprint("api", __name__)

def error(message: str, status: int):
    return jsonify({"error": message}), status

def document_download_url(document_id: str) -> str:
    return f'{request.url_root.rstrip("/")}/documents/{document_id}/download'

def normalize_document(document: dict[str, object]) -> dict[str, object]:
    normalized = dict(document)
    document_id = str(normalized.get("id") or "")
    if document_id:
        normalized["download_url"] = document_download_url(document_id)
        normalized["public_url"] = normalized.get("public_url") or normalized["download_url"]
    return normalized

def normalize_request(request_row: dict[str, object]) -> dict[str, object]:
    normalized = dict(request_row)
    documents = normalized.get("generated_documents")
    if isinstance(documents, list):
        normalized["generated_documents"] = [
            normalize_document(item) for item in documents if isinstance(item, dict)
        ]
    return normalized

def build_document_content(document: dict[str, object]) -> str:
    request_row = first_nested(document.get("service_requests"))
    return "\n".join(
        [
            "DIGIWA - Digitalisasi Data Warga",
            "",
            f"Layanan: {request_row.get('service_type', '-')}",
            f"Nomor Tracking: {request_row.get('tracking_number', '-')}",
            f"Nama Pemohon: {request_row.get('applicant_name', '-')}",
            f"NIK: {request_row.get('applicant_nik', '-')}",
            f"Tanggal Pengajuan: {request_row.get('submitted_at', '-')}",
            f"Status: {request_row.get('status', '-')}",
            f"Catatan Admin: {request_row.get('admin_note') or '-'}",
            "",
            "Tanda Tangan Petugas:",
            "",
            "(________________________)",
            "",
            "Dokumen ini dihasilkan secara digital melalui DIGIWA.",
        ]
    )

@api.route("/health", methods=["GET"])
def health():
    backend = resolve_database_backend(current_app.config)
    return jsonify(
        {
            "ok": True,
            "app": current_app.config["APP_NAME"],
            "databaseBackend": backend,
            "supabaseConfigured": bool(current_app.config["SUPABASE_URL"] and current_app.config["SUPABASE_SERVICE_ROLE_KEY"]),
            "postgresConfigured": bool(
                current_app.config["DATABASE_URL"]
                or (current_app.config["POSTGRES_USER"] and current_app.config["POSTGRES_PASSWORD"])
            ),
            "cloudinaryConfigured": bool(
                current_app.config["CLOUDINARY_CLOUD_NAME"]
                and current_app.config["CLOUDINARY_API_KEY"]
                and current_app.config["CLOUDINARY_API_SECRET"]
            ),
        }
    )

@api.route("/auth/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    identifier = str(payload.get("identifier", "")).strip()
    password = str(payload.get("password", ""))
    if not identifier or not password:
        return error("Data belum lengkap.", 400)

    repo = get_repository()
    user_row = repo.find_user_for_login(identifier)
    if not user_row or not check_password_hash(user_row.get("password_hash") or "", password):
        return error("Email/NIK atau password tidak sesuai.", 401)

    user = repo.serialize_user(user_row)
    repo.touch_last_login(user["id"])
    return jsonify({"token": issue_token(user["id"], user["role"]), "user": user})


@api.route("/auth/register", methods=["POST"])
def register():
    payload = request.get_json(silent=True) or {}
    user_payload = {
        "name": str(payload.get("name", "")).strip(),
        "email": str(payload.get("email", "")).strip().lower(),
        "nik": str(payload.get("nik", "")).strip(),
        "kkNumber": str(payload.get("kkNumber", "")).strip(),
        "phone": str(payload.get("phone", "")).strip(),
        "address": str(payload.get("address", "")).strip(),
        "rt": str(payload.get("rt") or "00").strip() or "00",
        "rw": str(payload.get("rw") or "00").strip() or "00",
        "password": str(payload.get("password", "")),
    }
    if not all([user_payload["name"], user_payload["email"], user_payload["kkNumber"], user_payload["phone"], user_payload["address"], user_payload["password"]]):
        return error("Data belum lengkap.", 400)
    if user_payload["email"].endswith(ADMIN_DOMAIN):
        return error("Email admin tidak dapat didaftarkan dari aplikasi publik.", 400)
    if not is_valid_email(user_payload["email"]):
        return error("Format email tidak valid.", 400)
    if user_payload["nik"] and not is_valid_nik(user_payload["nik"]):
        return error("Format NIK tidak valid.", 400)
    if not is_valid_nik(user_payload["kkNumber"]):
        return error("Nomor KK harus 16 digit.", 400)
    if len(user_payload["password"]) < 6:
        return error("Password minimal 6 karakter.", 400)

    repo = get_repository()
    if repo.email_exists(user_payload["email"]):
        return error("Email sudah terdaftar.", 409)
    if user_payload["nik"] and repo.nik_exists(user_payload["nik"]):
        return error("Email atau NIK sudah terdaftar.", 409)

    user_row = repo.create_user(user_payload)
    user = repo.serialize_user(user_row)
    return jsonify({"token": issue_token(user["id"], ROLE_WARGA), "user": user}), 201

@api.route("/me", methods=["GET"])
@require_auth()
def me():
    return jsonify({"user": get_repository().serialize_user(g.user_row)})

@api.route("/me", methods=["PATCH"])
@require_auth()
def update_me():
    payload = request.get_json(silent=True) or {}
    profile_payload = {
        "role": g.user["role"],
        "name": str(payload.get("name", "")).strip(),
        "email": str(payload.get("email", "")).strip().lower(),
        "phone": str(payload.get("phone", "")).strip(),
        "address": str(payload.get("address", "")).strip(),
        "rt": str(payload.get("rt") or "").strip(),
        "rw": str(payload.get("rw") or "").strip(),
    }
    if not profile_payload["name"] or not profile_payload["email"] or not profile_payload["phone"]:
        return error("Data belum lengkap.", 400)
    if not is_valid_email(profile_payload["email"]):
        return error("Format email tidak valid.", 400)
    if profile_payload["role"] == ROLE_WARGA and not profile_payload["address"]:
        return error("Data belum lengkap.", 400)
    repo = get_repository()
    if profile_payload["email"] != g.user["email"] and repo.email_exists(profile_payload["email"]):
        return error("Email sudah terdaftar.", 409)
    user_row = repo.update_user_profile(g.user["id"], profile_payload)
    return jsonify({"user": repo.serialize_user(user_row), "message": "Profil berhasil diperbarui."})

@api.route("/me/password", methods=["POST"])
@require_auth()
def update_my_password():
    payload = request.get_json(silent=True) or {}
    current_password = str(payload.get("currentPassword", ""))
    new_password = str(payload.get("newPassword", ""))
    if not current_password or not new_password:
        return error("Data belum lengkap.", 400)
    if len(new_password) < 6:
        return error("Password minimal 6 karakter.", 400)
    if not check_password_hash(g.user_row.get("password_hash") or "", current_password):
        return error("Password saat ini tidak sesuai.", 400)
    get_repository().update_user_password(g.user["id"], generate_password_hash(new_password))
    return jsonify({"message": "Password berhasil diperbarui."})

@api.route("/services", methods=["GET"])
def services():
    return jsonify({"services": get_repository().list_services()})

@api.route("/requests", methods=["GET"])
@require_auth()
def list_requests():
    filters = {
        "serviceType": request.args.get("serviceType", "").strip(),
        "status": request.args.get("status", "").strip(),
        "q": request.args.get("q", "").strip(),
    }
    return jsonify({"requests": get_repository().list_requests(g.user, filters)})

@api.route("/requests", methods=["POST"])
@require_auth(ROLE_WARGA)
def create_request():
    payload = request.get_json(silent=True) or {}
    service_type = str(payload.get("serviceType", "")).strip()
    form_data = payload.get("formData") or {}
    uploaded_files = payload.get("uploadedFiles") or []
    statement_accepted = bool(payload.get("statementAccepted"))
    if service_type not in SERVICE_TYPES:
        return error("Layanan tidak tersedia.", 400)
    if not isinstance(form_data, dict) or not statement_accepted:
        return error("Data belum lengkap.", 400)
    applicant_name = resolve_applicant_name(form_data)
    applicant_nik = resolve_applicant_nik(form_data)
    if not applicant_name or (service_type != "ktp" and not applicant_nik):
        return error("Data belum lengkap.", 400)
    if applicant_nik and not is_valid_nik(applicant_nik):
        return error("Format NIK tidak valid.", 400)

    created = get_repository().create_request(
        user_id=g.user["id"],
        service_type=service_type,
        applicant_name=applicant_name,
        applicant_nik=applicant_nik,
        form_data=form_data,
        uploaded_files=uploaded_files,
        statement_accepted=statement_accepted,
    )
    return jsonify({"request": normalize_request(created)}), 201

@api.route("/requests/<request_id>", methods=["GET"])
@require_auth()
def request_detail(request_id: str):
    request_row = get_repository().fetch_request(request_id)
    if not request_row:
        return error("Pengajuan tidak ditemukan.", 404)
    if g.user["role"] == ROLE_WARGA and request_row["user_id"] != g.user["id"]:
        return error("Akses tidak diizinkan.", 403)
    return jsonify({"request": normalize_request(request_row)})

@api.route("/notifications", methods=["GET"])
@require_auth()
def notifications():
    return jsonify({"notifications": get_repository().list_notifications(g.user)})

@api.route("/notifications/<notification_id>/read", methods=["PATCH"])
@require_auth()
def mark_notification_read(notification_id: str):
    get_repository().mark_notification_read(g.user["id"], notification_id)
    return jsonify({"ok": True})

@api.route("/admin/dashboard", methods=["GET"])
@require_auth(*ROLE_ADMIN)
def admin_dashboard():
    return jsonify(get_repository().dashboard())

@api.route("/admin/requests/<request_id>/status", methods=["PATCH"])
@require_auth(*ROLE_ADMIN)
def update_request_status(request_id: str):
    payload = request.get_json(silent=True) or {}
    status = str(payload.get("status", "")).strip()
    admin_note = str(payload.get("adminNote", "")).strip() or None
    if status not in STATUS_VALUES:
        return error("Status tidak valid.", 400)
    if status in {"revisi", "ditolak"} and not admin_note:
        return error("Catatan admin wajib diisi.", 400)
    updated = get_repository().update_request_status(request_id, g.user["id"], status, admin_note)
    return jsonify({"request": normalize_request(updated), "message": "Status berhasil diperbarui."})

@api.route("/uploads/signature", methods=["POST"])
@require_auth()
def upload_signature():
    if not all(
        [
            current_app.config["CLOUDINARY_CLOUD_NAME"],
            current_app.config["CLOUDINARY_API_KEY"],
            current_app.config["CLOUDINARY_API_SECRET"],
        ]
    ):
        return error("Cloudinary belum dikonfigurasi.", 500)
    payload = request.get_json(silent=True) or {}
    service_type = str(payload.get("serviceType") or "general").strip() or "general"
    timestamp = int(time.time())
    folder = f'{current_app.config["CLOUDINARY_UPLOAD_FOLDER"].rstrip("/")}/{service_type}'
    signature = build_cloudinary_signature({"folder": folder, "timestamp": timestamp}, current_app.config["CLOUDINARY_API_SECRET"])
    return jsonify(
        {
            "cloudName": current_app.config["CLOUDINARY_CLOUD_NAME"],
            "apiKey": current_app.config["CLOUDINARY_API_KEY"],
            "timestamp": timestamp,
            "folder": folder,
            "signature": signature,
            "uploadUrl": f'https://api.cloudinary.com/v1_1/{current_app.config["CLOUDINARY_CLOUD_NAME"]}/auto/upload',
        }
    )

@api.route("/documents/mock", methods=["POST"])
@require_auth(*ROLE_ADMIN)
def create_mock_document():
    payload = request.get_json(silent=True) or {}
    request_id = str(payload.get("requestId", "")).strip()
    try:
        document = get_repository().create_mock_document(request_id, g.user["id"])
    except KeyError:
        return error("Pengajuan tidak ditemukan.", 404)
    except ValueError:
        return error("Dokumen hanya dapat dibuat untuk pengajuan selesai.", 400)
    return jsonify({"document": normalize_document(document)})

@api.route("/documents/<document_id>/download", methods=["GET"])
@require_auth()
def download_document(document_id: str):
    document = get_repository().fetch_document(document_id)
    if not document:
        return error("Dokumen tidak ditemukan.", 404)
    request_row = first_nested(document.get("service_requests"))
    if g.user["role"] == ROLE_WARGA and request_row.get("user_id") != g.user["id"]:
        return error("Akses tidak diizinkan.", 403)
    content = build_document_content(document)
    filename = str(document.get("file_name") or "digiwa-document.pdf")
    response = Response(content, mimetype="application/pdf")
    response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response