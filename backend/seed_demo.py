from __future__ import annotations

from uuid import uuid4

from werkzeug.security import generate_password_hash

from core.config import ROLE_WARGA, build_postgres_conninfo, resolve_database_backend
from core.repository import get_repository
from core import create_app

def seed_supabase():
    repo = get_repository()
    if repo.email_exists("demo.warga@example.com"):
        print("demo warga already exists")
    else:
        repo.create_user(
            {
                "name": "Demo Warga",
                "nik": "3275014401900001",
                "kkNumber": "3275011201200001",
                "email": "demo.warga@example.com",
                "phone": "081234567890",
                "address": "Jl. Melati No. 12",
                "rt": "03",
                "rw": "05",
                "password": "password123",
            }
        )
        print("seeded demo warga")

    admin = repo.client.table("users").select("id").eq("email", "admin@digiwa.id").limit(1).execute().data or []
    if admin:
        print("demo admin already exists")
        return

    created = (
        repo.client.table("users")
        .insert(
            {
                "role": "admin",
                "account_status": "active",
                "full_name": "Admin DIGIWA",
                "email": "admin@digiwa.id",
                "phone_number": "081111111111",
                "password_hash": generate_password_hash("admin123"),
            }
        )
        .execute()
        .data
        or []
    )
    if created:
        repo.client.table("admin_profiles").insert(
            {
                "user_id": created[0]["id"],
                "admin_code": "ADM-DEMO",
                "position": "Admin Demo",
                "permissions": {"can_manage_all_requests": True, "can_generate_documents": True},
            }
        ).execute()
    print("seeded demo admin")

def seed_postgres(config):
    from psycopg import connect

    conninfo = build_postgres_conninfo(config)
    with connect(conninfo) as conn:
        warga = conn.execute("SELECT id FROM users WHERE email = %s LIMIT 1", ("demo.warga@example.com",)).fetchone()
        if not warga:
            user_id = str(uuid4())
            conn.execute(
                """
                INSERT INTO users (id, role, account_status, full_name, email, phone_number, password_hash)
                VALUES (%s, %s, 'active', %s, %s, %s, %s)
                """,
                (user_id, ROLE_WARGA, "Demo Warga", "demo.warga@example.com", "081234567890", generate_password_hash("password123")),
            )
            conn.execute(
                """
                INSERT INTO warga_profiles (user_id, nik, kk_number, address, rt, rw)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (user_id, "3275014401900001", "3275011201200001", "Jl. Melati No. 12", "03", "05"),
            )
            print("seeded demo warga")
        else:
            print("demo warga already exists")

        admin = conn.execute("SELECT id FROM users WHERE email = %s LIMIT 1", ("admin@digiwa.id",)).fetchone()
        if admin:
            print("demo admin already exists")
            return

        admin_id = str(uuid4())
        conn.execute(
            """
            INSERT INTO users (id, role, account_status, full_name, email, phone_number, password_hash)
            VALUES (%s, 'admin', 'active', %s, %s, %s, %s)
            """,
            (admin_id, "Admin DIGIWA", "admin@digiwa.id", "081111111111", generate_password_hash("admin123")),
        )
        conn.execute(
            """
            INSERT INTO admin_profiles (user_id, admin_code, position, permissions)
            VALUES (%s, %s, %s, %s::jsonb)
            """,
            (admin_id, "ADM-DEMO", "Admin Demo", '{"can_manage_all_requests": true, "can_generate_documents": true}'),
        )
        print("seeded demo admin")

def main():
    app = create_app()
    with app.app_context():
        # ponytail: one command for manual testing, split commands only if roles/config diverge later
        config = app.config
        backend = resolve_database_backend(config)
        if backend == "supabase":
            seed_supabase()
            return
        if backend == "postgres":
            seed_postgres(config)
            return
        raise SystemExit("No database backend configured.")

if __name__ == "__main__":
    main()