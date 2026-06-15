from functools import wraps
from typing import Any

from flask import current_app, g, jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from .repository import get_repository

def serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(current_app.config["APP_SECRET"], salt="digiwa-auth")

def issue_token(user_id: str, role: str) -> str:
    return serializer().dumps({"sub": user_id, "role": role})

def decode_token(token: str) -> dict[str, Any] | None:
    try:
        return serializer().loads(token, max_age=current_app.config["TOKEN_MAX_AGE_SECONDS"])
    except (BadSignature, SignatureExpired):
        return None

def require_auth(*roles: str):
    def decorator(fn):
        @wraps(fn)
        def wrapped(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            token = auth_header.removeprefix("Bearer ").strip()
            if not token:
                return jsonify({"error": "Unauthorized."}), 401
            claims = decode_token(token)
            if not claims:
                return jsonify({"error": "Unauthorized."}), 401
            repo = get_repository()
            user_row = repo.fetch_user(str(claims["sub"]))
            if not user_row:
                return jsonify({"error": "Unauthorized."}), 401
            user = repo.serialize_user(user_row)
            if roles and user["role"] not in set(roles):
                return jsonify({"error": "Akses tidak diizinkan."}), 403
            g.user = user
            g.user_row = user_row
            return fn(*args, **kwargs)

        return wrapped

    return decorator