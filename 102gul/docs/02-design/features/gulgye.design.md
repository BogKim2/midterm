# Design — 글결(Geulgyeol)

## Context Anchor

| 항목 | 내용 |
|---|---|
| WHY | 학교 과제 시연용 로컬 MVP. 인증·저장·AI생성·작성 흐름을 명확하게 보여야 함 |
| WHO | 감정 정돈러, 조용한 창작자 |
| RISK | Google OAuth, SQLite 마이그레이션, AI 장애 |
| SUCCESS | localhost:3000 전체 플로우 시연, 비공개 글 격리 |
| SCOPE | SQLite + NextAuth.js v5 로컬 앱 |

---

## 1. 선택 아키텍처 — Option C (Pragmatic Balance)

NextAuth.js v5 + Drizzle ORM + SQLite 조합. 기존 Supabase 구조를 최대한 유지하되
RLS를 API route 레벨 소유권 검사로 대체.

---

## 2. 파일 구조

```
F:\03llm\102gulgye\
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 랜딩
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts  # NextAuth handler
│   │   ├── (app)/
│   │   │   ├── layout.tsx              # 인증 레이아웃
│   │   │   ├── today/page.tsx
│   │   │   ├── feed/page.tsx
│   │   │   ├── write/page.tsx
│   │   │   └── me/page.tsx
│   │   └── api/
│   │       ├── quote/
│   │       │   ├── today/route.ts
│   │       │   └── generate/route.ts
│   │       ├── saved/
│   │       │   ├── route.ts
│   │       │   └── toggle/route.ts
│   │       └── posts/
│   │           ├── route.ts
│   │           └── [id]/route.ts
│   ├── components/
│   │   ├── auth/GoogleLoginButton.tsx
│   │   ├── quote/QuoteView.tsx
│   │   ├── quote/SaveButton.tsx
│   │   ├── editor/PostEditor.tsx
│   │   ├── feed/PostCard.tsx
│   │   └── shared/Navigation.tsx
│   ├── lib/
│   │   ├── auth.ts                     # NextAuth config
│   │   ├── db/
│   │   │   ├── index.ts                # Drizzle client
│   │   │   ├── schema.ts               # 테이블 정의
│   │   │   └── seed.ts                 # fallback seed
│   │   ├── ai/
│   │   │   ├── anthropic.ts
│   │   │   └── prompts.ts
│   │   └── validators/
│   │       └── post.ts
│   └── middleware.ts
├── drizzle/
│   └── 0001_init.sql
├── .env.local.example
├── drizzle.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 3. 데이터 모델 (SQLite/Drizzle)

```typescript
// src/lib/db/schema.ts

import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),          // Google sub
  email: text('email').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export const dailyQuotes = sqliteTable('daily_quotes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  quoteDate: text('quote_date').notNull().unique(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  sourceType: text('source_type', { enum: ['ai', 'manual', 'fallback'] }).notNull(),
  tags: text('tags').notNull().default('[]'),  // JSON array string
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

export const savedItems = sqliteTable('saved_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemType: text('item_type', { enum: ['daily', 'user'] }).notNull(),
  itemId: text('item_id').notNull(),
  savedAt: text('saved_at').notNull().default(sql`(datetime('now'))`),
}, (t) => ({
  uniq: unique().on(t.userId, t.itemType, t.itemId),
}))

export const userPosts = sqliteTable('user_posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  body: text('body').notNull(),
  visibility: text('visibility', { enum: ['public', 'private'] }).notNull().default('private'),
  tags: text('tags').notNull().default('[]'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})
```

---

## 4. API 설계

| Method | Path | 설명 | 인증 |
|---|---|---|---|
| GET | `/api/quote/today` | 오늘의 글 조회/생성 | 필요 |
| POST | `/api/quote/generate` | 강제 재생성 (개발용) | 필요 |
| GET | `/api/saved` | 내 저장 목록 | 필요 |
| POST | `/api/saved/toggle` | 저장/해제 | 필요 |
| GET | `/api/posts?scope=feed` | 공개 글 피드 | 필요 |
| GET | `/api/posts?scope=me` | 내 글 목록 | 필요 |
| POST | `/api/posts` | 글 작성 | 필요 |
| PATCH | `/api/posts/[id]` | 글 수정 (본인만) | 필요 |
| DELETE | `/api/posts/[id]` | 글 삭제 (본인만) | 필요 |

---

## 5. NextAuth 설정

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.id && user.email) {
        await db.insert(users).values({
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          avatarUrl: user.image ?? null,
        }).onConflictDoUpdate({
          target: users.id,
          set: { name: user.name ?? null, avatarUrl: user.image ?? null, updatedAt: new Date().toISOString() }
        })
      }
      return true
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === 'google') {
        token.sub = profile?.sub ?? token.sub
      }
      return token
    }
  },
  pages: { signIn: '/login' },
})
```

---

## 6. 미들웨어 (보호 라우트)

```typescript
// src/middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const PROTECTED = ['/today', '/feed', '/write', '/me']
const API_PROTECTED = ['/api/quote', '/api/saved', '/api/posts']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isProtectedPage = PROTECTED.some(p => pathname.startsWith(p))
  const isProtectedApi = API_PROTECTED.some(p => pathname.startsWith(p))

  if ((isProtectedPage || isProtectedApi) && !session) {
    if (isProtectedApi) {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 7. AI 글귀 생성

- 서버에서만 Anthropic API 호출
- 실패 시 fallback seed 5개 중 랜덤 선택
- quote_date unique 제약으로 중복 방지

### Fallback Seeds

```typescript
const FALLBACK_SEEDS = [
  { title: "오늘의 빈 자리", body: "아무것도 하지 않아도 되는 하루가 있다...", tags: ["여유", "일상"] },
  { title: "작은 것들", body: "손에 쥔 것이 적을수록 보이는 것이 많아진다...", tags: ["단순함"] },
  { title: "느린 오후", body: "서두르지 않아도 되는 시간이 찾아왔다...", tags: ["평온"] },
  { title: "침묵", body: "말하지 않아도 전해지는 것들이 있다...", tags: ["감정"] },
  { title: "다시, 오늘", body: "어제와 같은 아침이지만 다른 하루가 시작된다...", tags: ["시작"] },
]
```

---

## 8. UI 화면 구성

| 화면 | 경로 | 주요 CTA |
|---|---|---|
| 랜딩 | `/` | Google로 시작하기 |
| 로그인 | `/login` | Google로 로그인 |
| 오늘의 글 | `/today` | 저장하기 |
| 발견 피드 | `/feed` | 저장 / 읽기 |
| 글 작성 | `/write` | 저장하기 |
| 마이페이지 | `/me` | 저장 글 / 내 글 / 로그아웃 |

### 디자인 원칙
- 배경: `#FAF9F7` (따뜻한 오프화이트)
- 텍스트: `#1A1A1A`
- 포인트: `#3D5A4C` (딥 그린)
- 폰트: Noto Serif KR (본문), system-ui (UI)
- 페이드인: 0.6s ease-out
