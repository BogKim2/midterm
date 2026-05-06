import base64
from datetime import datetime, timezone, timedelta
import hashlib
import secrets
from cryptography.hazmat.primitives.serialization import load_pem_private_key, load_pem_public_key
from jose import jwt
from app.core.config import settings

ALGORITHM = "RS256"

def _load_private_key() -> bytes:
    if settings.JWT_PRIVATE_KEY_B64:
        return base64.b64decode(settings.JWT_PRIVATE_KEY_B64)
    with open(settings.JWT_PRIVATE_KEY_PATH, "rb") as f:
        return f.read()

def _load_public_key() -> bytes:
    if settings.JWT_PUBLIC_KEY_B64:
        return base64.b64decode(settings.JWT_PUBLIC_KEY_B64)
    with open(settings.JWT_PUBLIC_KEY_PATH, "rb") as f:
        return f.read()

def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": user_id, "exp": expire, "type": "access"},
        _load_private_key(),
        algorithm=ALGORITHM,
    )

def create_refresh_token() -> tuple[str, str]:
    raw = secrets.token_urlsafe(64)
    hashed = hash_token(raw)
    return raw, hashed

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, _load_public_key(), algorithms=[ALGORITHM])
    except Exception:
        return None
