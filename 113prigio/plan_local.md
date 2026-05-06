# plan_local.md — Prigio (프리지오) 로컬 스택 구현 계획

> **서비스명:** Prigio (프리지오) — 냉장고 AI 식재료 관리 & 레시피 추천  
> **슬로건:** "찍으면, 요리가 된다"  
> **조건:** Google 로그인 연동 O / 결제(Polar.sh) 제거  
> **스택:** FastAPI + **Local PostgreSQL** · React 18 + Vite + TypeScript + Tailwind · **LMStudio Local LLM**  
> **방법론:** bkit (PDCA 기반 개발)

---

## 변경 사항 요약 (원본 → 로컬 스택)

| 항목 | 원본 | 변경 |
|------|------|------|
| 데이터베이스 | Supabase PostgreSQL (클라우드) | **로컬 PostgreSQL** (`localhost:5432`) |
| AI/LLM | OpenAI GPT-4o (API 키 필요) | **LMStudio 로컬 LLM** (`localhost:1234`) |
| 이미지 분석 | GPT-4o Vision | **LMStudio 비전 모델 자동 탐색** |
| 개발 방법론 | 없음 | **bkit PDCA** (Plan→Do→Check→Act) |

---

## 목차

1. [서비스 개요](#1-서비스-개요)
2. [bkit PDCA 개발 방법론](#2-bkit-pdca-개발-방법론)
3. [디자인 시스템](#3-디자인-시스템)
4. [프로젝트 구조](#4-프로젝트-구조)
5. [환경 변수](#5-환경-변수)
6. [백엔드 — DB 모델](#6-백엔드--db-모델)
7. [백엔드 — LMStudio AI 서비스](#7-백엔드--lmstudio-ai-서비스)
8. [백엔드 — API 라우트](#8-백엔드--api-라우트)
9. [프론트엔드](#9-프론트엔드)
10. [구현 Phase별 순서](#10-구현-phase별-순서)
11. [설치 및 실행](#11-설치-및-실행)
12. [트러블슈팅](#12-트러블슈팅)

---

## 1. 서비스 개요

### 1-1. 핵심 기능

| 기능 | 설명 |
|------|------|
| Google 로그인 | OAuth 2.0 + JWT RS256 + HttpOnly Cookie |
| AI 사진 분석 | 냉장고 사진 최대 2장 → LMStudio 비전 모델 → 식재료 자동 인식 |
| 냉장고 관리 | 11종 카테고리별 식재료 CRUD + 유통기한 관리 + 일괄 삭제 |
| AI 레시피 추천 | 2단계(후보 3개 → 상세 레시피) + 영양정보 + 쿠팡 링크 |
| 사용 쿼터 | Free(분석 5회/레시피 10회), 관리자 무제한 |

### 1-2. 페이지 목록

| 경로 | 페이지 | 인증 |
|------|--------|------|
| `/` | 랜딩 | 불필요 |
| `/dashboard` | 대시보드 | 필요 |
| `/fridge` | 냉장고 관리 | 필요 |
| `/analyze` | AI 사진 분석 | 필요 |
| `/recipes` | 레시피 추천 | 필요 |
| `/recipes/:id` | 레시피 상세 | 필요 |
| `/subscription` | 플랜 안내 (정적) | 필요 |

---

## 2. bkit PDCA 개발 방법론

bkit은 PDCA(Plan→Do→Check→Act) 사이클 기반 Claude Code 개발 플러그인입니다.

### 2-1. 프로젝트 레벨: Dynamic

> Full-stack 웹앱 (FastAPI + Local DB + Local LLM + React)

### 2-2. 9단계 개발 파이프라인

```
Stage 1: 요구사항 분석 (PRD 작성)      [PLAN]
Stage 2: 스키마 설계 (DB 모델)          [PLAN]
Stage 3: 백엔드 코어 구현               [DO]
Stage 4: AI 서비스 구현 (LMStudio)      [DO]
Stage 5: API 라우트 구현                [DO]
Stage 6: 프론트엔드 구현                [DO]
Stage 7: 통합 테스트                   [CHECK]
Stage 8: 버그 수정 및 최적화            [ACT]
Stage 9: 문서화 및 배포 준비            [ACT]
```

### 2-3. 문서 구조

```
prigio/
├── docs/
│   ├── PRD.md          # 제품 요구사항 문서
│   ├── SCHEMA.md       # DB 스키마 문서
│   ├── API.md          # API 명세
│   └── PDCA.md         # PDCA 사이클 추적
├── backend/
└── frontend/
```

---

## 3. 디자인 시스템

### 3-1. 컬러 팔레트

```css
:root {
  --deep-night:   #0D1F1A;
  --prigio-green: #1D9E75;
  --mint:         #5DCAA5;
  --ice:          #E1F5EE;
  --warm-amber:   #FAC775;
  --cream:        #F1EFE8;
  --text-primary:   #1A1A1A;
  --text-secondary: #5F5E5A;
  --border:         #D3D1C7;
  --danger:         #E24B4A;
}
```

---

## 4. 프로젝트 구조

```
prigio/
├── docs/                             # bkit 문서
│   ├── PRD.md
│   ├── SCHEMA.md
│   └── PDCA.md
│
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── admin.py
│   │   │   ├── analysis.py          # LMStudio 비전 분석
│   │   │   ├── auth.py
│   │   │   ├── fridge.py
│   │   │   ├── quota.py
│   │   │   └── recipes.py
│   │   ├── core/
│   │   │   ├── config.py            # 로컬 DB + LMStudio 설정
│   │   │   ├── database.py          # 로컬 PostgreSQL
│   │   │   ├── dependencies.py
│   │   │   └── security.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── fridge.py
│   │   │   └── usage.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── fridge.py
│   │   │   ├── analysis.py
│   │   │   └── recipe.py
│   │   ├── services/
│   │   │   ├── ai_service.py        # ★ LMStudio 모델 자동 탐색 + 비전/텍스트
│   │   │   ├── lmstudio_client.py   # ★ LMStudio OpenAI-compat 클라이언트
│   │   │   ├── ingredient_normalizer.py
│   │   │   ├── quota_service.py
│   │   │   └── recipe_service.py
│   │   └── main.py
│   ├── alembic/
│   │   ├── versions/001_initial.py
│   │   └── env.py
│   ├── alembic.ini
│   ├── keys/
│   │   ├── private.pem
│   │   └── public.pem
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   ├── store/
    │   ├── types/
    │   └── utils/
    ├── package.json
    ├── vite.config.ts
    └── .env
```

---

## 5. 환경 변수

### 5-1. 백엔드 (`backend/.env`)

```bash
# ── 앱 기본 ──────────────────────────────────────
APP_ENV=development
APP_NAME=Prigio
DEBUG=true

# ── 데이터베이스 (로컬 PostgreSQL) ────────────────
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/prigio
# 또는 비밀번호 없이: postgresql+asyncpg://postgres@localhost:5432/prigio

# ── JWT RS256 비대칭키 ────────────────────────────
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_PRIVATE_KEY_B64=
JWT_PUBLIC_KEY_B64=
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=30

# ── Google OAuth ──────────────────────────────────
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# ── LMStudio 로컬 LLM ─────────────────────────────
LMSTUDIO_BASE_URL=http://localhost:1234/v1
LMSTUDIO_API_KEY=lm-studio
# 자동 탐색 (빈칸이면 로드된 모델 중 자동 선택)
LMSTUDIO_VISION_MODEL=
LMSTUDIO_CHAT_MODEL=
LMSTUDIO_TIMEOUT_SECONDS=120
LMSTUDIO_MAX_TOKENS=2000

# ── CORS ──────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=["http://localhost:5173","http://localhost:5174"]

# ── 관리자 ────────────────────────────────────────
ADMIN_SECRET=your-admin-secret-key

# ── 쿼터 ──────────────────────────────────────────
FREE_PLAN_MONTHLY_LIMIT=5
```

### 5-2. 프론트엔드 (`frontend/.env`)

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_ENV=development
```

---

## 6. 백엔드 — DB 모델

### 6-1. `requirements.txt`

```
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy[asyncio]==2.0.36
asyncpg==0.29.0
alembic==1.13.3
pydantic-settings==2.5.2
pydantic[email]==2.9.2
python-multipart==0.0.12
httpx==0.27.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
openai==1.51.2
cryptography==43.0.1
slowapi==0.1.9
python-dotenv==1.0.1
pytest==8.3.3
pytest-asyncio==0.24.0
anyio[trio]
```

> **주의:** openai 라이브러리를 LMStudio OpenAI 호환 엔드포인트에 사용합니다. 실제 OpenAI API 키 불필요.

### 6-2. `app/core/config.py`

```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_NAME: str = "Prigio"
    DEBUG: bool = True

    # 로컬 PostgreSQL
    DATABASE_URL: str = "postgresql+asyncpg://postgres@localhost:5432/prigio"

    # JWT RS256
    JWT_PRIVATE_KEY_PATH: str = "./keys/private.pem"
    JWT_PUBLIC_KEY_PATH: str = "./keys/public.pem"
    JWT_PRIVATE_KEY_B64: str = ""
    JWT_PUBLIC_KEY_B64: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"

    # LMStudio (OpenAI 호환 로컬 LLM)
    LMSTUDIO_BASE_URL: str = "http://localhost:1234/v1"
    LMSTUDIO_API_KEY: str = "lm-studio"
    LMSTUDIO_VISION_MODEL: str = ""   # 빈 칸 = 자동 탐색
    LMSTUDIO_CHAT_MODEL: str = ""     # 빈 칸 = 자동 탐색
    LMSTUDIO_TIMEOUT_SECONDS: int = 120
    LMSTUDIO_MAX_TOKENS: int = 2000

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173"]

    # Admin
    ADMIN_SECRET: str = ""

    # Quota
    FREE_PLAN_MONTHLY_LIMIT: int = 5

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 7. 백엔드 — LMStudio AI 서비스

### 7-1. `app/services/lmstudio_client.py` (핵심 신규 파일)

```python
"""
LMStudio OpenAI 호환 클라이언트
- 로컬 LMStudio 서버에 연결
- 비전 모델과 텍스트 모델 자동 탐색
"""
import httpx
from openai import AsyncOpenAI
from app.core.config import settings

VISION_KEYWORDS = [
    "vision", "vl", "llava", "moondream", "phi3-v",
    "qwen-vl", "qwen2-vl", "qwen2.5-vl", "minicpm-v",
    "gemma3", "bakllava", "cogvlm", "internvl",
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
    """LMStudio에 현재 로드된 모델 목록 조회"""
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{settings.LMSTUDIO_BASE_URL}/models")
        resp.raise_for_status()
        return [m["id"] for m in resp.json().get("data", [])]


def _is_vision_model(model_id: str) -> bool:
    lower = model_id.lower()
    return any(kw in lower for kw in VISION_KEYWORDS)


async def get_vision_model() -> str:
    """비전 모델 반환 (설정값 우선 → 자동 탐색)"""
    global _vision_model_cache
    if settings.LMSTUDIO_VISION_MODEL:
        return settings.LMSTUDIO_VISION_MODEL
    if _vision_model_cache:
        return _vision_model_cache
    models = await list_loaded_models()
    for m in models:
        if _is_vision_model(m):
            _vision_model_cache = m
            return m
    # 비전 모델 없으면 첫 번째 모델 사용 (텍스트 설명 전용)
    if models:
        _vision_model_cache = models[0]
        return models[0]
    raise RuntimeError("LMStudio에 로드된 모델이 없습니다. LMStudio를 실행하고 모델을 로드해주세요.")


async def get_chat_model() -> str:
    """텍스트 생성 모델 반환 (설정값 우선 → 자동 탐색)"""
    global _chat_model_cache
    if settings.LMSTUDIO_CHAT_MODEL:
        return settings.LMSTUDIO_CHAT_MODEL
    if _chat_model_cache:
        return _chat_model_cache
    models = await list_loaded_models()
    if not models:
        raise RuntimeError("LMStudio에 로드된 모델이 없습니다.")
    _chat_model_cache = models[0]
    return models[0]


async def check_lmstudio_health() -> dict:
    """LMStudio 연결 상태 확인"""
    try:
        models = await list_loaded_models()
        vision_models = [m for m in models if _is_vision_model(m)]
        return {
            "status": "ok",
            "models": models,
            "vision_models": vision_models,
            "has_vision": len(vision_models) > 0,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
```

### 7-2. `app/services/ai_service.py` (LMStudio 비전 분석)

```python
"""
LMStudio Vision → 식재료 인식
비전 모델 없으면 텍스트 프롬프트로 대체
"""
import asyncio, base64, json
from app.services.lmstudio_client import get_client, get_vision_model, _is_vision_model

VISION_SYSTEM_PROMPT = """당신은 냉장고·식품·음료·주류 이미지에서 모든 내용물을 정밀하게 인식하는 전문가입니다.
형식: {"items": [{"name": "재료명(한국어)", "quantity": 숫자|null, "unit": "단위|null", "confidence": 0~1}]}

규칙:
- 이미지를 좌→우, 위→아래 격자 스캔하여 빠짐없이 파악
- 브랜드명 제거, 재료명만 기재 (일반 명칭)
- confidence 0.3 미만은 출력 금지
- JSON 외 텍스트 절대 금지"""

TEXT_FALLBACK_PROMPT = """냉장고 사진을 분석할 준비가 되었습니다.
다음 형식으로 일반적인 냉장고 식재료를 예시로 반환하세요:
{"items": [{"name": "계란", "quantity": 6, "unit": "개", "confidence": 0.8}]}"""


async def analyze_single_image(image_bytes: bytes, model: str) -> list[dict]:
    client = get_client()
    b64 = base64.b64encode(image_bytes).decode()

    if _is_vision_model(model):
        messages = [
            {"role": "system", "content": VISION_SYSTEM_PROMPT},
            {"role": "user", "content": [
                {"type": "image_url",
                 "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
            ]},
        ]
    else:
        # 비전 모델 없음 → 텍스트 전용 분석 (제한적)
        messages = [
            {"role": "system", "content": VISION_SYSTEM_PROMPT},
            {"role": "user", "content": "냉장고 이미지가 제공되었습니다. 일반적인 냉장고 식재료 목록을 JSON으로 반환하세요."},
        ]

    resp = await client.chat.completions.create(
        model=model,
        max_tokens=2000,
        messages=messages,
        temperature=0.1,
    )
    raw = resp.choices[0].message.content.strip()
    # JSON 추출
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()
    data = json.loads(raw)
    return [i for i in data.get("items", []) if i.get("confidence", 0) >= 0.3]


async def analyze_images(images: list[bytes]) -> list[dict]:
    """최대 2장 병렬 분석 + 이름 기준 중복 제거"""
    model = await get_vision_model()
    results = await asyncio.gather(*[analyze_single_image(img, model) for img in images])
    merged, seen = [], set()
    for batch in results:
        for item in batch:
            key = item["name"].strip().lower()
            if key not in seen:
                seen.add(key)
                merged.append(item)
    return merged
```

### 7-3. `app/services/recipe_service.py` (LMStudio 텍스트 생성)

```python
import json
from app.services.lmstudio_client import get_client, get_chat_model

CANDIDATE_PROMPT = """당신은 한국 요리 전문가입니다.
냉장고 재료: {ingredients}
음식 종류: {food_types}
맛 선호: {tastes}
{diet_instruction}

위 조건으로 만들 수 있는 요리 후보 3가지를 추천하세요.
형식: {{"candidates": [{{"dish": "요리명", "description": "간단설명(20자)", "difficulty": "쉬움|보통|어려움"}}]}}
JSON만 반환, 다른 텍스트 금지."""

RECIPE_PROMPT = """당신은 요리 레시피 전문가입니다.
요리명: {selected_dish}
보유 재료: {ingredients}

{selected_dish} 레시피를 생성하세요.
형식:
{{
  "title": "요리명",
  "ingredients": [{{"name": "재료명", "amount": "양"}}],
  "steps": ["1. ...", "2. ..."],
  "cooking_time": "N분",
  "difficulty": "쉬움|보통|어려움",
  "tips": "조리 팁",
  "missing_ingredients": ["부족한재료"],
  "nutrition": {{"calories": N, "protein": N, "carbs": N, "fat": N}}
}}
JSON만 반환."""


def _extract_json(raw: str) -> dict:
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()
    return json.loads(raw)


async def generate_candidates(ingredients, food_types, tastes, custom_type=""):
    model = await get_chat_model()
    client = get_client()
    diet_instruction = "저칼로리·고단백 위주 요리를 우선 추천하세요." if "다이어트" in tastes else ""
    prompt = CANDIDATE_PROMPT.format(
        ingredients=", ".join(ingredients),
        food_types=", ".join(food_types) + (f", {custom_type}" if custom_type else ""),
        tastes=", ".join(tastes),
        diet_instruction=diet_instruction,
    )
    resp = await client.chat.completions.create(
        model=model,
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    return _extract_json(resp.choices[0].message.content)["candidates"]


async def generate_recipe(ingredients, food_types, tastes, selected_dish, custom_type=""):
    model = await get_chat_model()
    client = get_client()
    prompt = RECIPE_PROMPT.format(
        selected_dish=selected_dish,
        ingredients=", ".join(ingredients),
    )
    resp = await client.chat.completions.create(
        model=model,
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
    )
    recipe = _extract_json(resp.choices[0].message.content)
    if "nutrition" in recipe:
        recipe["nutrition"] = recalculate_calories(recipe["nutrition"])
    return recipe


def recalculate_calories(nutrition: dict) -> dict:
    p = nutrition.get("protein") or 0
    c = nutrition.get("carbs") or 0
    f = nutrition.get("fat") or 0
    nutrition["calories"] = round(p * 4 + c * 4 + f * 9)
    return nutrition
```

---

## 8. 백엔드 — API 라우트

(원본 plan.md의 라우트 코드와 동일, ai_service 호출만 LMStudio로 대체)

### 8-1. 추가 엔드포인트: `/api/v1/system/health`

```python
@app.get("/api/v1/system/health")
async def system_health():
    """LMStudio 연결 상태 + 로드된 모델 확인"""
    from app.services.lmstudio_client import check_lmstudio_health
    return await check_lmstudio_health()
```

---

## 9. 프론트엔드

(원본 plan.md와 동일 — 디자인 시스템, 컴포넌트, 페이지 구성 유지)

### 9-1. 추가 UI: LMStudio 상태 표시

대시보드에 AI 서버 상태 카드 추가:
```tsx
// LMStudio 연결 여부 + 로드된 모델명 표시
// 비전 모델 없으면 "이미지 분석 제한됨" 경고
```

---

## 10. 구현 Phase별 순서 (bkit PDCA)

### [PLAN] Phase 1 — 기반 환경 (1일)

- [ ] 로컬 PostgreSQL 데이터베이스 생성 (`createdb prigio`)
- [ ] LMStudio 실행 + 비전 모델(Qwen2.5-VL 또는 LLaVA 권장) + 텍스트 모델 로드
- [ ] 프로젝트 디렉토리 생성 (`prigio/backend`, `prigio/frontend`, `prigio/docs`)
- [ ] `backend/`: venv 생성 + requirements 설치
- [ ] RSA 키 쌍 생성
- [ ] `.env` 작성 (DATABASE_URL=localhost, LMSTUDIO_BASE_URL)
- [ ] `frontend/`: Vite + React TS 초기화

### [DO] Phase 2 — DB + 인증 (2일)

- [ ] SQLAlchemy 모델 4개 (user.py, fridge.py, usage.py)
- [ ] Alembic 마이그레이션
- [ ] `config.py`, `database.py`, `security.py`, `dependencies.py`
- [ ] `auth.py` Google OAuth 라우트
- [ ] `useAuth.ts`, `authStore.ts`
- [ ] `Landing.tsx`, `App.tsx` (라우터 + ProtectedRoute)

### [DO] Phase 3 — LMStudio AI 서비스 (1일)

- [ ] `lmstudio_client.py` (모델 자동 탐색, 연결 확인)
- [ ] `ai_service.py` (비전 분석, JSON 파싱, 에러 처리)
- [ ] `recipe_service.py` (후보 생성, 상세 레시피)
- [ ] `/api/v1/system/health` 엔드포인트
- [ ] LMStudio 연결 E2E 테스트

### [DO] Phase 4 — 냉장고 CRUD + AI 분석 (2일)

- [ ] `fridge.py`, `analysis.py`, `quota.py` 라우트
- [ ] `Fridge.tsx`, `Analyze.tsx`, `Dashboard.tsx`
- [ ] 쿼터 서비스 + 유통기한 뱃지

### [DO] Phase 5 — AI 레시피 (1일)

- [ ] `recipes.py` 라우트
- [ ] `Recipes.tsx`, `RecipeDetail.tsx`
- [ ] 북마크 유틸 + 쿠팡 링크

### [DO] Phase 6 — 마무리 (1일)

- [ ] `AdminPanel.tsx`, `Subscription.tsx`
- [ ] LMStudio 상태 카드 (대시보드)
- [ ] 반응형 스타일

### [CHECK] Phase 7 — 통합 테스트

- [ ] Google 로그인 E2E
- [ ] LMStudio 이미지 분석 E2E
- [ ] 레시피 생성 E2E
- [ ] 쿼터 차감 확인

### [ACT] Phase 8 — 최적화

- [ ] LMStudio 응답 파싱 오류 처리 강화
- [ ] 모델 없음 에러 메시지 UX 개선
- [ ] 응답 속도 최적화

---

## 11. 설치 및 실행

### 11-1. 사전 준비

#### 로컬 PostgreSQL 설치 및 DB 생성

```bash
# Windows (Chocolatey)
choco install postgresql

# 또는 공식 인스톨러: https://www.postgresql.org/download/windows/

# PostgreSQL 서비스 시작
net start postgresql-x64-17  # 버전에 맞게 조정

# DB 생성
psql -U postgres -c "CREATE DATABASE prigio;"

# 연결 확인
psql -U postgres -d prigio -c "\l"
```

#### LMStudio 설치 및 모델 로드

```
1. https://lmstudio.ai/ 에서 LMStudio 다운로드 설치
2. LMStudio 실행
3. 모델 검색 및 다운로드:
   - 비전 모델: "Qwen2.5-VL-3B" 또는 "LLaVA-1.5-7B" 권장
   - 텍스트 모델: "Qwen2.5-7B-Instruct" 또는 "Gemma-3-4B-IT" 권장
4. 모델 로드 후 Local Server 탭 → "Start Server" 클릭
5. http://localhost:1234/v1/models 에서 로드 확인
```

### 11-2. 백엔드

```bash
cd prigio/backend

python -m venv .venv
.venv\Scripts\activate  # Windows

pip install -r requirements.txt

# RSA 키 생성
mkdir keys
# Windows PowerShell:
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

# .env 설정
cp .env.example .env
# DATABASE_URL, GOOGLE_CLIENT_ID/SECRET, LMSTUDIO_BASE_URL 입력

# DB 마이그레이션
alembic upgrade head

# LMStudio 연결 확인
curl http://localhost:1234/v1/models

# 백엔드 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 11-3. 프론트엔드

```bash
cd prigio/frontend
npm install
npm run dev
# → http://localhost:5173
```

### 11-4. 전체 실행 순서

```
1. PostgreSQL 서비스 확인 (localhost:5432)
2. LMStudio 실행 + 모델 로드 + 서버 시작 (localhost:1234)
3. Google Cloud Console OAuth 앱 등록
4. backend/.env 작성 (DATABASE_URL, GOOGLE_CLIENT_ID/SECRET)
5. alembic upgrade head
6. uvicorn app.main:app --reload
7. npm run dev
8. http://localhost:8000/api/v1/system/health → LMStudio 상태 확인
9. http://localhost:5173 → 브라우저 접속
```

---

## 12. 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| `asyncpg.exceptions.InvalidPasswordError` | PostgreSQL 비밀번호 오류 | `DATABASE_URL` 비밀번호 확인 |
| `asyncpg.exceptions.InvalidCatalogNameError` | DB 없음 | `createdb prigio` 실행 |
| `Connection refused (localhost:1234)` | LMStudio 미실행 | LMStudio 실행 + Server 시작 |
| `No models loaded` | LMStudio 모델 미로드 | LMStudio에서 모델 로드 후 Server 시작 |
| 이미지 분석 결과 빈 배열 | 비전 모델 미지원 | Qwen2.5-VL, LLaVA 등 비전 모델 로드 |
| JSON 파싱 오류 | LLM 출력 형식 문제 | `LMSTUDIO_MAX_TOKENS` 증가, 프롬프트 강화 |
| 레시피 생성 느림 | 로컬 LLM 속도 | GPU 가속 확인, 작은 모델 사용 |
| Cookie 전송 안됨 | SameSite 설정 | 개발: `samesite="lax"` |
| CORS 오류 | ALLOWED_ORIGINS 미등록 | `.env`에 프론트 URL 추가 |
| JWT decode 실패 | PEM 키 문제 | 키 재생성 확인 |

---

## LMStudio 권장 모델 목록

### 비전 모델 (이미지 분석용)

| 모델 | 크기 | 추천도 | 특징 |
|------|------|--------|------|
| Qwen2.5-VL-7B-Instruct | 7B | ★★★★★ | 최고 성능, 한국어 지원 |
| Qwen2.5-VL-3B-Instruct | 3B | ★★★★ | 경량, 빠름 |
| LLaVA-1.5-7B | 7B | ★★★★ | 안정적 |
| Moondream2 | 2B | ★★★ | 초경량 |

### 텍스트 모델 (레시피 생성용)

| 모델 | 크기 | 추천도 | 특징 |
|------|------|--------|------|
| Qwen2.5-7B-Instruct | 7B | ★★★★★ | 한국어 최고 |
| Gemma-3-4B-IT | 4B | ★★★★ | 빠름 |
| Llama-3.2-3B-Instruct | 3B | ★★★ | 경량 |

---

*plan_local.md — bkit PDCA 기반 로컬 스택 구현 계획*  
*변경: Supabase → Local PostgreSQL / OpenAI → LMStudio Local LLM*
