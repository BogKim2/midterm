# Meal Calorie Tracker MVP

`mct`는 기존 `meal-calorie-tracker`를 참조해 새로 분리한 MVP 구현입니다.

구성:
- `frontend/`: React + Vite
- `backend/`: FastAPI + TensorFlow + LM Studio
- `docs/`: plan / design 문서

핵심 차이:
- `Stripe` 제거
- `Google OAuth` 유지
- `LM Studio`를 식사 요약 코멘트에 연동

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

환경변수:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=
```

## Backend

권장 Python은 `3.12`입니다.

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python main.py
```

환경변수:

```env
LMSTUDIO_ENABLED=true
LMSTUDIO_BASE_URL=http://127.0.0.1:1234
LMSTUDIO_MODEL=qwen/qwen3-vl-8b
LMSTUDIO_TIMEOUT_SECONDS=180
```

## Verification

Frontend build:

```powershell
cd frontend
npm run build
```

Backend smoke test:

```powershell
cd backend
.\.venv\Scripts\python smoke_test.py
```
