# saju-ai-mvp-foundation - Design Document (Starter)

> Version: 1.0.0 | Date: 2026-05-05 | Status: Draft
> Level: Starter | Plan: docs/01-plan/features/saju-ai-mvp-foundation.plan.md

---

## 1. Overview

이 feature는 사주AI의 첫 실행 가능한 웹앱 골격을 만든다. 목표는 전체 명리 기능 완성이 아니라, 사용자가 앱에 진입해 주요 페이지를 이동하고 사주 입력값을 넣은 뒤 결과 화면까지 흐름을 확인할 수 있는 최소 구조를 제공하는 것이다.

## 2. Approaches

### 2.1 Minimal Change

- 내용:
  단일 `App.tsx`에 모든 라우트와 화면 placeholder를 몰아넣고 최소 스타일만 입힌다.
- 복잡도:
  낮음
- 리스크:
  이후 기능 추가 시 파일이 빠르게 비대해진다.
- 변경 범위:
  적음
- 판단:
  초기 속도는 빠르지만 `plan.md`의 구조를 반영하기 어렵다.

### 2.2 Clean Separation

- 내용:
  `components`, `pages`, `hooks`, `lib`, `store`, `types` 구조를 먼저 만들고, 공통 레이아웃과 라우팅, 상태, LLM 연동 진입점을 분리한다.
- 복잡도:
  중간
- 리스크:
  초기 파일 수는 늘어나지만 구조가 안정적이다.
- 변경 범위:
  중간
- 판단:
  이후 확장성과 현재 요구의 균형이 가장 좋다.

### 2.3 Pragmatic Default

- 내용:
  `Clean Separation`을 택하되, 아직 복잡한 도메인 계산은 mock 데이터와 얇은 타입 정의만 두고 실제 로직은 후속 feature로 미룬다.
- 복잡도:
  중간
- 리스크:
  일부 화면은 placeholder가 포함된다.
- 변경 범위:
  중간
- 판단:
  추천. 현재 저장소 상태와 `plan.md`의 넓은 범위를 감안할 때 가장 실용적이다.

## 3. Page Structure

- `/`
  서비스 소개, 핵심 기능 카드, CTA
- `/input`
  생년월일시/성별 입력 폼
- `/result`
  입력 데이터와 mock 분석 결과 또는 생성된 결과 표시
- `/analysis`
  종합 분석 상세 placeholder
- `/compatibility`
  궁합 기능 placeholder
- `/calendar`
  운세 캘린더 placeholder
- `/timeline`
  인생 타임라인 placeholder
- `/login`
  로그인 placeholder
- `/signup`
  회원가입 placeholder
- `/mypage`
  마이페이지 placeholder
- `/premium`
  프리미엄 안내 placeholder

## 4. Design

### 4.1 Layout

- 공통 레이아웃은 `Header`, `main`, `Footer` 구조로 통일한다.
- 메인 영역은 `PageWrapper`가 감싸고, 페이지별로 최대 폭과 패딩을 맞춘다.
- 배경은 전역 `StarField`와 다크 그라디언트를 사용한다.
- 모바일 우선으로 구성하되, 데스크톱에서는 2열 카드와 소개 섹션을 사용한다.

### 4.2 Styling

- `plan.md`의 CSS 변수 이름을 최대한 유지한다.
- 폰트는 `Noto Serif KR`, `Noto Sans KR`, `JetBrains Mono`를 적용한다.
- 공통 카드, 버튼, 배지, 입력 컴포넌트는 glass/dark 스타일로 맞춘다.
- 반응형 기준은 `640px`, `1024px` 두 구간으로 단순화한다.

### 4.3 Data Boundaries

- `types/index.ts`
  `SajuInput`, `Ganji`, `SajuAnalysis`, `CompatibilityResult`, `Daeun` 타입 정의
- `store/sajuStore.ts`
  현재 입력값, 현재 분석 결과, 로딩 상태를 보관
- `lib/lmstudio.ts`
  환경 변수 기반 클라이언트 팩토리
- `lib/prompts.ts`
  시스템 프롬프트와 입력 프롬프트 빌더
- `hooks/useAI.ts`
  현재는 mock fallback을 포함한 얇은 호출 래퍼
- `lib/saju/*`
  실제 정교한 계산 대신 초기 더미 계산 함수 제공

## 5. Components

- 레이아웃:
  `Header`, `Footer`, `PageWrapper`
- UI:
  `Button`, `Card`, `Badge`, `Input`, `Select`, `Spinner`, `StarField`, `SajuPillar`
- 분석:
  `FiveElements`
- 페이지:
  각 라우트별 page component

## 6. Implementation Order

1. Vite + React + TypeScript 기반 파일 구성
2. 전역 CSS와 공통 컴포넌트 작성
3. 라우터와 페이지 골격 작성
4. 타입, 상태 저장소, mock 도메인 유틸 작성
5. 입력 페이지와 결과 페이지 흐름 연결
6. LM Studio 연동 진입점과 fallback 처리 추가
7. 빌드 검증

## 7. Verification Plan

- `npm install`
- `npm run build`
- 주요 라우트 렌더링 확인
- 입력 후 결과 페이지 상태 전달 확인
- 환경 변수 미설정 시 mock 결과로 동작하는지 확인

## 8. Learning Points

- React Router 기반 멀티 페이지 구조
- Zustand로 단순 전역 상태 구성
- 로컬 LLM 연동을 위한 환경 변수/클라이언트 경계 설계
- 큰 요구사항을 MVP slice로 축소하는 방법
