import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { savedItems, dailyQuotes, userPosts } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { UNAUTHORIZED, okResponse } from '@/lib/api/response'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return UNAUTHORIZED()

  const saved = await db
    .select()
    .from(savedItems)
    .where(eq(savedItems.userId, session.user.id))
    .orderBy(savedItems.savedAt)

  if (saved.length === 0) {
    return okResponse([])
  }

  const dailyIds = saved.filter((s) => s.itemType === 'daily').map((s) => s.itemId)
  const userIds = saved.filter((s) => s.itemType === 'user').map((s) => s.itemId)

  const [quotes, posts] = await Promise.all([
    dailyIds.length > 0
      ? db.select().from(dailyQuotes).where(inArray(dailyQuotes.id, dailyIds))
      : Promise.resolve([]),
    userIds.length > 0
      ? db.select().from(userPosts).where(inArray(userPosts.id, userIds))
      : Promise.resolve([]),
  ])

  const quoteMap = new Map(quotes.map((q) => [q.id, { ...q, tags: JSON.parse(q.tags) }]))
  const postMap = new Map(posts.map((p) => [p.id, { ...p, tags: JSON.parse(p.tags) }]))

  const result = saved.map((item) => ({
    ...item,
    content: item.itemType === 'daily' ? (quoteMap.get(item.itemId) ?? null) : (postMap.get(item.itemId) ?? null),
  }))

  return okResponse(result)
}
