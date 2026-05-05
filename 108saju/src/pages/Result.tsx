import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiveElements } from '../components/analysis/FiveElements'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SajuPillar } from '../components/ui/SajuPillar'
import { Spinner } from '../components/ui/Spinner'
import { useAI } from '../hooks/useAI'
import { useSajuStore } from '../store/sajuStore'

export function Result() {
  const [searchParams] = useSearchParams()
  const currentInput = useSajuStore((state) => state.currentInput)
  const currentAnalysis = useSajuStore((state) => state.currentAnalysis)
  const isAnalyzing = useSajuStore((state) => state.isAnalyzing)
  const setAnalysis = useSajuStore((state) => state.setAnalysis)
  const setAnalyzing = useSajuStore((state) => state.setAnalyzing)
  const { generateAnalysis } = useAI()

  useEffect(() => {
    if (!currentInput || currentAnalysis || isAnalyzing) {
      return
    }

    const input = currentInput
    let cancelled = false

    async function run() {
      setAnalyzing(true)
      const analysis = await generateAnalysis(input)
      if (!cancelled) {
        setAnalysis(analysis)
        setAnalyzing(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [currentAnalysis, currentInput, generateAnalysis, isAnalyzing, setAnalysis, setAnalyzing])

  if (!currentInput) {
    return (
      <PageWrapper>
        <Card>
          <div className="stack">
            <h1 className="section-title">입력 데이터가 없습니다</h1>
            <p className="section-copy">먼저 사주 입력 페이지에서 정보를 넣어야 결과를 생성할 수 있습니다.</p>
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

  if (isAnalyzing || !currentAnalysis || searchParams.get('loading') === 'true') {
    if (!currentAnalysis) {
      return (
        <PageWrapper>
          <Card>
            <div className="stack" style={{ justifyItems: 'center', textAlign: 'center', padding: '3rem 1rem' }}>
              <Spinner />
              <h1 className="section-title">AI가 사주를 분석하고 있습니다</h1>
              <p className="mono muted">
                {currentInput.birthYear}.{currentInput.birthMonth}.{currentInput.birthDay}
              </p>
            </div>
          </Card>
        </PageWrapper>
      )
    }
  }

  return (
    <PageWrapper>
      <section className="page-hero">
        <span className="eyebrow">Result</span>
        <h1 className="section-title">{currentInput.name || '익명'} 님의 사주팔자</h1>
        <p className="section-copy">
          {currentInput.birthYear}년 {currentInput.birthMonth}월 {currentInput.birthDay}일 ·{' '}
          {currentInput.gender === 'male' ? '남성' : '여성'}
        </p>
        <div className="cluster">
          <Badge tone="gold">용신 {currentAnalysis.yongsin.join(', ')}</Badge>
          <Badge tone="rose">기신 {currentAnalysis.gisin.join(', ')}</Badge>
          <Badge tone="purple">행운 방향 {currentAnalysis.luckyDirection}</Badge>
        </div>
      </section>

      <section className="pillars">
        <SajuPillar label="년주" pillar={currentAnalysis.pillars.year} />
        <SajuPillar label="월주" pillar={currentAnalysis.pillars.month} />
        <SajuPillar label="일주" pillar={currentAnalysis.pillars.day} />
        <SajuPillar label="시주" pillar={currentAnalysis.pillars.hour} />
      </section>

      <section className="grid grid--2 section-spacer">
        <Card>
          <div className="stack">
            <h2 className="card-title">종합 해석</h2>
            <p className="section-copy">{currentAnalysis.aiSummary}</p>
            <p className="section-copy">{currentAnalysis.aiPersonality}</p>
            <p className="section-copy">{currentAnalysis.aiCareer}</p>
            <p className="section-copy">{currentAnalysis.aiLove}</p>
          </div>
        </Card>
        <FiveElements ratio={currentAnalysis.fiveElements} />
      </section>

      <section className="grid grid--2 section-spacer">
        <Card>
          <div className="stack">
            <h2 className="card-title">행운 포인트</h2>
            <ul className="feature-list">
              <li>행운 색상: {currentAnalysis.luckyColors.join(', ')}</li>
              <li>행운 숫자: {currentAnalysis.luckyNumbers.join(', ')}</li>
              <li>행운 방향: {currentAnalysis.luckyDirection}</li>
              <li>일간 강도: {currentAnalysis.dayMaster.strength}</li>
            </ul>
          </div>
        </Card>
        <Card>
          <div className="stack">
            <h2 className="card-title">다음 기능으로 확장</h2>
            <p className="section-copy">
              현재 결과는 MVP 골격입니다. 이어서 상세 분석, 궁합, 운세 캘린더, 타임라인 페이지로 연결할 수 있습니다.
            </p>
            <div className="cluster">
              <Link className="ui-button ui-button--ghost ui-button--md" to="/analysis">
                상세 분석
              </Link>
              <Link className="ui-button ui-button--ghost ui-button--md" to="/calendar">
                운세 캘린더
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </PageWrapper>
  )
}
