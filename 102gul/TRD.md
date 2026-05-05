# TRD — 글결(Geulgyeol)

> Technical Requirements Document · Google OAuth + Supabase + Local Next.js MVP

---

## 0. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서 버전 | v0.2 Local MVP |
| 작성일 | 2026-05-05 |
| 관련 문서 | `PRD.md` |
| 실행 방식 | Vercel 배포 없이 로컬 실행 |
| 인증 방식 | Supabase Auth Google OAuth |
| 결제 범위 | 제외 |

---

## 1. 시스템 개요

### 1.1 목표 아키텍처

```text
┌────────────────────────────────────────────────────────────┐
│ Local Browser                                               │
│ http://localhost:3000                                      │
└───────────────┬────────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────────┐
│ Local Next.js App                                           │
│ - App Router                                                │
│ - Server Components / Route Handlers                        │
│ - Tailwind CSS                                              │
│ - Supabase SSR Client                                       │
└───────────────┬───────────────────────┬────────────────────┘
                │                       │
                ▼                       ▼
┌─────────────────────────────┐   ┌──────────────────────────┐
│ Supabase Hosted Project      │   │ Anthropic API             │
│ - Auth                       │   │ - 오늘의 글귀 생성         │
│ - PostgreSQL                 │   │ - 서버에서만 호출          │
│ - RLS                        │   └──────────────────────────┘
│ - Storage(optional)          │
└───────────────┬─────────────┘
                │
                ▼
┌─────────────────────────────┐
│ Google OAuth                 │
│ - Google 계정 인증            │
│ - Supabase callback 처리      │
└─────────────────────────────┘
```

### 1.2 핵심 설계 원칙

1. **로컬 우선**: 앱은 `localhost:3000`에서 실행하고 시연한다.
2. **결제 제외**: Toss Payments, premium, subscription 관련 기능은 구현하지 않는다.
3. **Google OAuth 필수**: 이메일/비밀번호보다 Google 로그인을 MVP 인증 기준으로 둔다.
4. **서버 보안 경계 유지**: AI API key와 Supabase service role key는 서버 전용이다.
5. **RLS 우선**: 사용자별 데이터 권한은 DB 정책에서 강제한다.
6. **시연 안정성 우선**: AI 장애, OAuth 오류, seed 데이터 부족에 대비한 fallback을 둔다.

---

## 2. 기술 스택

### 2.1 선정 스택

| 레이어 | 선택 | 비고 |
|---|---|---|
| Frontend | Next.js 16 App Router | 현재 프로젝트 기준 |
| Language | TypeScript 5.x | 타입 안정성 |
| Styling | Tailwind CSS v4 | 디자인 토큰 기반 UI |
| Animation | Framer Motion | 페이드 인 중심, 과도한 모션 금지 |
| Auth | Supabase Auth | Google OAuth Provider 사용 |
| Database | Supabase PostgreSQL | RLS 필수 |
| Server Auth | `@supabase/ssr` | 쿠키 기반 SSR 세션 처리 |
| AI | Anthropic Claude API | 오늘의 글귀 생성, 서버 전용 |
| Forms | React Hook Form + Zod | 작성 폼 검증 |
| Server State | TanStack Query | 필요 시 클라이언트 캐싱 |
| Runtime | Node.js local | `npm run dev`, `npm run build && npm run start` |

### 2.2 제거 또는 미사용 스택

| 항목 | 처리 |
|---|---|
| Toss Payments SDK | 사용하지 않음. 가능하면 dependency 제거 |
| Vercel | 배포하지 않음. 문서와 env에서 Vercel 설명 제거 |
| 결제 API Route | 생성하지 않음 |
| premium page | 생성하지 않거나 일반 안내 페이지로 변경 |
| subscription_status | DB 모델에서 제외 |

---

## 3. 로컬 실행 환경

### 3.1 필수 조건

- Node.js 20.9 이상 권장
- npm 사용
- Supabase hosted project 1개
- Google Cloud OAuth Client 1개
- Anthropic API key는 Phase 2부터 필요

### 3.2 실행 명령어

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

브라우저에서 접속:

```text
http://localhost:3000
```

프로덕션 빌드 로컬 확인:

```bash
npm run build
npm run start
```

접속:

```text
http://localhost:3000
```

---

## 4. 환경 변수

### 4.1 `.env.local.example`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic — Phase 2부터 필요
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4.2 삭제할 환경 변수

```bash
# 사용하지 않음
NEXT_PUBLIC_TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
```

### 4.3 보안 규칙

- `NEXT_PUBLIC_` 접두사가 붙은 값만 브라우저에 노출 가능하다.
- `SUPABASE_SERVICE_ROLE_KEY`는 RLS를 우회할 수 있으므로 서버 전용 파일에서만 import한다.
- `ANTHROPIC_API_KEY`는 Route Handler 또는 server-only module에서만 사용한다.
- `.env.local`은 커밋하지 않는다.

---

## 5. Google OAuth 인증

### 5.1 인증 방식

MVP는 Supabase Auth의 Google Provider를 사용한다.

```text
[Login Page]
  → supabase.auth.signInWithOAuth({ provider: 'google' })
  → Google consent screen
  → Supabase auth callback
  → /auth/callback
  → exchangeCodeForSession
  → /today
```

### 5.2 Google Cloud Console 설정

OAuth Client Type:

```text
Web application
```

Authorized JavaScript origins:

```text
http://localhost:3000
```

Authorized redirect URIs:

```text
https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
```

주의:

- Supabase hosted project를 사용할 경우 Google의 redirect URI는 Supabase callback URL이다.
- 앱의 최종 redirect는 Supabase Dashboard의 URL Configuration에서 허용한다.

### 5.3 Supabase Dashboard 설정

Authentication → Providers → Google:

```text
Enable Google Provider = true
Client ID = Google OAuth Client ID
Client Secret = Google OAuth Client Secret
```

Authentication → URL Configuration:

```text
Site URL = http://localhost:3000
Redirect URLs = http://localhost:3000/auth/callback
```

### 5.4 로그인 버튼 구현

파일 예시:

```text
app/(auth)/login/page.tsx
components/auth/GoogleLoginButton.tsx
```

클라이언트 코드 예시:

```ts
'use client'

import { createClient } from '@/lib/supabase/client'

export function GoogleLoginButton() {
  const onClick = async () => {
    const supabase = createClient()

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
  }

  return <button onClick={onClick}>Google로 로그인</button>
}
```

### 5.5 OAuth Callback 구현

파일:

```text
app/auth/callback/route.ts
```

동작:

1. URL에서 `code`를 읽는다.
2. Supabase server client로 `exchangeCodeForSession(code)`를 호출한다.
3. 성공하면 `/today`로 이동한다.
4. 실패하면 `/login?error=oauth`로 이동한다.

예시:

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/today'

  if (!code) {
    return NextResponse.redirect(`${url.origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${url.origin}/login?error=oauth`)
  }

  return NextResponse.redirect(`${url.origin}${next}`)
}
```

### 5.6 보호 라우트

보호 대상:

```text
/today
/feed
/write
/me
/api/quote/*
/api/saved/*
/api/posts/*
```

비보호 대상:

```text
/
/login
/auth/callback
/auth/auth-code-error
```

`proxy.ts` 또는 Next.js middleware 역할:

- 세션이 없으면 `/login`으로 redirect
- 세션이 있으면 요청 진행
- API는 401 JSON 반환

---

## 6. 데이터 모델

### 6.1 주요 테이블

```sql
-- 사용자 확장 정보
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 오늘의 글귀
create table public.daily_quotes (
  id uuid primary key default gen_random_uuid(),
  quote_date date not null unique,
  title text not null check (char_length(title) <= 60),
  body text not null check (char_length(body) <= 1200),
  source_type text not null check (source_type in ('ai', 'manual', 'fallback')),
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 사용자가 저장한 항목
create table public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('daily', 'user')),
  item_id uuid not null,
  saved_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

-- 사용자가 작성한 글
create table public.user_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) <= 40),
  body text not null check (char_length(body) <= 600),
  visibility text not null check (visibility in ('public', 'private')) default 'private',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- P1: 공개 글 공감
create table public.post_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.user_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
```

### 6.2 제외되는 테이블

```sql
-- 생성하지 않음
payment_logs
subscriptions
premium_plans
billing_events
```

### 6.3 Profile 자동 생성 트리거

Google 로그인 후 신규 사용자의 `profiles`를 자동 생성한다.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
```

---

## 7. RLS 정책

### 7.1 정책 요약

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| profiles | 본인 | 본인/trigger | 본인 | 불가 |
| daily_quotes | 로그인 사용자 전체 | service role | service role | service role |
| saved_items | 본인 | 본인 | 불가 | 본인 |
| user_posts | 공개글 또는 본인글 | 본인 | 본인 | 본인 |
| post_likes | 로그인 사용자 | 본인 | 불가 | 본인 |

### 7.2 RLS SQL 예시

```sql
alter table public.profiles enable row level security;
alter table public.daily_quotes enable row level security;
alter table public.saved_items enable row level security;
alter table public.user_posts enable row level security;
alter table public.post_likes enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "daily_quotes_select_authenticated"
on public.daily_quotes for select
to authenticated
using (true);

create policy "saved_items_select_own"
on public.saved_items for select
using (auth.uid() = user_id);

create policy "saved_items_insert_own"
on public.saved_items for insert
with check (auth.uid() = user_id);

create policy "saved_items_delete_own"
on public.saved_items for delete
using (auth.uid() = user_id);

create policy "user_posts_select_public_or_own"
on public.user_posts for select
using (visibility = 'public' or auth.uid() = user_id);

create policy "user_posts_insert_own"
on public.user_posts for insert
with check (auth.uid() = user_id);

create policy "user_posts_update_own"
on public.user_posts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_posts_delete_own"
on public.user_posts for delete
using (auth.uid() = user_id);
```

---

## 8. API 설계

### 8.1 공통 응답 포맷

```ts
type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }
```

### 8.2 엔드포인트

| Method | Path | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/quote/today` | 오늘의 글 조회, 없으면 생성 | 필요 |
| POST | `/api/quote/generate` | 오늘의 글 강제 생성, 개발자용 | 필요 + server guard |
| GET | `/api/saved` | 내 저장 목록 | 필요 |
| POST | `/api/saved/toggle` | 저장/해제 | 필요 |
| GET | `/api/posts?scope=feed` | 공개 글 피드 | 필요 |
| GET | `/api/posts?scope=me` | 내 글 목록 | 필요 |
| POST | `/api/posts` | 글 작성 | 필요 |
| PATCH | `/api/posts/[id]` | 글 수정 | 필요 + own |
| DELETE | `/api/posts/[id]` | 글 삭제 | 필요 + own |
| POST | `/api/auth/signout` | 로그아웃 | 필요 |

### 8.3 제외 엔드포인트

```text
/api/payment/ready
/api/payment/confirm
/api/payment/status
```

---

## 9. AI 글귀 생성

### 9.1 생성 원칙

- 서버에서만 Anthropic API를 호출한다.
- 매일 1회 생성이 원칙이다.
- 응답은 JSON으로 강제한다.
- 실패하면 fallback seed를 사용한다.

### 9.2 JSON 스키마

```ts
const QuoteSchema = z.object({
  title: z.string().min(1).max(60),
  body: z.string().min(20).max(1200),
  tags: z.array(z.string().min(1).max(10)).max(5),
})
```

### 9.3 프롬프트 원칙

```text
담담하고 느린 호흡의 한국어로 작성한다.
과장된 위로나 자기계발 문구를 피한다.
본문은 3~5문단, 전체 600자 이내로 작성한다.
JSON만 반환한다.
```

### 9.4 장애 대응

| 상황 | 대응 |
|---|---|
| API key 없음 | fallback seed 사용 |
| JSON parse 실패 | 1회 재시도 후 fallback |
| API timeout | fallback |
| 오늘 글 중복 생성 | `quote_date unique`로 방지 |

---

## 10. 화면 및 파일 구조

### 10.1 권장 라우트 구조

```text
app/
  page.tsx                         # 랜딩
  (auth)/
    login/page.tsx                  # 로그인
  auth/
    callback/route.ts               # OAuth callback
    auth-code-error/page.tsx        # 인증 오류 안내
  (app)/
    layout.tsx                      # 인증 사용자 레이아웃
    today/page.tsx                  # 오늘의 글
    feed/page.tsx                   # 발견 피드
    write/page.tsx                  # 글 작성
    me/page.tsx                     # 마이페이지
  api/
    quote/today/route.ts
    quote/generate/route.ts
    saved/route.ts
    saved/toggle/route.ts
    posts/route.ts
    posts/[id]/route.ts
components/
  auth/GoogleLoginButton.tsx
  quote/QuoteView.tsx
  quote/SaveButton.tsx
  editor/PostEditor.tsx
  feed/PostCard.tsx
  shared/Navigation.tsx
lib/
  env/public.ts
  env/server.ts
  supabase/client.ts
  supabase/server.ts
  supabase/middleware.ts
  ai/anthropic.ts
  ai/prompts.ts
  validators/post.ts
styles/
  theme.css
supabase/
  migrations/0001_init.sql
types/
  db.ts
proxy.ts
```

### 10.2 삭제 또는 미사용 파일 후보

```text
app/(app)/premium/*
app/api/payment/*
components/payment/*
lib/toss.ts
VERCEL.md
vercel.json
```

삭제가 부담되면 `deprecated` 주석을 달고 import되지 않도록 한다.

---

## 11. 입력 검증

### 11.1 글 작성 검증

```ts
export const PostInputSchema = z.object({
  title: z.string().min(1).max(40),
  body: z.string().min(1).max(600),
  visibility: z.enum(['public', 'private']),
  tags: z.array(z.string().min(1).max(10)).max(5).default([]),
})
```

### 11.2 저장 토글 검증

```ts
export const SaveToggleSchema = z.object({
  itemType: z.enum(['daily', 'user']),
  itemId: z.string().uuid(),
})
```

---

## 12. 보안 고려사항

| 카테고리 | 조치 |
|---|---|
| 인증 | Google OAuth + Supabase session cookie |
| 인가 | RLS + 서버에서 user id 확인 |
| 비밀키 | server-only module에서만 사용 |
| XSS | 사용자 입력은 plain text로만 렌더링 |
| CSRF | Supabase SSR cookie 흐름 사용, mutating API는 인증 필수 |
| Rate Limit | AI 생성 API는 개발자 guard 또는 날짜 unique 제한 |
| 데이터 누출 | 다른 사용자 비공개 글 접근 테스트 필수 |
| 로그 | OAuth token, service role key, provider token 로그 금지 |

---

## 13. 로컬 QA 체크리스트

### 13.1 Auth

- [ ] 로그아웃 상태에서 `/login` 접속 가능
- [ ] Google 로그인 버튼 클릭 시 Google 인증 화면 이동
- [ ] 로그인 성공 후 `/today` 이동
- [ ] 새로고침 후 세션 유지
- [ ] 로그아웃 후 `/today` 접근 시 `/login` 이동

### 13.2 Data

- [ ] 오늘의 글 1개 표시
- [ ] 저장 버튼 클릭 후 저장 상태 변경
- [ ] 마이페이지에서 저장한 글 확인
- [ ] 글 작성 후 내 글 목록 표시
- [ ] 공개 글은 `/feed`에 표시
- [ ] 비공개 글은 다른 계정에서 보이지 않음

### 13.3 Security

- [ ] `.env.local`이 git에 포함되지 않음
- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 번들에 포함되지 않음
- [ ] RLS 테스트 계정 A/B로 비공개 데이터 접근 실패 확인
- [ ] API 요청 body가 Zod로 검증됨

### 13.4 Local Run

- [ ] `npm run dev` 성공
- [ ] `npm run build` 성공
- [ ] `npm run start` 후 로컬 접속 성공
- [ ] Vercel 관련 설정 없이 시연 가능

---

## 14. 리스크 및 대응

| ID | 리스크 | 영향 | 대응 |
|---|---|---|---|
| R-01 | Google OAuth redirect 설정 오류 | 로그인 실패 | Google/Supabase redirect URL 체크리스트 문서화 |
| R-02 | Supabase RLS 설정 실수 | 데이터 노출 | 계정 A/B 테스트 필수 |
| R-03 | AI API 장애 | 오늘의 글 미표시 | fallback seed 사용 |
| R-04 | 로컬 환경 변수 누락 | 실행 실패 | `.env.local.example` 최소화 및 README에 체크리스트 작성 |
| R-05 | 결제 코드 잔존으로 혼란 | 구현 범위 불명확 | payment 관련 문서/라우트/dependency 제거 또는 deprecated 처리 |
| R-06 | 시연 당일 Google OAuth 제한 | 로그인 실패 | 테스트 계정 준비, redirect URL 사전 검증 |

---

## 15. 구현 순서

### Step 1 — 문서/스코프 정리

- PRD/TRD 교체
- 결제/배포 관련 문구 삭제
- README 로컬 실행 기준으로 정리

### Step 2 — Auth 구현

- Supabase Google Provider 설정
- `GoogleLoginButton` 구현
- `/auth/callback` 구현
- `proxy.ts` 보호 라우트 구현

### Step 3 — DB/RLS 구현

- migration 작성
- profiles trigger
- RLS policy 적용
- A/B 계정으로 접근 테스트

### Step 4 — Core 기능

- 오늘의 글 조회
- 저장/해제
- 마이페이지 저장 목록

### Step 5 — Write & Feed

- 글 작성/수정/삭제
- 공개 피드
- 내 글 목록

### Step 6 — Polish

- UI/모션 마감
- seed 데이터 준비
- 로컬 시연 스크립트 작성

---

## 16. Claude Code 작업 프롬프트 예시

```text
현재 프로젝트는 Vercel 배포와 결제 기능을 제외한 로컬 MVP입니다.
반드시 PRD.md와 TRD.md를 기준으로 작업하세요.

이번 작업 범위:
1. Supabase Google OAuth 로그인 버튼 구현
2. /auth/callback route에서 exchangeCodeForSession 처리
3. proxy.ts에서 /today, /feed, /write, /me 보호
4. 로그아웃 기능 구현

제약:
- Toss Payments, premium, Vercel 관련 코드는 새로 만들지 마세요.
- NEXT_PUBLIC_APP_URL은 http://localhost:3000 기준입니다.
- SUPABASE_SERVICE_ROLE_KEY는 클라이언트에서 import하지 마세요.
- 수정 전 관련 파일을 먼저 읽고, 변경 파일 목록을 요약하세요.
```
