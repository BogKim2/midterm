import { useState } from 'react'
import { createMockAnalysis } from '../lib/saju/mockAnalysis'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import type { CompatibilityResult, SajuInput } from '../types'

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  label: `${index + 1}월`,
  value: index + 1,
}))

const DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => ({
  label: `${index + 1}일`,
  value: index + 1,
}))

function buildDefaultPerson(name: string, year: number, gender: 'male' | 'female'): SajuInput {
  return {
    name,
    birthYear: year,
    birthMonth: 1,
    birthDay: 1,
    birthHour: -1,
    gender,
    lunarCalendar: false,
  }
}

function calculateCompatibility(person1: SajuInput, person2: SajuInput): CompatibilityResult {
  const first = createMockAnalysis(person1)
  const second = createMockAnalysis(person2)
  const sameYongsin = first.yongsin.filter((item) => second.yongsin.includes(item)).length
  const oppositeSignal = first.gisin.filter((item) => second.yongsin.includes(item)).length
  const baseScore = 70 + sameYongsin * 12 - oppositeSignal * 8
  const totalScore = Math.max(45, Math.min(98, baseScore))

  return {
    person1,
    person2,
    totalScore,
    loveScore: Math.max(40, Math.min(99, totalScore + 3)),
    communicationScore: Math.max(40, Math.min(99, totalScore - 4)),
    financeScore: Math.max(40, Math.min(99, totalScore - 1)),
    valuesScore: Math.max(40, Math.min(99, totalScore + 1)),
    sajuScore: totalScore,
    aiSummary: `${person1.name || '첫 번째 사람'}과 ${person2.name || '두 번째 사람'}은 오행 보완 흐름이 있어 기본 궁합이 안정적으로 형성됩니다.`,
    strengths: ['서로의 부족한 기운을 보완할 여지', '대화와 현실 감각의 균형 가능성'],
    weaknesses: ['감정 표현 속도 차이', '생활 리듬 조정 필요'],
    advice: '중요한 결정은 속도보다 리듬을 맞추는 방식으로 접근하는 편이 좋습니다.',
  }
}

export function Compatibility() {
  const [person1, setPerson1] = useState<SajuInput>(buildDefaultPerson('홍길동', 1990, 'male'))
  const [person2, setPerson2] = useState<SajuInput>(buildDefaultPerson('김민지', 1992, 'female'))
  const [result, setResult] = useState<CompatibilityResult | null>(calculateCompatibility(person1, person2))

  function updatePerson(
    target: 'person1' | 'person2',
    key: keyof SajuInput,
    value: string | number | boolean,
  ) {
    if (target === 'person1') {
      setPerson1((prev) => ({ ...prev, [key]: value }))
      return
    }

    setPerson2((prev) => ({ ...prev, [key]: value }))
  }

  function runCompatibility() {
    setResult(calculateCompatibility(person1, person2))
  }

  return (
    <PageWrapper>
      <div className="page-hero">
        <span className="eyebrow">Compatibility</span>
        <h1 className="section-title">궁합 페이지</h1>
        <p className="section-copy">두 사람의 기본 입력을 받아 mock 궁합 점수와 조언을 계산합니다.</p>
      </div>

      <div className="grid grid--2">
        <Card>
          <div className="stack">
            <h2 className="card-title">첫 번째 사람</h2>
            <Input
              label="이름"
              value={person1.name}
              onChange={(event) => updatePerson('person1', 'name', event.target.value)}
            />
            <Input
              label="출생연도"
              type="number"
              value={person1.birthYear}
              onChange={(event) => updatePerson('person1', 'birthYear', Number(event.target.value))}
            />
            <div className="grid grid--2">
              <Select
                label="월"
                options={MONTH_OPTIONS}
                value={person1.birthMonth}
                onChange={(event) => updatePerson('person1', 'birthMonth', Number(event.target.value))}
              />
              <Select
                label="일"
                options={DAY_OPTIONS}
                value={person1.birthDay}
                onChange={(event) => updatePerson('person1', 'birthDay', Number(event.target.value))}
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="stack">
            <h2 className="card-title">두 번째 사람</h2>
            <Input
              label="이름"
              value={person2.name}
              onChange={(event) => updatePerson('person2', 'name', event.target.value)}
            />
            <Input
              label="출생연도"
              type="number"
              value={person2.birthYear}
              onChange={(event) => updatePerson('person2', 'birthYear', Number(event.target.value))}
            />
            <div className="grid grid--2">
              <Select
                label="월"
                options={MONTH_OPTIONS}
                value={person2.birthMonth}
                onChange={(event) => updatePerson('person2', 'birthMonth', Number(event.target.value))}
              />
              <Select
                label="일"
                options={DAY_OPTIONS}
                value={person2.birthDay}
                onChange={(event) => updatePerson('person2', 'birthDay', Number(event.target.value))}
              />
            </div>
          </div>
        </Card>
      </div>

      <section className="section-spacer">
        <Button onClick={runCompatibility}>궁합 계산하기</Button>
      </section>

      {result ? (
        <section className="grid grid--2 section-spacer">
          <Card>
            <div className="stack">
              <h2 className="card-title">종합 점수</h2>
              <div className="compat-score">{result.totalScore}</div>
              <div className="cluster">
                <Badge tone="rose">연애 {result.loveScore}</Badge>
                <Badge tone="gold">소통 {result.communicationScore}</Badge>
                <Badge tone="purple">재물 {result.financeScore}</Badge>
              </div>
              <p className="section-copy">{result.aiSummary}</p>
            </div>
          </Card>
          <Card>
            <div className="stack">
              <h2 className="card-title">관계 조언</h2>
              <ul className="feature-list">
                {result.strengths.map((item) => (
                  <li key={item}>강점: {item}</li>
                ))}
                {result.weaknesses.map((item) => (
                  <li key={item}>주의: {item}</li>
                ))}
              </ul>
              <p className="section-copy">{result.advice}</p>
            </div>
          </Card>
        </section>
      ) : null}
    </PageWrapper>
  )
}
