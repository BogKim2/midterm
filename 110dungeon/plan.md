# plan.md — AI Dungeon RPG (LMStudio Qwen3 + Google OAuth 로컬 구현 계획)

> **원본 레포:** https://github.com/iringsoya-gif/ai-dungeon-rpg  
> **변경 핵심:** Groq API → **LMStudio 로컬 LLM (qwen3:6b)** 으로 교체  
> **인증:** Google OAuth 2.0 (원본과 동일, 로컬 환경 설정만 조정)  
> **스택:** FastAPI + SQLite · React 19 + Vite · Zustand · Web Audio API

---

## 0. 원본 대비 변경 사항 요약

| 항목 | 원본 | 이번 구현 |
|---|---|---|
| LLM | Groq API (LLaMA 3.3 70B) | **LMStudio 로컬 서버 (qwen3:6b)** |
| LLM 연결 방식 | `groq` SDK | **OpenAI 호환 REST API** (`openai` SDK) |
| 모델명 | `llama-3.3-70b-versatile` | **`qwen3-6b`** (LMStudio 모델명 그대로) |
| API 엔드포인트 | `api.groq.com` | **`http://localhost:1234/v1`** |
| API 키 | `GROQ_API_KEY` | `LM_STUDIO_API_KEY=lm-studio` (더미값) |
| 결제 | Polar.sh | **제거** (로컬 과제용, 플랜 제한만 유지) |
| DB | SQLite (원본도 SQLite) | SQLite 동일 유지 |
| 배포 | Vercel + Railway | **로컬 개발 환경** |

> **LMStudio OpenAI 호환 서버:** LMStudio는 `http://localhost:1234/v1`에 OpenAI 호환 API를 제공합니다.  
> `openai` 패키지의 `base_url`만 바꾸면 Groq SDK 교체 없이 대부분 동작합니다.

---

## 1. 사전 준비

### 1-1. LMStudio 설정

1. [lmstudio.ai](https://lmstudio.ai) 에서 LMStudio 다운로드 & 설치
2. 앱 실행 → 좌측 **Discover** 탭에서 `qwen3` 검색
3. **Qwen3-6B** (또는 `qwen/qwen3-6b`) 다운로드
4. 좌측 **Local Server** 탭 클릭
5. 다운로드한 `qwen3-6b` 모델 선택 후 **Start Server**
6. 서버 주소 확인: `http://localhost:1234` (기본값)
7. **CORS 허용** 체크 확인

```bash
# LMStudio 서버 확인
curl http://localhost:1234/v1/models
# 정상 응답: {"data":[{"id":"qwen3-6b","object":"model",...}]}
```

### 1-2. Google OAuth 앱 등록

1. [Google Cloud Console](https://console.cloud.google.com) → 새 프로젝트 생성
2. **API 및 서비스 → 사용자 인증 정보 → OAuth 2.0 클라이언트 ID** 생성
3. 애플리케이션 유형: **웹 애플리케이션**
4. 승인된 리디렉션 URI 추가:
   ```
   http://localhost:8000/api/v1/auth/callback
   ```
5. **클라이언트 ID**와 **클라이언트 보안 비밀** 저장

### 1-3. Python/Node 환경 확인

```bash
python --version   # 3.12 이상
node --version     # 18 이상
curl -LsSf https://astral.sh/uv/install.sh | sh   # uv 설치 (없으면)
```

---

## 2. 프로젝트 구조

```
ai-dungeon-rpg/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py              # JWT 검증, get_current_user
│   │   │   └── routes/
│   │   │       ├── auth.py          # Google OAuth + JWT 발급
│   │   │       └── game.py          # 게임 CRUD + SSE 스트리밍
│   │   ├── core/
│   │   │   ├── config.py            # ★ 환경변수 (LMStudio 설정)
│   │   │   ├── database.py          # SQLAlchemy SQLite
│   │   │   └── security.py          # JWT create/verify
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── game.py
│   │   │   └── history.py
│   │   ├── services/
│   │   │   ├── ai_gm.py             # ★ LMStudio 호출로 교체
│   │   │   ├── context_manager.py   # 토큰 추적 + 자동 압축
│   │   │   ├── state_manager.py     # 상태 변화 파싱 + 적용
│   │   │   └── text_sanitizer.py    # 한국어 외 문자 제거
│   │   └── main.py
│   ├── alembic/                     # DB 마이그레이션
│   ├── pyproject.toml               # ★ groq 제거, openai 추가
│   └── .env                         # ★ 환경변수
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Landing.jsx           # 랜딩 + Google 로그인 버튼
    │   │   ├── Dashboard.jsx         # 내 게임 목록
    │   │   ├── NewGame.jsx           # 세계관 + 캐릭터 생성
    │   │   ├── Game.jsx              # ★ 메인 게임 화면 (SSE)
    │   │   ├── GameOver.jsx
    │   │   ├── Stories.jsx           # 공개 모험 갤러리
    │   │   ├── Story.jsx             # 공유 스토리 뷰어
    │   │   └── auth/
    │   │       └── Callback.jsx      # Google OAuth 콜백 처리
    │   ├── components/
    │   │   ├── game/
    │   │   │   ├── StatusPanel.jsx   # 4탭: 상태/퀘스트/NPC/지도
    │   │   │   └── CharacterSheet.jsx
    │   │   └── ui/
    │   │       ├── StreamText.jsx    # 타이프라이터 효과
    │   │       └── ConfirmModal.jsx
    │   ├── hooks/
    │   │   ├── useStream.js          # SSE 수신 + 재시도
    │   │   └── useBGM.js             # Web Audio API BGM + SFX
    │   ├── store/
    │   │   ├── authStore.js
    │   │   └── gameStore.js
    │   └── lib/api.js
    ├── package.json
    └── .env
```

---

## 3. 환경 변수 설정

### 3-1. 백엔드 (`backend/.env`)

```bash
# ── 필수 ──────────────────────────────────────────
SECRET_KEY=your-random-secret-key-min-32-chars
DATABASE_URL=sqlite:///./dungeon.db

# ── Google OAuth ───────────────────────────────────
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/callback

# ── LMStudio ★ (Groq 완전 대체) ────────────────────
LM_STUDIO_BASE_URL=http://localhost:1234/v1
LM_STUDIO_API_KEY=lm-studio
LM_STUDIO_MODEL=qwen3-6b

# ── 앱 설정 ────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
```

> `SECRET_KEY` 생성: `python -c "import secrets; print(secrets.token_hex(32))"`

### 3-2. 프론트엔드 (`frontend/.env`)

```bash
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 4. 백엔드 구현 — 변경 파일

### 4-1. pyproject.toml (groq 제거, openai 추가)

```toml
[project]
name = "backend"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "openai>=1.35.0",             # ★ groq 대신 openai (LMStudio 호환)
    "fastapi[standard]>=0.115.0",
    "httpx>=0.27.0",
    "python-dotenv>=1.0.0",
    "python-jose[cryptography]>=3.3.0",
    "sqlalchemy>=2.0.0",
    "uvicorn[standard]>=0.30.0",
    "slowapi>=0.1.9",
    "alembic>=1.13.0",
]

[dependency-groups]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.23.0",
]
```

---

### 4-2. config.py (GROQ → LMStudio 환경변수)

```python
# backend/app/core/config.py
import os
from dotenv import load_dotenv

load_dotenv(encoding="utf-8")

GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI  = os.getenv("GOOGLE_REDIRECT_URI")
FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:5173")

SECRET_KEY                   = os.getenv("SECRET_KEY")
ALGORITHM                    = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES  = 60 * 24 * 7

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dungeon.db")

# ★ LMStudio 설정 (GROQ_API_KEY 완전 제거)
LM_STUDIO_BASE_URL = os.getenv("LM_STUDIO_BASE_URL", "http://localhost:1234/v1")
LM_STUDIO_API_KEY  = os.getenv("LM_STUDIO_API_KEY", "lm-studio")
LM_STUDIO_MODEL    = os.getenv("LM_STUDIO_MODEL", "qwen3-6b")

_REQUIRED = {
    "SECRET_KEY":           SECRET_KEY,
    "DATABASE_URL":         DATABASE_URL,
    "GOOGLE_CLIENT_ID":     GOOGLE_CLIENT_ID,
    "GOOGLE_CLIENT_SECRET": GOOGLE_CLIENT_SECRET,
    # GROQ_API_KEY 삭제 — LMStudio는 키 불필요
}
_missing = [k for k, v in _REQUIRED.items() if not v]
if _missing:
    raise RuntimeError(f"필수 환경변수 누락: {', '.join(_missing)}")
```

---

### 4-3. ★ ai_gm.py — LMStudio 교체 핵심

**변경 요점:**
- `from groq import Groq, AsyncGroq` → `from openai import OpenAI, AsyncOpenAI`
- 클라이언트 초기화 시 `base_url=LM_STUDIO_BASE_URL` 지정
- 모든 API 호출에 `extra_body={"thinking": {"type": "disabled"}}` 추가
- 나머지 코드 (시스템 프롬프트, few-shot, 상태 파싱 등) **원본 그대로 유지**

```python
# backend/app/services/ai_gm.py

# ── 변경: groq → openai ──────────────────────────────────────────────
from openai import OpenAI, AsyncOpenAI   # ★

from app.core.config import (
    LM_STUDIO_BASE_URL, LM_STUDIO_API_KEY, LM_STUDIO_MODEL  # ★
)
from app.services.context_manager import context_mgr, estimate_tokens
from app.services.state_manager import parse_state_changes
from app.services.text_sanitizer import sanitize_korean
import json

# ★ 클라이언트 초기화 — base_url을 LMStudio 주소로 지정
client = OpenAI(
    base_url=LM_STUDIO_BASE_URL,
    api_key=LM_STUDIO_API_KEY,   # LMStudio는 아무 문자열이나 수락
)
async_client = AsyncOpenAI(
    base_url=LM_STUDIO_BASE_URL,
    api_key=LM_STUDIO_API_KEY,
)

GM_MODEL      = LM_STUDIO_MODEL   # "qwen3-6b"
OPENING_MODEL = LM_STUDIO_MODEL

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 이하 원본 코드 완전 동일 유지:
#   _GENRE_KEYWORDS, _detect_genre()
#   _OPENING_STYLE, _GENRE_STYLE_BLOCKS
#   SYSTEM_TEMPLATE (한국어 전용, NPC 규칙, 출력 형식 포함)
#   _FEWSHOT_EXCHANGES (fantasy/scifi/horror/modern)
#   _format_npcs(), _format_weather_time(), _format_locations()
#   _format_inventory(), _format_active_quests()
#   build_system_prompt(), _get_genre()
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


async def stream_action(game, histories: list, player_input: str):
    """SSE 제너레이터 — 구조 원본 동일, 모델만 Qwen3"""
    system   = build_system_prompt(game)
    genre    = _get_genre(game)
    history  = context_mgr.build_context(game, histories)
    fewshot  = _FEWSHOT_EXCHANGES.get(genre, _FEWSHOT_EXCHANGES["modern"])
    messages = fewshot + history + [{"role": "user", "content": player_input}]
    all_msgs = [{"role": "system", "content": system}] + messages

    full_response = ""
    try:
        stream = await async_client.chat.completions.create(
            model=GM_MODEL,
            messages=all_msgs,
            max_tokens=1400,
            stream=True,
            extra_body={"thinking": {"type": "disabled"}},  # ★ Qwen3 thinking 비활성화
        )
        async for chunk in stream:
            text = chunk.choices[0].delta.content or ""
            if text:
                full_response += text
                yield ("text", sanitize_korean(text))
    except Exception as e:
        yield ("error", str(e))
        return

    full_response = sanitize_korean(full_response)
    state_changes = parse_state_changes(full_response)
    token_count   = estimate_tokens(full_response)
    yield ("done", {
        "full_response": full_response,
        "state_changes": state_changes,
        "token_count":   token_count,
    })


async def generate_summary(game, histories: list) -> str:
    """컨텍스트 압축 요약 — Qwen3"""
    if not histories:
        return ""
    excerpt = "\n".join(
        f"[{h.role}] {h.content[:200]}" for h in histories[-30:]
    )
    prompt = (
        "다음 RPG 게임 대화를 한국어로 3~5문단 내러티브 요약으로 작성하세요. "
        "주요 사건, 만난 NPC, 진행한 퀘스트, 현재 상황에 집중하세요. "
        "JSON 블록 없이 순수 텍스트만.\n\n" + excerpt
    )
    try:
        resp = await async_client.chat.completions.create(
            model=GM_MODEL,
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
            extra_body={"thinking": {"type": "disabled"}},  # ★
        )
        return sanitize_korean(resp.choices[0].message.content)
    except Exception:
        return ""


def generate_opening(world_description, character_name, character_class, character_background) -> str:
    """게임 오프닝 생성 — 동기 호출, Qwen3"""
    try:
        genre  = _detect_genre(world_description)
        prompt = OPENING_PROMPT.format(
            world_description=world_description,
            character_name=character_name,
            character_class=character_class,
            character_background=character_background,
            opening_style=_OPENING_STYLE[genre],
        )
        response = client.chat.completions.create(
            model=OPENING_MODEL,
            max_tokens=768,
            messages=[{"role": "user", "content": prompt}],
            extra_body={"thinking": {"type": "disabled"}},  # ★
        )
        return sanitize_korean(response.choices[0].message.content)
    except Exception:
        return (
            f"당신은 {character_name}입니다. {character_class} 출신으로, "
            f"{character_background}\n\n모험이 시작됩니다."
        )
```

> **`extra_body={"thinking": {"type": "disabled"}}` 이 필수인 이유:**  
> Qwen3는 기본적으로 내부 추론 과정을 `<think>...</think>` 태그로 응답에 포함시킵니다.  
> 이를 끄지 않으면 GM 서사 출력에 추론 내용이 그대로 섞여 나옵니다.

---

### 4-4. database.py (SQLite 설정)

```python
# backend/app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import DATABASE_URL

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

### 4-5. DB 모델 — UUID를 TEXT로 (SQLite 호환)

원본은 PostgreSQL UUID 타입을 사용하므로 SQLite 환경에서는 `TEXT`로 변경 필요.

```python
# backend/app/models/user.py
from sqlalchemy import Column, String, DateTime, Text
from datetime import datetime
import uuid
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id         = Column(Text, primary_key=True, default=lambda: str(uuid.uuid4()))  # ★ UUID→Text
    email      = Column(String, unique=True, nullable=False)
    name       = Column(String)
    picture    = Column(String)
    google_id  = Column(String, unique=True)
    plan       = Column(String, default="free")
    created_at = Column(DateTime, default=datetime.utcnow)
```

```python
# backend/app/models/game.py
from sqlalchemy import Column, String, DateTime, Integer, Boolean, ForeignKey, Text
from datetime import datetime
import uuid
from app.core.database import Base

class Game(Base):
    __tablename__ = "games"
    id             = Column(Text, primary_key=True, default=lambda: str(uuid.uuid4()))  # ★
    user_id        = Column(Text, ForeignKey("users.id"), nullable=False)               # ★
    title          = Column(String)
    world_json     = Column(Text, nullable=False)
    character_json = Column(Text, nullable=False)
    summary        = Column(Text)
    turn_count     = Column(Integer, default=0)
    hardcore_mode  = Column(Boolean, default=False)
    status         = Column(String, default="active")
    snapshot_json  = Column(Text, nullable=True)
    snapshot_turn  = Column(Integer, nullable=True)
    created_at     = Column(DateTime, default=datetime.utcnow)
    last_played    = Column(DateTime, default=datetime.utcnow)
```

```python
# backend/app/models/history.py
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Text
from datetime import datetime
import uuid
from app.core.database import Base

class History(Base):
    __tablename__ = "histories"
    id          = Column(Text, primary_key=True, default=lambda: str(uuid.uuid4()))  # ★
    game_id     = Column(Text, ForeignKey("games.id"), nullable=False)               # ★
    turn        = Column(Integer, nullable=False)
    role        = Column(String, nullable=False)
    content     = Column(Text, nullable=False)
    token_count = Column(Integer, default=0)
    created_at  = Column(DateTime, default=datetime.utcnow)
```

---

### 4-6. auth.py (Google OAuth — 원본과 동일)

```python
# backend/app/api/routes/auth.py
from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import httpx

from app.core.config import (
    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI, FRONTEND_URL,
)
from app.core.database import get_db
from app.core.security import create_token
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

GOOGLE_AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USER_URL  = "https://www.googleapis.com/oauth2/v2/userinfo"


@router.get("/login")
def google_login():
    params = (
        f"client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=openid email profile"
        f"&access_type=offline"
    )
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{params}")


@router.get("/callback")
async def google_callback(code: str = None, error: str = None,
                          db: Session = Depends(get_db)):
    if error or not code:
        return RedirectResponse(f"{FRONTEND_URL}/auth/callback?error={error or 'no_code'}")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # code → access_token 교환
            token_res  = await client.post(GOOGLE_TOKEN_URL, data={
                "code": code, "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            })
            token_data = token_res.json()
            if "access_token" not in token_data:
                return RedirectResponse(f"{FRONTEND_URL}/auth/callback?error=token_failed")

            # access_token → 사용자 정보
            user_res   = await client.get(
                GOOGLE_USER_URL,
                headers={"Authorization": f"Bearer {token_data['access_token']}"},
            )
            google_user = user_res.json()
    except Exception:
        return RedirectResponse(f"{FRONTEND_URL}/auth/callback?error=server_error")

    email = google_user.get("email")
    if not email:
        return RedirectResponse(f"{FRONTEND_URL}/auth/callback?error=no_email")

    # DB upsert
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.name    = google_user.get("name")
        user.picture = google_user.get("picture")
    else:
        user = User(
            email=email, name=google_user.get("name"),
            picture=google_user.get("picture"),
            google_id=google_user.get("id"),
        )
        db.add(user)
    db.commit()
    db.refresh(user)

    # JWT 발급 → 프론트엔드로 리디렉트
    token = create_token({"sub": str(user.id)})
    return RedirectResponse(f"{FRONTEND_URL}/auth/callback?token={token}")


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id), "email": current_user.email,
        "name": current_user.name,  "picture": current_user.picture,
        "plan": current_user.plan,
    }
```

---

### 4-7. main.py

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import FRONTEND_URL
from app.core.database import engine, Base
from app.api.routes import auth, game

Base.metadata.create_all(bind=engine)  # 개발 편의용 자동 테이블 생성

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="AI Dungeon RPG API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth",  tags=["auth"])
app.include_router(game.router, prefix="/api/v1/games", tags=["games"])

@app.get("/health")
def health():
    return {"status": "ok"}
```

---

## 5. 프론트엔드 구현

### 5-1. 페이지 흐름

```
/                 랜딩 — 서비스 소개 + "Google로 시작하기" 버튼
/auth/callback    Google OAuth 콜백 → JWT 저장 → /dashboard 리디렉트
/dashboard        내 게임 목록 (정렬: 최신/턴/레벨, 필터: 전체/진행/완료/사망)
/new-game         세계관 + 캐릭터 생성
/game/:id         ★ 메인 게임 화면 (SSE 스트리밍)
/game/:id/over    게임 오버 화면
/stories          공개 모험 갤러리 (인증 불필요)
/stories/:id      공유 스토리 뷰어
```

### 5-2. 메인 게임 화면 레이아웃

```
┌──────────────────────────────────────────────────────────────────────┐
│  [⚔ AI Dungeon]  [대시보드]  [Lv.3]  [🔥하드코어]  [캐릭터시트]  [♪BGM] │
├─────────────────────────────────────────────┬────────────────────────┤
│                                             │ [상태][퀘스트][NPC][지도] │
│  스토리 출력 (스크롤 가능)                   │                        │
│                                             │ ❤️ HP  80 / 120        │
│  ◆ GM 서술 (타이프라이터 효과)               │ 💎 MP  40 / 40         │
│    **굵게** → 금색                          │ ⭐ XP  45 / 100        │
│    *기울임* → 금색 이탤릭                    │                        │
│                                             │ 인벤토리:              │
│  [아르간 노사] "대사 내용"                   │  [기본 무기]           │
│    └ 골드 좌측 보더, 반투명 배경             │  [포션 1개]            │
│                                             │                        │
│  ▶ 플레이어: **칼을 뽑아 달려든다**          │ 퀘스트:               │
│    └ 금색 이탤릭                            │  ▸ 마을 조사           │
│                                             │                        │
├─────────────────────────────────────────────┤ NPC:                  │
│  [ 자유 텍스트 입력 (행동/대사)        ] [↵] │  아르간 노사 (우호)   │
│  **행동** 또는 일반 대사로 입력하세요        └────────────────────────┘
└──────────────────────────────────────────────────────────────────────┘
```

### 5-3. 핵심 프론트엔드 파일

**`frontend/src/store/authStore.js`** — JWT + 사용자 정보 persist
```js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser:  (user)  => set({ user }),
      logout:   ()      => set({ token: null, user: null }),
    }),
    { name: 'auth-storage' }
  )
)
```

**`frontend/src/pages/auth/Callback.jsx`** — OAuth 콜백 처리
```jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../lib/api'

export default function Callback() {
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    const error  = params.get('error')

    if (error || !token) {
      navigate('/?error=' + (error || 'no_token'))
      return
    }
    setToken(token)
    api.get('/auth/me', token)
      .then(user => { setUser(user); navigate('/dashboard') })
      .catch(()  => navigate('/?error=auth_failed'))
  }, [])

  return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>
    <p>로그인 처리 중...</p>
  </div>
}
```

**`frontend/src/lib/api.js`** — API 통신 헬퍼
```js
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export function getToken() {
  try {
    return JSON.parse(localStorage.getItem('auth-storage'))?.state?.token
  } catch { return null }
}

const req = async (method, path, body, token) => {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw Object.assign(new Error(await res.text()), { status: res.status })
  return res.json()
}

export const api = {
  get:    (path, token)       => req('GET',    path, null, token),
  post:   (path, body, token) => req('POST',   path, body, token),
  delete: (path, token)       => req('DELETE', path, null, token),
}
```

---

## 6. 핵심 시스템 흐름

### 6-1. SSE 스트리밍 전체 흐름

```
[프론트엔드] 플레이어 입력 → POST /games/{id}/action
                                     │
                              FastAPI StreamingResponse
                                     │
         data: {"text": "검을 꽉 쥐었다."}     ← Qwen3 스트리밍 청크
         data: {"text": " 발이 땅을 박찼다."}
         ...
         data: {"done": true, "character": {...}, "world": {...}}
                                     │
[프론트엔드] useStream.js
    ├── data.text → appendStream() → StreamText 타이프라이터 렌더링
    └── data.done → updateCharacter() → StatusPanel HP/MP 플래시 애니메이션
                    updateWorld()     → NPC/장소 목록 갱신
```

### 6-2. 컨텍스트 압축

```
매 턴 끝:
  전체 히스토리 토큰 합산 (4글자 = 1토큰 근사)
      │
  8,000 초과?
  ├── NO  → 최근 10턴 전부 모델에 전달
  └── YES → Qwen3로 오래된 기록 요약 생성
             → game.summary 저장
             → 이후: [요약] + 최근 10턴만 전달
```

### 6-3. 상태 추출 파이프라인

```
Qwen3 원문 응답
    │
parse_state_changes()  → 정규식으로 ```json ... ``` 블록 추출
    │
apply_state_changes()  → 캐릭터 JSON에 변화 적용
    ├── HP/MP 클램핑 (0 이하 방지)
    ├── 레벨업 체크 (XP >= xp_to_next → 레벨업, 전 스탯 +보너스)
    ├── 인벤토리 add/remove
    ├── 퀘스트 add/remove
    ├── NPC add / attitude_change 누적
    └── 하드코어 + HP=0 → game.status = "dead"
    │
apply_world_changes()  → world JSON에 NPC·장소 누적
    │
game.character_json, game.world_json 업데이트 → DB 저장
```

### 6-4. Web Audio API BGM 전환

```
게임 상태 변화 감지
    ├── in_battle: true  → battle 모드 (E단조, sawtooth 파형, 긴박)
    ├── in_battle: false → calm 모드 (A단조, sine 파형, 신비)
    └── game.status: "dead" → gameover 모드 (D단조, 낮고 처연)

SFX 이벤트 트리거:
    ├── inventory_add 발생    → item chime (부드러운 종소리)
    ├── 레벨업 발생          → levelup arpeggio (상승 화음)
    ├── 전투 돌입            → combat metallic (톱니파)
    └── 스트리밍 오류        → error sound (하강 사인파)
```

---

## 7. Qwen3 주의사항

### 7-1. thinking 모드 비활성화 (절대 필수)

```python
# 모든 completions.create() 호출에 반드시 추가
extra_body={"thinking": {"type": "disabled"}}

# 미추가 시 GM 응답 예시 (오염된 출력):
# <think>
# 플레이어가 칼을 뽑았다. 적에게 달려드는 상황이므로...
# </think>
# 검을 꽉 쥐었다. 발이 땅을 박찼다...
```

### 7-2. 성능 관련 설정값

| 설정 | 값 | 이유 |
|---|---|---|
| `max_tokens` (GM 응답) | 1400 | 서사 3~5문단 + JSON 블록 수용 |
| `max_tokens` (요약) | 512 | 요약은 짧아도 충분 |
| `max_tokens` (오프닝) | 768 | 오프닝 3~4문단 |
| TOKEN_LIMIT (압축 임계) | 8,000 | Qwen3-6B 로컬 속도 고려 |

> Qwen3-6B는 32K 컨텍스트를 지원하지만 로컬 환경에서 긴 컨텍스트는 응답이 느립니다.  
> 8,000 토큰 임계값은 품질과 속도의 균형점입니다.

### 7-3. 한국어 출력 품질

Qwen3는 한국어를 잘 지원하지만 간혹 한자·일본어가 섞일 수 있습니다.  
원본의 `text_sanitizer.py`가 이를 정제합니다. **반드시 유지**해야 합니다.

---

## 8. 설치 및 실행

### 8-1. 백엔드 초기화

```bash
# 1. 레포 클론
git clone https://github.com/iringsoya-gif/ai-dungeon-rpg.git
cd ai-dungeon-rpg/backend

# 2. 환경변수 설정
cat > .env << 'EOF'
SECRET_KEY=       # python -c "import secrets; print(secrets.token_hex(32))" 결과
DATABASE_URL=sqlite:///./dungeon.db
GOOGLE_CLIENT_ID=      # Google Cloud Console에서 복사
GOOGLE_CLIENT_SECRET=  # Google Cloud Console에서 복사
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/callback
LM_STUDIO_BASE_URL=http://localhost:1234/v1
LM_STUDIO_API_KEY=lm-studio
LM_STUDIO_MODEL=qwen3-6b
FRONTEND_URL=http://localhost:5173
EOF

# 3. pyproject.toml에서 groq → openai 교체
# groq>=0.11.0 줄 삭제, openai>=1.35.0 추가

# 4. 의존성 설치
uv sync

# 5. DB 초기화
uv run alembic upgrade head
# 또는 main.py의 Base.metadata.create_all로 자동 생성

# 6. 서버 실행
uv run fastapi dev app/main.py
# → http://localhost:8000
# → http://localhost:8000/docs
```

### 8-2. 프론트엔드 초기화

```bash
cd ../frontend
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
npm install
npm run dev
# → http://localhost:5173
```

### 8-3. LMStudio 서버 확인

```bash
# LMStudio 서버 실행 중인지 확인
curl http://localhost:1234/v1/models

# 한국어 출력 직접 테스트
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3-6b",
    "messages": [{"role":"user","content":"안녕하세요! 한국어로 짧게 인사해주세요."}],
    "max_tokens": 100,
    "stream": false,
    "thinking": {"type": "disabled"}
  }'
```

### 8-4. 전체 실행 순서

```
1. LMStudio 실행 → qwen3-6b 모델 선택 → Local Server Start
2. cd backend && uv run fastapi dev app/main.py
3. cd frontend && npm run dev
4. 브라우저: http://localhost:5173
5. "Google로 시작하기" 클릭 → Google 로그인 → 게임 시작
```

---

## 9. 구현 Phase별 체크리스트

### Phase 1 — 환경 세팅 (1~2일)

- [ ] 레포 클론 확인
- [ ] LMStudio qwen3-6b 모델 다운로드 + 서버 실행
- [ ] Google Cloud Console OAuth 앱 등록 + 리디렉션 URI 설정
- [ ] `backend/.env` 파일 생성 (LMStudio + Google + SECRET_KEY)
- [ ] `frontend/.env` 파일 생성
- [ ] `pyproject.toml` — `groq` 제거, `openai>=1.35.0` 추가
- [ ] `config.py` — `GROQ_API_KEY` → `LM_STUDIO_*` 환경변수로 교체
- [ ] DB 모델 UUID → TEXT 타입 변경 (SQLite 호환)
- [ ] `uv sync` + DB 초기화 (`alembic upgrade head`)
- [ ] LMStudio curl 테스트 통과

### Phase 2 — LMStudio 연결 + 인증 (2~3일)

- [ ] `ai_gm.py` — `Groq/AsyncGroq` → `OpenAI/AsyncOpenAI(base_url=...)` 교체
- [ ] 모든 completions 호출에 `extra_body={"thinking":{"type":"disabled"}}` 추가
- [ ] `generate_opening()` 직접 테스트 → 한국어 오프닝 생성 확인
- [ ] `auth.py` Google OAuth 라우트 동작 확인
  - 브라우저로 `http://localhost:8000/api/v1/auth/login` 접속 → Google 동의 화면 진입
  - 로그인 완료 후 `http://localhost:5173/auth/callback?token=...` 리디렉트 확인
- [ ] `authStore.js` + `Callback.jsx` 구현
- [ ] `Landing.jsx` — "Google로 시작하기" 버튼 (href: `/api/v1/auth/login`)
- [ ] `/dashboard` 접근 시 로그인 여부 확인

### Phase 3 — 게임 생성 플로우 (2~3일)

- [ ] `NewGame.jsx` 전체 구현
  - 세계관 템플릿 5종 카드 선택 UI
  - 직업 20종 선택 (CLASS_STATS 기반)
  - 배경 스토리 프리셋 칩 (직업별 2개)
  - 하드코어 모드 토글
- [ ] `POST /api/v1/games` 테스트
  - LMStudio 오프닝 생성 확인 (1~3초 내 응답)
  - DB에 game, history(오프닝) 저장 확인
- [ ] `Dashboard.jsx` — 게임 목록, 정렬/필터 UI

### Phase 4 — 메인 게임 화면 (4~5일)

- [ ] `Game.jsx` 기본 레이아웃 (좌: 스토리 영역, 우: StatusPanel)
- [ ] `useStream.js` — SSE 수신 + HttpError 재시도 로직
- [ ] `StreamText.jsx` — requestAnimationFrame 타이프라이터 (3글자/프레임)
- [ ] `POST /api/v1/games/{id}/action` → Qwen3 스트리밍 동작 확인
- [ ] `MarkdownText` — `**굵게**` 금색, `*기울임*` 금색 이탤릭
- [ ] NPC 대화 블록 `[이름] "대사"` 파싱 + 골드 좌측 보더 렌더링
- [ ] `StatusPanel.jsx` — 4탭 (상태/퀘스트/NPC/지도) + 뱃지 카운트
- [ ] HP/MP/XP 스탯 플래시 애니메이션 (CSS keyframes)
- [ ] `CharacterSheet.jsx` — 팝업 + Esc 닫기
- [ ] `gameStore.js` 구현

### Phase 5 — 게임 시스템 완성 (2~3일)

- [ ] 레벨업 처리 + SFX levelup 트리거
- [ ] 하드코어 모드 → game.status="dead" → `/game/:id/over` 리디렉트
- [ ] 일반 모드 사망 패널티 (`apply_death_penalty`)
- [ ] 컨텍스트 압축 동작 확인 (8,000 토큰 초과 시)
- [ ] `useBGM.js` — calm/battle/gameover 전환 + SFX
- [ ] 스토리 내보내기 (.txt 다운로드 버튼)
- [ ] `GameOver.jsx` 구현

### Phase 6 — 갤러리 + 마무리 (1~2일)

- [ ] `Stories.jsx` 공개 모험 갤러리
- [ ] `Story.jsx` 공유 스토리 뷰어
- [ ] Rate limit 동작 확인 (15req/min)
- [ ] 프롬프트 인젝션 방어 확인
- [ ] 전체 플로우 E2E 테스트

---

## 10. 변경 불필요 원본 파일

다음 파일은 **그대로 복사해서 사용** — 수정 불필요:

| 파일 | 이유 |
|---|---|
| `context_manager.py` | 토큰 계산·압축 로직 모델 무관 |
| `state_manager.py` | JSON 파싱·상태 적용 로직 모델 무관 |
| `text_sanitizer.py` | 한국어 정제 로직 동일 |
| `deps.py` | JWT 검증 로직 동일 |
| `security.py` | JWT 생성/검증 동일 |
| `useStream.js` | SSE 수신 로직 API 무관 |
| `useBGM.js` | Web Audio API 순수 프론트엔드 |
| `StreamText.jsx` | 타이프라이터 순수 UI |
| `StatusPanel.jsx` | 상태 패널 UI |
| `CharacterSheet.jsx` | 캐릭터 시트 UI |

---

## 11. 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| `ConnectionRefusedError` | LMStudio 서버 꺼짐 | LMStudio 열고 Local Server Start |
| GM 응답에 `<think>` 태그 | thinking 미비활성화 | `extra_body={"thinking":{"type":"disabled"}}` 추가 |
| `redirect_uri_mismatch` | Google Console URI 불일치 | Console에서 `http://localhost:8000/api/v1/auth/callback` 정확히 등록 |
| UUID 관련 SQLAlchemy 오류 | PostgreSQL UUID 타입 사용 | 모델 `UUID` → `Text` 변경 (섹션 4-5) |
| JSON 파싱 실패, 상태 안 갱신 | Qwen3 JSON 형식 불준수 | `parse_state_changes()` 기본값으로 폴백 (정상 동작), 프롬프트 출력 형식 섹션 유지 |
| `RuntimeError: 필수 환경변수 누락` | `.env` 미설정 | `config.py`의 `_REQUIRED` 목록 참고해서 `.env` 보완 |
| 한국어에 한자·일본어 섞임 | LMStudio 모델 출력 특성 | `text_sanitizer.py` 유지 (원본 그대로) |

---

*plan.md 끝 — Phase 1부터 순서대로 진행. LMStudio 서버가 항상 먼저 실행된 상태여야 함.*
