# design.md — 글결(Geulgyeol)
> 하루 3–5분, 한 편의 글을 나만의 속도로 읽고 간직하는 공간  
> **Source:** `design_handoff_geulgyeol/` — v0.2 Hi-fi 핸드오프 기준

---

## 0. 이 문서의 역할

이 파일은 글결 서비스를 새로운 코드베이스(Next.js, SvelteKit 등)로 구현하거나 디자인을 수정할 때 **단일 참조 문서**로 쓰인다. 디자인 결정의 *이유*까지 담아, "왜 이렇게 생겼는가"를 언제든 다시 읽을 수 있도록 정리했다.

---

## 1. 디자인 철학

글결의 UI는 **"조용한 방"** 한 마디로 압축된다. 구현 시 다음 다섯 원칙을 지속적으로 확인할 것.

| # | 원칙 | 금지 사항 |
|---|---|---|
| 1 | **타이포그래피 퍼스트** — 글자 하나가 주인공 | 배경 일러스트, 히어로 이미지로 글자를 덮지 말 것 |
| 2 | **조용한 방** — 의도적 빈 공간 | 토스트·팝업·알림·뱃지 카운트 기본값으로 삽입 금지 |
| 3 | **드러남의 모션** — 잉크 번지듯 천천히 | Snappy/bouncy/spring 모션 금지 |
| 4 | **이모지 / 화려한 일러스트 금지** | 헤어라인·라틴 `―`·일련번호(No. 047) 같은 시집/매거진 어휘만 |
| 5 | **한 화면 한 메시지** — 행동 하나만 | 기능 목록 나열, 스크롤 유도 배너 금지 |

---

## 2. 컬러 시스템

`data-theme="light"` / `data-theme="dark"` 속성으로 전환. 전체 토큰은 `styles/theme.css` 참고.

### 2-1. 라이트 모드 — "새벽 안개"

| 변수 | 값 | 역할 |
|---|---|---|
| `--bg` | `#F4F3EF` | 페이퍼 베이스 (전체 배경) |
| `--bg-2` | `#ECEAE3` | Surface (카드·사이드바) |
| `--bg-3` | `#E1E5E9` | Mist (비활성 영역) |
| `--bg-4` | `#C9D0D6` | Fog (disabled, 아바타 배경) |
| `--ink` | `#1F2630` | 본문 텍스트 |
| `--ink-deep` | `#0F141B` | 제목·강조 텍스트 |
| `--ink-2` | `#4F5862` | 부텍스트 (byline, 설명) |
| `--ink-3` | `#8D96A0` | 메타 (날짜, eyebrow) |
| `--ink-4` | `#C9D0D6` | Disabled / 장식 (`· · ·`) |
| `--accent` | `#4A6B8A` | 차가운 블루 (링크, 활성 탭, 카테고리) |
| `--accent-soft` | `#6E8AA6` | Accent 보조 |
| `--rule` | `rgba(31,38,48,0.10)` | 헤어라인 |
| `--rule-strong` | `rgba(31,38,48,0.22)` | 강조 헤어라인 (태그 테두리 등) |
| `--btn-bg` | `#0F141B` | Primary 버튼 배경 |
| `--btn-fg` | `#F4F3EF` | Primary 버튼 텍스트 |

### 2-2. 다크 모드 — "밤하늘 잉크"

| 변수 | 값 | 역할 |
|---|---|---|
| `--bg` | `#0B0F16` | 어두운 베이스 |
| `--bg-2` | `#11171F` | Surface |
| `--bg-3` | `#161D27` | Mist |
| `--bg-4` | `#1E2632` | Fog |
| `--ink` | `#B5BBC5` | 본문 |
| `--ink-deep` | `#F0EEE8` | 제목 ("달빛") |
| `--ink-2` | `#6B7585` | 부텍스트 |
| `--ink-3` | `#4A5568` | 메타 |
| `--ink-4` | `#2A3340` | Disabled |
| `--accent` | `#8FA8C2` | 달빛 블루 |
| `--accent-soft` | `#5C7390` | Accent 보조 |
| `--rule` | `rgba(240,238,232,0.08)` | 헤어라인 |
| `--rule-strong` | `rgba(240,238,232,0.20)` | 강조 헤어라인 |
| `--btn-bg` | `#F0EEE8` | Primary 버튼 배경 |
| `--btn-fg` | `#0B0F16` | Primary 버튼 텍스트 |

### 2-3. 테마 전환

```css
/* 모든 CSS 변수에 전환 트랜지션 적용 */
*, *::before, *::after {
  transition: background-color 0.4s ease, color 0.4s ease,
              border-color 0.4s ease;
}
```

테마 상태는 `<html data-theme="light|dark">` + `localStorage`로 유지.  
초기 flicker 방지를 위해 `<head>` 내 인라인 스크립트로 테마를 미리 적용할 것.

---

## 3. 타이포그래피 시스템

### 3-1. 폰트 스택

```css
--font-serif: "Noto Serif KR", "Source Serif 4", "Iowan Old Style", Georgia, serif;
--font-sans:  "Inter Tight", "Pretendard", "Apple SD Gothic Neo", "Helvetica Neue", system-ui, sans-serif;
--font-mono:  "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
```

- **Serif** → 제목, 본문, 카드 타이틀 (서비스의 목소리)
- **Sans** → Nav, 버튼 라벨, UI 텍스트 (기능의 목소리)
- **Mono** → Eyebrow, 일련번호, 날짜, 폼 라벨 (인쇄물의 목소리)

### 3-2. 타입 스케일

| 용도 | 폰트 | 크기 | line-height | letter-spacing | weight |
|---|---|---|---|---|---|
| 랜딩 페이지 타이틀 | Serif | 64–72px | 1.15–1.2 | −0.025em | 400 |
| 섹션 헤딩 | Serif | 46–60px | 1.1–1.35 | −0.02em | 400 |
| 카드 타이틀 | Serif | 22–24px | 1.35 | −0.01em | 400 |
| 읽기 본문 ★ | Serif | **21px** | **1.95** | 0 | 400 |
| 일반 본문 | Serif | 14–18px | 1.7–1.85 | 0 | 400 |
| Eyebrow | Mono | **11px** | 1 | **0.18em** | 400, UPPERCASE |
| 날짜·일련번호 | Mono | 11px | 1.6 | 0.12–0.16em | 400 |
| 버튼 라벨 | Sans | 13px | 1 | 0.10–0.12em | 400 |
| 인풋 라벨 | Mono | 11px | — | 0.18em | UPPERCASE |
| 메타 (작가명·분량) | Sans | 11–13px | — | 0.04–0.06em | 400 |

> ★ **읽기 본문(21px / 1.95)이 이 서비스의 핵심 타입 값**이다. 변경 시 PRD 재검토 필요.

### 3-3. 읽기 화면 들여쓰기 규칙

```css
/* 첫 단락: 들여쓰기 없음 */
p:first-of-type { text-indent: 0; }

/* 2번째 단락부터: 2em 들여쓰기 (시집 관례) */
p + p { text-indent: 2em; }
```

---

## 4. 스페이싱 시스템

8px 기준 스케일. 모든 여백은 이 토큰에서 조합할 것.

```css
--s-1:  4px;    /* 아이콘 내부 패딩, 태그 상하 패딩 */
--s-2:  8px;    /* 인라인 요소 간격 */
--s-3:  12px;   /* 메타 행 간격 */
--s-4:  16px;   /* 버튼 패딩, 카드 내 소항목 간격 */
--s-5:  24px;   /* 카드 패딩 상하, 섹션 내 블록 간격 */
--s-6:  32px;   /* 단락 간격 (읽기 화면) */
--s-7:  48px;   /* 섹션 내 큰 여백 */
--s-8:  64px;   /* 섹션 상단 패딩 (컴팩트) |
--s-9:  96px;   /* Today 화면 상단 여백, 섹션 간 |
--s-10: 128px;  /* 랜딩 대형 섹션 여백 */
```

---

## 5. 모션 규칙

| 종류 | 속성 | 값 | 비고 |
|---|---|---|---|
| **페이드인** | opacity `0→1` + translateY `8px→0` | **0.8s ease-out** | 모든 콘텐츠 첫 등장 |
| **호버** | background-color, color만 변경 | 0.15s ease | `transform` 변경 절대 금지 |
| **테마 전환** | background-color, color, border-color | 0.4s ease | 전체 `*` 셀렉터 |
| **간직하기 피드백** | opacity fade 후 라벨 교체 | 0.8s | 토스트 없음, 라벨→"간직됨" |
| **발행 후 이동** | 페이지 페이드아웃 후 `/g/:no`로 이동 | — | |

**절대 사용 금지:** spring, bounce, elastic, scale-up, rotate 트랜지션.

---

## 6. 형태(Shape) & 그림자

| 속성 | 값 | 이유 |
|---|---|---|
| **Border-radius** | 거의 `0` — 버튼·카드 직각 | 시집/인쇄물 미학 |
| 아바타·테마 토글 | `border-radius: 50%` | 유일한 예외 |
| **Shadow** | 거의 없음 | 풀스크린 포커스 모달 1곳만 `0 20px 80px rgba(0,0,0,0.4)` |
| Grain 텍스처 | `radial-gradient` 3px 패턴, `.grain` 클래스 | 종이 질감, multiply/screen blend |
| Fog 효과 | 방사형 블러 그라디언트, `.fog` 클래스 | 다크 모드 별빛 영역, 로그인 화면 |

---

## 7. 공통 컴포넌트

### 7-1. GGMark (로고)

```jsx
// 원 + "결" 글자, SVG 기반
// size: px (기본 28)
// color: CSS 색상 (기본 currentColor)
<GGMark size={22} color="var(--ink-deep)" />
```

구조: 32×32 viewBox, `stroke-width: 0.6` 원, 중앙 "결" (Noto Serif KR 14px, weight 500)

### 7-2. GGNav (상단 네비게이션)

```jsx
<GGNav active="오늘" />
// active prop: "오늘" | "발견" | "아카이브" | "쓰기" | "마이"
```

레이아웃:
- 전체 너비, `padding: 22px 56px`
- 하단 헤어라인 `1px solid var(--rule)`
- 좌: GGMark(22) + "글결" (Serif 18px)
- 중: 네비 링크 5개 (Sans 13px, gap 32px, letter-spacing 0.04em)
- 우: 검색 아이콘 + 아바타 원(30px)
- 활성 탭: `color: var(--ink-deep)`, 하단 `1px solid var(--accent)`
- 비활성 탭: `color: var(--ink-2)`
- **모바일(다음 페이즈):** 하단 탭바 5개 아이콘으로 전환

### 7-3. GGIcon (아이콘 세트)

```jsx
<GGIcon name="bookmark" size={16} stroke={1.25} color="var(--ink-deep)" />
```

지원 아이콘: `bookmark` / `bookmark-fill` / `heart` / `share` / `pen` / `search` / `arrow-right` / `arrow-down` / `arrow-up` / `moon` / `sun` / `plus`

모두 24×24 viewBox SVG. stroke 기반, fill 없음(`bookmark-fill` 제외).

### 7-4. GGStars (다크모드 별 배경)

```jsx
<GGStars count={60} w={1440} h={400} opacity={1} />
```

`opacity: calc(var(--is-dark) * {opacity})`로 라이트 모드에서 자동 숨김.

### 7-5. 유틸리티 CSS 클래스 (`theme.css` 정의)

| 클래스 | 역할 |
|---|---|
| `.skin` | `background: var(--bg)`, `color: var(--ink)`, font-family serif 적용 |
| `.skin .heading` | `color: var(--ink-deep)` |
| `.skin .accent` | `color: var(--accent)` |
| `.skin .muted` | `color: var(--ink-2)` |
| `.skin .faint` | `color: var(--ink-3)` |
| `.skin .surface` | `background: var(--bg-2)` |
| `.grain` | 종이 grain 텍스처 `::after` 오버레이 |
| `.fog` | 방사형 블러 그라디언트 `::before` 오버레이 |
| `.eyebrow` | Mono 11px, letter-spacing 0.18em, UPPERCASE |
| `.hairline` | `border-top: 1px solid var(--rule)` |

모든 화면 루트에 `className="skin grain"` 적용. Tailwind 환경이라면 `bg-[--bg] text-[--ink] font-serif`로 재현.

---

## 8. 화면별 스펙

### 8-0. 공통 레이아웃 규칙

- **데스크탑 기준폭:** 1440px
- **모바일:** 360px (다음 페이즈 대응, 컴포넌트는 처음부터 fluid하게)
- **읽기 화면 콘텐츠 폭:** `max-width: 780px`, `margin: 0 auto`
- **피드/프로필 콘텐츠 폭:** `max-width: 1200px`
- **컨테이너 외부:** fluid (hard cap만 두고 나머지 `%`로)

---

### 8-1. Landing — Hybrid ★ (메인)
**파일:** `scripts/v2/landing-hybrid.jsx`  
**사이즈:** 1440 × 2820px (스크롤 전체)

#### 구조 (3단 호흡)

**① 헤더** — 단 한 줄
```
[GGMark + "글결"]  |  "― 글결에 오신 걸 환영합니다. 오늘의 글이 이미 펼쳐져 있어요."  |  [로그인 · 가입]
```
- Mono 11px, color `var(--ink-3)`, letter-spacing 0.16em
- 하단 헤어라인 1px

**② 오늘의 글 본문** — 랜딩이 곧 읽기 화면
- `padding: 104px 0 0`, `max-width: 760px`
- 메타 row: `No. 047` / `― 고요 ―` / 날짜 (Mono 11px, letter-spacing 0.18em)
- h1: Serif 64px, weight 400, letter-spacing −0.02em
- byline: Sans 13px, `var(--ink-3)`
- 헤어라인 → 본문 (Serif 21px / 1.95) → `· · ·` 마침표

**③ 갈림길** — 두 페르소나
- 전환 카피: Serif 72px, `오늘 당신은 *읽는 사람*인가요, 아니면 *쓰는 사람*인가요.`
- 이탤릭 강조어에 `color: var(--accent)`
- `display: grid; grid-template-columns: 1fr 1fr`, 사이 `1px solid var(--rule)`
- 왼쪽(읽는 지연): `background: var(--bg)`, Primary 버튼
- 오른쪽(쓰는 민호): `background: var(--bg-2)`, Outline 버튼

**④ 합류** — 발견 피드 미리보기
- 카피: Serif 46px, `누군가의 한 문장은, 또 다른 누군가의 새벽이 됩니다.`
- 3-column 카드 그리드 (GG_FEED 데이터 샘플)

---

### 8-2. Login / Signup
**파일:** `scripts/v2/core-screens.jsx` → `UScreenLogin`  
**사이즈:** 1440 × 980px

- `display: grid; grid-template-columns: 1fr 1fr`
- **왼쪽 (인용 패널):** `.skin.fog` + `GGStars`, 오늘의 글 발췌 표시
  - GGMark + "글결" 상단
  - Eyebrow `― 오늘의 글, No. 047`
  - 인용 Serif 28px, 이탤릭, `var(--ink-deep)`
  - 하단 "오늘의 글 읽기 →" 링크
- **오른쪽 (폼 패널):** `.skin`, 우측 정렬
  - 폼 라벨: Mono 11px, UPPERCASE, letter-spacing 0.18em, `var(--ink-3)`
  - 인풋: `border: 0; border-bottom: 1px solid var(--rule-strong)`, 투명 배경, Serif
  - 에러: 빨간 박스 금지 → **헤어라인 1px + Mono 11px 메시지**
  - Primary 버튼 전체 폭

---

### 8-3. Today (오늘의 글, 읽기) ★★★
**파일:** `scripts/v2/core-screens.jsx` → `UScreenToday`  
**사이즈:** 1440 × 1460px

> 가장 신경써서 구현. PRD의 모든 정서가 여기에 응축된다.

```
GGNav (active="오늘")
  main [max-width:780px, margin:0 auto, padding:96px 0 80px]
    ├── 메타 row: No.047 | ― 고요 ― | 2026·04·27
    │     Mono 11px, var(--ink-3), letter-spacing:0.16em
    ├── h1 "안개가 지나간 자리"
    │     Serif 56px, weight:400, letter-spacing:-0.018em, mb:12px
    ├── byline "글결 큐레이션 · AI 보조 작성"
    │     Sans 13px, var(--ink-3), letter-spacing:0.04em, mb:64px
    ├── <hr className="hairline" mb:56px>
    ├── 본문 단락 ×5 (Serif 21px / 1.95)
    │     [첫 단락] text-indent:0, color:var(--ink-deep)
    │     [2번째~] text-indent:2em, color:inherit
    ├── · · ·  (Mono, letter-spacing:0.5em, var(--ink-4), centered, my:48px)
    ├── 태그 row: #고요 #새벽 #안개 #일상
    │     padding:6px 12px, border:1px solid var(--rule-strong), Sans 12px
    ├── 3등분 액션 row [grid 1fr/1fr/1fr, border-top/bottom 1px solid var(--rule)]
    │     ├── [bookmark] 간직하기 / 저장 목록에 담기
    │     ├── [pen]      감상 남기기 / 나에게만 보이는 일기   ← border-left
    │     └── [share]    조용히 보내기 / 링크 공유           ← border-left
    │     각 버튼: icon(20px) + label(Serif 16px) + sub(Sans 11px, var(--ink-3))
    ├── "1,284명이 오늘 함께 읽었어요"
    │     Sans 12px, var(--ink-3), letter-spacing:0.06em, centered, mt:48px
    └── 어제/내일 nav [border-top 1px, mt:96px]
          왼쪽: eyebrow "어제의 글" + Serif 18px 제목
          오른쪽: eyebrow "내일" + Serif 18px "새벽 5시에 도착합니다"
```

#### 인터랙션 (Today 전용)
| 액션 | 동작 | 금지 |
|---|---|---|
| 간직하기 클릭 | opacity fade 0.8s → 라벨 "간직됨" 교체 | 토스트 |
| 감상 남기기 클릭 | 우측 사이드시트 슬라이드인 (다음 페이즈) | — |
| 조용히 보내기 클릭 | 링크 클립보드 복사 + 인라인 한 줄 메시지 | 토스트 |

---

### 8-4. Feed (발견 피드)
**파일:** `scripts/v2/core-screens.jsx` → `UScreenFeed`  
**사이즈:** 1440 × 1570px

**헤더 섹션** (`grid 5fr/7fr`, gap:64px)
- 좌: Eyebrow `― 발견 / Discover` + h2 Serif 60px "조용히 누군가가 *남겨둔 문장들.*"
- 우: 설명 Serif 18px + 통계 Mono 11px

**카테고리 필터**
```
[전체★]  [고요]  [위로]  [사랑]  [용기]  [그리움]  [사색]       [최신순 ↓]
```
- Active: `background: var(--btn-bg); color: var(--btn-fg)`
- Inactive: `border: 1px solid var(--rule-strong); color: var(--ink-2)`
- 버튼: `padding: 10px 18px`, 직각 (border-radius: 0)

**카드 그리드** (`grid 1fr/1fr`, gap:1px, background:var(--rule))
```
article [padding:36px, min-height:220px]
  grid: [일련번호(Mono 38px, var(--ink-3))] [본문] [액션 아이콘]
  본문:
    ├── eyebrow accent "― {카테고리}"
    ├── h3 Serif 24px (카드 타이틀)
    ├── 발췌문 Serif 14px / 1.7 (max-width:480px)
    └── meta Sans 11px, var(--ink-3)
  액션: bookmark (저장) + heart + 좋아요 수 (Mono 11px)
```

**카드 호버:** `background: var(--bg-2)`, 0.15s — transform 변경 금지

---

### 8-5. Editor (글귀 작성)
**파일:** `scripts/v2/core-screens.jsx` → `UScreenEditor`  
**사이즈:** 1440 × 980px

`max-width: 780px`, `margin: 0 auto`, `padding: 72px 0`

```
메타 row: "― 새 글결 ―" | "자동 저장 · 4분 전"  (Mono 11px, var(--ink-3))

[제목 input]
  border:0, border-bottom:1px solid var(--rule), background:transparent
  Serif 46px, var(--ink-deep), letter-spacing:-0.015em

태그 row: "― 결" + #고요 #위로 #사색 + "+ 추가"
  활성 태그: color:var(--accent), border:1px solid var(--rule-strong)

[본문 textarea]
  height:280px, no resize, Serif 21px / 1.95, transparent bg

[하단 바]  border-top/bottom 1px solid var(--rule)
  좌: "본문 · 187 / 600자" + "제목 · 11 / 40자" (Sans 12px, var(--ink-3))
  우: [비공개 버튼] + [발견에 공개 버튼]

[발행하기] → 우측 정렬, Primary 버튼 (icon arrow-right)
```

#### 폼 검증
- 제목: 1–40자, 공백만 불가
- 본문: 1–600자
- 카운터: 항상 표시, 한도 초과 시 `color: var(--accent)`
- 에러 표현: 빨간 박스 금지 → 헤어라인 1px + Mono 11px 메시지

---

### 8-6. Profile (마이페이지)
**파일:** `scripts/v2/core-screens.jsx` → `UScreenProfile`  
**사이즈:** 1440 × 1100px

`padding: 72px 56px 0`

**상단 섹션** (`grid 4fr/8fr`, gap:64px, border-bottom)
- 좌: 아바타(148×148, border-radius:50%, bg:var(--bg-3)) + eyebrow + h1 Serif 42px + SINCE Mono
- 우: 4-stat grid (1fr×4) + 탭 row

**4-stat 그리드** (`grid 1fr×4`, gap:1px, bg:var(--rule))
```
[간직한 글 / 48]  [쓴 글결 / 12]  [연속 읽기 / 17일]  [멤버십 / 무료]
각 셀: padding:28px 24px, eyebrow "― {라벨}", 값 Serif 36px
```

**탭 row:** "간직한 글 (48)" / "내가 쓴 글 (12)" / "감상 일기 (23)"
- 활성 탭: `var(--ink-deep)`, 하단 `1px solid var(--accent)`

**저장 카드 그리드** (`grid 1fr×3`, gap:1px)
- 카드: `padding:32px`, No. + 카테고리 eyebrow + Serif 22px 제목 + 날짜 메타

---

## 9. 샘플 데이터 구조

```typescript
// 오늘의 글 (GG_SAMPLE)
{
  no: "No. 047",
  date: "2026 · 04 · 27",
  category: "고요",
  title: "안개가 지나간 자리",
  byline: "글결 큐레이션 · AI 보조 작성",
  body: string[],          // 단락 배열 (5개)
  tags: string[],          // ["#고요", "#새벽", ...]
  reads: "1,284명이 오늘 함께 읽었어요",
}

// 카테고리 목록
type Category = "고요" | "위로" | "사랑" | "용기" | "그리움" | "사색"

// 피드 카드
{
  no: string,     // "047"
  cat: Category,
  title: string,
  author: string,
  likes: number,
  save: boolean,
  len: string,    // "3분"
}
```

---

## 10. 라우팅 & 상태

### 10-1. 라우트 맵

| Path | 화면 | 인증 |
|---|---|---|
| `/` | Landing Hybrid | 불필요 |
| `/login` | Login | 불필요 |
| `/signup` | Signup | 불필요 |
| `/today` | Today (오늘의 글) | 필요 |
| `/feed` | Feed | 필요 |
| `/write` | Editor | 필요 |
| `/me` | Profile | 필요 |
| `/g/:no` | 특정 일련번호 글 | 필요 |

### 10-2. 핵심 타입

```typescript
type User = {
  id: string
  email: string
  name: string
  joinedAt: string
  membership: 'free' | 'plus'
}

type Post = {
  no: number           // 047
  date: string         // "2026-04-27"
  category: Category
  title: string        // ≤ 40자
  body: string         // ≤ 600자
  byline: string
  tags: string[]
  author: User | 'curated'
  likes: number
  reads: number
  visibility: 'public' | 'private'
  isAiAssisted: boolean
}

type UserPostState = {
  saved: boolean
  liked: boolean
  diaryEntry?: { text: string; createdAt: string }
}

type Theme = 'light' | 'dark'   // localStorage 저장
```

---

## 11. API 엔드포인트 요약

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/today` | 오늘의 큐레이션 1편 |
| GET | `/api/posts/:no` | 특정 일련번호 글 |
| GET | `/api/feed?cat=&cursor=` | 무한 스크롤 피드 |
| POST | `/api/posts/:no/save` | 저장 |
| DELETE | `/api/posts/:no/save` | 저장 취소 |
| POST | `/api/posts/:no/like` | 좋아요 |
| DELETE | `/api/posts/:no/like` | 좋아요 취소 |
| POST | `/api/posts` | 글귀 작성 |
| GET | `/api/me/saved` | 저장한 글 목록 |
| GET | `/api/me/written` | 내가 쓴 글 목록 |
| GET | `/api/me/diary` | 감상 일기 목록 |

---

## 12. 구현 순서 (권장)

1. `theme.css` 이식 (CSS 변수 또는 Tailwind config)
2. `GGMark`, `GGIcon`, `GGNav` 공통 컴포넌트
3. **Today 화면** — 가장 정서가 응축된 곳, 기준점이 됨
4. Login / Signup
5. Landing Hybrid
6. Feed
7. Editor
8. Profile
9. 테마 토글 (`<html data-theme>` + localStorage 동기화, flicker 방지)
10. 페이드인 모션 (`opacity 0→1`, `translateY 8px→0`, 0.8s)
11. 잉크 번짐 인터랙션 (간직하기) — 다음 페이즈

---

## 13. 모바일 대응 (다음 페이즈 선준비)

현재 1440 데스크탑 기준이지만, 컴포넌트는 처음부터 fluid하게 구성할 것.

| 요소 | 데스크탑 | 모바일 (360px) |
|---|---|---|
| 읽기 본문 | 21px / 1.95 | 18px / 1.85 |
| 좌우 패딩 | 56px | 24px |
| Feed 그리드 | 2-column | 1-column |
| 랜딩 갈림길 | 좌우 50:50 | 세로 스택 (hairline 추가) |
| GGNav | 상단 가로 | 하단 탭바 5아이콘 |
| Today max-width | 780px | 100% - 48px |

---

## 14. 체크리스트

구현 완료 후 다음 항목을 확인할 것.

### 타이포그래피
- [ ] 읽기 본문 Serif 21px / 1.95 적용
- [ ] 2번째 단락부터 text-indent 2em
- [ ] Eyebrow 클래스 Mono 11px / 0.18em / UPPERCASE
- [ ] `· · ·` (letter-spacing 0.5em, `var(--ink-4)`)

### 모션
- [ ] 페이드인 0.8s ease-out (opacity + translateY 8px)
- [ ] 호버 0.15s, transform 미사용 확인
- [ ] 테마 전환 0.4s, flicker 없음

### UI 원칙
- [ ] 토스트/팝업/알림 없음 확인
- [ ] 버튼·카드 border-radius 0 확인
- [ ] 에러 메시지: 빨간 박스 → 헤어라인 + Mono 11px
- [ ] 이모지 사용 없음 확인
- [ ] `.skin.grain` 루트 적용 확인

### 테마
- [ ] 라이트/다크 모든 색상 정상 전환
- [ ] localStorage 테마 저장
- [ ] `<head>` 인라인 스크립트로 flicker 방지
- [ ] GGStars 라이트 모드에서 자동 숨김

---

*이 문서는 `design_handoff_geulgyeol/README.md` + `styles/theme.css` + `scripts/v2/*.jsx` + `PRD.md`를 통합·재구성했습니다. 원본 파일이 업데이트되면 이 문서도 함께 갱신하세요.*