# PDCA — Prigio 개발 사이클 추적

## bkit 레벨: Dynamic
> Full-stack: FastAPI + Local PostgreSQL + LMStudio + React

---

## Cycle 1 — 기반 구축

### [PLAN] 계획
- [x] PRD 작성 (plan_local.md)
- [x] DB 스키마 설계 (users, refrigerators, ingredients, monthly_usage)
- [x] LMStudio API 연동 설계 (OpenAI 호환, 모델 자동 탐색)

### [DO] 구현
- [x] Backend core (config, database, security, dependencies)
- [x] SQLAlchemy 모델 4종
- [x] LMStudio 클라이언트 (lmstudio_client.py)
- [x] AI 서비스 (ai_service.py, recipe_service.py)
- [x] API 라우트 전체 (auth, fridge, analysis, recipes, quota, admin)
- [x] Frontend 전체 (7 페이지, 6 API 클라이언트)

### [CHECK] 확인 (사용자가 수행)
- [ ] LMStudio 연결 확인: `GET http://localhost:8000/api/v1/system/health`
- [ ] Alembic 마이그레이션: `alembic upgrade head`
- [ ] Google OAuth 설정 및 로그인 테스트
- [ ] AI 이미지 분석 E2E 테스트
- [ ] 레시피 생성 E2E 테스트

### [ACT] 개선
- [ ] JSON 파싱 오류 처리 강화
- [ ] 비전 모델 없을 때 UX 개선
- [ ] 응답 캐싱 최적화

---

## 다음 사이클 계획
- Cycle 2: 성능 최적화 (응답 캐싱, 스트리밍)
- Cycle 3: 테스트 커버리지 (pytest)
- Cycle 4: Docker 배포 설정

---

*bkit PDCA — Prigio v2.0 (Local Stack)*
