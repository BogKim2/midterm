import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { QUOTE_SYSTEM_PROMPT, QUOTE_USER_PROMPT } from './prompts'
import { FALLBACK_SEEDS } from '@/lib/db/seed'

const QuoteSchema = z.object({
  title: z.string().min(1).max(60),
  body: z.string().min(20).max(1200),
  tags: z.array(z.string().min(1).max(10)).max(5),
})

export interface GeneratedQuote {
  title: string
  body: string
  tags: string  // JSON string of string[]
}

async function tryGenerateWithAI(): Promise<z.infer<typeof QuoteSchema>> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: QUOTE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: QUOTE_USER_PROMPT }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI 응답에서 JSON을 찾을 수 없습니다')

  return QuoteSchema.parse(JSON.parse(jsonMatch[0]))
}

export async function generateDailyQuote(): Promise<GeneratedQuote> {
  if (process.env.ANTHROPIC_API_KEY) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const quote = await tryGenerateWithAI()
        return { title: quote.title, body: quote.body, tags: JSON.stringify(quote.tags) }
      } catch {
        // retry or fall through to seed
      }
    }
  }

  const seed = FALLBACK_SEEDS[Math.floor(Math.random() * FALLBACK_SEEDS.length)]
  return { title: seed.title, body: seed.body, tags: seed.tags }
}
