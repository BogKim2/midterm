import KoreanLunarCalendar from 'korean-lunar-calendar'
import type { SajuInput } from '../../types'

export type GapjaIndex = {
  cheongan: number
  jiji: number
}

export type CalendarResult = {
  solar: {
    year: number
    month: number
    day: number
  }
  lunar: {
    year: number
    month: number
    day: number
    intercalation: boolean
  }
  gapja: {
    year: GapjaIndex
    month: GapjaIndex
    day: GapjaIndex
  }
}

export function resolveCalendar(input: SajuInput): CalendarResult {
  const calendar = new KoreanLunarCalendar()
  const ok = input.lunarCalendar
    ? calendar.setLunarDate(input.birthYear, input.birthMonth, input.birthDay, false)
    : calendar.setSolarDate(input.birthYear, input.birthMonth, input.birthDay)

  if (!ok) {
    throw new Error('Unsupported solar/lunar date for saju calculation.')
  }

  const solar = calendar.getSolarCalendar()
  const lunar = calendar.getLunarCalendar()
  const gapjaIndex = calendar.getGapJaIndex()

  return {
    solar,
    lunar: {
      year: lunar.year,
      month: lunar.month,
      day: lunar.day,
      intercalation: Boolean(lunar.intercalation),
    },
    gapja: {
      year: {
        cheongan: gapjaIndex.cheongan.year,
        jiji: gapjaIndex.ganji.year,
      },
      month: {
        cheongan: gapjaIndex.cheongan.month,
        jiji: gapjaIndex.ganji.month,
      },
      day: {
        cheongan: gapjaIndex.cheongan.day,
        jiji: gapjaIndex.ganji.day,
      },
    },
  }
}
