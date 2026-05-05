import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userPosts, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { PostInputSchema } from '@/lib/validators/post'
import { UNAUTHORIZED, VALIDATION_ERROR, okResponse } from '@/lib/api/response'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return UNAUTHORIZED()

  const scope = req.nextUrl.searchParams.get('scope') ?? 'feed'
  const userId = session.user.id

  let posts
  if (scope === 'me') {
    posts = await db
      .select({ post: userPosts, author: users })
      .from(userPosts)
      .leftJoin(users, eq(userPosts.userId, users.id))
      .where(eq(userPosts.userId, userId))
      .orderBy(desc(userPosts.createdAt))
  } else {
    // scope=feed: 공개 글만 반환 (서버 레벨 필터링)
    posts = await db
      .select({ post: userPosts, author: users })
      .from(userPosts)
      .leftJoin(users, eq(userPosts.userId, users.id))
      .where(eq(userPosts.visibility, 'public'))
      .orderBy(desc(userPosts.createdAt))
  }

  const data = posts.map(({ post, author }) => ({
    ...post,
    tags: JSON.parse(post.tags),
    author: author ? { id: author.id, name: author.name, avatarUrl: author.avatarUrl } : null,
    isOwn: post.userId === userId,
  }))

  return okResponse(data)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return UNAUTHORIZED()

  const body = await req.json()
  const parsed = PostInputSchema.safeParse(body)
  if (!parsed.success) {
    return VALIDATION_ERROR('입력값을 확인해주세요', parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }

  const { title, body: postBody, visibility, tags } = parsed.data
  const id = crypto.randomUUID()

  await db.insert(userPosts).values({
    id,
    userId: session.user.id,
    title,
    body: postBody,
    visibility,
    tags: JSON.stringify(tags),
  })

  const created = await db
    .select()
    .from(userPosts)
    .where(eq(userPosts.id, id))
    .limit(1)

  const post = created[0]
  return okResponse({ ...post, tags: JSON.parse(post.tags) }, 201)
}
