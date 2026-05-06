import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'
import { quotaApi } from '../api/quota'
import { apiClient } from '../api/client'
import type { QuotaStatus, LmStudioHealth } from '../types'

export default function Dashboard() {
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()
  const [quota, setQuota] = useState<QuotaStatus | null>(null)
  const [health, setHealth] = useState<LmStudioHealth | null>(null)

  useEffect(() => {
    quotaApi.getStatus().then(setQuota).catch(console.error)
    apiClient.get('/api/v1/system/health').then((r) => setHealth(r.data)).catch(console.error)
  }, [])

  const handleLogout = async () => {
    await authApi.logout()
    setUser(null)
    navigate('/')
  }

  const pctColor = (usage: number, limit: number) => {
    const pct = (usage / limit) * 100
    if (pct >= 80) return '#E24B4A'
    if (pct >= 60) return '#FAC775'
    return '#1D9E75'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>
      <header style={{
        background: 'white', borderBottom: '1px solid #D3D1C7',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 64,
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="logo-text" style={{ fontSize: 24 }}>
            <span style={{ color: '#1A1A1A' }}>Pri</span>
            <span style={{ color: '#1D9E75' }}>gio.</span>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user?.avatar_url && (
            <img src={user.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
          )}
          <span style={{ color: '#5F5E5A', fontSize: 14 }}>{user?.display_name}</span>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent', border: '1px solid #D3D1C7',
              borderRadius: 8, padding: '6px 16px', fontSize: 13, cursor: 'pointer', color: '#5F5E5A',
            }}
          >
            로그아웃
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          안녕하세요, {user?.display_name}님 👋
        </h1>
        <p style={{ color: '#5F5E5A', marginBottom: 32 }}>오늘의 냉장고를 확인해보세요</p>

        {health && (
          <div style={{
            background: health.status === 'ok' ? '#E1F5EE' : '#FFF3F3',
            border: `1px solid ${health.status === 'ok' ? '#5DCAA5' : '#E24B4A'}`,
            borderRadius: 12, padding: '12px 20px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span>{health.status === 'ok' ? '🟢' : '🔴'}</span>
            <div>
              <span style={{ fontWeight: 600, fontSize: 14 }}>
                LMStudio {health.status === 'ok' ? '연결됨' : '연결 오류'}
              </span>
              {health.status === 'ok' ? (
                <span style={{ fontSize: 13, color: '#5F5E5A', marginLeft: 12 }}>
                  모델 {health.models.length}개 로드됨
                  {health.has_vision ? ' · 🖼️ 비전 분석 가능' : ' · ⚠️ 비전 모델 없음'}
                </span>
              ) : (
                <span style={{ fontSize: 13, color: '#E24B4A', marginLeft: 12 }}>
                  LMStudio를 실행하고 모델을 로드해주세요
                </span>
              )}
            </div>
          </div>
        )}

        {quota && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
            {[
              { label: 'AI 이미지 분석', usage: quota.analysis_usage, limit: quota.analysis_limit, icon: '📸' },
              { label: 'AI 레시피 생성', usage: quota.recipe_usage, limit: quota.recipe_limit, icon: '🍳' },
            ].map((q) => (
              <div key={q.label} style={{ background: 'white', borderRadius: 16, padding: 24, border: '0.5px solid #D3D1C7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>{q.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{q.label}</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: pctColor(q.usage, q.limit), marginBottom: 8 }}>
                  {q.usage} / {q.limit}
                </div>
                <div style={{ background: '#F1EFE8', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min((q.usage / q.limit) * 100, 100)}%`,
                    background: pctColor(q.usage, q.limit),
                    height: '100%', borderRadius: 99,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <p style={{ fontSize: 13, color: '#5F5E5A', marginTop: 8 }}>
                  잔여 {Math.max(0, q.limit - q.usage)}회 · {quota.year_month}
                </p>
              </div>
            ))}
          </div>
        )}

        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>빠른 액션</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { icon: '🥬', label: '냉장고 관리', desc: '식재료 추가/수정/삭제', path: '/fridge', highlight: false },
            { icon: '📸', label: 'AI 사진 분석', desc: '냉장고 사진으로 재료 인식', path: '/analyze', highlight: true },
            { icon: '🍳', label: 'AI 레시피 추천', desc: '보유 재료로 오늘 메뉴', path: '/recipes', highlight: false },
            { icon: '📋', label: '플랜 안내', desc: '사용 한도 확인', path: '/subscription', highlight: false },
          ].map((a) => (
            <Link key={a.path} to={a.path} style={{ textDecoration: 'none' }}>
              <div style={{
                background: a.highlight ? '#1D9E75' : 'white',
                color: a.highlight ? 'white' : '#1A1A1A',
                borderRadius: 16, padding: 24,
                border: a.highlight ? 'none' : '0.5px solid #D3D1C7',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>{a.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{a.label}</h3>
                <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
