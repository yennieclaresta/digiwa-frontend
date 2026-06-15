from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from flask import current_app
from werkzeug.security import generate_password_hash

from .config import ADMIN_DOMAIN, ROLE_ADMIN, ROLE_WARGA, build_postgres_conninfo, resolve_database_backend
from .domain import (
    build_detail_payload,
    build_uploaded_files,
    detail_table_name,
    digits_only,
    first_nested,
    iso_now,
    to_plain_data,
)

def get_repository():
    repo = current_app.extensions.get("repository")
    if repo:
        return repo
    backend = resolve_database_backend(current_app.config)
    if backend == "supabase":
        repo = SupabaseRepository(current_app.config)
    elif backend == "postgres":
        repo = PostgresRepository(current_app.config)
    else:
        raise RuntimeError("No database backend configured.")
    current_app.extensions["repository"] = repo
    return repo

class Repository(ABC):
    def __init__(self, config: dict[str, Any]):
        self.config = config

    @abstractmethod
    def fetch_user(self, user_id: str) -> dict[str, Any] | None: ...

    @abstractmethod
    def find_user_for_login(self, identifier: str) -> dict[str, Any] | None: ...

    @abstractmethod
    def touch_last_login(self, user_id: str) -> None: ...

    @abstractmethod
    def email_exists(self, email: str) -> bool: ...

    @abstractmethod
    def nik_exists(self, nik: str) -> bool: ...

    @abstractmethod
    def create_user(self, payload: dict[str, Any]) -> dict[str, Any]: ...

    @abstractmethod
    def update_user_profile(self, user_id: str, payload: dict[str, Any]) -> dict[str, Any]: ...

    @abstractmethod
    def update_user_password(self, user_id: str, password_hash: str) -> None: ...

    @abstractmethod
    def list_services(self) -> list[dict[str, Any]]: ...

    @abstractmethod
    def list_requests(self, user: dict[str, Any], filters: dict[str, str]) -> list[dict[str, Any]]: ...

    @abstractmethod
    def fetch_request(self, request_id: str) -> dict[str, Any] | None: ...

    @abstractmethod
    def create_request(
        self,
        *,
        user_id: str,
        service_type: str,
        applicant_name: str,
        applicant_nik: str,
        form_data: dict[str, Any],
        uploaded_files: list[dict[str, Any]],
        statement_accepted: bool,
    ) -> dict[str, Any]: ...

    @abstractmethod
    def list_notifications(self, user: dict[str, Any]) -> list[dict[str, Any]]: ...

    @abstractmethod
    def mark_notification_read(self, user_id: str, notification_id: str) -> None: ...

    @abstractmethod
    def dashboard(self) -> dict[str, Any]: ...

    @abstractmethod
    def update_request_status(self, request_id: str, admin_id: str, status: str, admin_note: str | None) -> dict[str, Any]: ...

    @abstractmethod
    def create_mock_document(self, request_id: str, admin_id: str) -> dict[str, Any]: ...

    @abstractmethod
    def fetch_document(self, document_id: str) -> dict[str, Any] | None: ...

    def serialize_user(self, row: dict[str, Any]) -> dict[str, Any]:
        warga_profile = first_nested(row.get("warga_profiles"))
        admin_profile = first_nested(row.get("admin_profiles"))
        data = {
            "id": row["id"],
            "role": row["role"],
            "name": row.get("full_name", ""),
            "email": row.get("email", ""),
            "phone": row.get("phone_number", ""),
            "nik": warga_profile.get("nik", ""),
            "kkNumber": warga_profile.get("kk_number", ""),
            "address": warga_profile.get("address", ""),
            "rt": warga_profile.get("rt", ""),
            "rw": warga_profile.get("rw", ""),
        }
        if row["role"] in ROLE_ADMIN:
            data["adminCode"] = admin_profile.get("admin_code", "")
            data["position"] = admin_profile.get("position", "")
        return data

class SupabaseRepository(Repository):
    def __init__(self, config: dict[str, Any]):
        super().__init__(config)
        from supabase import create_client

        self.client = create_client(config["SUPABASE_URL"], config["SUPABASE_SERVICE_ROLE_KEY"])

    def _first(self, response: Any) -> dict[str, Any] | None:
        rows = getattr(response, "data", None) or []
        return rows[0] if rows else None

    def fetch_user(self, user_id: str) -> dict[str, Any] | None:
        return self._first(
            self.client.table("users")
            .select(
                "id, role, account_status, full_name, email, phone_number, password_hash, created_at, "
                "warga_profiles(id, nik, kk_number, address, rt, rw), "
                "admin_profiles(id, admin_code, position, permissions)"
            )
            .eq("id", user_id)
            .limit(1)
            .execute()
        )

    def find_user_for_login(self, identifier: str) -> dict[str, Any] | None:
        normalized = identifier.strip().lower()
        if normalized.endswith(ADMIN_DOMAIN):
            return self._first(
                self.client.table("users")
                .select(
                    "id, role, account_status, full_name, email, phone_number, password_hash, "
                    "admin_profiles(id, admin_code, position, permissions)"
                )
                .eq("email", normalized)
                .in_("role", list(ROLE_ADMIN))
                .limit(1)
                .execute()
            )

        user = self._first(
            self.client.table("users")
            .select(
                "id, role, account_status, full_name, email, phone_number, password_hash, "
                "warga_profiles(id, nik, kk_number, address, rt, rw)"
            )
            .eq("email", normalized)
            .eq("role", ROLE_WARGA)
            .limit(1)
            .execute()
        )
        if user:
            return user

        profile = self._first(
            self.client.table("warga_profiles")
            .select(
                "id, user_id, nik, kk_number, address, rt, rw, "
                "users(id, role, account_status, full_name, email, phone_number, password_hash)"
            )
            .eq("nik", digits_only(identifier))
            .limit(1)
            .execute()
        )
        if not profile:
            return None
        user_row = first_nested(profile.get("users"))
        if not user_row:
            return None
        user_row["warga_profiles"] = [
            {
                "id": profile["id"],
                "nik": profile["nik"],
                "kk_number": profile["kk_number"],
                "address": profile["address"],
                "rt": profile["rt"],
                "rw": profile["rw"],
            }
        ]
        return user_row

    def touch_last_login(self, user_id: str) -> None:
        self.client.table("users").update({"last_login_at": iso_now()}).eq("id", user_id).execute()

    def email_exists(self, email: str) -> bool:
        return bool(self._first(self.client.table("users").select("id").eq("email", email).limit(1).execute()))

    def nik_exists(self, nik: str) -> bool:
        return bool(self._first(self.client.table("warga_profiles").select("id").eq("nik", nik).limit(1).execute()))

    def create_user(self, payload: dict[str, Any]) -> dict[str, Any]:
        user_insert = {
            "role": ROLE_WARGA,
            "account_status": "active",
            "full_name": payload["name"],
            "email": payload["email"],
            "phone_number": payload["phone"],
            "password_hash": generate_password_hash(payload["password"]),
        }
        created_user = self._first(self.client.table("users").insert(user_insert).execute())
        if not created_user:
            raise RuntimeError("Failed to create user.")
        profile_insert = {
            "user_id": created_user["id"],
            "nik": payload["nik"] or None,
            "kk_number": payload["kkNumber"],
            "address": payload["address"],
            "rt": payload["rt"],
            "rw": payload["rw"],
        }
        self.client.table("warga_profiles").insert(profile_insert).execute()
        return self.fetch_user(created_user["id"])

    def update_user_profile(self, user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        user_update = {
            "full_name": payload["name"],
            "email": payload["email"],
            "phone_number": payload["phone"],
        }
        self.client.table("users").update(user_update).eq("id", user_id).execute()
        if payload["role"] == ROLE_WARGA:
            profile_update = {
                "address": payload["address"],
                "rt": payload["rt"],
                "rw": payload["rw"],
            }
            self.client.table("warga_profiles").update(profile_update).eq("user_id", user_id).execute()
        return self.fetch_user(user_id)

    def update_user_password(self, user_id: str, password_hash: str) -> None:
        self.client.table("users").update({"password_hash": password_hash}).eq("id", user_id).execute()

    def list_services(self) -> list[dict[str, Any]]:
        templates = self.client.table("service_templates").select("*").eq("is_active", True).order("sort_order").execute().data or []
        docs = self.client.table("service_required_documents").select("*").order("sort_order").execute().data or []
        grouped: dict[str, list[dict[str, Any]]] = {}
        for item in docs:
            grouped.setdefault(item["service_type"], []).append(item)
        return [{**item, "required_documents": grouped.get(item["service_type"], [])} for item in templates]

    def list_requests(self, user: dict[str, Any], filters: dict[str, str]) -> list[dict[str, Any]]:
        query = self.client.table("view_request_summary").select("*").order("submitted_at", desc=True)
        if user["role"] == ROLE_WARGA:
            query = query.eq("user_id", user["id"])
        if filters.get("serviceType"):
            query = query.eq("service_type", filters["serviceType"])
        if filters.get("status"):
            query = query.eq("status", filters["status"])
        if filters.get("q"):
            q = filters["q"].replace(",", " ")
            query = query.or_(
                f"user_full_name.ilike.%{q}%,applicant_name.ilike.%{q}%,applicant_nik.ilike.%{q}%,tracking_number.ilike.%{q}%"
            )
        return query.execute().data or []

    def fetch_request(self, request_id: str) -> dict[str, Any] | None:
        row = self._first(self.client.table("service_requests").select("*").eq("id", request_id).limit(1).execute())
        if not row:
            return None
        row["timeline"] = self.client.table("request_timeline").select("*").eq("request_id", request_id).order("created_at").execute().data or []
        row["uploaded_files"] = self.client.table("uploaded_files").select("*").eq("request_id", request_id).order("created_at").execute().data or []
        row["generated_documents"] = self.client.table("generated_documents").select("*").eq("request_id", request_id).eq("is_active", True).order("generated_at", desc=True).execute().data or []
        detail_table = detail_table_name(row["service_type"])
        if detail_table:
            row["detail"] = self._first(self.client.table(detail_table).select("*").eq("request_id", request_id).limit(1).execute())
        return row

    def create_request(self, *, user_id: str, service_type: str, applicant_name: str, applicant_nik: str, form_data: dict[str, Any], uploaded_files: list[dict[str, Any]], statement_accepted: bool) -> dict[str, Any]:
        request_insert = {
            "user_id": user_id,
            "service_type": service_type,
            "status": "pending",
            "applicant_name": applicant_name,
            "applicant_nik": applicant_nik or None,
            "metadata": form_data,
        }
        created = self._first(self.client.table("service_requests").insert(request_insert).execute())
        if not created:
            raise RuntimeError("Failed to create request.")
        detail_table, detail_payload = build_detail_payload(
            service_type=service_type,
            request_id=created["id"],
            form_data=form_data,
            statement_accepted=statement_accepted,
        )
        if detail_payload:
            self.client.table(detail_table).insert(detail_payload).execute()
        file_rows = build_uploaded_files(created["id"], user_id, uploaded_files)
        if file_rows:
            self.client.table("uploaded_files").insert(file_rows).execute()
        return self.fetch_request(created["id"])

    def list_notifications(self, user: dict[str, Any]) -> list[dict[str, Any]]:
        return self.client.table("notifications").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute().data or []

    def mark_notification_read(self, user_id: str, notification_id: str) -> None:
        self.client.table("notifications").update({"is_read": True, "read_at": iso_now()}).eq("id", notification_id).eq("user_id", user_id).execute()

    def dashboard(self) -> dict[str, Any]:
        stats = self._first(self.client.table("view_admin_dashboard_stats").select("*").limit(1).execute()) or {}
        recent_requests = self.client.table("view_request_summary").select("*").order("submitted_at", desc=True).limit(10).execute().data or []
        recent_activity = self.client.table("admin_activity_logs").select("*").order("created_at", desc=True).limit(10).execute().data or []
        return {"stats": stats, "recentRequests": recent_requests, "recentActivity": recent_activity}

    def update_request_status(self, request_id: str, admin_id: str, status: str, admin_note: str | None) -> dict[str, Any]:
        self.client.rpc(
            "update_request_status",
            {
                "p_request_id": request_id,
                "p_admin_id": admin_id,
                "p_new_status": status,
                "p_admin_note": admin_note,
            },
        ).execute()
        return self.fetch_request(request_id)

    def create_mock_document(self, request_id: str, admin_id: str) -> dict[str, Any]:
        request_row = self.fetch_request(request_id)
        if not request_row:
            raise KeyError("not_found")
        if request_row["status"] != "selesai":
            raise ValueError("not_done")
        file_name = f'{request_row["tracking_number"]}.pdf'
        generated = {
            "request_id": request_id,
            "generated_by": admin_id,
            "document_type": request_row["service_type"],
            "file_name": file_name,
            "storage_path": f'mock-generated/{file_name}',
            "public_url": "",
        }
        created = self._first(self.client.table("generated_documents").insert(generated).execute())
        return created or generated

    def fetch_document(self, document_id: str) -> dict[str, Any] | None:
        return self._first(
            self.client.table("generated_documents")
            .select("*, service_requests(id, user_id, tracking_number, service_type, applicant_name, applicant_nik, submitted_at, status, admin_note)")
            .eq("id", document_id)
            .eq("is_active", True)
            .limit(1)
            .execute()
        )

class PostgresRepository(Repository):
    def __init__(self, config: dict[str, Any]):
        super().__init__(config)
        self.conninfo = build_postgres_conninfo(config)

    def _connect(self):
        from psycopg import connect
        from psycopg.rows import dict_row

        return connect(self.conninfo, row_factory=dict_row)

    def _shape_user_row(self, row: dict[str, Any] | None) -> dict[str, Any] | None:
        if not row:
            return None
        warga = (
            {
                "id": row.get("warga_profile_id"),
                "nik": row.get("nik", ""),
                "kk_number": row.get("kk_number", ""),
                "address": row.get("address", ""),
                "rt": row.get("rt", ""),
                "rw": row.get("rw", ""),
            }
            if row.get("warga_profile_id")
            else {}
        )
        admin = (
            {
                "id": row.get("admin_profile_id"),
                "admin_code": row.get("admin_code", ""),
                "position": row.get("position", ""),
                "permissions": row.get("permissions") or {},
            }
            if row.get("admin_profile_id")
            else {}
        )
        return {
            "id": row["id"],
            "role": row["role"],
            "account_status": row.get("account_status"),
            "full_name": row.get("full_name", ""),
            "email": row.get("email", ""),
            "phone_number": row.get("phone_number", ""),
            "password_hash": row.get("password_hash", ""),
            "created_at": row.get("created_at"),
            "warga_profiles": [warga] if warga else [],
            "admin_profiles": [admin] if admin else [],
        }

    def _fetch_user_by_clause(self, clause: str, params: tuple[Any, ...]) -> dict[str, Any] | None:
        sql = f"""
            SELECT
              u.id, u.role, u.account_status, u.full_name, u.email, u.phone_number, u.password_hash, u.created_at,
              wp.id AS warga_profile_id, wp.nik, wp.kk_number, wp.address, wp.rt, wp.rw,
              ap.id AS admin_profile_id, ap.admin_code, ap.position, ap.permissions
            FROM users u
            LEFT JOIN warga_profiles wp ON wp.user_id = u.id
            LEFT JOIN admin_profiles ap ON ap.user_id = u.id
            WHERE {clause}
            LIMIT 1
        """
        with self._connect() as conn:
            return to_plain_data(self._shape_user_row(conn.execute(sql, params).fetchone()))

    def fetch_user(self, user_id: str) -> dict[str, Any] | None:
        return self._fetch_user_by_clause("u.id = %s", (user_id,))

    def find_user_for_login(self, identifier: str) -> dict[str, Any] | None:
        normalized = identifier.strip().lower()
        if normalized.endswith(ADMIN_DOMAIN):
            return self._fetch_user_by_clause("u.email = %s AND u.role IN ('admin', 'super_admin')", (normalized,))
        user = self._fetch_user_by_clause("u.email = %s AND u.role = %s", (normalized, ROLE_WARGA))
        if user:
            return user
        return self._fetch_user_by_clause("wp.nik = %s AND u.role = %s", (digits_only(identifier), ROLE_WARGA))

    def touch_last_login(self, user_id: str) -> None:
        with self._connect() as conn:
            conn.execute("UPDATE users SET last_login_at = NOW() WHERE id = %s", (user_id,))

    def email_exists(self, email: str) -> bool:
        with self._connect() as conn:
            return bool(conn.execute("SELECT 1 FROM users WHERE email = %s LIMIT 1", (email,)).fetchone())

    def nik_exists(self, nik: str) -> bool:
        with self._connect() as conn:
            return bool(conn.execute("SELECT 1 FROM warga_profiles WHERE nik = %s LIMIT 1", (nik,)).fetchone())

    def create_user(self, payload: dict[str, Any]) -> dict[str, Any]:
        with self._connect() as conn:
            user_id = conn.execute(
                """
                INSERT INTO users (role, account_status, full_name, email, phone_number, password_hash)
                VALUES (%s, 'active', %s, %s, %s, %s)
                RETURNING id
                """,
                (ROLE_WARGA, payload["name"], payload["email"], payload["phone"], generate_password_hash(payload["password"])),
            ).fetchone()["id"]
            conn.execute(
                """
                INSERT INTO warga_profiles (user_id, nik, kk_number, address, rt, rw)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (user_id, payload["nik"] or None, payload["kkNumber"], payload["address"], payload["rt"], payload["rw"]),
            )
        return self.fetch_user(user_id)

    def update_user_profile(self, user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE users
                SET full_name = %s, email = %s, phone_number = %s
                WHERE id = %s
                """,
                (payload["name"], payload["email"], payload["phone"], user_id),
            )
            if payload["role"] == ROLE_WARGA:
                conn.execute(
                    """
                    UPDATE warga_profiles
                    SET address = %s, rt = %s, rw = %s
                    WHERE user_id = %s
                    """,
                    (payload["address"], payload["rt"], payload["rw"], user_id),
                )
        return self.fetch_user(user_id)

    def update_user_password(self, user_id: str, password_hash: str) -> None:
        with self._connect() as conn:
            conn.execute("UPDATE users SET password_hash = %s WHERE id = %s", (password_hash, user_id))

    def list_services(self) -> list[dict[str, Any]]:
        with self._connect() as conn:
            templates = conn.execute("SELECT * FROM service_templates WHERE is_active = TRUE ORDER BY sort_order").fetchall()
            docs = conn.execute("SELECT * FROM service_required_documents ORDER BY sort_order").fetchall()
        grouped: dict[str, list[dict[str, Any]]] = {}
        for item in docs:
            grouped.setdefault(item["service_type"], []).append(item)
        return to_plain_data([{**item, "required_documents": grouped.get(item["service_type"], [])} for item in templates])

    def list_requests(self, user: dict[str, Any], filters: dict[str, str]) -> list[dict[str, Any]]:
        sql = "SELECT * FROM view_request_summary WHERE 1=1"
        params: list[Any] = []
        if user["role"] == ROLE_WARGA:
            sql += " AND user_id = %s"
            params.append(user["id"])
        if filters.get("serviceType"):
            sql += " AND service_type = %s"
            params.append(filters["serviceType"])
        if filters.get("status"):
            sql += " AND status = %s"
            params.append(filters["status"])
        if filters.get("q"):
            q = f"%{filters['q']}%"
            sql += " AND (user_full_name ILIKE %s OR applicant_name ILIKE %s OR applicant_nik ILIKE %s OR tracking_number ILIKE %s)"
            params.extend([q, q, q, q])
        sql += " ORDER BY submitted_at DESC"
        with self._connect() as conn:
            return to_plain_data(conn.execute(sql, params).fetchall())

    def fetch_request(self, request_id: str) -> dict[str, Any] | None:
        with self._connect() as conn:
            row = conn.execute("SELECT * FROM service_requests WHERE id = %s LIMIT 1", (request_id,)).fetchone()
            if not row:
                return None
            row["timeline"] = conn.execute("SELECT * FROM request_timeline WHERE request_id = %s ORDER BY created_at", (request_id,)).fetchall()
            row["uploaded_files"] = conn.execute("SELECT * FROM uploaded_files WHERE request_id = %s ORDER BY created_at", (request_id,)).fetchall()
            row["generated_documents"] = conn.execute("SELECT * FROM generated_documents WHERE request_id = %s AND is_active = TRUE ORDER BY generated_at DESC", (request_id,)).fetchall()
            table = detail_table_name(row["service_type"])
            if table:
                row["detail"] = conn.execute(f"SELECT * FROM {table} WHERE request_id = %s LIMIT 1", (request_id,)).fetchone()
            return to_plain_data(row)

    def create_request(self, *, user_id: str, service_type: str, applicant_name: str, applicant_nik: str, form_data: dict[str, Any], uploaded_files: list[dict[str, Any]], statement_accepted: bool) -> dict[str, Any]:
        from psycopg.types.json import Jsonb

        with self._connect() as conn:
            created = conn.execute(
                """
                INSERT INTO service_requests (user_id, service_type, status, applicant_name, applicant_nik, metadata)
                VALUES (%s, %s, 'pending', %s, %s, %s)
                RETURNING id
                """,
                (user_id, service_type, applicant_name, applicant_nik or None, Jsonb(form_data)),
            ).fetchone()
            request_id = created["id"]
            table, payload = build_detail_payload(
                service_type=service_type,
                request_id=request_id,
                form_data=form_data,
                statement_accepted=statement_accepted,
            )
            if payload:
                keys = list(payload.keys())
                conn.execute(
                    f"INSERT INTO {table} ({', '.join(keys)}) VALUES ({', '.join(['%s'] * len(keys))})",
                    tuple(payload[key] for key in keys),
                )
            for row in build_uploaded_files(request_id, user_id, uploaded_files):
                keys = list(row.keys())
                conn.execute(
                    f"INSERT INTO uploaded_files ({', '.join(keys)}) VALUES ({', '.join(['%s'] * len(keys))})",
                    tuple(row[key] for key in keys),
                )
        return to_plain_data(self.fetch_request(request_id))

    def list_notifications(self, user: dict[str, Any]) -> list[dict[str, Any]]:
        with self._connect() as conn:
            return to_plain_data(conn.execute("SELECT * FROM notifications WHERE user_id = %s ORDER BY created_at DESC", (user["id"],)).fetchall())

    def mark_notification_read(self, user_id: str, notification_id: str) -> None:
        with self._connect() as conn:
            conn.execute("UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = %s AND user_id = %s", (notification_id, user_id))

    def dashboard(self) -> dict[str, Any]:
        with self._connect() as conn:
            stats = conn.execute("SELECT * FROM view_admin_dashboard_stats LIMIT 1").fetchone() or {}
            recent_requests = conn.execute("SELECT * FROM view_request_summary ORDER BY submitted_at DESC LIMIT 10").fetchall()
            recent_activity = conn.execute("SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT 10").fetchall()
        return to_plain_data({"stats": stats, "recentRequests": recent_requests, "recentActivity": recent_activity})

    def update_request_status(self, request_id: str, admin_id: str, status: str, admin_note: str | None) -> dict[str, Any]:
        with self._connect() as conn:
            conn.execute("SELECT update_request_status(%s, %s, %s::request_status, %s)", (request_id, admin_id, status, admin_note))
        return to_plain_data(self.fetch_request(request_id))

    def create_mock_document(self, request_id: str, admin_id: str) -> dict[str, Any]:
        request_row = self.fetch_request(request_id)
        if not request_row:
            raise KeyError("not_found")
        if request_row["status"] != "selesai":
            raise ValueError("not_done")
        file_name = f'{request_row["tracking_number"]}.pdf'
        generated = {
            "request_id": request_id,
            "generated_by": admin_id,
            "document_type": request_row["service_type"],
            "file_name": file_name,
            "storage_path": f'mock-generated/{file_name}',
            "public_url": "",
        }
        keys = list(generated.keys())
        with self._connect() as conn:
            created = conn.execute(
                f"INSERT INTO generated_documents ({', '.join(keys)}) VALUES ({', '.join(['%s'] * len(keys))}) RETURNING *",
                tuple(generated[key] for key in keys),
            ).fetchone()
        return to_plain_data(created or generated)

    def fetch_document(self, document_id: str) -> dict[str, Any] | None:
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT
                  gd.*,
                  json_build_object(
                    'id', sr.id,
                    'user_id', sr.user_id,
                    'tracking_number', sr.tracking_number,
                    'service_type', sr.service_type,
                    'applicant_name', sr.applicant_name,
                    'applicant_nik', sr.applicant_nik,
                    'submitted_at', sr.submitted_at,
                    'status', sr.status,
                    'admin_note', sr.admin_note
                  ) AS service_requests
                FROM generated_documents gd
                JOIN service_requests sr ON sr.id = gd.request_id
                WHERE gd.id = %s AND gd.is_active = TRUE
                LIMIT 1
                """,
                (document_id,),
            ).fetchone()
        return to_plain_data(row)