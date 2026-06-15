import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"
ADMIN_DOMAIN = "@digiwa.id"
ROLE_ADMIN = {"admin", "super_admin"}
ROLE_WARGA = "warga"
SERVICE_TYPES = {"ktp", "akta_kelahiran", "akta_kematian", "surat_rt_rw"}
STATUS_VALUES = {"pending", "diproses", "revisi", "selesai", "ditolak"}

def env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()

def bool_env(name: str, default: bool = False) -> bool:
    value = env(name, "true" if default else "false").lower()
    return value in {"1", "true", "yes", "on"}

def int_env(name: str, default: int) -> int:
    value = env(name, str(default))
    try:
        return int(value)
    except ValueError:
        return default

def build_config(overrides: dict[str, Any] | None = None) -> dict[str, Any]:
    load_dotenv(ENV_FILE, override=False)
    config = {
        "APP_NAME": "DIGIWA Backend",
        "APP_SECRET": env("APP_SECRET", "dev-secret"),
        "TOKEN_MAX_AGE_SECONDS": int_env("TOKEN_MAX_AGE_SECONDS", 604800),
        "DB_BACKEND": env("DB_BACKEND", "auto"),
        "SUPABASE_URL": env("SUPABASE_URL"),
        "SUPABASE_SERVICE_ROLE_KEY": env("SUPABASE_SERVICE_ROLE_KEY"),
        "DATABASE_URL": env("DATABASE_URL"),
        "POSTGRES_HOST": env("POSTGRES_HOST", "127.0.0.1"),
        "POSTGRES_PORT": int_env("POSTGRES_PORT", 5432),
        "POSTGRES_DB": env("POSTGRES_DB", "digiwa-database"),
        "POSTGRES_USER": env("POSTGRES_USER"),
        "POSTGRES_PASSWORD": env("POSTGRES_PASSWORD"),
        "POSTGRES_SSLMODE": env("POSTGRES_SSLMODE", "prefer"),
        "CLOUDINARY_CLOUD_NAME": env("CLOUDINARY_CLOUD_NAME"),
        "CLOUDINARY_API_KEY": env("CLOUDINARY_API_KEY"),
        "CLOUDINARY_API_SECRET": env("CLOUDINARY_API_SECRET"),
        "CLOUDINARY_UPLOAD_FOLDER": env("CLOUDINARY_UPLOAD_FOLDER", "digiwa"),
        "FLASK_HOST": env("FLASK_HOST", "0.0.0.0"),
        "FLASK_PORT": int_env("FLASK_PORT", 5000),
        "FLASK_DEBUG": bool_env("FLASK_DEBUG", True),
    }
    if overrides:
        config.update(overrides)
    return config

def resolve_database_backend(config: dict[str, Any]) -> str:
    choice = str(config.get("DB_BACKEND", "auto")).lower()
    if choice in {"supabase", "postgres"}:
        return choice
    if config.get("SUPABASE_URL") and config.get("SUPABASE_SERVICE_ROLE_KEY"):
        return "supabase"
    if config.get("DATABASE_URL") or (config.get("POSTGRES_USER") and config.get("POSTGRES_PASSWORD")):
        return "postgres"
    return "none"

def build_postgres_conninfo(config: dict[str, Any]) -> str:
    if config.get("DATABASE_URL"):
        return config["DATABASE_URL"]
    return (
        f"host={config['POSTGRES_HOST']} "
        f"port={config['POSTGRES_PORT']} "
        f"dbname={config['POSTGRES_DB']} "
        f"user={config['POSTGRES_USER']} "
        f"password={config['POSTGRES_PASSWORD']} "
        f"sslmode={config['POSTGRES_SSLMODE']}"
    )
