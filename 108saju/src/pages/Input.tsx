import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useSajuStore } from '../store/sajuStore'
import type { SajuInput } from '../types'

const yearOptions = Array.from({ length: 125 }, (_, index) => {
  const year = 2024 - index
  return { label: `${year}년`, value: year }
})

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  label: `${index + 1}월`,
  value: index + 1,
}))

const dayOptions = Array.from({ length: 31 }, (_, index) => ({
  label: `${index + 1}일`,
  value: index + 1,
}))

const hourOptions = [
  { label: '모름', value: -1 },
  { label: '자시 (23~1시)', value: 0 },
  { label: '축시 (1~3시)', value: 2 },
  { label: '인시 (3~5시)', value: 4 },
  { label: '묘시 (5~7시)', value: 6 },
  { label: '진시 (7~9시)', value: 8 },
  { label: '사시 (9~11시)', value: 10 },
  { label: '오시 (11~13시)', value: 12 },
  { label: '미시 (13~15시)', value: 14 },
  { label: '신시 (15~17시)', value: 16 },
  { label: '유시 (17~19시)', value: 18 },
  { label: '술시 (19~21시)', value: 20 },
  { label: '해시 (21~23시)', value: 22 },
]

export function InputPage() {
  const navigate = useNavigate()
  const setInput = useSajuStore((state) => state.setInput)
  const setAnalysis = useSajuStore((state) => state.setAnalysis)
  const [form, setForm] = useState<SajuInput>({
    name: '',
    birthYear: 1990,
    birthMonth: 1,
    birthDay: 1,
    birthHour: -1,
    gender: 'male',
    lunarCalendar: false,
  })

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setInput(form)
    setAnalysis(null)
    navigate('/result?loading=true')
  }

  return (
    <PageWrapper>
      <div className="page-hero">
        <span className="eyebrow">Input</span>
        <h1 className="section-title">생년월일시를 알려주세요</h1>
        <p className="section-copy">정확한 입력일수록 이후 로직과 AI 해석을 더 자연스럽게 확장할 수 있습니다.</p>
      </div>

      <Card>
        <form className="form-grid" onSubmit={submitForm}>
          <Input
            label="성함"
            placeholder="홍길동"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />

          <div className="form-grid form-grid--3">
            <Select
              label="생년"
              options={yearOptions}
              value={form.birthYear}
              onChange={(event) => setForm({ ...form, birthYear: Number(event.target.value) })}
            />
            <Select
              label="생월"
              options={monthOptions}
              value={form.birthMonth}
              onChange={(event) => setForm({ ...form, birthMonth: Number(event.target.value) })}
            />
            <Select
              label="생일"
              options={dayOptions}
              value={form.birthDay}
              onChange={(event) => setForm({ ...form, birthDay: Number(event.target.value) })}
            />
          </div>

          <Select
            label="태어난 시간"
            options={hourOptions}
            value={form.birthHour}
            onChange={(event) => setForm({ ...form, birthHour: Number(event.target.value) })}
          />

          <div className="grid grid--2">
            <Card>
              <div className="stack">
                <span className="ui-field__label">성별</span>
                <div className="cluster">
                  <Button
                    type="button"
                    variant={form.gender === 'male' ? 'primary' : 'ghost'}
                    onClick={() => setForm({ ...form, gender: 'male' })}
                  >
                    남성
                  </Button>
                  <Button
                    type="button"
                    variant={form.gender === 'female' ? 'primary' : 'ghost'}
                    onClick={() => setForm({ ...form, gender: 'female' })}
                  >
                    여성
                  </Button>
                </div>
              </div>
            </Card>

            <Card>
              <div className="stack">
                <span className="ui-field__label">양력 / 음력</span>
                <div className="cluster">
                  <Button
                    type="button"
                    variant={!form.lunarCalendar ? 'primary' : 'ghost'}
                    onClick={() => setForm({ ...form, lunarCalendar: false })}
                  >
                    양력
                  </Button>
                  <Button
                    type="button"
                    variant={form.lunarCalendar ? 'primary' : 'ghost'}
                    onClick={() => setForm({ ...form, lunarCalendar: true })}
                  >
                    음력
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <p className="muted">입력 정보는 현재 브라우저 메모리에서만 사용됩니다.</p>
          <div>
            <Button type="submit" size="lg">
              AI 사주 분석 시작하기
            </Button>
          </div>
        </form>
      </Card>
    </PageWrapper>
  )
}
