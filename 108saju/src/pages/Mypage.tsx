import { PageWrapper } from '../components/layout/PageWrapper'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { useSajuStore } from '../store/sajuStore'

export function Mypage() {
  const input = useSajuStore((state) => state.currentInput)
  const analysis = useSajuStore((state) => state.currentAnalysis)

  return (
    <PageWrapper>
      <div className="page-hero">
        <span className="eyebrow">My Page</span>
        <h1 className="section-title">마이페이지</h1>
        <p className="section-copy">인증과 저장 연동 전까지 현재 세션 기준의 상태만 보여줍니다.</p>
      </div>
      <div className="grid grid--2">
        <Card>
          <div className="stack">
            <h2 className="card-title">현재 입력 정보</h2>
            {input ? (
              <>
                <Badge tone="gold">{input.name || '익명'}</Badge>
                <p className="section-copy">
                  {input.birthYear}.{input.birthMonth}.{input.birthDay} / {input.gender === 'male' ? '남성' : '여성'}
                </p>
              </>
            ) : (
              <p className="section-copy">아직 입력된 사주 정보가 없습니다.</p>
            )}
          </div>
        </Card>
        <Card>
          <div className="stack">
            <h2 className="card-title">최근 분석</h2>
            {analysis ? (
              <p className="section-copy">{analysis.aiSummary}</p>
            ) : (
              <p className="section-copy">아직 생성된 분석 결과가 없습니다.</p>
            )}
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
