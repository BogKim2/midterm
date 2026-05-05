import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { dailyQuotes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateDailyQuote } from '@/lib/ai/anthropic'
import { UNAUTHORIZED, okResponse } from '@/lib/api/response'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

export async function POST() {
  const session = await auth()
  if (!session?.user) return UNAUTHORIZED()

  const today = todayDate()
  const generated = await generateDailyQuote()
  const id = crypto.randomUUID()
  const sourceType = process.env.ANTHROPIC_API_KEY ? 'ai' : 'fallback'

  await db.delete(dailyQuotes).where(eq(dailyQuotes.quoteDate, today))

  await db.insert(dailyQuotes).values({
    id,
    quoteDate: today,
    title: generated.title,
    body: generated.body,
    sourceType,
    tags: generated.tags,
  })

  const created = await db
    .select()
    .from(dailyQuotes)
    .where(eq(dailyQuotes.id, id))
    .limit(1)

  const q = created[0]
  return okResponse({ ...q, tags: JSON.parse(q.tags) })
}
