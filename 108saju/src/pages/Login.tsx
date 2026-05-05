import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export function Login() {
  return (
    <PageWrapper>
      <Card style={{ maxWidth: '28rem', margin: '0 auto' }}>
        <div className="stack">
          <span className="eyebrow">Login</span>
          <h1 className="section-title">다시 오셨군요</h1>
          <p className="section-copy">저장된 분석을 이어보기 위한 로그인 페이지 자리입니다.</p>
          <Input label="이메일" placeholder="name@example.com" />
          <Input label="비밀번호" type="password" placeholder="••••••••" />
          <Button>로그인</Button>
        </div>
      </Card>
    </PageWrapper>
  )
}
