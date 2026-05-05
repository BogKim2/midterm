import Link from 'next/link'
import GGMark from '@/components/ui/GGMark'
import GGIcon from '@/components/ui/GGIcon'

export default function LandingPage() {
  return (
    <main className="skin fade-in" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '22px 56px',
          borderBottom: '1px solid var(--rule)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GGMark size={22} color="var(--ink-deep)" />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--ink-deep)' }}>
            글결
          </span>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--ink-3)',
            letterSpacing: '0.16em',
          }}
        >
          ― 글결에 오신 걸 환영합니다. 오늘의 글이 이미 펼쳐져 있어요.
        </p>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link
            href="/login"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--ink-2)',
              textDecoration: 'none',
              letterSpacing: '0.04em',
            }}
          >
            로그인
          </Link>
          <Link href="/login" className="btn-primary" style={{ padding: '10px 20px' }}>
            시작하기
          </Link>
        </div>
      </header>

      {/* Hero: 오늘의 글 */}
      <section
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: '104px 24px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginBottom: '32px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.18em',
            color: 'var(--ink-3)',
          }}
        >
          <span>No. 001</span>
          <span>― 고요 ―</span>
          <span>2026 · 05 · 05</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(40px, 5vw, 64px)',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            color: 'var(--ink-deep)',
            marginBottom: '16px',
            lineHeight: 1.15,
          }}
        >
          안개가 지나간 자리
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--ink-3)',
            letterSpacing: '0.04em',
            marginBottom: '56px',
          }}
        >
          글결 큐레이션 · AI 보조 작성
        </p>

        <hr className="hairline" style={{ marginBottom: '48px' }} />

        <div className="reading-body">
          <p>
            새벽 다섯 시, 창밖으로 안개가 흘러들어온다. 도시의 소음은 아직 잠들어 있고,
            오직 이 방 안에만 빛이 있다.
          </p>
          <p>
            어떤 날은 아무것도 하지 않아도 된다는 사실이, 가장 깊은 위로가 된다.
            그냥 이렇게 앉아, 안개가 걷히는 것을 지켜보는 것으로 충분하다.
          </p>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.5em',
            color: 'var(--ink-4)',
            textAlign: 'center',
            margin: '48px 0',
          }}
        >
          · · ·
        </p>
      </section>

      {/* Fork section */}
      <section
        style={{
          borderTop: '1px solid var(--rule)',
          padding: '96px 56px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 400,
            color: 'var(--ink-deep)',
            letterSpacing: '-0.02em',
            marginBottom: '64px',
            lineHeight: 1.3,
          }}
        >
          오늘 당신은{' '}
          <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>읽는 사람</em>
          인가요,<br />
          아니면{' '}
          <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>쓰는 사람</em>
          인가요.
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1px',
            backgroundColor: 'var(--rule)',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg)',
              padding: '56px 48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '24px',
            }}
          >
            <p className="eyebrow">읽는 사람</p>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                color: 'var(--ink-2)',
                lineHeight: 1.7,
              }}
            >
              매일 한 편의 글을<br />나만의 속도로 읽고 간직하세요
            </p>
            <Link href="/login" className="btn-primary">
              오늘의 글 읽기
              <GGIcon name="arrow-right" size={14} stroke={1.5} color="var(--btn-fg)" />
            </Link>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-2)',
              padding: '56px 48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '24px',
            }}
          >
            <p className="eyebrow">쓰는 사람</p>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                color: 'var(--ink-2)',
                lineHeight: 1.7,
              }}
            >
              당신의 한 문장이<br />누군가의 새벽이 될 수 있어요
            </p>
            <Link href="/login" className="btn-outline">
              글결 써보기
              <GGIcon name="pen" size={14} stroke={1.25} color="var(--ink)" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--rule)',
          padding: '32px 56px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GGMark size={16} color="var(--ink-3)" />
          <span
            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-3)', letterSpacing: '0.12em' }}
          >
            글결 — 하루 한 편의 글
          </span>
        </div>
        <p
          style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-4)', letterSpacing: '0.08em' }}
        >
          2026
        </p>
      </footer>
    </main>
  )
}
