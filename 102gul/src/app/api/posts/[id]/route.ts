import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userPosts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { PostInputSchema } from '@/lib/validators/post'
import { UNAUTHORIZED, NOT_FOUND, VALIDATION_ERROR, okResponse } from '@/lib/api/response'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return UNAUTHORIZED()

  const { id } = await params
  const existing = await db
    .select()
    .from(userPosts)
    .where(and(eq(userPosts.id, id), eq(userPosts.userId, session.user.id)))
    .limit(1)

  if (!existing.length) return NOT_FOUND('글을 찾을 수 없습니다')

  const body = await req.json()
  const parsed = PostInputSchema.partial().safeParse(body)
  if (!parsed.success) {
    return VALIDATION_ERROR('입력값을 확인해주세요', parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }

  const { title, body: postBody, visibility, tags } = parsed.data

  await db
    .update(userPosts)
    .set({
      ...(title !== undefined && { title }),
      ...(postBody !== undefined && { body: postBody }),
      ...(visibility !== undefined && { visibility }),
      ...(tags !== undefined && { tags: JSON.stringify(tags) }),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(userPosts.id, id))

  const updated = await db.select().from(userPosts).where(eq(userPosts.id, id)).limit(1)
  const post = updated[0]
  return okResponse({ ...post, tags: JSON.parse(post.tags) })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return UNAUTHORIZED()

  const { id } = await params
  const existing = await db
    .select()
    .from(userPosts)
    .where(and(eq(userPosts.id, id), eq(userPosts.userId, session.user.id)))
    .limit(1)

  if (!existing.length) return NOT_FOUND('글을 찾을 수 없습니다')

  await db.delete(userPosts).where(eq(userPosts.id, id))
  return okResponse(null)
}
