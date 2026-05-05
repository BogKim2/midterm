# FridgeChef

냉장고 속 재료를 기반으로 레시피 추천, 주간 식단 생성, 장보기 목록을 자동화하는 로컬 실행 중심 식단 관리 웹앱입니다.

## 주요 기능

- **냉장고 재료 관리** — 보유 식재료 등록, 유통기한 추적, 카테고리 필터, 일괄 추가
- **레시피 추천** — 냉장고 재료 기준 매칭률 순 추천
- **주간 식단 생성** — 3일/7일 식단 자동 생성 (유통기한 임박 재료 우선 활용)
- **장보기 목록** — 식단에서 부족한 재료 자동 계산

## 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | FastAPI · SQLAlchemy · SQLite · Python 3.12 |
| Frontend | Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 |
| UI | shadcn/ui · Lucide Icons |
| 인증 | JWT · Demo Login · Google OAuth (선택) |
| DB | SQLite (로컬 자동 생성, 결제 없음) |

## 프로젝트 구조

```
106refri/
├── backend/          # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py         # 앱 진입점, 라우터 등록
│   │   ├── core/           # 설정, 보안, 의존성
│   │   ├── models/         # SQLAlchemy 모델
│   │   ├── routers/        # API 라우터 (auth, fridge, recipes, ...)
│   │   ├── schemas/        # Pydantic 스키마
│   │   └── services/       # 레시피 매칭, 식단 생성, 장보기 로직
│   ├── data/
│   │   └── recipe_seed.json  # 한식 레시피 시드 데이터 (11개)
│   └── requirements.txt
└── frontend/         # Next.js 프론트엔드
    ├── src/
    │   ├── app/            # App Router 페이지
    │   ├── components/     # UI 컴포넌트
    │   ├── lib/            # API 클라이언트
    │   ├── stores/         # Zustand 상태 관리
    │   └── types/          # TypeScript 타입
    └── package.json
```

## 실행 방법

### 백엔드

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- 첫 실행 시 `backend/data/fridgechef.db` 자동 생성
- 레시피 시드 데이터 자동 삽입
- API 문서: http://localhost:8000/docs

### 프론트엔드

```bash
cd frontend
npm install   # 또는 pnpm install
npm run dev
```

- 앱: http://localhost:3000
- 환경변수: `frontend/.env.local` 참고 (기본값으로 동작)

## 환경 변수

### 백엔드 (`backend/.env`, 선택)

```env
DATABASE_URL=sqlite:///./data/fridgechef.db
SECRET_KEY=your-secret-key-change-in-production
DEMO_LOGIN=true
GOOGLE_CLIENT_ID=      # Google OAuth 사용 시
GOOGLE_CLIENT_SECRET=  # Google OAuth 사용 시
```

### 프론트엔드 (`frontend/.env.local`, 선택)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API 엔드포인트

| 라우터 | 엔드포인트 |
|--------|-----------|
| 인증 | `POST /v1/auth/demo` · `POST /v1/auth/google` · `GET /v1/auth/me` |
| 냉장고 | `GET/POST /v1/fridge/items` · `PATCH/DELETE /v1/fridge/items/{id}` · `POST /v1/fridge/items/bulk` |
| 레시피 | `GET /v1/recipes` · `GET /v1/recipes/recommendations` · `GET /v1/recipes/{id}` |
| 식단 | `GET/POST /v1/meal-plan` · `POST /v1/meal-plan/generate` |
| 장보기 | `GET /v1/shopping` · `GET/POST /v1/shopping/items` · `POST /v1/shopping/generate` |
| 재료 | `GET /v1/ingredients/common` · `GET /v1/ingredients/search` |

## 로그인

- **데모 계정** — 설치 후 바로 사용 (`DEMO_LOGIN=true` 기본값)
- **Google OAuth** — `.env`에 CLIENT_ID/SECRET 설정 후 사용 가능

## 라이선스

MIT License
