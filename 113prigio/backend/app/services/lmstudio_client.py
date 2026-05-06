"""LMStudio OpenAI 호환 클라이언트 - 모델 자동 탐색"""
import httpx
from openai import AsyncOpenAI
from app.core.config import settings

VISION_KEYWORDS = [
    "vision", "vl", "llava", "moondream", "phi3-v",
    "qwen-vl", "qwen2-vl", "qwen2.5-vl", "minicpm-v",
    "gemma3", "bakllava", "cogvlm", "internvl", "pixtral",
]

_vision_model_cache: str | None = None
_chat_model_cache: str | None = None


def get_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        base_url=settings.LMSTUDIO_BASE_URL,
        api_key=settings.LMSTUDIO_API_KEY,
        timeout=settings.LMSTUDIO_TIMEOUT_SECONDS,
    )


async def list_loaded_models() -> list[str]:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{settings.LMSTUDIO_BASE_URL}/models")
        resp.raise_for_status()
        return [m["id"] for m in resp.json().get("data", [])]


def is_vision_model(model_id: str) -> bool:
    lower = model_id.lower()
    return any(kw in lower for kw in VISION_KEYWORDS)


async def get_vision_model() -> tuple[str, bool]:
    """(model_id, has_vision) 반환"""
    global _vision_model_cache
    if settings.LMSTUDIO_VISION_MODEL:
        return settings.LMSTUDIO_VISION_MODEL, True
    if _vision_model_cache:
        return _vision_model_cache, is_vision_model(_vision_model_cache)
    models = await list_loaded_models()
    for m in models:
        if is_vision_model(m):
            _vision_model_cache = m
            return m, True
    if models:
        _vision_model_cache = models[0]
        return models[0], False
    raise RuntimeError("LMStudio에 로드된 모델이 없습니다")


async def get_chat_model() -> str:
    global _chat_model_cache
    if settings.LMSTUDIO_CHAT_MODEL:
        return settings.LMSTUDIO_CHAT_MODEL
    if _chat_model_cache:
        return _chat_model_cache
    models = await list_loaded_models()
    if not models:
        raise RuntimeError("LMStudio에 로드된 모델이 없습니다")
    _chat_model_cache = models[0]
    return models[0]


async def check_lmstudio_health() -> dict:
    try:
        models = await list_loaded_models()
        vision_models = [m for m in models if is_vision_model(m)]
        return {
            "status": "ok",
            "models": models,
            "vision_models": vision_models,
            "has_vision": len(vision_models) > 0,
        }
    except Exception as e:
        return {"status": "error", "message": str(e), "models": [], "vision_models": [], "has_vision": False}
