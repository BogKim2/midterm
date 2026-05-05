import { useState } from 'react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'

type DayItem = {
  day: number
  score: number
  ganji: string
  category: string
  advice: string
}

const MONTH_LABEL = '2026년 5월'
const DAYS: DayItem[] = Array.from({ length: 31 }, (_, index) => {
  const day = index + 1
  const score = 2 + ((day * 7) % 4)
  const labels = ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午']

  return {
    day,
    score,
    ganji: labels[index % labels.length],
    category: score >= 5 ? '최상' : score >= 4 ? '좋음' : score === 3 ? '보통' : '주의',
    advice:
      score >= 4
        ? '사람을 만나고 계획을 진행하기 좋은 흐름입니다.'
        : '무리한 결정 대신 정리와 점검에 집중하는 편이 좋습니다.',
  }
})

function dots(score: number) {
  return '●'.repeat(score) + '○'.repeat(5 - score)
}

export function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState<DayItem>(DAYS[new Date().getDate() - 1] || DAYS[0])

  return (
    <PageWrapper>
      <div className="page-hero">
        <span className="eyebrow">Calendar</span>
        <h1 className="section-title">운세 캘린더</h1>
        <p className="section-copy">월 단위 흐름을 빠르게 살펴보고 선택한 날짜의 코멘트를 확인할 수 있습니다.</p>
      </div>

      <div className="grid grid--2">
        <Card>
          <div className="stack">
            <div className="stat-line">
              <h2 className="card-title">{MONTH_LABEL}</h2>
              <Badge tone="gold">오늘 {new Date().getDate()}일</Badge>
            </div>
            <div className="calendar-grid">
              {DAYS.map((item) => (
                <button
                  key={item.day}
                  type="button"
                  className={`calendar-cell${item.day === selectedDay.day ? ' is-selected' : ''}`}
                  onClick={() => setSelectedDay(item)}
                >
                  <strong>{item.day}</strong>
                  <span className="mono">{item.ganji}</span>
                  <span className="mono">{dots(item.score)}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="stack">
            <h2 className="card-title">
              {MONTH_LABEL} {selectedDay.day}일
            </h2>
            <div className="cluster">
              <Badge tone="purple">{selectedDay.ganji}</Badge>
              <Badge tone={selectedDay.score >= 4 ? 'gold' : 'muted'}>{selectedDay.category}</Badge>
            </div>
            <p className="section-copy">{selectedDay.advice}</p>
            <ul className="feature-list">
              <li>전체운 점수: {selectedDay.score} / 5</li>
              <li>추천 시간대: {selectedDay.score >= 4 ? '오시 · 신시' : '정오 이후 천천히'}</li>
              <li>행동 포인트: {selectedDay.score >= 4 ? '미뤄둔 일정 실행' : '정리와 점검'}</li>
            </ul>
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
