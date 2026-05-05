# plan.md — 사주AI (SajuAI) 전체 구현 계획

> **서비스:** `https://saju-frontend-nine.vercel.app/`  
> **설명:** AI 사주 분석 · 궁합 · 운세 캘린더 · 인생 타임라인  
> **스택:** React + TypeScript + Vite · Tailwind CSS · Framer Motion · **LM Studio (로컬 LLM, Qwen)**  
> **배포:** Vercel  
> **LLM:** [LM Studio](https://lmstudio.ai/)에서 **Qwen** 계열 모델 로드 후 OpenAI 호환 API로 호출 (문서상 기본: **Qwen 3.6** — 실제 LM Studio에 표시되는 **정확한 모델 ID**를 환경 변수에 맞출 것)

---

## 0. 문서 개요

이 문서는 사주AI 서비스를 처음부터 구현하기 위한 **완전한 설계 + 구현 지침서**다.  
**LLM**은 클라우드 API가 아니라 **LM Studio**에 로드한 **로컬 Qwen(Qwen 3.6 가정)** 과 **OpenAI 호환 로컬 서버**로 연결한다. **시각 요소**는 `https://saju-frontend-nine.vercel.app/` 에서 쓰는 **이미지·이모지·문구**를 가져와 동일하게 맞춘다.  
각 섹션은 독립적으로 읽을 수 있으나, 구현 순서는 **섹션 7. 구현 순서**를 따를 것.

---

## 1. 서비스 개요

### 1-1. 핵심 기능 4개

| 기능 | 설명 | 라우트 |
|---|---|---|
| **AI 사주 분석** | 생년월일시 입력 → 로컬 LLM(Qwen, LM Studio)로 사주팔자 해석 | `/analysis` |
| **궁합** | 두 사람의 사주 비교 → 궁합 점수 + 조언 | `/compatibility` |
| **운세 캘린더** | 월별 운세 흐름 캘린더 뷰 | `/calendar` |
| **인생 타임라인** | 대운(10년 주기) 시각화 타임라인 | `/timeline` |

### 1-2. 추가 페이지

| 페이지 | 라우트 | 설명 |
|---|---|---|
| 랜딩 | `/` | 서비스 소개 + 시작하기 CTA |
| 사주 입력 | `/input` | 생년월일시·성별 입력 폼 |
| 분석 결과 | `/result` | 사주팔자 분석 결과 전체 |
| 로그인 | `/login` | 이메일/소셜 로그인 |
| 회원가입 | `/signup` | 계정 생성 |
| 마이페이지 | `/mypage` | 저장된 분석·설정 |
| 프리미엄 | `/premium` | 요금제 소개 + 결제 |

---

## 2. 디자인 시스템

### 2-1. 컨셉

**"신비로운 밤하늘 + 현대적 데이터 시각화"**  
고전 명리학의 깊이감을 모던 다크 UI로 재해석. 배경은 딥 네이비/블랙, 강조색은 금빛과 자줏빛.

### 2-2. 컬러 팔레트

```css
:root {
  /* 배경 */
  --bg-base:       #090B14;   /* 최심층 배경 */
  --bg-surface:    #0F1221;   /* 카드 배경 */
  --bg-elevated:   #161929;   /* 호버/포커스 표면 */
  --bg-overlay:    #1E2237;   /* 모달/팝업 */

  /* 오행 컬러 (목화토금수) */
  --five-wood:     #4ADE80;   /* 목(木) — 초록 */
  --five-fire:     #F97316;   /* 화(火) — 주황 */
  --five-earth:    #EAB308;   /* 토(土) — 노랑 */
  --five-metal:    #E2E8F0;   /* 금(金) — 실버 */
  --five-water:    #38BDF8;   /* 수(水) — 파랑 */

  /* 주 텍스트 */
  --text-primary:  #F1F0EC;
  --text-secondary:#9BA3B8;
  --text-muted:    #4A5168;

  /* 강조 */
  --accent-gold:   #D4A853;   /* 금빛 — 제목·별자리 */
  --accent-purple: #9B6FD8;   /* 자줏빛 — 신비로움 */
  --accent-rose:   #F472B6;   /* 핑크 — 궁합·연애 */

  /* 경계선 */
  --border:        rgba(212,168,83,0.15);
  --border-strong: rgba(212,168,83,0.35);

  /* 그라디언트 */
  --grad-hero:     linear-gradient(135deg, #090B14 0%, #1A0A2E 50%, #0A1428 100%);
  --grad-card:     linear-gradient(145deg, #0F1221 0%, #161929 100%);
  --grad-gold:     linear-gradient(90deg, #D4A853, #F1C87A, #D4A853);
}
```

### 2-3. 타이포그래피

```css
/* 구글 폰트 import */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-display: 'Noto Serif KR', 'Georgia', serif;   /* 제목·결과 텍스트 */
  --font-body:    'Noto Sans KR', 'system-ui', sans-serif; /* UI·설명 */
  --font-mono:    'JetBrains Mono', monospace;          /* 간지·수치 */
}
```

| 역할 | 폰트 | 크기 | weight |
|---|---|---|---|
| 히어로 제목 | Serif | 56–72px | 300 |
| 섹션 제목 | Serif | 36–48px | 400 |
| 카드 제목 | Serif | 22–28px | 500 |
| 본문 | Sans | 15–17px | 400 |
| 간지(甲子) | Mono | 13–16px | 500 |
| 메타/태그 | Sans | 11–12px | 400 |

### 2-4. 컴포넌트 공통 규칙

```
border-radius: 12px (카드), 8px (버튼·입력), 999px (pill 배지)
border: 1px solid var(--border)
box-shadow: 0 0 40px rgba(155,111,216,0.08), 0 1px 3px rgba(0,0,0,0.4)
backdrop-filter: blur(12px) (glass 카드)
```

**모션 (Framer Motion)**
- 페이지 진입: `opacity 0→1, y 16→0, duration 0.5s`
- 카드 hover: `scale 1→1.02, y 0→-4, duration 0.2s`
- 로딩 시머: `shimmer` keyframe 좌→우 1.5s 반복
- 오행 게이지: `scaleX 0→1, duration 1.2s, stagger 0.1s`

### 2-5. 비주얼 에셋·이모지 (배포 웹 기준 재사용)

**원칙:** 새로 그리거나 임의 이모지만 쓰지 말고, **이미 서비스 중인 웹** `https://saju-frontend-nine.vercel.app/` 에 쓰인 **그림(SVG/PNG/WebP)·파비콘·OG 이미지·섹션별 일러스트**와 **문구에 붙은 이모지·기호(✦, ♡ 등)를 동일하게 가져와** 로컬 프로젝트에 맞춘다.

| 작업 | 방법 |
|---|---|
| 이미지·아이콘 | 브라우저 **DevTools → Network → Img** 또는 **Sources**, 배포 사이트의 `public` 정적 경로(예: `/assets/...`, `/vite.svg`, 배너 등)를 확인해 **동일 파일명·경로**로 `public/`(또는 `src/assets/`)에 **다운로드·복사** |
| 이모지·텍스트 심볼 | 랜딩/기능 카드/버튼 문구를 **배포 페이지에서 그대로 복사**하거나, `src/constants/uiCopy.ts` 등에 **배포본과 동일한 문자열**로 상수화 |
| 일관성 | 헤더·카드·CTA에 쓰는 장식 문자는 plan 섹션 5의 예시보다 **실제 배포 UI**를 우선 |

**산출물:** `public/` 미러 구조 문서 1줄(예: `ASSETS.md`에 출처 URL·로컬 경로만 적어도 됨) — 사용자가 별도로 요청하지 않은 경우 **코드 외 마크다운은 최소화**하고, 팀 내에서는 위 표만으로도 충분.

---

## 3. 프로젝트 구조

```
saju-ai/
├── public/
│   ├── favicon.ico          # 배포 사이트 favicon과 동일 파일 우선
│   ├── og-image.png         # 배포 OG 이미지와 동일
│   └── assets/              # (선택) 배포본 `/assets/*` 미러 — 그림·일러스트
├── src/
│   ├── main.tsx
│   ├── App.tsx                    # 라우터 설정
│   ├── index.css                  # 글로벌 스타일 + CSS 변수
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx         # 상단 네비게이션
│   │   │   ├── Footer.tsx
│   │   │   └── PageWrapper.tsx    # 페이드인 래퍼
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.tsx         # variant: primary|ghost|outline
│   │   │   ├── Card.tsx           # glass 카드 + 일반 카드
│   │   │   ├── Badge.tsx          # 오행 배지, 카테고리 배지
│   │   │   ├── Input.tsx          # 기본 인풋 + 날짜 인풋
│   │   │   ├── Select.tsx
│   │   │   ├── Spinner.tsx        # AI 분석 중 로딩
│   │   │   ├── StarField.tsx      # 배경 별자리 SVG 애니메이션
│   │   │   └── SajuPillar.tsx     # 사주 기둥 (년/월/일/시) 표시 컴포넌트
│   │   │
│   │   ├── analysis/
│   │   │   ├── FiveElements.tsx   # 오행 비율 레이더/바 차트
│   │   │   ├── TenGods.tsx        # 십성 분석 표
│   │   │   ├── DayMaster.tsx      # 일간(나) 강약 분석
│   │   │   └── LuckyItems.tsx     # 행운 색·방향·숫자
│   │   │
│   │   ├── compatibility/
│   │   │   ├── ScoreRing.tsx      # 궁합 점수 원형 게이지
│   │   │   └── CompatMatrix.tsx   # 두 사주 비교 매트릭스
│   │   │
│   │   ├── calendar/
│   │   │   ├── MonthGrid.tsx      # 월 캘린더 그리드
│   │   │   └── DayDetail.tsx      # 일별 운세 상세
│   │   │
│   │   └── timeline/
│   │       ├── DaeunBar.tsx       # 대운 타임라인 바
│   │       └── LifeEvent.tsx      # 중요 인생 이벤트 마커
│   │
│   ├── pages/
│   │   ├── Landing.tsx            # /
│   │   ├── Input.tsx              # /input
│   │   ├── Result.tsx             # /result
│   │   ├── Analysis.tsx           # /analysis
│   │   ├── Compatibility.tsx      # /compatibility
│   │   ├── CalendarPage.tsx       # /calendar
│   │   ├── Timeline.tsx           # /timeline
│   │   ├── Login.tsx              # /login
│   │   ├── Signup.tsx             # /signup
│   │   ├── Mypage.tsx             # /mypage
│   │   └── Premium.tsx            # /premium
│   │
│   ├── hooks/
│   │   ├── useSaju.ts             # 사주 계산 로직 훅
│   │   ├── useAI.ts               # LM Studio(OpenAI 호환) 호출 훅
│   │   └── useAuth.ts             # 인증 상태 훅
│   │
│   ├── lib/
│   │   ├── saju/
│   │   │   ├── calendar.ts        # 양력↔음력 변환, 만세력
│   │   │   ├── pillars.ts         # 사주팔자 기둥 계산
│   │   │   ├── fiveElements.ts    # 오행 분석
│   │   │   └── compatibility.ts   # 궁합 계산
│   │   ├── lmstudio.ts            # LM Studio 로컬 API 클라이언트 (OpenAI SDK, baseURL 설정)
│   │   └── prompts.ts             # AI 프롬프트 템플릿
│   │
│   ├── store/
│   │   └── sajuStore.ts           # Zustand 전역 상태
│   │
│   └── types/
│       └── index.ts               # 공통 타입 정의
│
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 4. 공통 컴포넌트 상세

### 4-1. Header

```
[별 아이콘 + "사주AI"]          [오늘의운세] [사주분석] [궁합] [캘린더] [타임라인]          [로그인] [시작하기]
```

- `position: sticky; top: 0; z-index: 50`
- `backdrop-filter: blur(20px)` + `background: rgba(9,11,20,0.85)`
- 하단 `1px solid var(--border)`
- 활성 링크: `color: var(--accent-gold)`, 하단 2px 골드 언더라인
- 모바일: 햄버거 → 풀스크린 메뉴

### 4-2. StarField (배경 별자리)

- SVG `<canvas>` 또는 CSS 애니메이션 별 200개
- 별 크기: 0.5–2.5px, 랜덤 opacity 0.1–0.7
- 미묘한 twinkle 애니메이션 (3–8s 랜덤 delay)
- 페이지별 별 밀도 조절 가능 (`density` prop)

### 4-3. SajuPillar (사주 기둥 표시)

```
┌─────────┐
│   甲    │  ← 천간 (Mono, 골드)
│   午    │  ← 지지 (Mono, 자주)
│  목(木) │  ← 오행 배지 (초록)
│  년주   │  ← 라벨 (회색 11px)
└─────────┘
```

4개 기둥 (년·월·일·시) 나란히 배치. 카드 클릭 시 상세 툴팁.

### 4-4. FiveElements (오행 차트)

두 가지 뷰 전환:
1. **레이더 차트** (D3.js 또는 Recharts) — 오각형, 꼭짓점이 목화토금수
2. **가로 바 차트** — 각 오행 비율 퍼센트 + 아이콘

### 4-5. Button

```typescript
// variant
primary:  bg-[--accent-gold] text-black font-semibold
ghost:    bg-transparent border border-[--border] text-[--text-primary] hover:bg-[--bg-elevated]
outline:  border border-[--accent-gold] text-[--accent-gold]
danger:   bg-red-900/50 border border-red-500/30 text-red-300

// size
sm: px-3 py-1.5 text-sm rounded-lg
md: px-5 py-2.5 text-base rounded-xl   ← default
lg: px-8 py-4 text-lg rounded-xl
```

---

## 5. 페이지별 상세 스펙

---

### 5-1. 랜딩 페이지 (`/`)

**목적:** 서비스의 세계관을 전달 + 분석 시작 유도

#### 레이아웃

```
─────────────────────────────────────────────
  [Header]
─────────────────────────────────────────────
  [HERO SECTION]
    배경: --grad-hero + StarField (density: high)
    중앙 정렬, min-height: 100vh

    eyebrow: "AI × 명리학의 만남" (Mono, 골드, letter-spacing 0.2em)
    h1: "당신의 사주에는\n어떤 이야기가 담겨있을까요"
        (Serif 64px, weight 300, line-height 1.2)
    sub: "생년월일시 입력 하나로, AI가 수천 년의\n명리학을 풀어드립니다."
        (Sans 18px, --text-secondary)

    [사주 분석 시작하기 →]  (primary button, lg)
    "무료로 체험 · 회원가입 불필요"  (Mono 12px, --text-muted)

    ↓ 스크롤 인디케이터 (골드 점 3개 bounce)
─────────────────────────────────────────────
  [기능 소개 SECTION] — "사주AI가 하는 일"
    3열 그리드 (모바일: 1열)

    카드 1: ✦ AI 사주 분석
      아이콘: 사주팔자 기둥 일러스트
      제목: "나의 사주를 AI로 해석"
      설명: 년월일시 사주팔자 전체 분석, 일간 강약, 용신 분석
      CTA: "분석해보기 →"

    카드 2: ♡ 궁합
      아이콘: 두 원이 겹치는 일러스트
      제목: "두 사람의 인연 확인"
      설명: 오행 궁합, 일간 합충, 연애·결혼 궁합 종합 점수
      CTA: "궁합 보기 →"

    카드 3: ◉ 운세 캘린더
      아이콘: 달력 일러스트
      제목: "월별 운세 흐름 파악"
      설명: 오늘의 일진, 월운·년운 캘린더, 좋은 날 찾기
      CTA: "캘린더 열기 →"

    카드 4: ∿ 인생 타임라인
      아이콘: 물결선 타임라인 일러스트
      제목: "대운의 흐름 한눈에"
      설명: 10년 대운 주기, 세운 흐름, 인생 고비와 전환점
      CTA: "타임라인 보기 →"
─────────────────────────────────────────────
  [오행 시각화 SECTION] — 인터랙티브 데모
    h2: "오행(五行)이란 무엇인가"
    좌: 오행 설명 텍스트 (목화토금수 각각 컬러 배지 + 설명)
    우: 레이더 차트 데모 (더미 데이터, 마우스 호버로 회전)
─────────────────────────────────────────────
  [사용 후기 SECTION]
    h2: "사용자 이야기"
    카드 슬라이더 (3개):
      "30대 직장인 / 이모씨" — 리뷰 텍스트 + 별점
      "대학생 / 박모씨" — ...
      "40대 주부 / 최모씨" — ...
─────────────────────────────────────────────
  [CTA SECTION]
    배경: 딥 퍼플 그라디언트
    h2: "지금 바로 시작해보세요"
    [무료로 사주 분석하기]  [프리미엄 요금제 보기]
─────────────────────────────────────────────
  [Footer]
    좌: 로고 + 서비스 설명
    중: 서비스 링크
    우: 약관·개인정보처리방침
    하단: "© 2026 사주AI · AI 사주 분석 서비스"
─────────────────────────────────────────────
```

#### 애니메이션
- Hero 텍스트: stagger fade-in (eyebrow → h1 → sub → button, 각 0.15s delay)
- 기능 카드: scroll trigger, `y: 30→0` stagger
- 오행 차트: 진입 시 0→100% 애니메이션

---

### 5-2. 사주 입력 페이지 (`/input`)

**목적:** 사주 분석을 위한 생년월일시·성별 수집

#### 레이아웃

```
─────────────────────────────────────────────
  [Header]
─────────────────────────────────────────────
  진행 단계 표시기
  ① 정보 입력  ②  분석 중  ③  결과 확인
  ●──────────────○──────────────○

  중앙 카드 (max-width: 520px)

  h2: "생년월일시를 알려주세요"
  sub: "정확한 생년월일시로 더 정밀한 분석이 가능합니다"

  ────────── 입력 폼 ──────────

  [성명]
  label: 성함 (선택)
  input: text, placeholder "홍길동"

  [생년월일]
  label: 생년월일 *
  3개 select 나란히: [1990년 ▼] [1월 ▼] [1일 ▼]
  또는 date input (커스텀 스타일)

  [태어난 시간]
  label: 태어난 시간 *
  12지지 시간 선택:
  [자시(23~1시)] [축시(1~3시)] [인시(3~5시)] [묘시(5~7시)]
  [진시(7~9시)]  [사시(9~11시)] [오시(11~13시)] [미시(13~15시)]
  [신시(15~17시)] [유시(17~19시)] [술시(19~21시)] [해시(21~23시)]
  [모름 (임의 지정)]
  → 2열 그리드 버튼 (선택 시 골드 테두리 + bg)

  [성별]
  label: 성별 *
  [남성] [여성]  (토글 버튼 2개)

  [양력/음력]
  label: 생년월일 기준
  [양력 ●] [음력 ○]  (라디오 토글)

  ────────────────────────────

  체크: 정보는 분석 외 목적으로 사용되지 않습니다.

  [AI 사주 분석 시작하기 →]  (primary, 전체 폭)
─────────────────────────────────────────────
```

#### 검증 규칙

| 필드 | 규칙 |
|---|---|
| 생년 | 1900–2024 |
| 생월 | 1–12 |
| 생일 | 해당 월 최대 일수 이하 |
| 시간 | 1개 필수 선택 (모름 포함) |
| 성별 | 필수 |

#### 제출 후 동작

1. `/result?loading=true`로 이동
2. URL 파라미터 또는 Zustand store에 입력값 저장
3. LM Studio 로컬 API로 분석 요청 시작 (비동기; `vite` 프록시 또는 동일 PC의 CORS 정책에 맞춰 연결)

---

### 5-3. 분석 결과 페이지 (`/result`)

**목적:** 사주팔자 분석 결과 종합 표시

#### 레이아웃

```
─────────────────────────────────────────────
  [Header]
─────────────────────────────────────────────

  ── 로딩 상태 (AI 분석 중) ──
  StarField 배경
  중앙:
    [회전하는 팔괘 SVG 애니메이션]
    "AI가 사주를 분석하고 있습니다..."
    "甲午年 · 乙巳月 · 丙申日 · 丁亥시"  (Mono, 골드)
    로딩 바 (shimmer 애니메이션)

  ── 결과 상태 ──

  [상단 요약 헤드]
  배경: 반투명 glass 카드, 전체 폭
  "홍길동 님의 사주팔자"  (Serif 32px)
  "1990년 1월 1일 오시생 · 남성"  (Sans, --text-secondary)
  [저장하기] [공유하기] [재분석] 버튼 우측

  ──────────────────────────────────────────

  [섹션 1] 사주팔자 기둥
  h3: "사주팔자 (四柱八字)"
  4개 SajuPillar 컴포넌트 나란히:
    년주(年柱) / 월주(月柱) / 일주(日柱) / 시주(時柱)
  각 기둥 클릭 → 해당 간지 의미 모달

  ──────────────────────────────────────────

  [섹션 2] 오행 분석
  2열 레이아웃
  좌: FiveElements 레이더 차트
  우:
    h4: "오행 구성비"
    목(木) ██████░░░ 35%  (초록 게이지)
    화(火) ████░░░░░ 25%  (주황)
    토(土) ██░░░░░░░ 15%  (노랑)
    금(金) ███░░░░░░ 20%  (실버)
    수(水) █░░░░░░░░  5%  (파랑)

    "용신: 수(水) · 금(金)"  (배지)
    "기신: 목(木)"           (배지, 빨강)

  ──────────────────────────────────────────

  [섹션 3] AI 종합 해석  ← 핵심
  배경: 약간 다른 surface 색상 카드
  h3: "AI 종합 해석"
  아이콘: ✦ (골드)

  탭 4개:
  [전체 요약] [성격·적성] [재물·직업운] [연애·결혼운]

  각 탭 내용: 로컬 LLM(Qwen) 응답 텍스트
  - 마크다운 렌더링 (bold, 리스트 등)
  - Serif 16px / line-height 1.9
  - 스트리밍 표시 지원 (타이핑 효과)

  ──────────────────────────────────────────

  [섹션 4] 올해의 운세 (년운)
  h3: "2026년 운세"
  12개월 미니 카드 그리드 (3열)
  각 카드:
    월 표시 (1월, 2월...)
    운세 강도 바 (0–100%)
    색상: 좋음(골드) / 보통(회색) / 주의(빨강)
    한 줄 코멘트

  ──────────────────────────────────────────

  [섹션 5] 행운 아이템
  h3: "행운을 부르는 것들"
  4개 배지 그룹:
    🎨 행운색: 검정, 파랑
    🔢 행운숫자: 1, 6
    🧭 행운방향: 북쪽
    💎 행운석: 흑요석, 사파이어

  ──────────────────────────────────────────

  [하단 CTA]
  [궁합 보기 →]  [운세 캘린더 →]  [인생 타임라인 →]
─────────────────────────────────────────────
```

---

### 5-4. AI 사주 분석 페이지 (`/analysis`)

**목적:** 입력된 사주의 심층 분석 (결과보다 더 전문적)

```
─────────────────────────────────────────────
  [Header]
─────────────────────────────────────────────

  좌측 사이드바 (240px) — 네비게이션
  ├── 사주팔자 개요
  ├── 일간(日干) 분석
  ├── 오행 분석
  ├── 십성(十星) 분석
  ├── 신살(神殺) 분석
  └── 종합 조언

  우측 메인 콘텐츠 영역
  각 섹션 상세:

  [일간 분석]
  "나(日干)는 甲木입니다"  h2
  일간 캐릭터 설명:
    "봄의 새싹처럼 위로 뻗어나가는 에너지..."
  일간 강약: 진(旺)/약(弱) 미터 게이지
  핵심 키워드: [창의적] [리더십] [고집] [개척정신] 배지들

  [십성 분석]
  h3: "십성(十星) — 나와 세상의 관계"
  표 형태:
  | 십성 | 육친 | 개수 | 의미 |
  |------|------|------|------|
  | 비견 | 형제 |  2개 | 경쟁·독립 |
  | 겁재 | 형제 |  1개 | 재물소모 |
  ...

  [신살 분석]
  "현재 사주에 작용하는 신살"
  [천을귀인] — "귀인의 도움을 받는 별"
  [역마살]   — "이동·여행이 잦은 별"
  ...
─────────────────────────────────────────────
```

---

### 5-5. 궁합 페이지 (`/compatibility`)

**목적:** 두 사람의 사주 궁합 분석

#### 레이아웃

```
─────────────────────────────────────────────
  [Header]
─────────────────────────────────────────────

  h2: "두 사람의 인연을 살펴봅니다"  (중앙, Serif)

  ── 입력 영역 ──
  2열 레이아웃 (좌: 나 / 우: 상대방)

  [나의 정보]                    [상대방 정보]
  ┌──────────────────────┐  ┌──────────────────────┐
  │ 이름 (선택)          │  │ 이름 (선택)          │
  │ 생년월일: ___/__/__  │  │ 생년월일: ___/__/__  │
  │ 시간: [시간 선택 ▼]  │  │ 시간: [시간 선택 ▼]  │
  │ 성별: [남] [여]      │  │ 성별: [남] [여]      │
  └──────────────────────┘  └──────────────────────┘

       ← 중앙에 ♡ 하트 아이콘 (양쪽 연결) →

  [궁합 분석하기]  (primary, 전체 폭)

  ── 결과 영역 ──

  [궁합 종합 점수]
  두 아바타 원 (이니셜) ← 연결선 → 두 아바타 원
  중앙: 점수 링 (0–100, 애니메이션)
        큰 숫자 "82" + "/100"
        "매우 좋은 궁합"  (골드)

  [궁합 세부 분석]
  5개 카테고리 가로 바:
  ❤️ 애정  ████████░░  78%
  💬 소통  █████████░  88%
  💰 경제  ████████░░  75%
  🌿 가치관 ████████░░  80%
  🔮 사주합 ███████░░░  70%

  [AI 궁합 해석]
  탭: [종합 해석] [좋은 점] [주의할 점] [조언]
  각 탭 로컬 LLM 응답 텍스트

  [두 사람의 오행 비교]
  좌우 레이더 차트 나란히 + 오버랩 비교 뷰

  [합충 분석]
  "일간 합충" 표: 甲과 己의 합(合) 여부
  "지지 합충" 표: 子과 午의 충(沖) 여부
─────────────────────────────────────────────
```

---

### 5-6. 운세 캘린더 페이지 (`/calendar`)

**목적:** 날짜별 일진과 월별 운세 흐름 캘린더

#### 레이아웃

```
─────────────────────────────────────────────
  [Header]
─────────────────────────────────────────────

  상단 컨트롤바:
  [← 이전달]  2026년 4월  [다음달 →]    [년도 선택 ▼]

  2열 레이아웃

  ── 왼쪽: 월 캘린더 ──
  7열 그리드 (일~토)
  각 날짜 셀:
    ┌──────────┐
    │    15    │  ← 날짜 숫자
    │  甲子    │  ← 일진 간지 (Mono, 작게)
    │  ●●●○○  │  ← 운세 강도 도트 (5단계)
    └──────────┘

  색상 코딩:
    운세 최고 (골드 테두리)
    운세 좋음 (연한 골드 배경)
    보통 (기본)
    주의 (연한 빨강 배경)
    주의 최고 (빨강 테두리)

  오늘 날짜: 골드 원 하이라이트

  ── 오른쪽: 선택 날짜 상세 ──
  [오늘 2026년 4월 15일]
  h3: "甲午日"  (Mono, 크게)
  일진 설명: "갑오일은 힘차고 활동적인 기운..."

  운세 카테고리:
  [전체운] [재물운] [연애운] [직업운] [건강운]

  각 카테고리별 점수 + 코멘트:
  ★★★★☆  "재물운이 상승하는 날입니다."

  오늘의 조언:
  "북쪽 방향이 이로우며, 파란색 계열이 행운..."

  길한 시간대:
  午시(11–13시) · 申시(15–17시)
─────────────────────────────────────────────
```

---

### 5-7. 인생 타임라인 페이지 (`/timeline`)

**목적:** 대운(大運) 흐름과 인생 주요 시기 시각화

#### 레이아웃

```
─────────────────────────────────────────────
  [Header]
─────────────────────────────────────────────

  h2: "홍길동 님의 인생 대운 흐름"
  sub: "10년 단위 대운과 세운의 흐름을 한눈에 확인하세요"

  ── 대운 타임라인 ──

  수평 스크롤 가능한 타임라인 바

  나이:  0   10   20   30   40   50   60   70   80
        ├────┼────┼────┼────┼────┼────┼────┼────┤
  대운: │甲子│乙丑│丙寅│丁卯│戊辰│己巳│庚午│辛未│
  오행: │水  │土  │木  │木  │土  │火  │火  │금  │

  현재 위치: 36세 (丁卯 대운) 표시 (골드 수직선)

  각 대운 블록 클릭 → 하단 상세 패널 펼침:
  "丁卯 대운 (30–40세)"
  키워드: [성장기] [도전] [학업·직업 기반 다지기]
  상세 해석: LM Studio + Qwen 생성 텍스트

  ── 세운 (년도별) ──

  현재 대운 내 세운 상세:
  년도   세운   운세 강도
  2024  甲辰   ████████░░  중상
  2025  乙巳   ████████░░  중상
  2026  丙午   ██████████  최상 ← 현재
  2027  丁未   ███████░░░  중
  2028  戊申   ██████░░░░  중하
  ...

  ── AI 해석 ──

  "현재 대운 분석"
  h3: "丁卯 대운 — 성장과 도전의 시기"
  로컬 LLM 응답 텍스트 (Serif 16px / 1.9)

  "앞으로의 주요 시기"
  카드 리스트:
  2026–2028년: "직업·경력의 전환점 가능성"
  2031–2033년: "결혼·가정 관련 이슈"
  2036–2038년: "재물운 상승기"
─────────────────────────────────────────────
```

---

### 5-8. 로그인 페이지 (`/login`)

```
─────────────────────────────────────────────
  배경: StarField + --bg-base
  중앙 카드 (max-width: 400px)

  상단: GGMark + "사주AI"

  h2: "다시 오셨군요"
  sub: "저장된 분석을 이어보세요"

  [이메일]  input
  [비밀번호] input + 눈 아이콘 토글

  [로그인] primary button, 전체 폭
  "비밀번호를 잊으셨나요?" 링크

  ── 또는 ──

  [Google로 계속하기]  ghost button
  [카카오로 계속하기]  ghost button (옐로우)

  하단: "아직 계정이 없으신가요? 회원가입 →"
─────────────────────────────────────────────
```

---

### 5-9. 회원가입 페이지 (`/signup`)

```
─────────────────────────────────────────────
  중앙 카드 (max-width: 480px)

  h2: "사주AI를 시작해보세요"
  sub: "무료로 사주를 분석하고 저장하세요"

  [이름]
  [이메일]
  [비밀번호]
  [비밀번호 확인]

  비밀번호 강도 표시 (바 + 텍스트)

  □ 서비스 이용약관 동의 (필수)
  □ 개인정보 처리방침 동의 (필수)
  □ 마케팅 정보 수신 동의 (선택)

  [회원가입] primary button

  ── 또는 소셜 가입 ──

  하단: "이미 계정이 있으신가요? 로그인 →"
─────────────────────────────────────────────
```

---

### 5-10. 마이페이지 (`/mypage`)

```
─────────────────────────────────────────────
  [Header]
─────────────────────────────────────────────

  좌: 사이드바 (240px)
  ├── 내 프로필
  ├── 저장된 분석
  ├── 궁합 목록
  ├── 설정
  └── 로그아웃

  우: 메인 콘텐츠

  [프로필 섹션]
  아바타 원 (이니셜) + 이름 + 이메일
  멤버십: [무료] / [프리미엄] 배지

  내 사주 정보:
  ┌─────────────────────────────────┐
  │ 홍길동 · 1990.01.01 오시 · 남  │
  │ [甲][午][丙][申][丁][亥] ← 간지│
  │ [수정하기]                      │
  └─────────────────────────────────┘

  [저장된 분석 목록]
  카드 그리드:
  ├── 2026.04.15 사주 종합 분석
  ├── 2026.03.28 2026년 운세
  └── 2026.03.10 홍길동 × 김민지 궁합

  [설정]
  알림 설정 (매일 오늘의 운세)
  테마 (다크/라이트)
  계정 삭제
─────────────────────────────────────────────
```

---

### 5-11. 프리미엄 페이지 (`/premium`)

```
─────────────────────────────────────────────
  [Header]
─────────────────────────────────────────────

  히어로:
  h2: "사주AI 프리미엄으로\n더 깊이 들여다보세요"
  골드 그라디언트 텍스트

  ── 요금제 카드 3개 ──

  [무료]           [프리미엄 ★]     [프리미엄+]
  ─────────────    ─────────────    ─────────────
  ₩0/월           ₩9,900/월        ₩19,900/월
  ─────────────    ─────────────    ─────────────
  ✓ 사주 1회       ✓ 무제한 분석    ✓ 프리미엄 전체
  ✓ 기본 분석      ✓ 궁합 분석      ✓ 전화 상담 1회
  ✗ 궁합           ✓ 운세 캘린더    ✓ 맞춤 AI 상담
  ✗ 캘린더         ✓ 타임라인       ✓ 리포트 PDF
  ✗ 타임라인       ✓ 저장 무제한    ✓ VIP 우선 지원
  ─────────────    ─────────────    ─────────────
  [시작하기]       [지금 시작하기]  [상담 신청]
                   (골드 강조)

  프리미엄 카드: `border: 2px solid var(--accent-gold)`
                `box-shadow: 0 0 40px rgba(212,168,83,0.2)`

  ── FAQ ──
  아코디언 형식 5–6개 질문

  ── 하단 CTA ──
  "7일 무료 체험으로 시작해보세요"
─────────────────────────────────────────────
```

---

## 6. 데이터 모델 & API

### 6-1. 사주 계산 타입

```typescript
// 간지 (천간+지지)
type Ganji = {
  cheongan: '甲'|'乙'|'丙'|'丁'|'戊'|'己'|'庚'|'辛'|'壬'|'癸'
  jiji:     '子'|'丑'|'寅'|'卯'|'辰'|'巳'|'午'|'未'|'申'|'酉'|'戌'|'亥'
  ohaeng:   '목'|'화'|'토'|'금'|'수'
}

// 사주팔자 4기둥
type SajuPillars = {
  year:  Ganji   // 년주
  month: Ganji   // 월주
  day:   Ganji   // 일주 (일간 = 나)
  hour:  Ganji   // 시주
}

// 분석 입력
type SajuInput = {
  name?:      string
  birthYear:  number
  birthMonth: number
  birthDay:   number
  birthHour:  number   // 0–23 (모름: -1)
  gender:     'male' | 'female'
  lunarCalendar: boolean
}

// 오행 비율
type FiveElementsRatio = {
  wood:  number  // 0–100
  fire:  number
  earth: number
  metal: number
  water: number
}

// 분석 결과 전체
type SajuAnalysis = {
  input:        SajuInput
  pillars:      SajuPillars
  fiveElements: FiveElementsRatio
  dayMaster:    { element: string; strength: 'strong'|'weak'|'neutral' }
  yongsin:      string[]    // 용신 (유리한 오행)
  gisin:        string[]    // 기신 (불리한 오행)
  aiSummary:    string      // 로컬 LLM 응답
  aiPersonality: string
  aiCareer:     string
  aiLove:       string
  luckyColors:  string[]
  luckyNumbers: number[]
  luckyDirection: string
  createdAt:    Date
}

// 궁합
type CompatibilityResult = {
  person1: SajuInput
  person2: SajuInput
  totalScore: number         // 0–100
  loveScore:  number
  communicationScore: number
  financeScore: number
  valuesScore:  number
  sajuScore:    number
  aiSummary:    string
  strengths:    string[]
  weaknesses:   string[]
  advice:       string
}

// 대운
type Daeun = {
  startAge: number
  endAge:   number
  ganji:    Ganji
  ohaeng:   string
  aiSummary: string
}
```

### 6-2. Zustand 전역 상태

```typescript
interface SajuStore {
  // 현재 입력
  currentInput: SajuInput | null
  setInput: (input: SajuInput) => void

  // 분석 결과
  currentAnalysis: SajuAnalysis | null
  setAnalysis: (a: SajuAnalysis) => void

  // 로딩
  isAnalyzing: boolean
  setAnalyzing: (v: boolean) => void

  // 저장 목록
  savedAnalyses: SajuAnalysis[]
  saveAnalysis: (a: SajuAnalysis) => void

  // 선택된 캘린더 날짜
  selectedDate: Date
  setSelectedDate: (d: Date) => void
}
```

### 6-3. LM Studio + Qwen — 프롬프트·연동

#### 연동 요약

1. **LM Studio**에서 Qwen 계열 모델(문서 기준 **Qwen 3.6**)을 받아 로드한 뒤 **Local Server**를 켠다.  
2. 기본 엔드포인트: `http://127.0.0.1:1234/v1` (OpenAI 호환).  
3. 프론트(Vite)는 **환경 변수**로 베이스 URL·모델명을 읽고, **`openai` 패키지** 또는 `fetch`로 `chat.completions` 호출.  
4. **CORS:** 브라우저 직결 시 차단될 수 있으므로 **`vite` 개발 서버 proxy**(`'/v1' → LM Studio`) 또는 LM Studio **CORS 허용** 설정 중 하나를 반드시 택한다.  
5. `VITE_LMSTUDIO_MODEL`에는 LM Studio 우측에 보이는 **모델 식별자**를 그대로 넣는다 (예: 배포된 빌드와 맞추려면 로컬에서 동일 체크포인트 사용).

```typescript
// lib/lmstudio.ts  (개념 예시 — 실제 프로젝트는 팀 컨벤션에 맞출 것)

import OpenAI from 'openai'

export function createLMClient() {
  return new OpenAI({
    baseURL: import.meta.env.VITE_LMSTUDIO_BASE_URL ?? 'http://127.0.0.1:1234/v1',
    apiKey: 'lm-studio', // 로컬 서버는 더미 키가 관행
    dangerouslyAllowBrowser: true, // 가능하면 서버/프록시로 옮기고 브라우저 직접 호출은 지양
  })
}
```

```typescript
// lib/prompts.ts

export const SAJU_SYSTEM_PROMPT = `
당신은 수십 년 경력의 명리학(사주팔자) 전문가이자, 이를 현대적 언어로 풀어주는 AI입니다.
사용자의 사주팔자를 분석할 때:
1. 전문 명리학 이론(음양오행, 십성, 신살 등)에 기반하여 분석합니다.
2. 결과는 운명론적이 아닌, 자기 이해와 성장을 돕는 방향으로 표현합니다.
3. 한국어로 응답하며, 적절한 한자를 병기합니다.
4. 마크다운 형식으로 구조화하여 응답합니다.
`

export const buildAnalysisPrompt = (pillars: SajuPillars, input: SajuInput) => `
다음 사주팔자를 분석해주세요:

- 이름: ${input.name || '익명'}
- 성별: ${input.gender === 'male' ? '남성' : '여성'}
- 년주: ${pillars.year.cheongan}${pillars.year.jiji}
- 월주: ${pillars.month.cheongan}${pillars.month.jiji}
- 일주: ${pillars.day.cheongan}${pillars.day.jiji}
- 시주: ${pillars.hour.cheongan}${pillars.hour.jiji}

다음 항목을 분석해주세요:
1. 종합 성격 분석 (300자 이내)
2. 재물·직업운 분석 (200자 이내)
3. 연애·결혼운 분석 (200자 이내)
4. 올해(2026년) 운세 요약 (200자 이내)
5. 행운 아이템 (색상, 숫자, 방향, 보석 각 1–2개)

JSON 형식으로 응답해주세요.
`

// chat.completions 호출 시: model: import.meta.env.VITE_LMSTUDIO_MODEL
// Qwen 3.6 권장 파라미터는 LM Studio 문서·프리셋에 따름 (temperature, max_tokens 등)
```

---

## 7. 구현 순서

### Phase 1 — 기반 (1–2일)
- [ ] Vite + React + TypeScript 프로젝트 초기화
- [ ] Tailwind CSS 설정 + CSS 변수 (컬러 팔레트)
- [ ] 폰트 (Noto Serif KR, Noto Sans KR, JetBrains Mono) 적용
- [ ] 기본 라우팅 설정 (React Router v6)
- [ ] 공통 레이아웃 (Header, Footer, PageWrapper)
- [ ] StarField 배경 컴포넌트
- [ ] Button, Card, Badge, Input 기본 UI 컴포넌트
- [ ] **배포 사이트(`saju-frontend-nine.vercel.app`) 기준** `public/` 에셋·이모지·문구 정렬 (섹션 2-5)

### Phase 2 — 핵심 플로우 (3–5일)
- [ ] 사주 입력 페이지 (`/input`) + 만세력 계산 로직
- [ ] **LM Studio 연동** (`lib/lmstudio.ts`, `lib/prompts.ts`, `useAI.ts`) — 모델 **Qwen 3.6**(LM Studio에 표시된 ID)
- [ ] **Vite proxy / CORS**로 로컬 API 안정 접속
- [ ] Zustand 상태 관리 설정
- [ ] 로딩 상태 (회전 팔괘 애니메이션)
- [ ] 분석 결과 페이지 (`/result`) — 기본 구조
- [ ] SajuPillar 컴포넌트
- [ ] FiveElements 차트 (Recharts 레이더 + 바)

### Phase 3 — 4개 핵심 기능 (6–10일)
- [ ] 궁합 페이지 (`/compatibility`) + 점수 링 애니메이션
- [ ] 운세 캘린더 (`/calendar`) + 일진 계산 로직
- [ ] 인생 타임라인 (`/timeline`) + 대운 타임라인 바
- [ ] AI 분석 페이지 (`/analysis`) + 사이드바 네비

### Phase 4 — 인증 & 마이페이지 (2–3일)
- [ ] 로그인 / 회원가입 페이지
- [ ] 인증 상태 관리 (`useAuth.ts`)
- [ ] 마이페이지 (`/mypage`) + 분석 저장/조회
- [ ] 프리미엄 페이지 (`/premium`) + 요금제 표

### Phase 5 — 랜딩 & 마감 (2–3일)
- [ ] 랜딩 페이지 (`/`) — 풀 애니메이션
- [ ] Framer Motion 전체 적용 (페이지 전환, 스크롤 트리거)
- [ ] 반응형 (모바일 360px, 태블릿 768px)
- [ ] 메타 태그 / OG 이미지
- [ ] Vercel 배포

---

## 8. 기술 스택 상세

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "framer-motion": "^11",
    "recharts": "^2",
    "zustand": "^4",
    "openai": "^4",
    "date-fns": "^3",
    "react-markdown": "^9",
    "clsx": "^2"
  },
  "devDependencies": {
    "typescript": "^5",
    "vite": "^5",
    "@vitejs/plugin-react": "^4",
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "postcss": "^8"
  }
}
```

### 환경 변수 (`.env.local`)

```
# LM Studio Local Server (OpenAI 호환). 기본 포트 1234
VITE_LMSTUDIO_BASE_URL=http://127.0.0.1:1234/v1
# LM Studio에서 로드한 모델 ID — Qwen 3.6 사용 시 UI에 보이는 정확한 문자열
VITE_LMSTUDIO_MODEL=qwen3.6
VITE_SUPABASE_URL=https://...supabase.co   (인증·저장 사용 시)
VITE_SUPABASE_ANON_KEY=...
```

> **`VITE_LMSTUDIO_MODEL`:** LM Studio 앱에서 선택한 모델 이름과 **완전히 동일**해야 한다. 저장소에 실제 키·URL을 커밋하지 말 것.

### 프로덕션(Vercel) vs 로컬 LM

브라우저에 배포된 앱은 사용자 PC의 `127.0.0.1:1234`에 접근할 수 없다. **운영 배포**를 할 때는 다음 중 하나로 정한다: (1) **사내/개인용**으로만 쓰고 로컬에서 `npm run dev` + LM Studio 조합 유지, (2) **동일 Qwen 모델**을 올린 **중개 서버**(OpenAI 호환 엔드포인트)의 URL을 `VITE_LMSTUDIO_BASE_URL`로 교체, (3) 데스크톱 래퍼(Tauri 등)로 로컬 서버와 함께 배포.

---

## 9. 라우팅 설정

```tsx
// App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/"              element={<Landing />} />
    <Route path="/input"         element={<Input />} />
    <Route path="/result"        element={<Result />} />
    <Route path="/analysis"      element={<Analysis />} />
    <Route path="/compatibility" element={<Compatibility />} />
    <Route path="/calendar"      element={<CalendarPage />} />
    <Route path="/timeline"      element={<Timeline />} />
    <Route path="/login"         element={<Login />} />
    <Route path="/signup"        element={<Signup />} />
    <Route path="/mypage"        element={<PrivateRoute><Mypage /></PrivateRoute>} />
    <Route path="/premium"       element={<Premium />} />
    <Route path="*"              element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

---

## 10. 반응형 브레이크포인트

| 이름 | 너비 | 변경 사항 |
|---|---|---|
| mobile | < 640px | 1열 레이아웃, 하단 탭바, 폰트 축소 |
| tablet | 640–1024px | 2열, 사이드바 숨김 (햄버거) |
| desktop | > 1024px | 기본 레이아웃 |

---

## 11. 성능 & 접근성 체크리스트

- [ ] Lazy import (React.lazy) — 각 페이지 컴포넌트
- [ ] LLM 호출 debounce + **연결 실패(로컬 서버 미기동)·타임아웃** 오류 처리
- [ ] 로딩 스켈레톤 (shimmer) 모든 비동기 콘텐츠에 적용
- [ ] `aria-label` — 아이콘 버튼 전체
- [ ] 키보드 네비게이션 (Tab/Enter) 폼 전체
- [ ] 색상 대비 WCAG AA 기준 충족
- [ ] OG 메타 태그 (title, description, image)
- [ ] 404 페이지

---

*plan.md 끝 — 각 섹션은 독립 구현 가능하며, 구현 순서는 섹션 7을 따를 것.*
