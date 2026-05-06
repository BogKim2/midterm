# lmstudio-meal-calorie-tracker - Plan Document

> Version: 1.0.0 | Date: 2026-05-06 | Status: Draft
> Level: Starter

---

## 1. Overview

### 1.1 Purpose
`mct` 아래에 Google 로그인과 로컬 식사 기록 기능을 포함한 한끼 칼로리 추적 웹앱을 새로 구현한다. 기존 TensorFlow 음식 분류 흐름을 유지하면서 LM Studio 로컬 모델을 보조 분석 계층으로 붙여 음식 설명과 식단 코멘트를 생성한다.

### 1.2 Background
기존 `meal-calorie-tracker`는 사용자 경험과 식단 흐름이 이미 정리되어 있지만, 결제 기능이 포함되어 있고 로컬 LLM 연동은 없다. 이번 작업은 결제를 제거하고 LM Studio API를 연동한 실사용 가능한 로컬 MVP를 새 디렉터리에서 독립적으로 만드는 것이 목표다.

## 2. Goals

### 2.1 Primary Goals
- [ ] `mct` 안에 독립 실행 가능한 프론트엔드와 백엔드를 만든다.
- [ ] Google OAuth 로그인, 프로필 관리, 사진 업로드, 칼로리 조회, 히스토리 기능을 구현한다.
- [ ] LM Studio 모델을 이용해 음식 사진 기반 보조 설명과 식단 코멘트를 생성한다.
- [ ] Stripe 및 결제 관련 코드 없이 동작하게 만든다.

### 2.2 Non-Goals
- 서버 사이드 사용자 계정 저장소를 추가하지 않는다.
- Food-101 모델 재학습은 하지 않는다.
- 모바일 앱으로 확장하지 않는다.
- 정확도 수치를 외부 벤치마크로 증명하지 않는다.

## 3. Scope

### 3.1 In Scope
- FastAPI 백엔드
- React + Vite 프론트엔드
- Google OAuth 로그인
- LocalStorage 기반 프로필/식사 저장
- 기존 Food-101 영양 DB 기반 결과 표시
- LM Studio OpenAI 호환 API 연동
- 수동 확인용 검증 스크립트/테스트

### 3.2 Out of Scope
- Stripe 결제
- PostgreSQL 같은 서버 DB
- 다중 기기 동기화
- 한국 음식 데이터셋 확장

## 4. Success Criteria

- [ ] `frontend`와 `backend`가 `mct` 아래에서 별도로 실행된다.
- [ ] Google OAuth client ID가 있을 때 실제 로그인, 없을 때 명시적 mock 로그인으로 동작한다.
- [ ] `/api/predict`와 `/api/predict-with-hint`가 기존 음식 분류 결과를 반환한다.
- [ ] `/api/meal-insight`가 LM Studio를 호출해 설명/코멘트를 생성한다.
- [ ] 결과 화면 또는 저장 흐름에서 AI 코멘트가 사용자에게 표시된다.
- [ ] 빌드와 최소 검증 명령이 모두 통과한다.

## 5. Schedule

| Phase | Target Date | Status |
|-------|------------|--------|
| Plan | 2026-05-06 | In Progress |
| Design | 2026-05-06 | Pending |
| Implementation | 2026-05-06 | Pending |
| Review | 2026-05-06 | Pending |

## 6. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| LM Studio 서버 미기동 | High | Medium | 환경변수로 비활성화하고 폴백 메시지 제공 |
| 비전 LLM 결과 불안정 | Medium | High | 기존 CNN 결과를 기본값으로 유지하고 LM Studio는 보조 분석으로 제한 |
| Google OAuth 설정 누락 | Medium | High | mock 로그인 경로 유지 |
| 기존 코드 복사 후 불필요 기능 유입 | Medium | Medium | Stripe 관련 파일/의존성 제거와 검색 검증 수행 |

## 7. Verification

- 백엔드 테스트 또는 헬스체크 검증
- 프론트엔드 production build
- LM Studio 연결 확인
- 주요 수동 플로우 점검
  - 로그인
  - 프로필 생성
  - 업로드
  - 예측 확인
  - AI 코멘트 확인
  - 기록 저장
  - 히스토리 조회

## 8. References

- Existing reference app: `F:\03llm\112mealcalorie\meal-calorie-tracker`
- Existing OAuth screen: `frontend/src/pages/LoginPage.jsx`
- Existing upload flow: `frontend/src/pages/UploadPage.jsx`
- Existing inference endpoint: `backend/app/main.py`
