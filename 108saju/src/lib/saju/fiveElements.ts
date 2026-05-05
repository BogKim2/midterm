import type { FiveElementsRatio, SajuPillars } from '../../types'

function emptyRatio(): FiveElementsRatio {
  return {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  }
}

export function calculateFiveElements(pillars: SajuPillars): FiveElementsRatio {
  const ratio = emptyRatio()
  const values = [pillars.year, pillars.month, pillars.day, pillars.hour]

  for (const pillar of values) {
    if (pillar.ohaeng === '목') ratio.wood += 25
    if (pillar.ohaeng === '화') ratio.fire += 25
    if (pillar.ohaeng === '토') ratio.earth += 25
    if (pillar.ohaeng === '금') ratio.metal += 25
    if (pillar.ohaeng === '수') ratio.water += 25
  }

  return ratio
}
