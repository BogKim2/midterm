import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageWrapper } from '../components/layout/PageWrapper'

const features = [
  {
    title: '✦ AI 사주 분석',
    copy: '생년월일시 입력만으로 사주팔자, 오행 비율, 핵심 해석을 확인합니다.',
    to: '/input',
  },
  {
    title: '♡ 궁합',
    copy: '두 사람의 흐름을 비교하는 궁합 페이지를 위한 자리입니다.',
    to: '/compatibility',
  },
  {
    title: '◉ 운세 캘린더',
    copy: '월별 흐름과 일진을 연결할 캘린더 뼈대를 준비했습니다.',
    to: '/calendar',
  },
  {
    title: '∿ 인생 타임라인',
    copy: '대운과 세운 시각화를 위한 타임라인 페이지로 이어집니다.',
    to: '/timeline',
  },
]

export function Landing() {
  return (
    <PageWrapper>
      <section className="page-hero">
        <span className="eyebrow">AI × 명리학의 만남</span>
        <h1 className="hero-title">당신의 사주에는 어떤 이야기가 담겨있을까요</h1>
        <p className="section-copy">
          생년월일시 입력 하나로, AI가 사주 해석의 시작점을 열어줍니다. 현재 버전은 MVP 골격과
          로컬 LM Studio 연동 진입점을 포함합니다.
        </p>
        <div className="cluster">
          <Button as="link" to="/input" size="lg">
            사주 분석 시작하기
          </Button>
          <Button as="link" to="/premium" variant="outline" size="lg">
            프리미엄 보기
          </Button>
        </div>
        <p className="muted mono">무료 체험 · LM Studio 미연결 시 mock 분석 제공</p>
      </section>

      <section className="grid grid--4 section-spacer">
        {features.map((feature) => (
          <Card key={feature.title}>
            <div className="stack">
              <h2 className="card-title">{feature.title}</h2>
              <p className="section-copy">{feature.copy}</p>
              <div>
                <Button as="link" to={feature.to} variant="ghost">
                  열기
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </PageWrapper>
  )
}
