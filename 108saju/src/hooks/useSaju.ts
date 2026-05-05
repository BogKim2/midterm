import { calculateFiveElements } from '../lib/saju/fiveElements'
import { calculatePillars } from '../lib/saju/pillars'
import type { SajuInput } from '../types'

export function useSaju(input: SajuInput | null) {
  if (!input) {
    return null
  }

  const pillars = calculatePillars(input)
  const fiveElements = calculateFiveElements(pillars)

  return {
    pillars,
    fiveElements,
  }
}
