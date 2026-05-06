# Prigio Frontend - 구현 완료 보고서

## 프로젝트 개요

Prigio는 냉장고 사진을 AI로 분석하여 보유한 식재료를 관리하고, 맞춤형 레시피를 추천하는 웹 애플리케이션입니다.

**기술 스택**: React 18 + Vite + TypeScript + Tailwind CSS

## 생성된 파일 목록

### 핵심 설정 파일
- `package.json` - 프로젝트 의존성 및 스크립트
- `vite.config.ts` - Vite 번들러 설정
- `tsconfig.json` - TypeScript 설정
- `tailwind.config.js` - Tailwind CSS 설정
- `postcss.config.js` - PostCSS 설정
- `.env` - 환경 변수 (개발)
- `.gitignore` - Git 무시 파일
- `index.html` - HTML 진입점
- `README.md` - 프로젝트 문서

### 소스 코드

#### src/main.tsx & App.tsx
- 애플리케이션 진입점
- React Router 라우팅 설정 (7개 페이지)
- 인증 보호 라우트 구현

#### API 클라이언트 (src/api/)
- `client.ts` - Axios 인스턴스, 401 에러 처리, 자동 토큰 갱신
- `auth.ts` - 인증 API (Google OAuth, 로그아웃)
- `fridge.ts` - 냉장고 식재료 CRUD 및 일괄 추가
- `analysis.ts` - 이미지 업로드 및 AI 분석
- `recipes.ts` - 레시피 후보 조회 및 상세 생성
- `quota.ts` - 사용 한도 조회

#### 페이지 컴포넌트 (src/pages/)
- **Landing.tsx** (6KB)
  - 랜딩 페이지 (로그인 전)
  - 배경 슬라이드쇼 (6초 간격)
  - 기능 소개 & 요금제 안내

- **Dashboard.tsx** (8KB)
  - 메인 허브 페이지 (로그인 후)
  - LMStudio 상태 표시
  - 사용 한도 진행률 시각화
  - 빠른 액션 메뉴

- **Fridge.tsx** (15KB)
  - 냉장고 식재료 관리
  - 11개 카테고리 필터링
  - 일괄 삭제 기능 (선택 모드)
  - 유통기한 경고 (D-7 이상)
  - 수동 식재료 추가 모달

- **Analyze.tsx** (12KB)
  - 드래그 앤 드롭 이미지 업로드
  - 최대 2장 동시 분석
  - AI 분석 결과 편집 기능
  - 신뢰도 표시 (% 단위)
  - 냉장고에 일괄 반영

- **Recipes.tsx** (14KB)
  - 냉장고 재료 기반 추천
  - 음식 종류 선택 (5개 유형 + 커스텀)
  - 맛 선택 (매운맛, 단맛, 짠맛, 다이어트)
  - 후보 요리 리스트 표시
  - 상세 레시피 생성

- **RecipeDetail.tsx** (11KB)
  - 레시피 상세 페이지
  - 북마크 저장 기능 (localStorage)
  - 재료 목록 (있음/없음 분류)
  - 쿠팡 링크 자동 연결
  - 조리 단계 (번호 매김)
  - 영양정보 표시

- **Subscription.tsx** (7KB)
  - 플랜 안내 페이지
  - 현재 사용량 진행률
  - 리셋 날짜 표시
  - 무료 플랜 혜택 표

#### 타입 정의 (src/types/)
- `index.ts` - 모든 TypeScript 인터페이스 (70줄)
  - User, Ingredient, Refrigerator
  - QuotaStatus, DetectedIngredient
  - RecipeCandidate, RecipeDetail
  - LmStudioHealth

#### 상태 관리 (src/store/)
- `authStore.ts` - 사용자 인증 상태 (Zustand)
- `quotaStore.ts` - 사용 한도 상태 (Zustand)

#### 커스텀 훅 (src/hooks/)
- `useAuth.ts` - 초기 인증 상태 로드

#### 유틸리티 (src/utils/)
- `bookmarks.ts` - 레시피 북마크 localStorage 관리
  - getBookmarks, addBookmark, removeBookmark, isBookmarked

#### 컴포넌트 (src/components/)
- `AdminPanel.tsx` - 관리자 패널 (고정 FAB)
  - LMStudio 상태 실시간 모니터링

#### 스타일
- `src/index.css` (60줄)
  - Tailwind CSS 임포트
  - CSS 변수 정의 (색상, 타이밍)
  - 전역 스타일 (폰트, 스크롤바)

### Public 파일 (src/public/)
- `favicon.svg` - 냉장고 아이콘 SVG
- `bg-market.jpg.README.txt` - 배경 이미지 교체 가이드
- `bg-seafood.jpg.README.txt` - 배경 이미지 교체 가이드

## 주요 기능

### 1. 인증 (Authentication)
- Google OAuth 로그인
- 토큰 기반 API 호출
- 자동 토큰 갱신 (401 에러 시)
- 안전한 로그아웃

### 2. 식재료 관리 (Fridge Management)
- CRUD 작업 (생성, 읽기, 수정, 삭제)
- 11개 카테고리 분류
- 유통기한 알림 (만료 > D-7)
- 일괄 삭제 선택 모드
- 수량 및 단위 관리

### 3. AI 이미지 분석 (Image Analysis)
- 로컬 LMStudio AI 통합
- 최대 2장 동시 업로드
- 드래그 앤 드롭 UI
- 신뢰도 기반 색상 구분 (녹색 90%+, 황색 70%+, 회색 <70%)
- 결과 편집 및 일괄 반영

### 4. AI 레시피 추천 (Recipe Recommendation)
- 보유 식재료 기반 후보 추천
- 음식 종류 & 맛 필터링
- 단계별 조리 지시사항
- 영양정보 (칼로리, 단백질, 탄수화물, 지방)
- 부족한 재료 쿠팡 링크 제공

### 5. 사용 한도 관리 (Quota Management)
- 월별 분석 횟수 제한 (5회)
- 월별 레시피 생성 제한 (10회)
- 진행률 시각화
- 리셋 날짜 표시

### 6. 북마크 시스템 (Bookmarking)
- localStorage 기반 클라이언트 저장
- 레시피 저장/해제
- 영속성 보장

## 디자인 시스템

### 색상 팔레트
```
Primary: #1D9E75 (Prigio Green) - 메인 CTA
Dark: #0D1F1A (Deep Night) - 네비게이션
Accent: #5DCAA5 (Mint) - 포인트
Light: #E1F5EE (Ice) - 밝은 배경
Warning: #FAC775 (Warm Amber) - 경고
Danger: #E24B4A (Red) - 에러
```

### 타이포그래피
- **로고**: Playfair Display (세리프, 우아함)
- **본문**: Pretendard Variable (한글 최적화)
- **UI**: Inter (영문 선명함)

### 컴포넌트 스타일
- 버튼: 12px 글자, 10px 패딩, 8px 보더 라디우스
- 카드: 16px 보더 라디우스, 0.5px 경계선
- 입력: 14px 글자, 8px 패딩, 8px 보더 라디우스
- 배지: 99px 보더 라디우스 (완전 원형)

## API 연동

### 인증
- `GET /auth/google/login` → Google OAuth URL 반환
- `GET /auth/me` → 현재 사용자 정보
- `POST /auth/logout` → 로그아웃

### 냉장고
- `GET /api/v1/fridge` → 식재료 목록
- `POST /api/v1/fridge/ingredients` → 재료 추가
- `POST /api/v1/fridge/ingredients/bulk` → 일괄 추가
- `PATCH /api/v1/fridge/ingredients/{id}` → 재료 수정
- `DELETE /api/v1/fridge/ingredients/{id}` → 재료 삭제

### 분석
- `POST /api/v1/analysis/upload` → 이미지 분석
  - multipart/form-data 지원
  - 최대 2개 파일

### 레시피
- `POST /api/v1/recipes/ai/candidates` → 후보 추천
- `POST /api/v1/recipes/ai/generate` → 상세 생성
- `GET /api/v1/recipes/curated` → 큐레이션 레시피

### 시스템
- `GET /api/v1/quota/status` → 사용 한도 조회
- `GET /api/v1/system/health` → LMStudio 상태 확인

## 라우팅 구조

```
/ (Landing)
├─ /dashboard (Dashboard) [Protected]
├─ /fridge (Fridge) [Protected]
├─ /analyze (Analyze) [Protected]
├─ /recipes (Recipes) [Protected]
├─ /recipes/:id (RecipeDetail) [Protected]
└─ /subscription (Subscription) [Protected]
```

## 상태 관리

### Zustand 스토어
```typescript
useAuthStore()
  - user: User | null
  - initialized: boolean
  - setUser(user)
  - setInitialized(v)

useQuotaStore()
  - quotaStatus: QuotaStatus | null
  - setQuotaStatus(status)
```

### localStorage
```
prigio_bookmarks → RecipeDetail[]
prigio_current_recipe → RecipeDetail
```

## 성능 최적화

### 이미지 처리
- 드래그 앤 드롭으로 파일 제한 (최대 2장)
- 미리보기 생성 (URL.createObjectURL)
- 메모리 누수 방지

### 렌더링
- 함수형 컴포넌트 사용
- 조건부 렌더링 최적화
- 상태 분리 (글로벌 vs 로컬)

### 번들 크기
- 의존성 최소화 (React, ReactDOM, Router, Zustand, Axios만 사용)
- Tailwind CSS JIT 컴파일
- 트리 쉐이킹 활성화

## 개발 환경 설정

### Node.js 버전
- 권장: 16.x 이상
- npm 8.x 이상 또는 yarn 3.x

### 명령어
```bash
# 설치
npm install

# 개발 (포트 5173)
npm run dev

# 빌드
npm run build

# 미리보기
npm run preview
```

### 환경 변수 (.env)
```
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_ENV=development
```

## 주의사항

### 배경 이미지
Landing 페이지의 배경 슬라이드쇼 이미지는 placeholder입니다.
- `public/bg-market.jpg` - 실제 이미지로 교체 필요
- `public/bg-seafood.jpg` - 실제 이미지로 교체 필요

각 파일의 README 주석을 참고하세요.

### API 프록시
Vite 개발 서버는 다음 경로를 자동으로 프록시합니다:
- `/auth/*` → `http://localhost:8000/auth/*`
- `/api/*` → `http://localhost:8000/api/*`

백엔드가 8000 포트에서 실행 중이어야 합니다.

### LMStudio 의존성
AI 이미지 분석 기능은 LMStudio 로컬 서버가 필요합니다.
- 백엔드 설정 파일 참고

## 파일 통계

| 카테고리 | 파일 수 | 라인 수 |
|---------|--------|--------|
| 페이지 | 6 | ~1,000 |
| API | 6 | ~100 |
| 타입 | 1 | 70 |
| 스토어 | 2 | 30 |
| 컴포넌트 | 1 | 50 |
| 훅 | 1 | 15 |
| 유틸 | 1 | 25 |
| 설정 | 8 | 200 |
| **합계** | **26** | **~1,490** |

## 다음 단계

1. **배경 이미지 교체**
   - `public/bg-market.jpg` (신선한 마켓 사진)
   - `public/bg-seafood.jpg` (신선한 해산물 사진)

2. **백엔드 연동 테스트**
   - 로컬에서 백엔드 서버 실행 (포트 8000)
   - 프론트엔드 개발 서버 시작 (포트 5173)
   - 각 페이지 기능 테스트

3. **프로덕션 빌드**
   - `npm run build` 실행
   - `dist/` 폴더 배포

## 구현 완료

✅ 전체 UI 구현 완료
✅ API 클라이언트 설정 완료
✅ 라우팅 구조 완료
✅ 상태 관리 구현 완료
✅ 타입 안정성 확보
✅ 디자인 시스템 적용

프로젝트는 백엔드 API와의 통합 준비가 완료되었습니다.
