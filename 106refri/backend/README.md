# FridgeChef Backend API

FastAPI 기반의 냉장고 식재료 관리 및 식단 플래닝 백엔드 서버입니다.

## 주요 기능

- **사용자 인증**: Google OAuth + JWT 토큰 기반 인증, 데모 로그인 지원
- **냉장고 관리**: 보유 중인 식재료 추가/수정/삭제
- **레시피 관리**: 공개 레시피 조회, 추천 (냉장고 식재료 기반)
- **식단 계획**: 자동 식단 생성, 수동 식단 관리
- **장보기 목록**: 식단에서 필요한 식재료 자동 추출

## 프로젝트 구조

```
backend/
├── app/
│   ├── core/              # 설정 및 보안
│   │   ├── config.py      # 환경 설정
│   │   ├── security.py    # JWT, 비밀번호 해싱
│   │   └── deps.py        # 의존성 주입
│   ├── models/            # SQLAlchemy ORM 모델
│   │   ├── user.py
│   │   ├── ingredient.py
│   │   ├── fridge.py
│   │   ├── recipe.py
│   │   ├── meal_plan.py
│   │   └── shopping.py
│   ├── routers/           # API 엔드포인트
│   │   ├── auth.py
│   │   ├── fridge.py
│   │   ├── ingredients.py
│   │   ├── recipes.py
│   │   ├── meal_plan.py
│   │   └── shopping.py
│   ├── schemas/           # Pydantic 요청/응답 스키마
│   │   ├── user.py
│   │   ├── fridge.py
│   │   ├── recipe.py
│   │   └── meal_plan.py
│   ├── services/          # 비즈니스 로직
│   │   ├── recipe_matcher.py   # 레시피 매칭
│   │   ├── meal_planner.py     # 식단 생성
│   │   └── shopping_list.py    # 장보기 목록 생성
│   ├── database.py        # SQLite 데이터베이스 설정
│   └── main.py            # FastAPI 애플리케이션 진입점
├── data/
│   └── recipe_seed.json   # 초기 레시피 데이터 (11개)
├── requirements.txt
├── .env.example
└── .gitignore
```

## 설치 및 실행

### 1. 환경 설정

```bash
# .env 파일 생성
cp .env.example .env

# 필요시 .env 수정 (기본값은 로컬 개발용)
```

### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

### 3. 서버 실행

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

서버가 실행되면:
- API 문서: http://localhost:8000/docs
- 데이터베이스: `data/fridgechef.db` (자동 생성)

## API 엔드포인트

### 인증 (v1/auth)
- `POST /v1/auth/google` - Google OAuth 로그인
- `POST /v1/auth/demo` - 데모 로그인
- `GET /v1/auth/me` - 현재 사용자 정보 조회
- `PATCH /v1/auth/me/preferences` - 사용자 설정 수정

### 냉장고 (v1/fridge)
- `GET /v1/fridge/items` - 냉장고 식재료 목록
- `POST /v1/fridge/items` - 식재료 추가
- `PATCH /v1/fridge/items/{item_id}` - 식재료 수정
- `DELETE /v1/fridge/items/{item_id}` - 식재료 삭제
- `POST /v1/fridge/items/bulk` - 일괄 추가

### 식재료 (v1/ingredients)
- `GET /v1/ingredients/common` - 공통 식재료 목록
- `GET /v1/ingredients/search` - 식재료 검색

### 레시피 (v1/recipes)
- `GET /v1/recipes` - 전체 레시피 조회
- `GET /v1/recipes/recommendations` - 냉장고 기반 추천 레시피
- `GET /v1/recipes/{recipe_id}` - 레시피 상세 조회
- `POST /v1/recipes/{recipe_id}/like` - 레시피 좋아요
- `DELETE /v1/recipes/{recipe_id}/like` - 레시피 좋아요 취소

### 식단 계획 (v1/meal-plan)
- `GET /v1/meal-plan` - 식단 계획 목록
- `POST /v1/meal-plan/generate` - 식단 자동 생성
- `POST /v1/meal-plan` - 수동 식단 추가
- `DELETE /v1/meal-plan/{plan_id}` - 식단 삭제

### 장보기 (v1/shopping)
- `GET /v1/shopping` - 장보기 목록 조회
- `POST /v1/shopping/generate` - 필요 식재료 자동 추출
- `POST /v1/shopping/items` - 항목 추가
- `PATCH /v1/shopping/items/{item_id}` - 항목 수정
- `DELETE /v1/shopping/items/{item_id}` - 항목 삭제

## 기술 스택

- **FastAPI 0.115.0** - 웹 프레임워크
- **SQLAlchemy 2.0.35** - ORM
- **SQLite** - 데이터베이스
- **Pydantic 2.9.2** - 데이터 검증
- **python-jose** - JWT 인증
- **httpx** - 비동기 HTTP 클라이언트

## 데이터베이스

SQLite를 사용하여 로컬 개발에 최적화:
- 자동 마이그레이션 (테이블 자동 생성)
- 초기 데이터 자동 로드 (25개의 공통 식재료 + 11개 레시피)
- 파일 기반 저장소 (`data/fridgechef.db`)

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `APP_ENV` | `local` | 실행 환경 |
| `DATABASE_URL` | `sqlite:///./data/fridgechef.db` | DB 연결 문자열 |
| `SECRET_KEY` | 개발용 키 | JWT 서명 키 (최소 32자) |
| `ALGORITHM` | `HS256` | JWT 알고리즘 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` | 토큰 만료 시간 (7일) |
| `BACKEND_CORS_ORIGINS` | `http://localhost:3000` | CORS 허용 출처 |
| `GOOGLE_CLIENT_ID` | (필수) | Google OAuth 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | (필수) | Google OAuth 클라이언트 시크릿 |
| `DEMO_LOGIN` | `true` | 데모 로그인 활성화 |

## 데모 사용

```bash
# 데모 계정으로 로그인
curl -X POST http://localhost:8000/v1/auth/demo

# 응답: JWT 토큰 + 사용자 정보

# API 호출 시 토큰 사용
curl -H "Authorization: Bearer <token>" http://localhost:8000/v1/fridge/items
```

## 개발 참고사항

- 모든 엔드포인트는 보호됨 (JWT 인증 필수, `/health` 제외)
- Pydantic v2 문법 사용 (`model_validate`, `model_dump`)
- SQLite `check_same_thread=False` 설정됨
- 일관된 응답 포맷 (성공/실패 모두 JSON)

## 라이선스

MIT
