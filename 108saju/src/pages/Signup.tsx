import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export function Signup() {
  return (
    <PageWrapper>
      <Card style={{ maxWidth: '32rem', margin: '0 auto' }}>
        <div className="stack">
          <span className="eyebrow">Signup</span>
          <h1 className="section-title">사주AI를 시작해보세요</h1>
          <p className="section-copy">인증 로직 연결 전까지는 화면 골격만 제공합니다.</p>
          <Input label="이름" placeholder="홍길동" />
          <Input label="이메일" placeholder="name@example.com" />
          <Input label="비밀번호" type="password" placeholder="••••••••" />
          <Input label="비밀번호 확인" type="password" placeholder="••••••••" />
          <Button>회원가입</Button>
        </div>
      </Card>
    </PageWrapper>
  )
}
