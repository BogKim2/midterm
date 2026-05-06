"""LMStudio 비전 모델로 냉장고 이미지 분석"""
import asyncio, base64, json
from app.services.lmstudio_client import get_client, get_vision_model, is_vision_model
from app.core.config import settings

VISION_SYSTEM_PROMPT = """당신은 냉장고·식품·음료·주류 이미지에서 모든 내용물을 정밀하게 인식하는 전문가입니다.
형식: {"items": [{"name": "재료명(한국어)", "quantity": 숫자|null, "unit": "단위|null", "confidence": 0~1}]}

규칙:
- 이미지를 좌→우, 위→아래 격자 스캔하여 빠짐없이 파악
- 브랜드명 제거, 재료명만 기재 (일반 명칭)
- "냉동" 접두사 금지 → "만두", "피자"로 기재
- confidence 0.3 미만은 출력 금지
- JSON 외 텍스트 절대 금지"""


def _extract_json(raw: str) -> dict:
    raw = raw.strip()
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()
    start = raw.find("{")
    if start != -1:
        raw = raw[start:]
    return json.loads(raw)


async def analyze_single_image(image_bytes: bytes, model: str, has_vision: bool) -> list[dict]:
    client = get_client()
    b64 = base64.b64encode(image_bytes).decode()

    if has_vision:
        messages = [
            {"role": "system", "content": VISION_SYSTEM_PROMPT},
            {"role": "user", "content": [
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
            ]},
        ]
    else:
        messages = [
            {"role": "system", "content": VISION_SYSTEM_PROMPT},
            {"role": "user", "content": "냉장고 이미지가 제공되었습니다. 일반적인 한국 냉장고 식재료 10가지를 JSON으로 반환하세요."},
        ]

    resp = await client.chat.completions.create(
        model=model,
        max_tokens=settings.LMSTUDIO_MAX_TOKENS,
        messages=messages,
        temperature=0.1,
    )
    raw = resp.choices[0].message.content
    try:
        data = _extract_json(raw)
        return [i for i in data.get("items", []) if i.get("confidence", 0) >= 0.3]
    except Exception:
        return []


async def analyze_images(images: list[bytes]) -> tuple[list[dict], str, bool]:
    """(detected_items, model_id, has_vision) 반환"""
    model, has_vision = await get_vision_model()
    results = await asyncio.gather(*[analyze_single_image(img, model, has_vision) for img in images])
    merged, seen = [], set()
    for batch in results:
        for item in batch:
            key = item["name"].strip().lower()
            if key not in seen:
                seen.add(key)
                merged.append(item)
    return merged, model, has_vision
