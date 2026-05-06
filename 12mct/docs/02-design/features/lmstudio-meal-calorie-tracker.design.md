# lmstudio-meal-calorie-tracker - Design Document

> Version: 1.0.0 | Date: 2026-05-06 | Status: Draft
> Based on: `docs/01-plan/features/lmstudio-meal-calorie-tracker.plan.md`

---

## 1. Summary

새 앱은 기존 칼로리 추적 UX를 유지하되, AI 계층을 둘로 나눈다.

- 기본 분류: 기존 TensorFlow Food-101 모델
- 보조 해석: LM Studio 로컬 모델

이 구조는 사진 분류 안정성을 유지하면서 로컬 LLM 활용 가치를 추가하는 가장 작은 변경이다.

## 2. Architecture

### 2.1 Frontend
- `frontend/`
- React 19 + Vite
- LocalStorage 기반 상태 저장
- Google OAuth 로그인
- 주요 페이지
  - `LoginPage`
  - `ProfilePage`
  - `HomePage`
  - `UploadPage`
  - `ResultPage`
  - `HistoryPage`
  - `SettingsPage`

### 2.2 Backend
- `backend/`
- FastAPI
- 엔드포인트
  - `/api/health`
  - `/api/categories`
  - `/api/foods`
  - `/api/nutrition/{food_class}`
  - `/api/predict`
  - `/api/predict-with-hint`
  - `/api/meal-insight`

### 2.3 AI Responsibilities
- TensorFlow model
  - 음식 분류
  - 카테고리 힌트 기반 재분류
- LM Studio
  - 사진/예측 결과 기반 음식 설명
  - 총 영양 요약
  - 운동 및 섭취 피드백 문장

## 3. Reuse Strategy

### 3.1 Reuse As-Is or Near-As-Is
- App context and LocalStorage helpers
- Profile calculations
- Upload flow state machine
- Home/history/result page structure

### 3.2 Replace or Remove
- `PaymentModal`
- Stripe env vars and API endpoints
- Settings page의 결제 UI

### 3.3 New Additions
- LM Studio client module in backend
- meal insight response model
- frontend result card for AI insight

## 4. API Design

### 4.1 GET `/api/health`
Response:

```json
{
  "status": "ok",
  "ml_model_loaded": true,
  "lmstudio_enabled": true,
  "lmstudio_model": "qwen/qwen3-vl-8b"
}
```

### 4.2 POST `/api/predict`
Input:
- multipart file

Response:

```json
{
  "predicted_class": "bibimbap",
  "confidence": 0.92,
  "nutrition": {
    "food_class": "bibimbap",
    "name_ko": "비빔밥",
    "category": "밥/면류",
    "calorie": 560,
    "carbs_g": 79,
    "protein_g": 19,
    "fat_g": 16
  },
  "insight": {
    "source": "lmstudio",
    "title": "한 끼 분석",
    "summary": "비빔밥으로 보이며 탄수화물 비중이 높은 편입니다.",
    "tips": [
      "단백질 반찬을 함께 먹으면 균형이 좋아집니다.",
      "오늘 남은 목표 칼로리와 비교해 저녁 섭취량을 조절하세요."
    ]
  }
}
```

### 4.3 POST `/api/meal-insight`
Input:

```json
{
  "food_class": "bibimbap",
  "name_ko": "비빔밥",
  "category": "밥/면류",
  "calorie": 560,
  "carbs_g": 79,
  "protein_g": 19,
  "fat_g": 16
}
```

Response:

```json
{
  "source": "lmstudio",
  "title": "한 끼 분석",
  "summary": "탄수화물 비중이 큰 식사입니다.",
  "tips": [
    "채소와 단백질을 함께 섭취하세요.",
    "활동량이 적은 날에는 양을 조절하는 편이 좋습니다."
  ]
}
```

## 5. LM Studio Integration

### 5.1 Configuration
- `LMSTUDIO_BASE_URL`
- `LMSTUDIO_MODEL`
- `LMSTUDIO_TIMEOUT_SECONDS`
- `LMSTUDIO_ENABLED`

### 5.2 Prompting Strategy
- 시스템 프롬프트는 짧고 고정한다.
- 입력은 음식명, 분류 카테고리, 영양 정보만 넣는다.
- JSON만 반환하도록 강제한다.
- 실패 시 서버가 안전한 폴백 응답을 반환한다.

### 5.3 Why Text-First, Not Full Replacement
- 로컬 비전 LLM은 음식 사진 분류 일관성이 기존 분류기보다 떨어질 수 있다.
- 현재 목적은 높은 재현성과 빠른 완성도다.
- 따라서 LLM은 보조 판단과 설명 생성만 담당한다.

## 6. Frontend Interaction Design

### 6.1 Upload Flow
1. 사진 선택
2. `/api/predict` 호출
3. 음식명/영양/AI 코멘트 표시
4. 사용자 확인 또는 카테고리 힌트 선택
5. 항목 누적 후 결과 저장

### 6.2 Result Flow
- 저장 전 선택한 음식 리스트 표시
- 총 칼로리와 합산 영양소 계산
- 대표 음식 또는 총합 기준 AI 코멘트 표시

## 7. File Layout

```text
mct/
  docs/
  frontend/
  backend/
```

Frontend key files:

```text
frontend/src/App.jsx
frontend/src/contexts/AppContext.jsx
frontend/src/pages/LoginPage.jsx
frontend/src/pages/UploadPage.jsx
frontend/src/pages/ResultPage.jsx
frontend/src/utils/storage.js
```

Backend key files:

```text
backend/app/main.py
backend/app/lmstudio.py
backend/app/nutrition_db.json
backend/app/class_indices.json
backend/app/food_classifier.h5
```

## 8. Verification Plan

- Backend:
  - health endpoint
  - categories endpoint
  - foods endpoint
  - meal insight endpoint
- Frontend:
  - build succeeds
  - no Stripe imports remain
  - result page renders insight block
- Integration:
  - LM Studio model list reachable from local API
  - upload and insight path succeeds or degrades gracefully
