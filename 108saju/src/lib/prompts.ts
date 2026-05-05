import type { SajuInput, SajuPillars } from '../types'

export const SAJU_SYSTEM_PROMPT = `
당신은 수십 년 경력의 명리학 전문가이자 이를 현대적인 한국어로 설명하는 AI입니다.
분석은 단정적 예언이 아니라 자기 이해와 선택을 돕는 형태로 작성하세요.
응답은 JSON 형식이어야 하며, summary, personality, career, love, luckyColors, luckyNumbers, luckyDirection 필드를 포함하세요.
`

export function buildAnalysisPrompt(pillars: SajuPillars, input: SajuInput) {
  return `
이름: ${input.name || '익명'}
성별: ${input.gender === 'male' ? '남성' : '여성'}
생년월일: ${input.birthYear}-${input.birthMonth}-${input.birthDay}
태어난 시간: ${input.birthHour < 0 ? '모름' : `${input.birthHour}시`}
년주: ${pillars.year.cheongan}${pillars.year.jiji}
월주: ${pillars.month.cheongan}${pillars.month.jiji}
일주: ${pillars.day.cheongan}${pillars.day.jiji}
시주: ${pillars.hour.cheongan}${pillars.hour.jiji}

다음 항목을 JSON으로 작성하세요.
- summary
- personality
- career
- love
- luckyColors
- luckyNumbers
- luckyDirection
`
}
