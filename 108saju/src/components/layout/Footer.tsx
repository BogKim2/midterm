import './layout.css'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="stack">
          <div className="brand">
            <span className="brand__mark">✦</span>
            <span>사주AI</span>
          </div>
          <p className="muted">AI 사주 분석 · 궁합 · 운세 캘린더 · 인생 타임라인</p>
        </div>
        <div className="cluster mono muted">
          <span>/analysis</span>
          <span>/compatibility</span>
          <span>/calendar</span>
          <span>/timeline</span>
        </div>
      </div>
    </footer>
  )
}
