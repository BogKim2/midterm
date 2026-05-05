'use client'

import { signIn } from 'next-auth/react'
import GGMark from '@/components/ui/GGMark'

export default function LoginPage() {
  function handleGoogleLogin() {
    signIn('google', { callbackUrl: '/today' })
  }

  return (
    <div
      className="fade-in"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100vh',
      }}
    >
      {/* Left: Quote Panel */}
      <div
        className="fog"
        style={{
          backgroundColor: 'var(--bg-3)',
          padding: '56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Stars (dark mode) */}
        <div className="gg-stars" aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: '1.5px',
                height: '1.5px',
                borderRadius: '50%',
                backgroundColor: 'var(--ink-3)',
                opacity: Math.random() * 0.6 + 0.2,
              }}
            />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '64px' }}>
            <GGMark size={22} color="var(--ink-deep)" />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--ink-deep)' }}>
              글결
            </span>
          </div>

          <p className="eyebrow" style={{ marginBottom: '24px' }}>― 오늘의 글</p>

          <blockquote
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '28px',
              fontStyle: 'italic',
              color: 'var(--ink-deep)',
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            "안개가 지나간 자리에<br />
            고요가 남았다."
          </blockquote>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <a
            href="/today"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--accent)',
              textDecoration: 'none',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            오늘의 글 읽기 →
          </a>
        </div>
      </div>

      {/* Right: Form Panel */}
      <div
        style={{
          backgroundColor: 'var(--bg)',
          padding: '56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ maxWidth: '360px', width: '100%' }}>
          <p className="eyebrow" style={{ marginBottom: '32px' }}>로그인 / Login</p>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '32px',
              fontWeight: 400,
              color: 'var(--ink-deep)',
              marginBottom: '8px',
              letterSpacing: '-0.01em',
            }}
          >
            다시 오셨군요
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '16px',
              color: 'var(--ink-3)',
              marginBottom: '48px',
              lineHeight: 1.7,
            }}
          >
            오늘의 글이 기다리고 있어요
          </p>

          <hr className="hairline" style={{ marginBottom: '48px' }} />

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '14px 24px',
              backgroundColor: 'var(--btn-bg)',
              color: 'var(--btn-fg)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              letterSpacing: '0.08em',
              border: 'none',
              borderRadius: 0,
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <GoogleIcon />
            Google로 계속하기
          </button>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--ink-3)',
              letterSpacing: '0.06em',
              textAlign: 'center',
              marginTop: '24px',
            }}
          >
            로그인하면 글결의 이용약관에 동의하게 됩니다
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
