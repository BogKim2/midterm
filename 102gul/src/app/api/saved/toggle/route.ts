import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { savedItems } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { SaveToggleSchema } from '@/lib/validators/post'
import { UNAUTHORIZED, VALIDATION_ERROR, okResponse } from '@/lib/api/response'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return UNAUTHORIZED()

  const body = await req.json()
  const parsed = SaveToggleSchema.safeParse(body)
  if (!parsed.success) {
    return VALIDATION_ERROR('잘못된 요청입니다', parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }

  const { itemType, itemId } = parsed.data
  const userId = session.user.id

  const existing = await db
    .select()
    .from(savedItems)
    .where(and(eq(savedItems.userId, userId), eq(savedItems.itemType, itemType), eq(savedItems.itemId, itemId)))
    .limit(1)

  if (existing.length > 0) {
    await db.delete(savedItems).where(eq(savedItems.id, existing[0].id))
    return okResponse({ saved: false })
  }

  await db.insert(savedItems).values({
    id: crypto.randomUUID(),
    userId,
    itemType,
    itemId,
  })

  return okResponse({ saved: true })
}
