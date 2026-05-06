import os
from dotenv import load_dotenv

load_dotenv(encoding="utf-8")

GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI  = os.getenv("GOOGLE_REDIRECT_URI")
FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:5173")

SECRET_KEY                  = os.getenv("SECRET_KEY")
ALGORITHM                   = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dungeon.db")

# LMStudio 로컬 서버 설정 (Groq 대체)
LM_STUDIO_BASE_URL = os.getenv("LM_STUDIO_BASE_URL", "http://localhost:1234/v1")
LM_STUDIO_API_KEY  = os.getenv("LM_STUDIO_API_KEY", "lm-studio")
LM_STUDIO_MODEL    = os.getenv("LM_STUDIO_MODEL", "qwen3-6b")

_REQUIRED = {
    "SECRET_KEY":           SECRET_KEY,
    "DATABASE_URL":         DATABASE_URL,
    "GOOGLE_CLIENT_ID":     GOOGLE_CLIENT_ID,
    "GOOGLE_CLIENT_SECRET": GOOGLE_CLIENT_SECRET,
}
_missing = [k for k, v in _REQUIRED.items() if not v]
if _missing:
    raise RuntimeError(f"필수 환경변수 누락: {', '.join(_missing)}")
