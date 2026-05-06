from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings
from app.api.v1 import auth, fridge, analysis, recipes, quota, admin
from app.services.lmstudio_client import check_lmstudio_health

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Prigio API", version="2.0.0", description="냉장고 AI 관리 - LMStudio 로컬 LLM")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Cookie"],
)

app.include_router(auth.router,     prefix="/auth",            tags=["auth"])
app.include_router(fridge.router,   prefix="/api/v1/fridge",   tags=["fridge"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["analysis"])
app.include_router(recipes.router,  prefix="/api/v1/recipes",  tags=["recipes"])
app.include_router(quota.router,    prefix="/api/v1/quota",    tags=["quota"])
app.include_router(admin.router,    prefix="/api/v1/admin",    tags=["admin"])


@app.get("/api/v1/system/health")
async def system_health():
    """LMStudio 연결 상태 + 로드된 모델 확인"""
    return await check_lmstudio_health()


@app.get("/health")
def health():
    return {"status": "ok", "service": "Prigio API", "llm": "LMStudio Local", "db": "PostgreSQL Local"}
