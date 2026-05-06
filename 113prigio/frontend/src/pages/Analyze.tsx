import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { analysisApi } from '../api/analysis'
import { fridgeApi } from '../api/fridge'
import type { DetectedIngredient } from '../types'

export default function Analyze() {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [detected, setDetected] = useState<DetectedIngredient[]>([])
  const [modelInfo, setModelInfo] = useState<{ model: string; has_vision: boolean } | null>(null)
  const [quotaInfo, setQuotaInfo] = useState<any>(null)
  const [drag, setDrag] = useState(false)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return
    const arr = Array.from(selected).slice(0, 2)
    setFiles(arr)
    setPreviews(arr.map((f) => URL.createObjectURL(f)))
    setDetected([])
    setSaved(false)
  }

  const handleAnalyze = async () => {
    if (!files.length) return
    setLoading(true)
    try {
      const res = await analysisApi.uploadAndAnalyze(files)
      setDetected(res.detected_ingredients)
      setModelInfo({ model: res.model_used, has_vision: res.has_vision })
      setQuotaInfo(res.analysis)
    } catch (e: any) {
      if (e.response?.status === 402) alert('월 분석 횟수를 모두 사용했습니다')
      else alert('분석 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToFridge = async () => {
    const items = detected.map((d) => ({
      name: d.name,
      quantity: d.quantity,
      unit: d.unit,
      category: 'other',
      source: 'ai_analysis',
    }))
    try {
      await fridgeApi.bulkAdd(items)
      setSaved(true)
      alert(`${items.length}개 재료가 냉장고에 추가되었습니다`)
    } catch (e) { alert('저장 중 오류가 발생했습니다') }
  }

  const confidenceColor = (c: number) => c >= 0.9 ? '#1D9E75' : c >= 0.7 ? '#FAC775' : '#888780'

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>
      <header style={{
        background: 'white', borderBottom: '1px solid #D3D1C7',
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 32px', height: 64,
      }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#1D9E75', fontSize: 14 }}>← 대시보드</Link>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>📸 AI 사진 분석</h1>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${drag ? '#1D9E75' : '#D3D1C7'}`,
            borderRadius: 16,
            background: drag ? '#E1F5EE' : 'white',
            padding: '48px 24px',
            textAlign: 'center', cursor: 'pointer',
            transition: 'all 200ms',
            marginBottom: 24,
          }}
        >
          <input ref={inputRef} type="file" multiple accept="image/*" hidden onChange={(e) => handleFiles(e.target.files)} />
          {previews.length > 0 ? (
            <div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                {previews.map((p, i) => (
                  <img key={i} src={p} alt="" style={{ height: 160, width: 'auto', borderRadius: 8, objectFit: 'cover' }} />
                ))}
              </div>
              <p style={{ fontSize: 14, color: '#5F5E5A' }}>{files.length}장 선택됨 · 클릭하여 변경</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>냉장고 사진을 업로드하세요</p>
              <p style={{ fontSize: 13, color: '#5F5E5A' }}>최대 2장 · JPEG/PNG/WEBP · 장당 10MB</p>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <button onClick={handleAnalyze} disabled={loading}
              style={{
                background: loading ? '#D3D1C7' : '#1D9E75', color: 'white',
                border: 'none', borderRadius: 10, padding: '14px 40px',
                fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              }}>
              {loading ? '🔍 분석 중... (로컬 AI)' : `🔍 분석하기 (${files.length}장 · 1회 차감)`}
            </button>
          </div>
        )}

        {modelInfo && (
          <div style={{
            background: '#E1F5EE', border: '1px solid #5DCAA5',
            borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 13,
          }}>
            🤖 사용 모델: <strong>{modelInfo.model}</strong>
            {!modelInfo.has_vision && (
              <span style={{ color: '#E24B4A', marginLeft: 8 }}>⚠️ 비전 모델 아님 (텍스트 모드)</span>
            )}
          </div>
        )}

        {quotaInfo && (
          <div style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 20 }}>
            분석 잔여: {quotaInfo.analysis_remaining}회 · {quotaInfo.year_month}
          </div>
        )}

        {detected.length > 0 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
              인식된 재료 ({detected.length}개)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              {detected.map((item, i) => (
                <div key={i} style={{
                  background: 'white', border: '0.5px solid #D3D1C7', borderRadius: 12, padding: 16,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <input
                      value={item.name}
                      onChange={(e) => setDetected((prev) => prev.map((d, j) => j === i ? { ...d, name: e.target.value } : d))}
                      style={{ fontSize: 15, fontWeight: 600, border: 'none', outline: 'none', flex: 1, background: 'transparent' }}
                    />
                    <button onClick={() => setDetected((prev) => prev.filter((_, j) => j !== i))}
                      style={{ background: 'transparent', border: 'none', color: '#D3D1C7', cursor: 'pointer', fontSize: 16 }}>
                      ×
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input type="number" value={item.quantity ?? ''} placeholder="수량"
                      onChange={(e) => setDetected((prev) => prev.map((d, j) => j === i ? { ...d, quantity: e.target.value ? parseFloat(e.target.value) : null } : d))}
                      style={{ width: 64, border: '1px solid #D3D1C7', borderRadius: 6, padding: '4px 8px', fontSize: 13 }} />
                    <input value={item.unit ?? ''} placeholder="단위"
                      onChange={(e) => setDetected((prev) => prev.map((d, j) => j === i ? { ...d, unit: e.target.value } : d))}
                      style={{ width: 64, border: '1px solid #D3D1C7', borderRadius: 6, padding: '4px 8px', fontSize: 13 }} />
                  </div>
                  <span style={{
                    fontSize: 11, borderRadius: 99, padding: '2px 8px', fontWeight: 600,
                    background: `${confidenceColor(item.confidence)}22`,
                    color: confidenceColor(item.confidence),
                  }}>
                    신뢰도 {Math.round(item.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button onClick={() => setDetected((prev) => [...prev, { name: '', quantity: null, unit: null, confidence: 1 }])}
                style={{ background: 'transparent', border: '1px solid #1D9E75', color: '#1D9E75', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                + 재료 추가
              </button>
              {!saved && (
                <button onClick={handleSaveToFridge}
                  style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                  🥬 냉장고에 반영 ({detected.length}개)
                </button>
              )}
              {saved && <span style={{ color: '#1D9E75', fontWeight: 600, fontSize: 14, alignSelf: 'center' }}>✓ 저장 완료</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
