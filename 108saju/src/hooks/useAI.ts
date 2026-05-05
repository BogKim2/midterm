import { buildAnalysisPrompt, SAJU_SYSTEM_PROMPT } from '../lib/prompts'
import { createMockAnalysis } from '../lib/saju/mockAnalysis'
import { calculatePillars } from '../lib/saju/pillars'
import { getLMStudioConfig } from '../lib/lmstudio'
import type { SajuAnalysis, SajuInput } from '../types'

type LMStudioPayload = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

function parseResponse(rawContent: string | undefined, fallback: SajuAnalysis): SajuAnalysis {
  if (!rawContent) {
    return fallback
  }

  try {
    const parsed = JSON.parse(rawContent) as {
      summary?: string
      personality?: string
      career?: string
      love?: string
      luckyColors?: string[]
      luckyNumbers?: number[]
      luckyDirection?: string
    }

    return {
      ...fallback,
      aiSummary: parsed.summary || fallback.aiSummary,
      aiPersonality: parsed.personality || fallback.aiPersonality,
      aiCareer: parsed.career || fallback.aiCareer,
      aiLove: parsed.love || fallback.aiLove,
      luckyColors: parsed.luckyColors?.length ? parsed.luckyColors : fallback.luckyColors,
      luckyNumbers: parsed.luckyNumbers?.length ? parsed.luckyNumbers : fallback.luckyNumbers,
      luckyDirection: parsed.luckyDirection || fallback.luckyDirection,
    }
  } catch {
    return fallback
  }
}

export function useAI() {
  async function generateAnalysis(input: SajuInput): Promise<SajuAnalysis> {
    const fallback = createMockAnalysis(input)
    const config = getLMStudioConfig()

    if (!config) {
      return fallback
    }

    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer lm-studio',
        },
        body: JSON.stringify({
          model: config.model,
          temperature: 0.5,
          messages: [
            { role: 'system', content: SAJU_SYSTEM_PROMPT },
            { role: 'user', content: buildAnalysisPrompt(calculatePillars(input), input) },
          ],
          response_format: { type: 'json_object' },
        }),
      })

      if (!response.ok) {
        return fallback
      }

      const payload = (await response.json()) as LMStudioPayload
      const rawContent = payload.choices?.[0]?.message?.content

      return parseResponse(rawContent, fallback)
    } catch {
      return fallback
    }
  }

  return { generateAnalysis }
}
