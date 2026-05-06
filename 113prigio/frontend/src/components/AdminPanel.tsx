import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { apiClient } from '../api/client'
import type { LmStudioHealth } from '../types'

export default function AdminPanel() {
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [health, setHealth] = useState<LmStudioHealth | null>(null)

  if (!user?.is_admin) return null

  const checkHealth = async () => {
    const res = await apiClient.get('/api/v1/system/health')
    setHealth(res.data)
  }

  return (
    <>
      <button
        onClick={() => { setOpen(!open); if (!open) checkHealth() }}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          background: '#0D1F1A', color: 'white', border: 'none',
          borderRadius: '50%', width: 48, height: 48, fontSize: 20,
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        ⚙️
      </button>
      {open && (
        <div style={{
          position: 'fixed', bottom: 84, right: 24, zIndex: 999,
          background: 'white', borderRadius: 16, padding: 24,
          width: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: '1px solid #D3D1C7',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🔧 관리자 패널</h3>
          {health ? (
            <div>
              <p style={{ fontSize: 13, color: health.status === 'ok' ? '#1D9E75' : '#E24B4A', marginBottom: 8 }}>
                LMStudio: {health.status === 'ok' ? '✅ 연결됨' : '❌ 오류'}
              </p>
              <p style={{ fontSize: 12, color: '#5F5E5A' }}>
                모델: {health.models.join(', ') || '없음'}
              </p>
              <p style={{ fontSize: 12, color: '#5F5E5A' }}>
                비전: {health.has_vision ? health.vision_models.join(', ') : '없음'}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: '#5F5E5A' }}>로딩 중...</p>
          )}
          <button onClick={checkHealth}
            style={{ marginTop: 12, background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', width: '100%' }}>
            새로고침
          </button>
        </div>
      )}
    </>
  )
}
