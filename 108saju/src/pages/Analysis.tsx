import { Link } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useSajuStore } from '../store/sajuStore'

export function Analysis() {
  const analysis = useSajuStore((state) => state.currentAnalysis)

  if (!analysis) {
    return (
      <PageWrapper>
        <Card>
          <div className="stack">
            <h1 className="section-title">상세 분석 데이터가 없습니다</h1>
            <p className="section-copy">먼저 입력과 결과 생성 흐름을 완료해야 상세 분석을 볼 수 있습니다.</p>
            <div>
              <Button as="link" to="/input">
                입력 페이지로 이동
              </Button>
            </div>
          </div>
        </Card>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="page-hero">
        <span className="eyebrow">Analysis</span>
        <h1 className="section-title">상세 분석 페이지</h1>
        <p className="section-copy">결과 페이지에서 생성된 데이터를 기준으로 핵심 해석을 섹션별로 풀어 보여줍니다.</p>
      </div>

      <div className="grid grid--2">
        <Card>
          <div className="stack">
            <h2 className="card-title">성격과 기질</h2>
            <div className="cluster">
              <Badge tone="gold">일간 {analysis.dayMaster.element}</Badge>
              <Badge tone="purple">강도 {analysis.dayMaster.strength}</Badge>
            </div>
            <p className="section-copy">{analysis.aiPersonality}</p>
            <p className="section-copy">{analysis.aiSummary}</p>
          </div>
        </Card>

        <Card>
          <div className="stack">
            <h2 className="card-title">직업과 재물</h2>
            <p className="section-copy">{analysis.aiCareer}</p>
            <ul className="feature-list">
              {analysis.luckyColors.map((color) => (
                <li key={color}>추천 색상: {color}</li>
              ))}
              <li>행운 방향: {analysis.luckyDirection}</li>
              <li>행운 숫자: {analysis.luckyNumbers.join(', ')}</li>
            </ul>
          </div>
        </Card>

        <Card>
          <div className="stack">
            <h2 className="card-title">연애와 관계</h2>
            <p className="section-copy">{analysis.aiLove}</p>
            <div className="cluster">
              {analysis.yongsin.map((item) => (
                <Badge key={item} tone="gold">
                  용신 {item}
                </Badge>
              ))}
              {analysis.gisin.map((item) => (
                <Badge key={item} tone="rose">
                  기신 {item}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="stack">
            <h2 className="card-title">다음 탐색</h2>
            <p className="section-copy">
              현재 상세 분석은 MVP 기준의 핵심 해석 모음입니다. 이어서 궁합, 캘린더, 타임라인 화면에서 같은 데이터를 다른 관점으로 볼 수 있습니다.
            </p>
            <div className="cluster">
              <Link className="ui-button ui-button--ghost ui-button--md" to="/compatibility">
                궁합 보기
              </Link>
              <Link className="ui-button ui-button--ghost ui-button--md" to="/timeline">
                타임라인 보기
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
