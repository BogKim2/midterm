import { resolveCalendar } from './calendar'
import type { Cheongan, Ganji, Jiji, Ohaeng, SajuInput, SajuPillars } from '../../types'

const STEMS: Cheongan[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const BRANCHES: Jiji[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const BRANCH_TO_ELEMENT: Record<Jiji, Ohaeng> = {
  子: '수',
  丑: '토',
  寅: '목',
  卯: '목',
  辰: '토',
  巳: '화',
  午: '화',
  未: '토',
  申: '금',
  酉: '금',
  戌: '토',
  亥: '수',
}

const DAY_STEM_GROUP_BASE: Record<Cheongan, number> = {
  甲: 0,
  己: 0,
  乙: 2,
  庚: 2,
  丙: 4,
  辛: 4,
  丁: 6,
  壬: 6,
  戊: 8,
  癸: 8,
}

function normalizeIndex(index: number, size: number) {
  return ((index % size) + size) % size
}

function createGanji(cheonganIndex: number, jijiIndex: number): Ganji {
  const cheongan = STEMS[normalizeIndex(cheonganIndex, STEMS.length)]
  const jiji = BRANCHES[normalizeIndex(jijiIndex, BRANCHES.length)]

  return {
    cheongan,
    jiji,
    ohaeng: BRANCH_TO_ELEMENT[jiji],
  }
}

function getHourBranchIndex(birthHour: number) {
  if (birthHour < 0) {
    return 0
  }

  return normalizeIndex(Math.floor(((birthHour + 1) % 24) / 2), BRANCHES.length)
}

function calculateHourPillar(dayStem: Cheongan, birthHour: number) {
  const hourBranchIndex = getHourBranchIndex(birthHour)
  const hourStemBase = DAY_STEM_GROUP_BASE[dayStem]
  const hourStemIndex = normalizeIndex(hourStemBase + hourBranchIndex, STEMS.length)

  return createGanji(hourStemIndex, hourBranchIndex)
}

export function calculatePillars(input: SajuInput): SajuPillars {
  const calendar = resolveCalendar(input)
  const year = createGanji(calendar.gapja.year.cheongan, calendar.gapja.year.jiji)
  const month = createGanji(calendar.gapja.month.cheongan, calendar.gapja.month.jiji)
  const day = createGanji(calendar.gapja.day.cheongan, calendar.gapja.day.jiji)
  const hour = calculateHourPillar(day.cheongan, input.birthHour)

  return {
    year,
    month,
    day,
    hour,
  }
}
