import type { FiveElementsRatio } from '../../types'
import { Card } from '../ui/Card'

const ELEMENT_META = [
  { key: 'wood', label: '목', color: 'var(--five-wood)' },
  { key: 'fire', label: '화', color: 'var(--five-fire)' },
  { key: 'earth', label: '토', color: 'var(--five-earth)' },
  { key: 'metal', label: '금', color: 'var(--five-metal)' },
  { key: 'water', label: '수', color: 'var(--five-water)' },
] as const

type FiveElementsProps = {
  ratio: FiveElementsRatio
}

export function FiveElements({ ratio }: FiveElementsProps) {
  return (
    <Card>
      <div className="stack">
        <div>
          <h3 className="card-title">오행 비율</h3>
          <p className="muted">초기 MVP에서는 단순 막대 시각화로 구성했습니다.</p>
        </div>
        {ELEMENT_META.map((item) => (
          <div key={item.key} className="stack">
            <div className="stat-line">
              <span>{item.label}</span>
              <span className="mono">{ratio[item.key]}%</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '0.7rem',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${ratio[item.key]}%`,
                  height: '100%',
                  background: item.color,
                  borderRadius: '999px',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
