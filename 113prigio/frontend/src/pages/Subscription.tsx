import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { quotaApi } from '../api/quota'
import type { QuotaStatus } from '../types'

export default function Subscription() {
  const [quota, setQuota] = useState<QuotaStatus | null>(null)

  useEffect(() => {
    quotaApi.getStatus().then(setQuota).catch(console.error)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>
      <header style={{
        background: 'white', borderBottom: '1px solid #D3D1C7',
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 32px', height: 64,
      }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#1D9E75', fontSize: 14 }}>← 대시보드</Link>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>📋 플랜 안내</h1>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
        {quota && (
          <div style={{ background: 'white', borderRadius: 16, padding: 32, marginBottom: 24, border: '1px solid #1D9E75' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1D9E75', marginBottom: 20 }}>현재 플랜: 무료</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: '📸 AI 이미지 분석', usage: quota.analysis_usage, limit: quota.analysis_limit },
                { label: '🍳 AI 레시피 생성', usage: quota.recipe_usage, limit: quota.recipe_limit },
              ].map((q) => (
                <div key={q.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{q.label}</span>
                    <span style={{ fontSize: 14, color: '#5F5E5A' }}>{q.usage} / {q.limit}회</span>
                  </div>
                  <div style={{ background: '#F1EFE8', borderRadius: 99, height: 8 }}>
                    <div style={{
                      width: `${Math.min((q.usage / q.limit) * 100, 100)}%`,
                      background: '#1D9E75', height: '100%', borderRadius: 99,
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: '#5F5E5A', marginTop: 16 }}>
              리셋 날짜: {new Date(quota.reset_date).toLocaleDateString('ko-KR')}
            </p>
          </div>
        )}

        <div style={{ background: 'white', borderRadius: 16, padding: 32, border: '0.5px solid #D3D1C7', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>무료 플랜 혜택</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #D3D1C7' }}>
                <th style={{ textAlign: 'left', padding: '12px 0', fontSize: 14, color: '#5F5E5A' }}>기능</th>
                <th style={{ textAlign: 'center', padding: '12px 0', fontSize: 14, color: '#1D9E75' }}>무료</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['월 AI 이미지 분석', '5회'],
                ['월 AI 레시피 생성', '10회'],
                ['냉장고 식재료 관리', '무제한'],
                ['레시피 북마크', '무제한'],
                ['로컬 AI (API 비용 없음)', '✓'],
              ].map(([feature, free]) => (
                <tr key={feature} style={{ borderBottom: '1px solid #F1EFE8' }}>
                  <td style={{ padding: '14px 0', fontSize: 14 }}>{feature}</td>
                  <td style={{ padding: '14px 0', textAlign: 'center', color: '#1D9E75', fontSize: 14, fontWeight: 600 }}>{free}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#E1F5EE', borderRadius: 12, padding: '16px 20px', border: '1px solid #5DCAA5' }}>
          <p style={{ fontSize: 14, color: '#1A1A1A', margin: 0 }}>
            💡 현재 서비스는 무료 플랜으로 운영됩니다. LMStudio 로컬 AI를 사용하므로 별도 API 비용이 발생하지 않습니다.
          </p>
        </div>
      </div>
    </div>
  )
}
