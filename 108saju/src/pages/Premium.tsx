import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const tiers = [
  { name: '무료', price: '₩0/월', features: ['사주 1회', '기본 분석'], featured: false },
  { name: '프리미엄', price: '₩9,900/월', features: ['무제한 분석', '궁합 분석', '캘린더'], featured: true },
  { name: '프리미엄+', price: '₩19,900/월', features: ['맞춤 상담', 'PDF 리포트', '우선 지원'], featured: false },
]

export function Premium() {
  return (
    <PageWrapper>
      <div className="page-hero">
        <span className="eyebrow">Premium</span>
        <h1 className="section-title text-gradient">사주AI 프리미엄으로 더 깊이 들여다보세요</h1>
        <p className="section-copy">요금제 실제 결제는 아직 연결하지 않았고, 정보 구조만 먼저 배치했습니다.</p>
      </div>
      <section className="grid grid--3">
        {tiers.map((tier) => (
          <Card key={tier.name} className={tier.featured ? 'premium-card' : ''}>
            <div className="stack">
              <h2 className="card-title">{tier.name}</h2>
              <p className="mono">{tier.price}</p>
              <ul className="feature-list">
                {tier.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Button variant={tier.featured ? 'primary' : 'ghost'}>{tier.featured ? '지금 시작하기' : '선택하기'}</Button>
            </div>
          </Card>
        ))}
      </section>
    </PageWrapper>
  )
}
