# PLAN.md

# Refrigerator Madrake / FridgeChef 로컬 웹앱 재작성 계획

**대상 저장소:** `Kimwoojin-pnu/refrigerator-madrake`  
**목표:** 기존 FridgeChef 프로젝트를 결제 시스템 없이, SQLite 기반 로컬 실행 웹앱으로 재구성한다.  
**프론트엔드 방향:** Next.js + Tailwind CSS + shadcn/ui 스타일 시스템  
**백엔드 방향:** FastAPI + SQLAlchemy + SQLite  
**디자인 방향:** 첨부된 `DESIGN-claude.md`의 warm canvas / coral CTA / dark product surface 스타일을 FridgeChef에 맞게 적용  
**배포 방향:** Vercel, Railway 등 외부 배포 우선이 아니라 로컬 실행 중심  
**결제 방향:** Polar, checkout, subscription, paid tier 제한 제거  

---

## 1. 프로젝트 재작성 목표

이 프로젝트는 사용자가 냉장고 속 재료를 등록하고, 보유 재료 기반 레시피 추천, 식단 생성, 장보기 목록 생성을 할 수 있는 웹앱이다.

이번 재작성의 핵심 목표는 다음과 같다.

1. **결제 시스템 제거**
   - Polar checkout 제거
   - Webhook 기반 구독 갱신 제거
   - 유료 tier 제한 제거
   - pricing CTA는 결제가 아니라 기능 소개 또는 시작하기 버튼으로 변경

2. **SQLite 기반 로컬 DB 사용**
   - 로컬 개발자가 별도 DB 서버 없이 실행 가능하게 구성
   - `backend/data/fridgechef.db` 또는 `backend/local_data/fridgechef.db` 사용
   - 기존 SQLAlchemy 모델은 최대한 유지

3. **로컬 실행 가능한 웹앱으로 정리**
   - 백엔드: `uvicorn app.main:app --reload`
   - 프론트엔드: `pnpm dev`
   - 프론트엔드 API base URL은 `http://localhost:8000`

4. **첨부 디자인 + shadcn 스타일 적용**
   - warm cream canvas
   - coral primary CTA
   - dark navy product/mockup surface
   - card 중심 UI
   - serif display headline + Inter body
   - shadcn/ui 컴포넌트 방식으로 재사용 가능한 UI 구조화

5. **기존 기능은 가능한 한 유지**
   - 로그인
   - 냉장고 재료 관리
   - 공통 식재료 검색
   - 레시피 조회/추천
   - 식단 생성
   - 장보기 목록 생성
   - 설정 화면

---

## 2. 현재 저장소 구조 분석

GitHub 저장소 기준으로 최상위 구조는 다음과 같다.

```txt
refrigerator-madrake/
├── backend/
├── frontend/
├── .gitignore
├── README.md
└── railway.toml
```

현재 저장소는 크게 `backend`와 `frontend`로 분리되어 있다.

---

## 3. Backend 구조 분석

현재 `backend/` 구조는 다음과 같다.

```txt
backend/
├── app/
│   ├── __init__.py
│   ├── database.py
│   ├── main.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── deps.py
│   │   └── security.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── fridge.py
│   │   ├── ingredient.py
│   │   ├── meal_plan.py
│   │   ├── recipe.py
│   │   └── user.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── fridge.py
│   │   ├── ingredients.py
│   │   ├── meal_plan.py
│   │   ├── payments.py
│   │   ├── recipes.py
│   │   ├── shopping.py
│   │   └── webhooks.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── fridge.py
│   │   ├── meal_plan.py
│   │   ├── recipe.py
│   │   └── user.py
│   └── services/
│       ├── __init__.py
│       ├── meal_planner.py
│       ├── polar.py
│       ├── recipe_matcher.py
│       └── shopping_list.py
├── data/
│   └── recipe_seed.json
├── .env.example
├── Dockerfile
└── requirements.txt
```

### 3.1 Backend 현재 역할

| 경로 | 현재 역할 | 유지/수정 방향 |
|---|---|---|
| `app/main.py` | FastAPI 앱 생성, 라우터 등록, DB 초기화, seed 실행, scheduler 실행 | 결제 라우터 제거, SQLite seed 유지 |
| `app/database.py` | SQLAlchemy engine/session/base 구성 | SQLite 경로를 로컬 중심으로 정리 |
| `app/core/config.py` | 환경변수 설정 | Polar/Railway/Vercel 관련 설정 제거 |
| `app/core/deps.py` | DB 세션, 현재 사용자 의존성 | 유지 |
| `app/core/security.py` | JWT/password/token 관련 보안 유틸 | 유지 |
| `app/models/*` | SQLAlchemy ORM 모델 | 결제 관련 필드만 최소화 또는 비활성화 |
| `app/routers/auth.py` | 인증 API | 유지 |
| `app/routers/fridge.py` | 냉장고 API | 유지 |
| `app/routers/ingredients.py` | 공통 식재료 API | 유지 |
| `app/routers/recipes.py` | 레시피 API | 유지 |
| `app/routers/meal_plan.py` | 식단 API | 유지 |
| `app/routers/shopping.py` | 장보기 API | 유지 |
| `app/routers/payments.py` | Polar checkout API | 제거 |
| `app/routers/webhooks.py` | Polar webhook API | 제거 또는 비활성화 |
| `app/services/polar.py` | Polar signature 검증 | 제거 |
| `app/services/meal_planner.py` | 식단 생성 로직 | 유지 |
| `app/services/recipe_matcher.py` | 재료 기반 레시피 매칭 | 유지 |
| `app/services/shopping_list.py` | 장보기 목록 생성 | 유지 |
| `backend/data/recipe_seed.json` | 초기 레시피 seed 데이터 | 유지 |

---

## 4. Frontend 구조 분석

현재 `frontend/` 구조는 다음과 같다.

```txt
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (main)/
│   │   │   ├── dashboard/
│   │   │   ├── meal-plan/
│   │   │   ├── recipes/
│   │   │   ├── settings/
│   │   │   ├── shopping/
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   └── TokenSync.tsx
│   │   ├── fridge/
│   │   │   ├── AddIngredientModal.tsx
│   │   │   ├── BulkAddModal.tsx
│   │   │   └── IngredientCard.tsx
│   │   ├── ui/
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   └── Navbar.tsx
│   │   └── providers.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── tier.ts
│   │   └── utils.ts
│   ├── stores/
│   │   ├── fridgeStore.ts
│   │   └── mealPlanStore.ts
│   ├── types/
│   │   ├── index.ts
│   │   └── next-auth.d.ts
│   └── proxy.ts
├── package.json
├── next.config.ts
├── tsconfig.json
├── vercel.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── eslint.config.mjs
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

### 4.1 Frontend 현재 역할

| 경로 | 현재 역할 | 유지/수정 방향 |
|---|---|---|
| `src/app/page.tsx` | 랜딩 페이지 | 결제/가격 CTA 제거, 디자인 리뉴얼 |
| `src/app/(auth)/login` | 로그인 페이지 | 유지, 디자인 리뉴얼 |
| `src/app/(main)/dashboard` | 메인 대시보드 | 유지, 카드 UI 강화 |
| `src/app/(main)/recipes` | 레시피 화면 | 유지 |
| `src/app/(main)/meal-plan` | 식단 화면 | 유지, paid 제한 제거 |
| `src/app/(main)/shopping` | 장보기 화면 | 유지, paid 제한 제거 |
| `src/app/(main)/settings` | 설정 화면 | 결제/구독 정보 제거 |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth API route | 유지 |
| `src/components/auth/TokenSync.tsx` | NextAuth token과 백엔드 token 동기화 | 유지 |
| `src/components/fridge/*` | 냉장고 관련 컴포넌트 | shadcn 기반으로 리팩터링 |
| `src/components/ui/*` | 자체 UI 컴포넌트 | shadcn/ui 스타일로 확장 또는 대체 |
| `src/lib/api.ts` | API client | 로컬 백엔드 URL 기준 정리 |
| `src/lib/auth.ts` | 인증 설정 | 유지 |
| `src/lib/tier.ts` | 유료 tier 접근 제한 | 제거 또는 항상 true 처리 |
| `src/stores/*` | Zustand 상태 관리 | 유지 |
| `src/types/*` | 타입 정의 | 결제/tier 타입 정리 |
| `vercel.json` | Vercel 배포 설정 | 로컬 중심이면 제거 또는 무시 |

---

## 5. 삭제하거나 비활성화할 결제 시스템

이번 작업에서 결제 시스템은 완전히 제외한다.

### 5.1 제거 대상 Backend

```txt
backend/app/routers/payments.py
backend/app/routers/webhooks.py
backend/app/services/polar.py
```

### 5.2 수정 대상 Backend

```py
# backend/app/main.py
from app.routers import auth, fridge, recipes, meal_plan, shopping, webhooks, ingredients, payments
```

위 import에서 `payments`, `webhooks`를 제거한다.

```py
# 제거 전
app.include_router(webhooks.router, prefix="/v1/webhooks", tags=["webhooks"])
app.include_router(payments.router, prefix="/v1/payments", tags=["payments"])

# 제거 후
# 결제/웹훅 라우터 등록 없음
```

### 5.3 제거 대상 설정값

`backend/app/core/config.py`와 `.env.example`에서 다음과 같은 결제 관련 값을 제거한다.

```env
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_CHECKOUT_URL_STANDARD=
POLAR_CHECKOUT_URL_PROFESSIONAL=
```

### 5.4 수정 대상 Frontend

```txt
frontend/src/lib/tier.ts
frontend/src/app/page.tsx
frontend/src/app/(main)/settings
```

#### `src/lib/tier.ts` 처리 방향

기존 paid tier 제한은 제거한다.

```ts
// 가장 단순한 처리
export function hasAccess(): boolean {
  return true
}
```

또는 tier 개념 자체를 제거하고, 관련 import를 모두 삭제한다.

#### 랜딩 페이지 pricing 처리

기존 `PRICING` 섹션은 다음 중 하나로 바꾼다.

1. **기능 소개 섹션**
   - 냉장고 관리
   - 레시피 추천
   - 주간 식단
   - 장보기 목록

2. **로컬 MVP 안내 섹션**
   - 무료 로컬 실행
   - SQLite 저장
   - Google 로그인 선택 가능
   - 외부 결제 없음

#### 설정 페이지 처리

설정 페이지에서 결제/플랜 관리 UI를 제거하고 다음 항목만 남긴다.

- 프로필 정보
- 기본 인원수
- 선호/비선호 재료
- 알림 옵션
- 데이터 초기화
- 로그아웃

---

## 6. SQLite 전환 계획

현재 backend는 이미 SQLAlchemy를 사용하고 있으며, `requirements.txt`에도 `sqlalchemy`가 포함되어 있다. 따라서 DB 레이어를 새로 만들기보다 SQLite 설정을 로컬 중심으로 정리한다.

### 6.1 목표 DB 경로

권장 경로는 다음과 같다.

```txt
backend/data/fridgechef.db
```

또는 개발 DB와 seed JSON을 분리하고 싶다면 다음도 가능하다.

```txt
backend/local_data/fridgechef.db
backend/data/recipe_seed.json
```

### 6.2 `.env.example` 권장값

```env
APP_ENV=local
DATABASE_URL=sqlite:///./data/fridgechef.db
SECRET_KEY=change-this-local-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

BACKEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change-this-nextauth-secret
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 6.3 `database.py` 권장 구현

```py
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL or "sqlite:///./data/fridgechef.db"

if DATABASE_URL.startswith("sqlite:///"):
    db_file = DATABASE_URL.replace("sqlite:///", "", 1)
    db_path = Path(db_file)
    if not db_path.is_absolute():
        db_path = Path.cwd() / db_path
    db_path.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 6.4 SQLite에서 주의할 점

- 로컬 MVP에서는 SQLite로 충분하다.
- 동시 접속이 많은 production 환경이면 PostgreSQL을 고려한다.
- 마이그레이션은 MVP에서는 `Base.metadata.create_all()` + 간단한 `ALTER TABLE`로 처리 가능하다.
- 장기적으로는 Alembic 도입 가능하지만, 과제/로컬 프로젝트에서는 과할 수 있다.

---

## 7. 디자인 시스템 적용 계획

첨부된 `DESIGN-claude.md`의 핵심은 다음이다.

- warm cream canvas
- muted coral primary CTA
- dark navy product/mockup surface
- serif display headline
- humanist sans body
- generous spacing
- card-based editorial layout

이를 FridgeChef에 맞게 다음처럼 변환한다.

### 7.1 Design Token

```css
:root {
  --canvas: #faf9f5;
  --surface-soft: #f5f0e8;
  --surface-card: #efe9de;
  --surface-cream-strong: #e8e0d2;

  --ink: #141413;
  --body: #3d3d3a;
  --muted: #6c6a64;
  --muted-soft: #8e8b82;

  --primary: #cc785c;
  --primary-active: #a9583e;
  --primary-disabled: #e6dfd8;

  --surface-dark: #181715;
  --surface-dark-elevated: #252320;
  --surface-dark-soft: #1f1e1b;

  --on-primary: #ffffff;
  --on-dark: #faf9f5;
  --on-dark-soft: #a09d96;

  --success: #5db872;
  --warning: #d4a017;
  --error: #c64545;
  --hairline: #e6dfd8;
}
```

### 7.2 Tailwind v4 Theme 방향

`frontend/src/app/globals.css`에서 Tailwind v4의 CSS variable 중심 테마를 구성한다.

```css
@import "tailwindcss";

@theme {
  --color-canvas: #faf9f5;
  --color-card: #efe9de;
  --color-ink: #141413;
  --color-body: #3d3d3a;
  --color-muted: #6c6a64;
  --color-primary: #cc785c;
  --color-primary-active: #a9583e;
  --color-dark: #181715;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

### 7.3 Font 방향

라이선스 폰트는 포함하지 않는다.

권장 오픈소스 대체:

```txt
Display: Cormorant Garamond 또는 EB Garamond
Body: Inter
Code: JetBrains Mono
```

Next.js font 설정 예시:

```ts
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google"
```

### 7.4 FridgeChef에 맞는 컴포넌트 룩

| 컴포넌트 | 디자인 방향 |
|---|---|
| Hero | cream canvas + serif headline + coral CTA |
| Dashboard card | cream card + 12px radius + soft hairline |
| Ingredient card | ingredient category badge + expiration status |
| Recipe card | image/emoji 없이도 editorial card로 구성 |
| Meal plan card | dark navy card를 일부 사용해 product surface 느낌 |
| Shopping list | checklist card + muted separators |
| Modal | shadcn Dialog + cream surface |
| Form | shadcn Input/Select/Button + coral focus ring |
| Navbar | cream nav + small brand mark + route links |
| Empty state | coral badge + serif headline + action button |

---

## 8. shadcn/ui 도입 계획

현재 프로젝트에는 `src/components/ui/Button.tsx`, `Badge.tsx`, `Navbar.tsx` 같은 자체 UI가 있다. shadcn/ui를 도입할 때는 기존 구조를 완전히 버리기보다 다음 방식이 좋다.

### 8.1 설치

```bash
cd frontend
pnpm dlx shadcn@latest init
```

권장 설정:

```txt
Style: default 또는 new-york
Base color: neutral
CSS variables: yes
React Server Components: yes
Tailwind CSS: v4 환경에 맞춰 globals.css 중심 설정
Import alias: @/*
```

### 8.2 우선 추가할 컴포넌트

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add label
pnpm dlx shadcn@latest add textarea
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add sheet
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add separator
pnpm dlx shadcn@latest add toast
pnpm dlx shadcn@latest add skeleton
pnpm dlx shadcn@latest add alert
```

### 8.3 기존 UI와의 호환 전략

| 기존 컴포넌트 | 처리 방향 |
|---|---|
| `Button.tsx` | shadcn button wrapper로 교체 |
| `Badge.tsx` | shadcn badge wrapper로 교체 |
| `Navbar.tsx` | 직접 유지하되 shadcn button/sheet/dropdown-menu 사용 |
| `AddIngredientModal.tsx` | shadcn dialog + input + select로 리팩터링 |
| `BulkAddModal.tsx` | shadcn dialog + textarea로 리팩터링 |
| `IngredientCard.tsx` | shadcn card + badge + button으로 리팩터링 |

---

## 9. 목표 기능 정의

### 9.1 인증

#### 유지 기능

- Google OAuth 로그인
- NextAuth session
- 백엔드 JWT token sync

#### 로컬 개발 대안

Google OAuth 설정이 어려운 경우를 위해 `DEMO_LOGIN=true` 옵션을 두는 것을 추천한다.

```env
DEMO_LOGIN=true
```

Demo login은 과제/로컬 시연용이며, production 기능으로 간주하지 않는다.

### 9.2 냉장고 관리

사용자가 재료를 등록, 수정, 삭제할 수 있다.

필수 필드:

```txt
name
category
quantity
unit
expires_at
is_condiment
memo
```

주요 UX:

- 재료 추가 모달
- 여러 재료 일괄 추가
- 카테고리 필터
- 유통기한 임박 badge
- 수량 부족 badge
- 재료 카드 grid

### 9.3 공통 식재료

기존 seed를 활용해 자주 쓰는 재료를 빠르게 선택한다.

기능:

- 이름 자동완성
- 카테고리별 필터
- 기본 단위 자동 입력
- 상비 조미료 여부 표시

### 9.4 레시피

기능:

- 레시피 목록
- 레시피 상세
- 냉장고 재료 기반 매칭률 표시
- 부족 재료 표시
- 레시피 좋아요 또는 저장
- public seed recipe 유지

### 9.5 식단 생성

결제 제한 없이 모든 사용자가 사용 가능해야 한다.

기능:

- 기간 선택: 3일 / 7일
- 식사 유형: 아침 / 점심 / 저녁
- 보유 재료 우선 사용
- 유통기한 임박 재료 우선 사용
- 생성된 식단 저장

### 9.6 장보기 목록

기능:

- 식단 기준 부족 재료 자동 계산
- 수동 항목 추가/삭제
- 체크 완료 처리
- 카테고리별 grouping
- JSON 또는 CSV export는 선택 기능

### 9.7 설정

결제/구독 정보를 제거하고 사용자 환경 설정만 남긴다.

기능:

- 기본 인원 수
- 선호 카테고리
- 알레르기/비선호 재료
- 데이터 초기화
- 로그아웃

---

## 10. API 설계

기존 API prefix는 유지한다.

```txt
/v1/auth
/v1/fridge
/v1/ingredients
/v1/recipes
/v1/meal-plan
/v1/shopping
```

삭제 API:

```txt
/v1/payments
/v1/webhooks/polar
/v1/webhooks/polar/test
```

### 10.1 Auth API

| Method | Path | 설명 |
|---|---|---|
| POST | `/v1/auth/google` | Google token 검증 후 backend token 발급 |
| GET | `/v1/auth/me` | 현재 사용자 조회 |
| PATCH | `/v1/auth/me/preferences` | 사용자 설정 변경 |

### 10.2 Fridge API

| Method | Path | 설명 |
|---|---|---|
| GET | `/v1/fridge/items` | 내 냉장고 재료 목록 |
| POST | `/v1/fridge/items` | 재료 추가 |
| PATCH | `/v1/fridge/items/{id}` | 재료 수정 |
| DELETE | `/v1/fridge/items/{id}` | 재료 삭제 |
| POST | `/v1/fridge/items/bulk` | 여러 재료 추가 |

### 10.3 Ingredients API

| Method | Path | 설명 |
|---|---|---|
| GET | `/v1/ingredients/common` | 공통 식재료 목록 |
| GET | `/v1/ingredients/search?q=` | 식재료 검색 |

### 10.4 Recipes API

| Method | Path | 설명 |
|---|---|---|
| GET | `/v1/recipes` | 레시피 목록 |
| GET | `/v1/recipes/{id}` | 레시피 상세 |
| GET | `/v1/recipes/recommendations` | 보유 재료 기반 추천 |
| POST | `/v1/recipes/{id}/like` | 좋아요 |
| DELETE | `/v1/recipes/{id}/like` | 좋아요 취소 |

### 10.5 Meal Plan API

| Method | Path | 설명 |
|---|---|---|
| GET | `/v1/meal-plan` | 저장된 식단 조회 |
| POST | `/v1/meal-plan/generate` | 식단 자동 생성 |
| POST | `/v1/meal-plan` | 식단 저장 |
| DELETE | `/v1/meal-plan/{id}` | 식단 삭제 |

### 10.6 Shopping API

| Method | Path | 설명 |
|---|---|---|
| GET | `/v1/shopping` | 장보기 목록 조회 |
| POST | `/v1/shopping/generate` | 부족 재료 기반 생성 |
| POST | `/v1/shopping/items` | 수동 항목 추가 |
| PATCH | `/v1/shopping/items/{id}` | 체크/수정 |
| DELETE | `/v1/shopping/items/{id}` | 삭제 |

---

## 11. DB 모델 정리 계획

기존 모델을 유지하되 결제 필드는 제거하거나 사용하지 않는다.

### 11.1 User

권장 필드:

```txt
id
email
name
image_url
provider
created_at
updated_at
default_servings
preferences_json
```

제거 또는 미사용 필드:

```txt
tier
tier_expires_at
polar_sub_id
```

간단히 유지하되 기능에서 사용하지 않는 방법도 가능하다. 가장 깔끔한 방법은 새 SQLite DB를 만들 때 결제 필드를 제외하는 것이다.

### 11.2 FridgeItem

```txt
id
user_id
common_ingredient_id nullable
name
category
quantity
unit
expires_at
is_condiment
memo
created_at
updated_at
```

### 11.3 CommonIngredient

```txt
id
name
category
default_unit
is_condiment
```

### 11.4 Recipe

```txt
id
name
category
cooking_time
calories
instructions
is_public
likes
created_by_user_id nullable
created_at
updated_at
```

### 11.5 RecipeIngredient

```txt
id
recipe_id
common_ingredient_id nullable
custom_name
quantity
unit
is_condiment
```

### 11.6 MealPlan

```txt
id
user_id
date
meal_type
recipe_id
servings
created_at
```

### 11.7 ShoppingListItem

```txt
id
user_id
name
category
quantity
unit
checked
source
created_at
updated_at
```

---

## 12. 화면별 구현 계획

## 12.1 Landing Page `/`

### 목표

사용자가 서비스의 가치를 이해하고 로그인 또는 대시보드로 진입하게 만든다.

### 섹션 구성

1. Top Navigation
2. Hero
3. Feature Cards
4. Product Mockup / Dashboard Preview
5. How it Works
6. No Payment / Local SQLite Callout
7. CTA
8. Footer

### 디자인 상세

- 배경: `#faf9f5`
- Hero headline: serif 64px
- CTA: coral button
- Preview mockup: dark navy card
- Feature card: cream card
- Pricing section: 제거

### Hero 문구 예시

```txt
냉장고 속 재료로 오늘의 식단을 완성하세요.

FridgeChef는 보유 재료를 기준으로 레시피와 장보기 목록을 자동으로 정리해주는 로컬 우선 식단 관리 웹앱입니다.
```

---

## 12.2 Login Page `/login`

### 구성

- 왼쪽: 서비스 설명 카드
- 오른쪽: 로그인 카드
- Google 로그인 버튼
- Demo login 버튼 선택

### shadcn 컴포넌트

- `Card`
- `Button`
- `Separator`
- `Alert`

---

## 12.3 Dashboard `/dashboard`

### 구성

- 상단 요약 카드 4개
  - 보유 재료 수
  - 유통기한 임박
  - 추천 레시피 수
  - 이번 주 식단 수
- 냉장고 재료 preview
- 오늘 추천 레시피
- 장보기 목록 preview
- 빠른 액션 버튼

### 디자인 포인트

- 전체는 cream canvas
- 주요 카드 중 하나는 dark navy surface로 강조
- 유통기한 임박은 warning badge 사용
- 추천 레시피는 coral badge 사용

---

## 12.4 Fridge `/dashboard` 또는 `/fridge`

현재 라우트 구조에 `fridge`가 별도 페이지로 없는 경우, dashboard 내부 섹션으로 두거나 `src/app/(main)/fridge/page.tsx`를 새로 만드는 것을 추천한다.

### 구성

- 재료 검색/필터
- 재료 추가 버튼
- 일괄 추가 버튼
- 재료 카드 grid
- 유통기한 상태 filter

### 컴포넌트

```txt
AddIngredientDialog
BulkAddDialog
IngredientCard
IngredientCategoryTabs
ExpirationBadge
QuantityEditor
```

---

## 12.5 Recipes `/recipes`

### 구성

- 추천 레시피
- 전체 레시피
- 카테고리 필터
- 보유 재료 매칭률
- 부족 재료 표시
- 상세 dialog 또는 detail page

### 레시피 카드 정보

```txt
레시피명
카테고리
조리시간
칼로리
보유 재료 매칭률
부족 재료 수
CTA: 상세보기 / 식단에 추가
```

---

## 12.6 Meal Plan `/meal-plan`

### 구성

- 날짜 범위 선택
- 3일/7일 식단 생성
- meal type 선택
- 생성 결과 calendar grid
- 식단 저장
- 식단 재생성

### 결제 제한 제거

기존 tier 제한이 있다면 모두 제거한다.

```ts
// 제거
if (!hasAccess(session?.tier, "professional")) ...

// 변경
// 모든 로그인 사용자가 사용 가능
```

---

## 12.7 Shopping `/shopping`

### 구성

- 식단 기반 생성 버튼
- 부족 재료 목록
- 수동 항목 추가
- checked 상태
- 카테고리 grouping
- 전체 완료/삭제

### UX

- 체크된 항목은 muted text + line-through
- 필요한 수량은 badge로 표시
- 상비 조미료는 별도 그룹 처리

---

## 12.8 Settings `/settings`

### 구성

- 프로필 정보
- 기본 인원 수
- 선호/비선호 재료
- 알림 설정
- 데이터 초기화
- 로그아웃

### 제거할 UI

```txt
현재 플랜
구독 상태
결제 관리
업그레이드 버튼
checkout button
```

---

## 13. 프론트엔드 파일별 작업 계획

### 13.1 `src/app/page.tsx`

작업:

- Pricing 데이터를 Feature 데이터로 변경
- 결제 CTA 제거
- warm-canvas 디자인 적용
- dark product preview 추가
- shadcn Button/Card/Badge 사용

### 13.2 `src/app/globals.css`

작업:

- 디자인 토큰 CSS variables 추가
- Tailwind theme token 추가
- body 배경 cream 적용
- selection/focus style 적용
- serif headline utility 추가

### 13.3 `src/components/ui/*`

작업:

- shadcn 컴포넌트 도입
- 기존 `Button`, `Badge` wrapper는 shadcn 기반으로 통일
- `Navbar`는 responsive sheet menu 적용

### 13.4 `src/components/fridge/AddIngredientModal.tsx`

작업:

- Dialog로 변경
- Form field 정리
- category select 추가
- expires_at date input 추가
- validation message 추가

### 13.5 `src/components/fridge/BulkAddModal.tsx`

작업:

- textarea 기반 다중 입력
- 예시 placeholder 제공
- parsing preview 추가

### 13.6 `src/components/fridge/IngredientCard.tsx`

작업:

- Card + Badge 기반 디자인
- 상태 표시:
  - Fresh
  - Expiring Soon
  - Expired
  - Condiment
- 수정/삭제 버튼 정리

### 13.7 `src/lib/api.ts`

작업:

```ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
```

- axios instance 유지
- auth token interceptor 유지
- error handling 표준화

### 13.8 `src/lib/tier.ts`

작업:

- 파일 삭제 또는 항상 true 반환
- 관련 import 제거
- type `Tier`가 필요한 경우 `"free"` 하나만 남김

### 13.9 `src/types/index.ts`

작업:

- 결제/tier 관련 타입 제거
- DB 모델에 맞춘 타입 정리
- `Ingredient`, `Recipe`, `MealPlan`, `ShoppingListItem`, `UserPreferences` 명확화

---

## 14. 백엔드 파일별 작업 계획

### 14.1 `backend/app/main.py`

작업:

- `payments`, `webhooks` import 제거
- payment router include 제거
- CORS local origin 확인
- seed recipe 경로 확인
- scheduler 백업 기능은 유지 가능하나 로컬 MVP에서는 선택

권장 router 등록:

```py
app.include_router(auth.router, prefix="/v1/auth", tags=["auth"])
app.include_router(fridge.router, prefix="/v1/fridge", tags=["fridge"])
app.include_router(ingredients.router, prefix="/v1/ingredients", tags=["ingredients"])
app.include_router(recipes.router, prefix="/v1/recipes", tags=["recipes"])
app.include_router(meal_plan.router, prefix="/v1/meal-plan", tags=["meal-plan"])
app.include_router(shopping.router, prefix="/v1/shopping", tags=["shopping"])
```

### 14.2 `backend/app/database.py`

작업:

- SQLite 경로 로컬화
- 디렉터리 자동 생성
- `check_same_thread=False`
- 상대 경로 처리 안정화

### 14.3 `backend/app/core/config.py`

작업:

- Polar 관련 설정 제거
- Railway/Vercel domain 기본값 제거
- local CORS 기본값 지정
- demo login 옵션 추가 가능

필수 설정:

```py
DATABASE_URL: str = "sqlite:///./data/fridgechef.db"
CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
SECRET_KEY: str
GOOGLE_CLIENT_ID: str | None
```

### 14.4 `backend/app/models/user.py`

작업:

- 결제 필드 제거 또는 미사용 처리
- `default_servings`
- `preferences_json`
- `created_at`, `updated_at`

### 14.5 `backend/app/routers/payments.py`

작업:

- 삭제

### 14.6 `backend/app/routers/webhooks.py`

작업:

- 삭제
- webhook이 나중에 필요하면 `webhooks.py`가 아니라 `integrations.py`로 새로 설계

### 14.7 `backend/app/services/polar.py`

작업:

- 삭제

### 14.8 `.env.example`

작업:

- local 실행 중심으로 재작성
- payment 관련 값 삭제

### 14.9 `requirements.txt`

현재 의존성은 대체로 유지 가능하다.

검토:

```txt
fastapi
uvicorn
sqlalchemy
python-jose
passlib
python-dotenv
httpx
pydantic
pydantic-settings
apscheduler
slowapi
python-multipart
google-auth
requests
reportlab
```

삭제 후보:

- 결제 전용으로만 쓰는 라이브러리가 있다면 제거
- 현재 `polar` SDK는 requirements에 없으므로 큰 수정은 필요 없어 보임

---

## 15. Local 실행 계획

### 15.1 Backend 실행

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt

cp .env.example .env

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

확인:

```txt
http://localhost:8000/health
http://localhost:8000/docs
```

### 15.2 Frontend 실행

```bash
cd frontend

corepack enable
pnpm install

cp .env.example .env.local

pnpm dev
```

확인:

```txt
http://localhost:3000
```

### 15.3 Root 실행 스크립트 선택

루트에 `scripts/dev.sh` 또는 `Makefile`을 추가하면 좋다.

```makefile
dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && pnpm dev
```

또는 Windows 기준:

```ps1
# scripts/dev.ps1
Start-Process powershell -ArgumentList "cd backend; .\.venv\Scripts\activate; uvicorn app.main:app --reload --port 8000"
Start-Process powershell -ArgumentList "cd frontend; pnpm dev"
```

---

## 16. README 재작성 계획

기존 README는 배포 URL 중심으로 간단히 되어 있으므로 로컬 개발 중심으로 재작성한다.

README에 포함할 내용:

1. 프로젝트 소개
2. 기능 목록
3. 기술 스택
4. 디렉터리 구조
5. 환경변수 설정
6. Backend 실행
7. Frontend 실행
8. SQLite DB 위치
9. 초기 recipe seed 방식
10. 결제 시스템 제외 안내
11. 디자인 시스템 요약
12. 문제 해결 FAQ

---

## 17. 구현 순서

## Phase 1. 결제 제거와 로컬 DB 안정화

목표:

- 앱이 결제 없이 실행된다.
- SQLite DB가 자동 생성된다.
- 기존 핵심 API가 정상 동작한다.

작업:

- [ ] `payments.py` 삭제
- [ ] `webhooks.py` 삭제
- [ ] `polar.py` 삭제
- [ ] `main.py`에서 payments/webhooks import 제거
- [ ] `main.py`에서 payments/webhooks router 제거
- [ ] `config.py`에서 Polar 설정 제거
- [ ] `.env.example` local용으로 수정
- [ ] `database.py` SQLite local path 정리
- [ ] `tier` 관련 backend 조건 제거
- [ ] `/health`, `/docs` 확인

완료 기준:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

이 명령으로 서버가 뜨고 `http://localhost:8000/health`가 `{"status":"ok"}`를 반환한다.

---

## Phase 2. Frontend 결제/tier 제거

목표:

- 결제 버튼, pricing upgrade, paid feature 제한이 사라진다.
- 모든 핵심 기능을 무료/local 기능으로 사용할 수 있다.

작업:

- [ ] `src/lib/tier.ts` 제거 또는 항상 true 처리
- [ ] `src/app/page.tsx`의 `PRICING` 제거 또는 기능 섹션화
- [ ] settings 페이지에서 플랜/구독 UI 제거
- [ ] meal-plan/shopping에서 tier guard 제거
- [ ] 결제 API 호출 코드 제거
- [ ] `.env.local.example` local API URL 정리

완료 기준:

```bash
cd frontend
pnpm dev
```

랜딩 페이지에서 결제 관련 문구가 보이지 않아야 한다.

---

## Phase 3. shadcn/ui 도입

목표:

- UI 컴포넌트가 일관된 design system을 사용한다.
- modal, button, card, form UI가 professional하게 보인다.

작업:

- [ ] shadcn init
- [ ] button/card/badge/input/dialog/select/tabs/sheet 등 추가
- [ ] `src/components/ui` 구조 정리
- [ ] `globals.css` 디자인 token 적용
- [ ] 기존 Button/Badge wrapper를 shadcn 기반으로 변경
- [ ] Navbar responsive 처리

완료 기준:

- 랜딩, 로그인, 대시보드, 냉장고 화면에서 동일한 버튼/카드/배지 스타일이 적용된다.

---

## Phase 4. Landing Page 리디자인

목표:

- 첨부 디자인 스타일을 반영한 warm editorial 랜딩 페이지 구현

작업:

- [ ] cream canvas background
- [ ] serif hero headline
- [ ] coral primary CTA
- [ ] dark navy product mockup card
- [ ] feature cards 3-up
- [ ] how-it-works 섹션
- [ ] no-payment/local SQLite callout
- [ ] footer

완료 기준:

- 첫 화면에서 FridgeChef의 핵심 가치가 분명히 보인다.
- 결제 대신 로컬/무료/SQLite 기반 프로젝트임이 명확하다.

---

## Phase 5. Dashboard / Fridge UI 리팩터링

목표:

- 실제 앱 화면을 카드형 dashboard로 정리한다.

작업:

- [ ] dashboard summary cards
- [ ] fridge ingredient grid
- [ ] ingredient add dialog
- [ ] bulk add dialog
- [ ] expiration badge
- [ ] category tabs
- [ ] loading skeleton
- [ ] error alert

완료 기준:

- 재료 추가/수정/삭제가 정상 작동한다.
- UI가 landing page와 같은 디자인 언어를 사용한다.

---

## Phase 6. Recipes / Meal Plan / Shopping 리팩터링

목표:

- 주요 기능 화면을 모두 결제 제한 없이 사용 가능하게 한다.

작업:

- [ ] recipe card 리디자인
- [ ] recipe recommendation matching UI
- [ ] meal-plan calendar/card UI
- [ ] shopping list checklist UI
- [ ] 부족 재료 표시
- [ ] 식단 기반 장보기 생성

완료 기준:

- 냉장고 재료 → 추천 레시피 → 식단 → 장보기 흐름이 데모 가능하다.

---

## Phase 7. 문서화와 최종 점검

작업:

- [ ] README 재작성
- [ ] PLAN.md 추가
- [ ] `.env.example` / `.env.local.example` 추가
- [ ] backend API 테스트
- [ ] frontend lint
- [ ] 새 DB로 seed 재현 확인
- [ ] 스크린샷 추가 선택

완료 기준:

- 새 사용자가 README만 보고 로컬 실행 가능하다.

---

## 18. 권장 최종 구조

```txt
refrigerator-madrake/
├── PLAN.md
├── README.md
├── .gitignore
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── deps.py
│   │   │   └── security.py
│   │   ├── models/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── fridge.py
│   │   │   ├── ingredients.py
│   │   │   ├── meal_plan.py
│   │   │   ├── recipes.py
│   │   │   └── shopping.py
│   │   ├── schemas/
│   │   └── services/
│   │       ├── meal_planner.py
│   │       ├── recipe_matcher.py
│   │       └── shopping_list.py
│   ├── data/
│   │   ├── recipe_seed.json
│   │   └── fridgechef.db
│   ├── .env.example
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/
    │   │   ├── (main)/
    │   │   ├── api/
    │   │   ├── globals.css
    │   │   ├── layout.tsx
    │   │   └── page.tsx
    │   ├── components/
    │   │   ├── auth/
    │   │   ├── fridge/
    │   │   ├── layout/
    │   │   └── ui/
    │   ├── lib/
    │   ├── stores/
    │   └── types/
    ├── .env.local.example
    ├── package.json
    └── components.json
```

삭제 또는 무시할 파일:

```txt
backend/app/routers/payments.py
backend/app/routers/webhooks.py
backend/app/services/polar.py
frontend/vercel.json
railway.toml
```

`frontend/vercel.json`과 `railway.toml`은 삭제하지 않고 남겨도 되지만, 로컬 중심 프로젝트에서는 README에서 사용하지 않는다고 명시한다.

---

## 19. 디자인 적용 상세 체크리스트

### Colors

- [ ] body background: `#faf9f5`
- [ ] primary button: `#cc785c`
- [ ] primary hover/active: `#a9583e`
- [ ] text ink: `#141413`
- [ ] card surface: `#efe9de`
- [ ] dark card: `#181715`
- [ ] dark elevated: `#252320`
- [ ] hairline: `#e6dfd8`

### Typography

- [ ] h1/h2: serif display
- [ ] body/nav/button: Inter
- [ ] h1 letter spacing negative
- [ ] buttons 14px / 500
- [ ] body 16px / 1.55

### Components

- [ ] shadcn Button variant: `default`, `secondary`, `ghost`, `destructive`
- [ ] shadcn Card variant: cream/default/dark wrapper
- [ ] shadcn Badge variant: coral, muted, warning, success
- [ ] shadcn Dialog for modals
- [ ] shadcn Sheet for mobile nav
- [ ] shadcn Tabs for category filters
- [ ] shadcn Alert for error/empty state
- [ ] shadcn Skeleton for loading state

### Layout

- [ ] max-width 1200px
- [ ] section padding 96px on landing
- [ ] card padding 24~32px
- [ ] responsive 3 → 2 → 1 grid
- [ ] mobile nav sheet
- [ ] dark footer

---

## 20. 테스트 계획

### 20.1 Backend 수동 테스트

```bash
curl http://localhost:8000/health
```

확인 항목:

- [ ] health OK
- [ ] DB 파일 생성
- [ ] recipe seed 삽입
- [ ] common ingredient seed 삽입
- [ ] auth API 동작
- [ ] fridge CRUD 동작
- [ ] recipes 목록 동작
- [ ] meal plan 생성 동작
- [ ] shopping list 생성 동작
- [ ] payments endpoint가 존재하지 않음

### 20.2 Frontend 수동 테스트

확인 항목:

- [ ] `/` 랜딩 페이지 정상 표시
- [ ] `/login` 정상 표시
- [ ] 로그인 후 dashboard 접근 가능
- [ ] 냉장고 재료 추가 가능
- [ ] 레시피 추천 표시
- [ ] 식단 생성 가능
- [ ] 장보기 목록 생성 가능
- [ ] settings에서 결제 UI가 보이지 않음
- [ ] mobile width에서 nav 동작

### 20.3 결제 제거 검증

검색 명령:

```bash
grep -R "polar" -n backend frontend
grep -R "checkout" -n backend frontend
grep -R "payments" -n backend frontend
grep -R "subscription" -n backend frontend
```

허용되는 경우:

- README 또는 migration note에서 “removed”로 언급하는 경우

허용되지 않는 경우:

- 실행 코드에서 checkout 호출
- 실행 코드에서 Polar webhook 처리
- UI에서 유료 업그레이드 버튼 노출
- feature 접근 제한

---

## 21. 예상 리스크와 대응

| 리스크 | 설명 | 대응 |
|---|---|---|
| Google OAuth local 설정 어려움 | callback URL 설정이 필요함 | Demo login 옵션 제공 |
| SQLite 마이그레이션 꼬임 | 기존 DB와 모델 불일치 가능 | 개발 초기에는 DB 삭제 후 재생성 허용 |
| shadcn + Tailwind v4 설정 충돌 | 기존 Tailwind v4 프로젝트에 shadcn 도입 시 설정 확인 필요 | globals.css token 중심으로 적용 |
| 결제 tier 의존 코드 누락 | 일부 화면에서 `hasAccess` 참조 가능 | grep으로 전체 검색 후 제거 |
| Seed 중복 삽입 | 앱 재시작마다 중복 가능 | unique name check 유지 |
| Railway/Vercel 흔적 | README와 env에 배포 흔적이 남을 수 있음 | 로컬 실행 문서로 정리 |

---

## 22. 최종 완료 기준

이 작업은 다음 조건을 만족하면 완료로 본다.

1. `backend`가 SQLite DB로 로컬 실행된다.
2. `frontend`가 로컬 Next.js dev server로 실행된다.
3. 결제 관련 API와 UI가 제거되어 있다.
4. 모든 주요 기능이 무료/local 상태로 사용 가능하다.
5. landing page가 첨부 디자인 스타일을 반영한다.
6. shadcn/ui 기반의 일관된 컴포넌트 스타일이 적용된다.
7. README만 보고 새 사용자가 실행할 수 있다.
8. `PLAN.md`가 프로젝트 루트에 존재한다.

---

## 23. 추천 구현 커밋 단위

```txt
commit 1: chore: document local sqlite no-payment rebuild plan
commit 2: backend: remove polar payment and webhook routes
commit 3: backend: normalize sqlite local database setup
commit 4: frontend: remove tier gates and payment UI
commit 5: ui: install shadcn components and design tokens
commit 6: ui: redesign landing page with warm canvas system
commit 7: ui: refactor fridge dashboard components
commit 8: feature: polish meal plan and shopping screens
commit 9: docs: rewrite local setup README
```

---

## 24. 작업 우선순위 요약

가장 먼저 할 일은 디자인이 아니라 실행 가능성이다.

1. 결제 제거
2. SQLite 로컬 DB 정리
3. Backend 정상 실행
4. Frontend 결제/tier 제거
5. shadcn/ui 적용
6. 랜딩 페이지 리디자인
7. 핵심 앱 화면 리디자인
8. README 정리

이 순서로 진행하면 중간에 디자인을 적용하다가 API/DB가 깨지는 상황을 줄일 수 있다.
