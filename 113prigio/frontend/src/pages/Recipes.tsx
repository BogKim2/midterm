import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fridgeApi } from '../api/fridge'
import { recipesApi } from '../api/recipes'
import type { RecipeCandidate, RecipeDetail } from '../types'

const FOOD_TYPES = ['한식', '양식', '중식', '일식', '기타']
const TASTES = [
  { key: '매운음식', label: '🌶️ 매운음식' },
  { key: '단음식', label: '🍯 단음식' },
  { key: '짠음식', label: '🧂 짠음식' },
  { key: '다이어트', label: '🥗 다이어트' },
]

export default function Recipes() {
  const navigate = useNavigate()
  const [ingredients, setIngredients] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [customType, setCustomType] = useState('')
  const [selectedTastes, setSelectedTastes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [candidates, setCandidates] = useState<RecipeCandidate[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState<RecipeDetail | null>(null)

  useEffect(() => {
    fridgeApi.get().then((f) => setIngredients(f.ingredients.map((i) => i.name))).catch(console.error)
  }, [])

  const toggle = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]

  const handleGetCandidates = async () => {
    setLoading(true)
    setCandidates([])
    setDetail(null)
    try {
      const res = await recipesApi.getCandidates({
        ingredients,
        food_types: selectedTypes,
        custom_type: customType,
        tastes: selectedTastes,
      })
      setCandidates(res.candidates || [])
    } catch (e: any) {
      if (e.response?.status === 402) alert('월 레시피 횟수를 모두 사용했습니다')
      else alert('AI 요청 중 오류가 발생했습니다. LMStudio가 실행 중인지 확인해주세요.')
    } finally { setLoading(false) }
  }

  const handleSelectCandidate = async (dish: string) => {
    setDetailLoading(true)
    setDetail(null)
    try {
      const res = await recipesApi.generateRecipe({
        ingredients,
        food_types: selectedTypes,
        custom_type: customType,
        tastes: selectedTastes,
        selected_dish: dish,
      })
      setDetail(res)
    } catch { alert('레시피 생성 중 오류가 발생했습니다') }
    finally { setDetailLoading(false) }
  }

  const handleViewDetail = () => {
    if (detail) {
      localStorage.setItem('prigio_current_recipe', JSON.stringify(detail))
      navigate('/recipes/current')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>
      <header style={{
        background: 'white', borderBottom: '1px solid #D3D1C7',
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 32px', height: 64,
      }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#1D9E75', fontSize: 14 }}>← 대시보드</Link>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>🍳 AI 레시피 추천</h1>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, border: '0.5px solid #D3D1C7' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>🥬 냉장고 재료 ({ingredients.length}개)</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ingredients.slice(0, 20).map((name) => (
              <span key={name} style={{
                background: '#E1F5EE', color: '#1D9E75', borderRadius: 99,
                padding: '4px 12px', fontSize: 13, fontWeight: 600,
              }}>
                {name}
              </span>
            ))}
            {ingredients.length > 20 && <span style={{ fontSize: 13, color: '#5F5E5A', alignSelf: 'center' }}>+{ingredients.length - 20}개</span>}
            {ingredients.length === 0 && (
              <span style={{ fontSize: 13, color: '#5F5E5A' }}>냉장고에 재료가 없습니다. <Link to="/fridge" style={{ color: '#1D9E75' }}>추가하기</Link></span>
            )}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, border: '0.5px solid #D3D1C7' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>음식 종류 선택</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {FOOD_TYPES.map((t) => (
              <button key={t}
                onClick={() => setSelectedTypes((p) => toggle(p, t))}
                style={{
                  background: selectedTypes.includes(t) ? '#1D9E75' : '#F1EFE8',
                  color: selectedTypes.includes(t) ? 'white' : '#5F5E5A',
                  border: 'none', borderRadius: 99, padding: '8px 18px', fontSize: 14, cursor: 'pointer', fontWeight: 600,
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <input placeholder="직접 입력 (예: 퓨전, 베트남식...)" value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            style={{ border: '1px solid #D3D1C7', borderRadius: 8, padding: '8px 14px', fontSize: 14, width: '100%' }} />
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 24, border: '0.5px solid #D3D1C7' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>맛 선택</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TASTES.map((t) => (
              <button key={t.key}
                onClick={() => setSelectedTastes((p) => toggle(p, t.key))}
                style={{
                  background: selectedTastes.includes(t.key) ? '#FAC775' : '#F1EFE8',
                  color: selectedTastes.includes(t.key) ? '#1A1A1A' : '#5F5E5A',
                  border: 'none', borderRadius: 99, padding: '8px 18px', fontSize: 14, cursor: 'pointer', fontWeight: 600,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <button onClick={handleGetCandidates} disabled={loading || ingredients.length === 0}
            style={{
              background: loading || ingredients.length === 0 ? '#D3D1C7' : '#1D9E75',
              color: 'white', border: 'none', borderRadius: 10,
              padding: '14px 48px', fontSize: 16, fontWeight: 600,
              cursor: loading || ingredients.length === 0 ? 'not-allowed' : 'pointer',
            }}>
            {loading ? '🤖 AI 추천 중...' : '🍽️ 레시피 추천받기'}
          </button>
        </div>

        {candidates.length > 0 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>추천 요리 후보 ({candidates.length}개)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {candidates.map((c, i) => (
                <div key={i}
                  onClick={() => handleSelectCandidate(c.dish)}
                  style={{
                    background: 'white', border: '0.5px solid #D3D1C7',
                    borderRadius: 12, padding: '20px 24px', cursor: 'pointer',
                    transition: 'transform 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#1D9E75' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#D3D1C7' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{c.dish}</h3>
                      <p style={{ fontSize: 14, color: '#5F5E5A', margin: 0 }}>{c.description}</p>
                    </div>
                    <span style={{
                      background: c.difficulty === '쉬움' ? '#E1F5EE' : c.difficulty === '보통' ? '#FFF9E6' : '#FFF0F0',
                      color: c.difficulty === '쉬움' ? '#1D9E75' : c.difficulty === '보통' ? '#FAC775' : '#E24B4A',
                      borderRadius: 99, padding: '4px 12px', fontSize: 13, fontWeight: 600,
                    }}>
                      {c.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {detailLoading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#5F5E5A' }}>🤖 상세 레시피 생성 중...</div>
        )}

        {detail && !detailLoading && (
          <div style={{ background: 'white', border: '1px solid #1D9E75', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>{detail.title}</h2>
              <button onClick={handleViewDetail}
                style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                상세 보기 →
              </button>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <span style={{ background: '#E1F5EE', color: '#1D9E75', borderRadius: 99, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>⏱️ {detail.cooking_time}</span>
              <span style={{ background: '#F1EFE8', color: '#5F5E5A', borderRadius: 99, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>{detail.difficulty}</span>
            </div>
            <p style={{ fontSize: 14, color: '#5F5E5A' }}>재료 {detail.ingredients.length}가지 · 단계 {detail.steps.length}단계</p>
          </div>
        )}
      </div>
    </div>
  )
}
