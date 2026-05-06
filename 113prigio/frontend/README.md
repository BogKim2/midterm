# Prigio Frontend

찍으면, 요리가 된다 - 냉장고 AI 관리 서비스의 React 프론트엔드

## 기술 스택

- **React 18** - UI 프레임워크
- **Vite** - 번들러 및 개발 서버
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **React Router** - 클라이언트 라우팅
- **Zustand** - 상태 관리
- **TanStack Query** - 서버 상태 관리
- **Axios** - HTTP 클라이언트

## 프로젝트 구조

```
src/
├── api/              # API 클라이언트
├── components/       # 재사용 가능한 컴포넌트
├── hooks/            # 커스텀 훅
├── pages/            # 페이지 컴포넌트
├── store/            # Zustand 스토어
├── types/            # TypeScript 타입 정의
├── utils/            # 유틸리티 함수
├── App.tsx           # 라우팅 설정
├── main.tsx          # 진입점
└── index.css         # 전역 스타일
```

## 페이지 구조

- **Landing** (`/`) - 랜딩 페이지
- **Dashboard** (`/dashboard`) - 대시보드 (메인 허브)
- **Fridge** (`/fridge`) - 냉장고 식재료 관리
- **Analyze** (`/analyze`) - AI 사진 분석
- **Recipes** (`/recipes`) - AI 레시피 추천
- **RecipeDetail** (`/recipes/:id`) - 레시피 상세보기
- **Subscription** (`/subscription`) - 플랜 안내

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 환경 변수

`.env` 파일 설정:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_ENV=development
```

## 디자인 시스템

### 색상

- **Primary Green**: `#1D9E75` - 메인 CTA, 강조
- **Deep Night**: `#0D1F1A` - 네비게이션, 어두운 배경
- **Mint**: `#5DCAA5` - 포인트 색상
- **Ice**: `#E1F5EE` - 카드 배경, 밝은 배경
- **Warm Amber**: `#FAC775` - 경고, 주의 표시
- **Cream**: `#F1EFE8` - 다크 배경 텍스트
- **Danger Red**: `#E24B4A` - 에러, 위험

### 폰트

- **Playfair Display** - 로고, 제목
- **Pretendard Variable** - 한글 본문
- **Inter** - 영문 UI

## API 통신

모든 API 요청은 `src/api/` 디렉토리의 클라이언트를 통해 관리됩니다:

- `auth.ts` - 인증 API
- `fridge.ts` - 냉장고 API
- `analysis.ts` - 이미지 분석 API
- `recipes.ts` - 레시피 API
- `quota.ts` - 사용 한도 API

## 상태 관리

**Zustand** 스토어:

- `authStore` - 사용자 인증 상태
- `quotaStore` - 사용 한도 상태

## 배경 이미지

Landing 페이지의 배경 슬라이드쇼 이미지:

- `public/bg-market.jpg` - 마켓/시장 배경 (교체 필요)
- `public/bg-seafood.jpg` - 해산물/생선 배경 (교체 필요)

각 파일의 README 주석을 참고하여 실제 이미지로 교체해주세요.

## 개발 가이드

### 컴포넌트 작성

- 함수형 컴포넌트 사용
- TypeScript 타입 정의 필수
- Props 인터페이스 정의
- 불필요한 리렌더링 최소화 (useMemo, useCallback)

### 스타일링

- Tailwind CSS 유틸리티 우선 사용
- 복잡한 스타일은 인라인 스타일로 작성 (지정된 색상 변수 사용)
- 반응형 디자인 고려

### API 호출

```typescript
import { fridgeApi } from '../api/fridge'

const fridge = await fridgeApi.get()
```

### 상태 관리

```typescript
import { useAuthStore } from '../store/authStore'

const { user, setUser } = useAuthStore()
```

## 성능 최적화

- 이미지 레이지 로딩
- 코드 스플리팅 (React.lazy)
- 불필요한 번들 최소화
- 번들 사이즈 모니터링

## 배포

```bash
# 프로덕션 빌드
npm run build

# 결과물은 dist/ 디렉토리에 생성됨
```

## 라이선스

MIT
