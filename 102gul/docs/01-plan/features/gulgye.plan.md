# Plan — 글결(Geulgyeol)

## Executive Summary

| 관점 | 내용 |
|---|---|
| Problem | SNS 글귀는 빠르게 소비되고 다시 찾기 어려움. 집중이 깨지는 환경 |
| Solution | 하루 한 편 조용히 읽고, 저장하고, 직접 쓸 수 있는 한국어 글귀 서비스 |
| Functional UX Effect | 로그인 → 오늘의 글 읽기 → 저장 → 작성 → 마이페이지 완성된 단일 플로우 |
| Core Value | 타이포그래피 중심의 조용한 읽기 경험, Google 로그인으로 즉시 시작 |

## Context Anchor

| 항목 | 내용 |
|---|---|
| WHY | 학교 과제 시연용 로컬 MVP. 인증·저장·AI생성·작성 흐름을 명확하게 보여야 함 |
| WHO | 감정 정돈러 (매일 짧은 글 읽기), 조용한 창작자 (짧게 쓰고 공개 선택) |
| RISK | Google OAuth redirect 설정 오류, SQLite 스키마 마이그레이션, AI API 장애 |
| SUCCESS | localhost:3000에서 전체 플로우 시연 가능, 비공개 글 격리 검증 통과 |
| SCOPE | SQLite + NextAuth.js v5 기반 로컬 실행 앱. Vercel 배포·결제 제외 |

---

## 1. 요구사항

### 1.1 P0 — 필수

| ID | 기능 | 상세 |
|---|---|---|
| F-01 | Google 로그인 | NextAuth.js v5 Google Provider |
| F-02 | OAuth Callback | `/auth/callback` → 세션 생성 → `/today` |
| F-03 | 보호 라우트 | middleware에서 미인증 → `/login` redirect |
| F-04 | 프로필 자동 생성 | NextAuth signIn 콜백에서 users 레코드 생성 |
| F-05 | 오늘의 글 조회 | 날짜 기준 daily_quotes 1건 조회 |
| F-06 | 오늘의 글 생성 | 없으면 AI(Anthropic) 또는 fallback seed |
| F-07 | 글 저장/해제 | saved_items 토글 |
| F-08 | 저장 목록 | 내 저장 글 목록 |
| F-09 | 글 작성 | 제목(40자), 본문(600자), 태그, 공개여부 |
| F-10 | 글 수정/삭제 | 본인 글만 |
| F-11 | 발견 피드 | 공개 글 최신순 |
| F-12 | 로그아웃 | NextAuth signOut |
| F-13 | 로컬 실행 | npm run dev → localhost:3000 |

### 1.2 기술 스택 (Supabase → SQLite 변경)

| 레이어 | 기존(TRD) | 변경 |
|---|---|---|
| Auth | Supabase Auth | NextAuth.js v5 (Google Provider) |
| Database | Supabase PostgreSQL + RLS | SQLite + Drizzle ORM + 앱 레벨 접근 제어 |
| Session | @supabase/ssr | NextAuth.js JWT/DB session |
| Styling | Tailwind CSS v4 | Tailwind CSS v4 (동일) |
| AI | Anthropic Claude API | Anthropic Claude API (동일) |
| Forms | React Hook Form + Zod | React Hook Form + Zod (동일) |

### 1.3 환경 변수

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=
DATABASE_URL=./gulgye.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 2. 성공 기준

| 항목 | 조건 |
|---|---|
| Google 로그인 | 실제 Google 계정으로 로그인 성공 |
| 세션 유지 | 새로고침 후 로그인 유지 |
| 보호 라우트 | 로그아웃 상태에서 /today 접근 → /login 이동 |
| 오늘의 글 | 로그인 후 오늘 날짜 글 표시 |
| 저장 | 저장 후 마이페이지 확인 |
| 작성 | 새 글 작성 후 내 글 목록 표시 |
| 발견 피드 | 공개 글이 피드에 표시 |
| 데이터 격리 | 다른 사용자의 비공개 글 접근 불가 (앱 레벨) |
| 로컬 실행 | npm run dev 단일 명령으로 시연 |

---

## 3. 리스크

| ID | 리스크 | 대응 |
|---|---|---|
| R-01 | Google OAuth redirect 설정 오류 | Google Console + NextAuth callback URL 체크리스트 |
| R-02 | SQLite 동시 쓰기 제한 | WAL 모드 활성화 |
| R-03 | AI API 장애 | fallback seed 5개 준비 |
| R-04 | NextAuth 세션 쿠키 미작동 | NEXTAUTH_SECRET 필수 검증 |
| R-05 | 비공개 글 노출 | API route에서 user_id 비교 강제 |

---

## 4. 구현 순서

1. Next.js 프로젝트 초기화 (App Router, TypeScript, Tailwind)
2. SQLite + Drizzle ORM 설정, 스키마 정의
3. NextAuth.js v5 Google OAuth 설정
4. 보호 미들웨어
5. DB 시드 데이터
6. API Routes (quote, saved, posts)
7. 페이지 UI (/, /login, /today, /feed, /write, /me)
8. AI 글귀 생성 (Anthropic)
9. QA 체크리스트 검증
