import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function NotFound() {
  return (
    <PageWrapper>
      <Card>
        <div className="stack">
          <h1 className="section-title">페이지를 찾을 수 없습니다</h1>
          <p className="section-copy">잘못된 주소이거나 아직 준비되지 않은 경로입니다.</p>
          <div>
            <Button as="link" to="/">
              홈으로 이동
            </Button>
          </div>
        </div>
      </Card>
    </PageWrapper>
  )
}
