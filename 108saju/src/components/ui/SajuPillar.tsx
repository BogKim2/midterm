import type { Ganji } from '../../types'
import { Badge } from './Badge'

type SajuPillarProps = {
  label: string
  pillar: Ganji
}

export function SajuPillar({ label, pillar }: SajuPillarProps) {
  return (
    <div className="ui-card ui-pillar">
      <span className="ui-pillar__stem mono">{pillar.cheongan}</span>
      <span className="ui-pillar__branch mono">{pillar.jiji}</span>
      <Badge tone="purple">{pillar.ohaeng}</Badge>
      <span className="ui-pillar__label">{label}</span>
    </div>
  )
}
