# 110dungeon — AI Dungeon RPG (LM Studio + Google OAuth)

로컬 LLM(Qwen3, LM Studio)과 Google OAuth를 쓰는 텍스트 던전 RPG 풀스택 프로젝트입니다.

- **백엔드:** `backend/` — FastAPI, SQLite, OpenAI 호환 LM Studio 연동
- **프론트엔드:** `frontend/` — React 19, Vite, Zustand
- **설계·계획:** 상위 `plan.md` 참고

## 빠른 시작

1. LM Studio에서 모델 서버 실행 (`http://localhost:1234/v1`).
2. `backend/.env.example`를 복사해 `backend/.env` 작성 (Google OAuth, `SECRET_KEY` 등).
3. `frontend/.env`에 `VITE_API_URL=http://localhost:8000/api/v1` 설정.
4. 백엔드: `uv sync` 후 `uv run fastapi dev app/main.py` (또는 프로젝트에 맞는 실행 명령).
5. 프론트: `npm install` 후 `npm run dev`.

원본 레포 참고: [iringsoya-gif/ai-dungeon-rpg](https://github.com/iringsoya-gif/ai-dungeon-rpg).
