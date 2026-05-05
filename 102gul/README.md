# 글결(Geulgyeol)

> 하루 3~5분, 한 편의 글을 나만의 속도로 읽고 간직하는 공간

## 빠른 시작 (로컬 실행)

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열고 Google OAuth 키와 NEXTAUTH_SECRET 입력

# 3. DB 초기화
npm run db:migrate

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 환경 변수 설정

| 변수 | 필수 | 설명 |
|---|---|---|
| `GOOGLE_CLIENT_ID` | ✅ | Google Cloud Console → OAuth 2.0 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google Cloud Console → OAuth 2.0 클라이언트 보안 비밀 |
| `NEXTAUTH_SECRET` | ✅ | 임의의 무작위 문자열 (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | ✅ | `http://localhost:3000` |
| `ANTHROPIC_API_KEY` | ❌ | 없으면 fallback seed 글 사용 |

## Google OAuth 설정

Google Cloud Console에서:
- OAuth 2.0 클라이언트 타입: **Web application**
- 승인된 JavaScript 원본: `http://localhost:3000`
- 승인된 리디렉션 URI: `http://localhost:3000/api/auth/callback/google`

## 기술 스택

| 레이어 | 기술 |
|---|---|
| Frontend | Next.js 16 App Router + TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js v5 (Google OAuth) |
| Database | SQLite + Drizzle ORM |
| AI | Anthropic Claude API (선택, fallback seed 있음) |
| Forms | React Hook Form + Zod |

## 주요 화면

| 경로 | 설명 |
|---|---|
| `/` | 랜딩 페이지 |
| `/login` | Google 로그인 |
| `/today` | 오늘의 글 읽기 + 저장 |
| `/feed` | 공개 글 발견 피드 |
| `/write` | 글 작성 |
| `/me` | 마이페이지 (저장 글 / 내 글 관리) |

## 로컬 QA 체크리스트

- [ ] Google 로그인 성공
- [ ] 새로고침 후 세션 유지
- [ ] 로그아웃 후 `/today` 접근 시 `/login` 이동
- [ ] 오늘의 글 표시 (AI 또는 fallback seed)
- [ ] 글 저장 후 마이페이지에서 확인
- [ ] 글 작성 후 내 글 목록 표시
- [ ] 공개 글이 발견 피드에 표시
- [ ] 비공개 글은 본인만 볼 수 있음 (다른 계정에서 접근 불가)

## 관련 문서

- [PRD.md](./PRD.md) — 제품 요구사항 문서
- [TRD.md](./TRD.md) — 기술 요구사항 문서
