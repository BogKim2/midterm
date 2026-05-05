import { calculateFiveElements } from './fiveElements'
import { calculatePillars } from './pillars'
import type { FiveElementsRatio, Ganji, SajuAnalysis, SajuInput, SajuPillars } from '../../types'

const LUCKY_COLORS: Record<Ganji['ohaeng'], string[]> = {
  목: ['에메랄드', '올리브'],
  화: ['코랄', '크림슨'],
  토: ['머스타드', '샌드'],
  금: ['실버', '아이보리'],
  수: ['딥블루', '스카이'],
}

const LUCKY_DIRECTIONS: Record<Ganji['ohaeng'], string> = {
  목: '동쪽',
  화: '남쪽',
  토: '중앙',
  금: '서쪽',
  수: '북쪽',
}

function findDominantElement(ratio: FiveElementsRatio): keyof FiveElementsRatio {
  return (Object.entries(ratio).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'earth') as keyof FiveElementsRatio
}

function findWeakElement(ratio: FiveElementsRatio): keyof FiveElementsRatio {
  return (Object.entries(ratio).sort((a, b) => a[1] - b[1])[0]?.[0] ?? 'water') as keyof FiveElementsRatio
}

function mapElementToKorean(element: keyof FiveElementsRatio): Ganji['ohaeng'] {
  if (element === 'wood') return '목'
  if (element === 'fire') return '화'
  if (element === 'earth') return '토'
  if (element === 'metal') return '금'
  return '수'
}

function buildSummary(input: SajuInput, pillars: SajuPillars, ratio: FiveElementsRatio) {
  const dominant = mapElementToKorean(findDominantElement(ratio))
  const weak = mapElementToKorean(findWeakElement(ratio))
  const name = input.name || '익명'

  return {
    aiSummary: `${name} 님의 사주는 ${pillars.day.cheongan}${pillars.day.jiji} 일주를 중심으로 ${dominant}의 기운이 비교적 강하게 드러납니다. ${weak}의 기운은 보완 포인트로 보이며, 현재 단계에서는 실제 간지 계산 위에 설명형 mock 해석을 얹고 있습니다.`,
    aiPersonality: `${dominant} 기운이 강조되어 자기 방향성이 분명하고, 상황을 주도하려는 성향이 있습니다. 다만 부족한 ${weak} 기운을 보완하는 환경을 선택하면 균형이 좋아집니다.`,
    aiCareer: `직업적으로는 강한 기운을 살려 주도권이 필요한 역할과 꾸준한 성장 구조가 맞습니다. 현재 결과는 계산 정확도를 높인 뒤 설명 레이어를 유지하는 방식입니다.`,
    aiLove: `관계에서는 강한 에너지가 매력으로 작용하지만, 속도를 조절하고 상대의 리듬을 읽는 것이 중요합니다.`,
  }
}

export function createMockAnalysis(input: SajuInput): SajuAnalysis {
  const pillars = calculatePillars(input)
  const fiveElements = calculateFiveElements(pillars)
  const summary = buildSummary(input, pillars, fiveElements)
  const dominant = mapElementToKorean(findDominantElement(fiveElements))
  const weak = mapElementToKorean(findWeakElement(fiveElements))

  return {
    input,
    pillars,
    fiveElements,
    dayMaster: {
      element: pillars.day.ohaeng,
      strength: dominant === pillars.day.ohaeng ? 'strong' : weak === pillars.day.ohaeng ? 'weak' : 'neutral',
    },
    yongsin: [weak],
    gisin: [dominant],
    aiSummary: summary.aiSummary,
    aiPersonality: summary.aiPersonality,
    aiCareer: summary.aiCareer,
    aiLove: summary.aiLove,
    luckyColors: LUCKY_COLORS[weak],
    luckyNumbers: [input.birthMonth, input.birthDay].sort((a, b) => a - b),
    luckyDirection: LUCKY_DIRECTIONS[weak],
    createdAt: new Date().toISOString(),
  }
}
