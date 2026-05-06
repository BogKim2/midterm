# Prigio (프리지오)

**슬로건:** 찍으면, 요리가 된다  

냉장고 사진 AI 분석·식재료 관리·레시피 추천을 제공하는 풀스택 웹앱입니다. 로컬 개발 기준으로 **FastAPI + PostgreSQL + LM Studio(호환 OpenAI API)**, 프론트는 **React 18 + Vite + TypeScript + Tailwind**를 사용합니다.

## 문서

| 파일 | 설명 |
|------|------|
| [plan_local.md](./plan_local.md) | 로컬 스택 구현 계획·환경·API·트러블슈팅 |
| [docs/PDCA.md](./docs/PDCA.md) | PDCA 추적 |
| [frontend/README.md](./frontend/README.md) | 프론트엔드 상세 |

## 디렉터리 구조

```
prigio/
├── backend/       # FastAPI, Alembic, LM Studio 연동
├── frontend/      # Vite + React
├── docs/          # 설계·PDCA 문서
├── setup.ps1      # Windows 초기 셋업 스크립트
├── plan_local.md  # 로컬 구현 플랜
└── README.md      # 이 파일
```

## 빠른 시작 (Windows)

1. **PostgreSQL** 실행 후 `setup.ps1` 실행:

   ```powershell
   cd prigio
   .\setup.ps1
   ```

2. **Google OAuth**: `backend/.env`에 클라이언트 ID·시크릿 설정 (`.env.example` 참고).

3. **LM Studio**: 로컬 서버(기본 `http://localhost:1234`)에서 비전 모델 로드.

4. **마이그레이션·실행**:

   ```powershell
   cd backend
   .\.venv\Scripts\activate
   alembic upgrade head
   uvicorn app.main:app --reload --port 8000
   ```

   ```powershell
   cd frontend
   npm run dev
   ```

5. 브라우저: `http://localhost:5173`

## 주요 기능

- Google 로그인(OAuth) + JWT
- 냉장고 사진 AI 분석(로컬 LLM 비전)
- 식재료·유통기한 관리, 레시피 추천·상세
- 사용 쿼터(무료 한도) 및 관리자 API

## 라이선스

프로젝트 정책에 따릅니다.
