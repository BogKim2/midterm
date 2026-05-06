from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_NAME: str = "Prigio"
    DEBUG: bool = True
    DATABASE_URL: str = "postgresql+asyncpg://postgres@localhost:5432/prigio"

    JWT_PRIVATE_KEY_PATH: str = "./keys/private.pem"
    JWT_PUBLIC_KEY_PATH: str = "./keys/public.pem"
    JWT_PRIVATE_KEY_B64: str = ""
    JWT_PUBLIC_KEY_B64: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"

    LMSTUDIO_BASE_URL: str = "http://localhost:1234/v1"
    LMSTUDIO_API_KEY: str = "lm-studio"
    LMSTUDIO_VISION_MODEL: str = ""
    LMSTUDIO_CHAT_MODEL: str = ""
    LMSTUDIO_TIMEOUT_SECONDS: int = 120
    LMSTUDIO_MAX_TOKENS: int = 2000

    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173"]

    ADMIN_SECRET: str = ""
    FREE_PLAN_MONTHLY_LIMIT: int = 5

    class Config:
        env_file = ".env"

settings = Settings()
