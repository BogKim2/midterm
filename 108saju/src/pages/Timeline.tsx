import { PageWrapper } from '../components/layout/PageWrapper'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { useSajuStore } from '../store/sajuStore'

type TimelineItem = {
  startAge: number
  endAge: number
  label: string
  ohaeng: string
  summary: string
}

const TIMELINE_ITEMS: TimelineItem[] = [
  { startAge: 0, endAge: 9, label: '甲子', ohaeng: '수', summary: '기초 감각을 익히는 시기' },
  { startAge: 10, endAge: 19, label: '乙丑', ohaeng: '토', summary: '환경에 적응하며 기반을 다지는 시기' },
  { startAge: 20, endAge: 29, label: '丙寅', ohaeng: '목', summary: '진로와 관계의 방향을 넓히는 시기' },
  { startAge: 30, endAge: 39, label: '丁卯', ohaeng: '목', summary: '성장과 확장이 두드러지는 시기' },
  { startAge: 40, endAge: 49, label: '戊辰', ohaeng: '토', summary: '안정과 책임이 강조되는 시기' },
  { startAge: 50, endAge: 59, label: '己巳', ohaeng: '화', summary: '성과를 집중적으로 드러내는 시기' },
]

export function Timeline() {
  const input = useSajuStore((state) => state.currentInput)
  const currentAge = input ? new Date().getFullYear() - input.birthYear + 1 : 36
  const activeItem = TIMELINE_ITEMS.find((item) => currentAge >= item.startAge && currentAge <= item.endAge) || TIMELINE_ITEMS[3]

  return (
    <PageWrapper>
      <div className="page-hero">
        <span className="eyebrow">Timeline</span>
        <h1 className="section-title">인생 타임라인</h1>
        <p className="section-copy">현재 나이를 기준으로 대운 구간을 강조해서 보여주는 MVP 버전입니다.</p>
      </div>

      <Card>
        <div className="stack">
          <div className="stat-line">
            <h2 className="card-title">대운 흐름</h2>
            <Badge tone="gold">현재 {currentAge}세</Badge>
          </div>
          <div className="timeline-strip">
            {TIMELINE_ITEMS.map((item) => (
              <div
                key={item.label}
                className={`timeline-block${item.label === activeItem.label ? ' is-active' : ''}`}
              >
                <span className="mono">
                  {item.startAge}-{item.endAge}
                </span>
                <strong>{item.label}</strong>
                <span>{item.ohaeng}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <section className="grid grid--2 section-spacer">
        <Card>
          <div className="stack">
            <h2 className="card-title">현재 구간</h2>
            <div className="cluster">
              <Badge tone="purple">{activeItem.label}</Badge>
              <Badge tone="gold">{activeItem.ohaeng}</Badge>
            </div>
            <p className="section-copy">{activeItem.summary}</p>
            <p className="section-copy">
              현재 MVP에서는 입력된 출생연도로 현재 나이를 계산하고 기본 대운 구간을 매핑합니다.
            </p>
          </div>
        </Card>

        <Card>
          <div className="stack">
            <h2 className="card-title">앞으로의 포인트</h2>
            <ul className="feature-list">
              <li>{currentAge + 1}세 전후: 현재 구간의 연장선에서 선택을 구체화</li>
              <li>{currentAge + 3}세 전후: 직업 또는 관계의 재정렬 가능성</li>
              <li>{currentAge + 5}세 전후: 생활 리듬과 우선순위 조정 필요</li>
            </ul>
          </div>
        </Card>
      </section>
    </PageWrapper>
  )
}
