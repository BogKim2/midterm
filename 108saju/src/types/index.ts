export type ElementKey = 'wood' | 'fire' | 'earth' | 'metal' | 'water'

export type Cheongan = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸'
export type Jiji = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥'
export type Ohaeng = '목' | '화' | '토' | '금' | '수'

export type Ganji = {
  cheongan: Cheongan
  jiji: Jiji
  ohaeng: Ohaeng
}

export type SajuPillars = {
  year: Ganji
  month: Ganji
  day: Ganji
  hour: Ganji
}

export type SajuInput = {
  name?: string
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number
  gender: 'male' | 'female'
  lunarCalendar: boolean
}

export type FiveElementsRatio = Record<ElementKey, number>

export type SajuAnalysis = {
  input: SajuInput
  pillars: SajuPillars
  fiveElements: FiveElementsRatio
  dayMaster: {
    element: string
    strength: 'strong' | 'weak' | 'neutral'
  }
  yongsin: string[]
  gisin: string[]
  aiSummary: string
  aiPersonality: string
  aiCareer: string
  aiLove: string
  luckyColors: string[]
  luckyNumbers: number[]
  luckyDirection: string
  createdAt: string
}

export type CompatibilityResult = {
  person1: SajuInput
  person2: SajuInput
  totalScore: number
  loveScore: number
  communicationScore: number
  financeScore: number
  valuesScore: number
  sajuScore: number
  aiSummary: string
  strengths: string[]
  weaknesses: string[]
  advice: string
}

export type Daeun = {
  startAge: number
  endAge: number
  ganji: Ganji
  ohaeng: string
  aiSummary: string
}
