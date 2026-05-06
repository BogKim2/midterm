import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'

const BG_IMAGES = ['/bg-market.jpg', '/bg-seafood.jpg']

function BackgroundSlideshow() {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % BG_IMAGES.length), 6000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {BG_IMAGES.map((src, i) => (
        <div
          key={src}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            transform: 'scale(1.1)',
            filter: 'blur(8px)',
            opacity: i === current ? 0.45 : 0,
            transition: 'opacity 3.75s ease-in-out',
          }}
        />
      ))}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(237,233,225,0.65)' }} />
    </div>
  )
}

export default function Landing() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (user) { navigate('/dashboard'); return }
    const res = await authApi.getLoginUrl()
    window.location.href = res.authorization_url
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Pretendard Variable, Inter, sans-serif' }}>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(13,31,26,0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 64,
      }}>
        <div className="logo-text" style={{ fontSize: 24 }}>
          <span style={{ color: '#F1EFE8' }}>Pri</span>
          <span style={{ color: '#5DCAA5' }}>gio.</span>
        </div>
        <button
          onClick={handleLogin}
          style={{
            background: '#1D9E75', color: 'white', border: 'none',
            borderRadius: 10, padding: '10px 24px', fontSize: 15,
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          {user ? '대시보드' : '시작하기'}
        </button>
      </nav>

      <section style={{
        position: 'relative', height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
      }}>
        <BackgroundSlideshow />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="logo-text" style={{ fontSize: 64, marginBottom: 16 }}>
            <span style={{ color: '#1A1A1A' }}>Pri</span>
            <span style={{ color: '#1D9E75' }}>gio.</span>
          </div>
          <p style={{ fontSize: 24, color: '#1A1A1A', marginBottom: 8, fontWeight: 600 }}>
            찍으면, 요리가 된다
          </p>
          <p style={{ fontSize: 16, color: '#5F5E5A', marginBottom: 40 }}>
            냉장고 사진 한 장으로 오늘 저녁 완성
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={handleLogin}
              style={{
                background: '#1D9E75', color: 'white', border: 'none',
                borderRadius: 10, padding: '14px 32px', fontSize: 16,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              🚀 시작하기
            </button>
            <button
              style={{
                background: 'transparent', color: '#1A1A1A',
                border: '1.5px solid #1A1A1A',
                borderRadius: 10, padding: '14px 32px', fontSize: 16,
                fontWeight: 600, cursor: 'pointer',
              }}
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              더 알아보기
            </button>
          </div>
        </div>
      </section>

      <section id="features" style={{ background: 'white', padding: '80px 48px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 48, color: '#1A1A1A' }}>
          주요 기능
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, maxWidth: 960, margin: '0 auto' }}>
          {[
            { icon: '📸', title: 'AI 사진 분석', desc: '냉장고 사진 1~2장으로 식재료 자동 인식', sub: 'LMStudio 로컬 AI 사용' },
            { icon: '🥬', title: '식재료 관리', desc: '11종 카테고리별 관리, 유통기한 알림', sub: '직관적인 CRUD 인터페이스' },
            { icon: '🍳', title: 'AI 레시피 추천', desc: '보유 재료 기반 맞춤 레시피', sub: '영양정보 + 쿠팡 링크 포함' },
          ].map((f) => (
            <div key={f.title} style={{
              background: '#E1F5EE', borderRadius: 16, padding: 32, textAlign: 'center',
              border: '0.5px solid #D3D1C7',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#1A1A1A' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#5F5E5A', marginBottom: 8 }}>{f.desc}</p>
              <p style={{ fontSize: 12, color: '#1D9E75', fontWeight: 600 }}>{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: '#F1EFE8', padding: '80px 48px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 40, color: '#1A1A1A' }}>
          사용 한도
        </h2>
        <div style={{ maxWidth: 480, margin: '0 auto', background: 'white', borderRadius: 20, padding: 40, border: '0.5px solid #D3D1C7' }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1D9E75', marginBottom: 24 }}>무료 플랜</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: 2.2 }}>
            <li>📸 월 AI 이미지 분석 5회</li>
            <li>🍳 월 AI 레시피 생성 10회</li>
            <li>🥬 냉장고 식재료 관리 무제한</li>
            <li>📌 레시피 북마크 무제한</li>
          </ul>
          <p style={{ marginTop: 24, fontSize: 13, color: '#5F5E5A', background: '#E1F5EE', borderRadius: 8, padding: '8px 12px' }}>
            💡 로컬 LMStudio AI를 사용하므로 API 비용 없음
          </p>
        </div>
      </section>

      <footer style={{ background: '#0D1F1A', padding: '40px 48px', textAlign: 'center' }}>
        <div className="logo-text" style={{ fontSize: 24, marginBottom: 8 }}>
          <span style={{ color: '#F1EFE8' }}>Pri</span>
          <span style={{ color: '#5DCAA5' }}>gio.</span>
        </div>
        <p style={{ color: '#5F5E5A', fontSize: 13 }}>찍으면, 요리가 된다 · 로컬 AI 기반 냉장고 관리</p>
      </footer>
    </div>
  )
}
