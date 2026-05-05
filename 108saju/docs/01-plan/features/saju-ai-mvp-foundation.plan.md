# saju-ai-mvp-foundation - Plan Document

> Version: 1.0.0 | Date: 2026-05-05 | Status: Draft
> Level: Starter

---

## Summary

- Problem:
  `plan.md`에는 사주AI 전체 구현 방향이 정리되어 있지만, 현재 저장소에는 실제 코드가 없고 전체 범위가 넓어 바로 구현에 들어가면 과도한 변경과 범위 확장이 발생할 가능성이 높다.
- User impact:
  첫 구현 단계에서 앱 골격, 공통 디자인 토큰, 라우팅, 핵심 입력/결과 흐름의 최소 뼈대를 확보하면 이후 사주 계산, AI 해석, 캘린더, 궁합 기능을 작은 단위로 이어서 구현할 수 있다.
- Constraints:
  React + TypeScript + Vite 기반이어야 한다.
  `plan.md`의 디자인/라우팅/기술 스택 방향을 따른다.
  LLM은 LM Studio의 OpenAI 호환 로컬 API를 전제로 한다.
  프로덕션에서 `127.0.0.1:1234` 직접 호출은 불가능하므로 로컬 개발용 흐름과 배포 제약을 분리해서 다뤄야 한다.
  변경은 작고 검증 가능해야 하며, 아직 요구되지 않은 인증/결제/고급 명리 로직은 미리 구현하지 않는다.

## 1. Overview

### 1.1 Purpose

`plan.md`를 구현 가능한 작업 단위로 축소해, 사주AI MVP의 첫 번째 PDCA feature인 기반 구축 범위를 명확히 정의한다.

### 1.2 Background

전체 목표는 사주 분석, 궁합, 운세 캘린더, 인생 타임라인을 포함한 React 웹앱 구축이다. 다만 현재 코드베이스가 비어 있으므로, 첫 단계에서는 전체 기능 완성이 아니라 이후 기능이 얹힐 수 있는 안정적인 프런트엔드 골격과 핵심 흐름의 진입점을 만드는 것이 우선이다.

## 2. Goals

### 2.1 Primary Goals

- [ ] Vite + React + TypeScript 기반 프로젝트를 초기화하고 실행 가능한 앱 골격을 만든다.
- [ ] `plan.md` 기준의 디자인 토큰, 공통 레이아웃, 기본 라우팅, 핵심 페이지 뼈대를 구성한다.
- [ ] 사주 입력에서 결과 화면으로 이어지는 최소 흐름과 LM Studio 연동 진입점 구조를 마련한다.
- [ ] 이후 PDCA `design`과 `do` 단계에서 작은 단위로 확장할 수 있도록 구조를 고정한다.

### 2.2 Non-Goals

- 정교한 사주 명리 계산의 완성본 구현
- 궁합/캘린더/타임라인의 전체 비즈니스 로직 구현
- 실제 인증, 결제, DB 저장 기능 구현
- 운영 배포용 서버 아키텍처 확정
- 배포 사이트의 모든 에셋을 완전 복제하는 작업

## 3. Scope

### 3.1 In Scope

- 프로젝트 초기화
- 기본 디렉터리 구조 생성
- 글로벌 스타일과 CSS 변수 정의
- 공통 레이아웃 컴포넌트 뼈대
- 기본 UI 컴포넌트 일부
- 라우터 및 주요 페이지 placeholder
- 입력 페이지와 결과 페이지의 최소 화면 흐름
- LM Studio 설정값을 읽는 클라이언트 계층 초안
- 상태 관리 기본 구조 초안
- 로컬 개발/검증 기준 정의

### 3.2 Out of Scope

- 실제 만세력 계산 정확도 보장
- 로컬 LLM 프롬프트 품질 튜닝
- 실서비스용 로그인/회원가입
- 유료 플랜 결제 흐름
- 백엔드 연동

## 4. Success Criteria

- [ ] `npm install` 후 `npm run dev` 또는 동등한 개발 서버 실행이 가능하다.
- [ ] `/`, `/input`, `/result`, `/analysis`, `/compatibility`, `/calendar`, `/timeline`, `/login`, `/signup`, `/mypage`, `/premium` 라우트가 최소 화면으로 렌더링된다.
- [ ] 글로벌 스타일에 `plan.md`의 핵심 색상/폰트 토큰이 반영된다.
- [ ] 공통 레이아웃과 기본 UI 컴포넌트가 최소 1회 이상 실제 페이지에서 사용된다.
- [ ] 입력 페이지에서 사용자 입력을 수집해 결과 페이지로 전달하는 최소 흐름이 동작한다.
- [ ] LM Studio 연동을 위한 환경 변수 구조와 클라이언트 진입 파일이 준비된다.
- [ ] 빌드 또는 타입체크 중 최소 하나의 검증 명령이 통과한다.

## 5. Verification

- 개발 서버 실행 후 주요 라우트 수동 확인
- 입력 페이지에서 결과 페이지 이동 수동 확인
- 빌드 또는 타입체크 실행
- 환경 변수 누락 시 동작 방식 점검
- 구현 범위가 본 문서의 in-scope를 넘지 않았는지 diff 기준 확인

## 6. Schedule

| Phase | Target Date | Status |
|-------|------------|--------|
| Plan | 2026-05-05 | In Progress |
| Design | TBD | Pending |
| Implementation | TBD | Pending |
| Review | TBD | Pending |

## 7. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 첫 feature 범위가 너무 커져 초기 구현이 지연됨 | High | High | Phase 1 기반 구축과 핵심 흐름 뼈대까지만 제한하고, 나머지는 후속 feature로 분리 |
| LM Studio 연결 방식이 브라우저 환경에서 막힘 | High | Medium | 초기 계획에 proxy 또는 로컬 전용 흐름을 명시하고, 구현 단계에서 직접 호출 의존을 최소화 |
| `plan.md`의 디자인 요구가 넓어 UI 구현이 과도해짐 | Medium | High | 토큰과 공통 레이아웃만 우선 반영하고 세부 연출은 후속 단계로 분리 |
| 사주 계산 로직이 예상보다 복잡함 | High | Medium | 첫 단계에서는 계산 인터페이스와 mock 데이터 흐름만 정의하고 정확한 계산은 별도 feature로 분리 |

## 8. References

- [plan.md](F:/03llm/108saju/plan.md)
- 배포 기준 UI: `https://saju-frontend-nine.vercel.app/`
- LM Studio: `https://lmstudio.ai/`

## 9. Next PDCA Recommendation

- 다음 단계는 `design`이다.
- 설계 단계에서는 아래 3가지를 먼저 고정한다.
- 라우팅/페이지 구조
- 상태 관리와 데이터 타입 경계
- LM Studio 연동 방식을 로컬 개발 기준으로 어떻게 단순화할지
