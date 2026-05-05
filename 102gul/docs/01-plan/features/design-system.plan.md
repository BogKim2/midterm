# Plan — design-system (글결 UI 전면 리디자인)

## Executive Summary

| 관점 | 내용 |
|---|---|
| **Problem** | 기능은 완성된 글결 앱이지만 design.md가 정의한 "조용한 방" 미학이 현재 UI에 전혀 반영되지 않아 시연 완성도가 낮음 |
| **Solution** | design.md §1–§8 스펙을 완전히 구현 — 새 CSS 변수 시스템, 공통 컴포넌트, 6개 페이지 리디자인, 라이트/다크 테마 토글 |
| **Function UX Effect** | Noto Serif KR 기반 타이포그래피 퍼스트 레이아웃, 직각 카드, 잉크 번짐 페이드인 모션, 토스트 없는 인라인 피드백 |
| **Core Value** | "하루 한 편의 글"이라는 서비스 정체성을 UI가 스스로 전달 — 글자가 주인공인 화면 |

## Context Anchor

| 축 | 내용 |
|---|---|
| **WHY** | 학교 과제 시연용 — 기능 완성 후 디자인 완성도로 차별화 필요 |
| **WHO** | 시연 평가자 + 개발자(본인) |
| **RISK** | Tailwind v4 CSS 변수 충돌, Google Font 로딩 지연, SSR hydration 에러 |
| **SUCCESS** | design.md §14 체크리스트 95%+ 충족, localhost:3000 전 페이지 시각 검증 |
| **SCOPE** | CSS 시스템 + 공통 컴포넌트 + 6개 페이지 + 테마 토글 + 모션 |

---

## 1. 요구사항

### 1-1. CSS 디자인 시스템
- [ ] `globals.css` → 새 CSS 변수 시스템 (`--bg`, `--ink`, `--accent` 등) 적용
- [ ] 라이트("새벽 안개") / 다크("밤하늘 잉크") 양 모드 완전 구현
- [ ] `data-theme="light|dark"` + localStorage 테마 유지
- [ ] `<head>` 인라인 스크립트로 flicker 방지
- [ ] 테마 전환 0.4s ease 트랜지션
- [ ] `.skin`, `.grain`, `.fog`, `.eyebrow`, `.hairline` 유틸리티 클래스

### 1-2. 타이포그래피
- [ ] Noto Serif KR (Serif) + Inter Tight (Sans) + JetBrains Mono (Mono) Google Fonts 로드
- [ ] 읽기 본문 Serif 21px / 1.95 line-height
- [ ] Eyebrow: Mono 11px / 0.18em letter-spacing / UPPERCASE
- [ ] 2번째 단락부터 text-indent: 2em (시집 관례)

### 1-3. 공통 컴포넌트
- [ ] `GGMark` — SVG 로고 (원 + "결")
- [ ] `GGNav` — 상단 네비게이션 (active prop, 테마 토글 버튼)
- [ ] `GGIcon` — SVG 아이콘 세트 (bookmark, pen, share, search, moon, sun, plus, arrow-right)

### 1-4. 페이지 리디자인 (6개)
- [ ] `/login` — 2-column 그리드 (인용 패널 + 폼 패널)
- [ ] `/today` — max-width 780px 읽기 화면, 3등분 액션 row
- [ ] `/feed` — 헤더 섹션 + 카테고리 필터 + 2-column 카드 그리드
- [ ] `/write` — 에디터 화면 (제목/본문/태그, 글자수 카운터)
- [ ] `/me` — 프로필 헤더 + 4-stat 그리드 + 탭 기반 콘텐츠
- [ ] `/` (landing) — 3단 호흡 랜딩 (헤더 + 오늘의 글 + 갈림길)

### 1-5. 모션
- [ ] 페이드인: `opacity 0→1` + `translateY 8px→0`, 0.8s ease-out
- [ ] 호버: background-color/color만, 0.15s (transform 변경 금지)
- [ ] 간직하기: opacity fade 후 라벨 "간직됨" 교체 (토스트 금지)

### 1-6. 비기능 요구사항
- [ ] 이모지 사용 0개
- [ ] 버튼/카드 border-radius: 0 (아바타/토글 제외)
- [ ] 에러 표현: 빨간 박스 금지 → 헤어라인 + Mono 11px 메시지
- [ ] TypeScript 빌드 에러 0

---

## 2. 구현 순서

design.md §12 권장 순서 준수:

1. **Module 1** — CSS 시스템 + 테마 토글 (`globals.css` 전면 교체, `layout.tsx` 인라인 스크립트)
2. **Module 2** — 공통 컴포넌트 (`GGMark`, `GGIcon`, `GGNav`)
3. **Module 3** — Today 페이지 (가장 정서가 응축된 핵심 화면)
4. **Module 4** — Login 페이지
5. **Module 5** — Feed 페이지 + 카테고리 필터
6. **Module 6** — Write(Editor) 페이지
7. **Module 7** — Me(Profile) 페이지
8. **Module 8** — Landing 페이지
9. **Module 9** — 전체 검증 + 체크리스트 확인

---

## 3. 위험 요소

| 위험 | 심각도 | 대응 |
|---|---|---|
| Tailwind v4 CSS 변수 충돌 | HIGH | `@theme` 대신 `:root` 직접 정의, Tailwind arbitrary value `bg-[--bg]` 활용 |
| Google Font 로딩 지연 | MEDIUM | `font-display: swap`, preconnect 유지 |
| SSR hydration 에러 | MEDIUM | 테마 감지 로직 `suppressHydrationWarning` 처리 |
| 기존 API 연동 깨짐 | LOW | UI만 변경, API 로직 손대지 않음 |

---

## 4. 성공 기준

- design.md §14 체크리스트 19개 항목 중 18개 이상 충족 (95%+)
- 라이트/다크 전환 flicker 없음 확인
- 6개 페이지 시각 정상 확인 (localhost:3000)
- TypeScript 빌드 에러 0
