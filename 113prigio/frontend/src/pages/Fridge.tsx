import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { fridgeApi } from '../api/fridge'
import type { Ingredient } from '../types'

const CATEGORIES = [
  { key: 'vegetable', label: '🥦 채소' },
  { key: 'fruit', label: '🍎 과일' },
  { key: 'meat_fish', label: '🥩 육류·수산' },
  { key: 'dairy', label: '🥛 유제품' },
  { key: 'cooked', label: '🍱 조리식품' },
  { key: 'egg_convenience', label: '🥚 달걀·간편식' },
  { key: 'ready_made', label: '🥫 즉석·통조림' },
  { key: 'sauce', label: '🧂 소스·양념' },
  { key: 'beverage', label: '🥤 음료' },
  { key: 'grain', label: '🌾 곡물·면' },
  { key: 'other', label: '📦 기타' },
]

function getDaysDiff(expiryDate: string): number {
  const diff = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000)
  return diff
}

function ExpiryBadge({ expiryDate }: { expiryDate: string | null }) {
  if (!expiryDate) return null
  const diff = getDaysDiff(expiryDate)
  if (diff <= 0) return (
    <span style={{ background: '#E24B4A', color: 'white', borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
      ⚠️ 만료
    </span>
  )
  if (diff <= 7) return (
    <span style={{ background: '#FAC775', color: '#1A1A1A', borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
      🚨 D-{diff}
    </span>
  )
  return null
}

export default function Fridge() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '', expiry_date: '', category: 'other' })
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const fridge = await fridgeApi.get()
      setIngredients(fridge.ingredients)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    const visible = filteredIngredients.map((i) => i.id)
    setSelected(new Set(visible))
  }

  const deleteSelected = async () => {
    if (!window.confirm(`${selected.size}개의 재료를 삭제하시겠습니까?`)) return
    const original = [...ingredients]
    setIngredients((prev) => prev.filter((i) => !selected.has(i.id)))
    setSelected(new Set())
    setSelectionMode(false)
    try {
      await Promise.all([...selected].map((id) => fridgeApi.deleteIngredient(id)))
    } catch {
      setIngredients(original)
    }
  }

  const addIngredient = async () => {
    if (!newItem.name.trim()) return
    try {
      await fridgeApi.addIngredient({
        name: newItem.name,
        quantity: newItem.quantity ? parseFloat(newItem.quantity) : null,
        unit: newItem.unit || null,
        expiry_date: newItem.expiry_date || null,
        category: newItem.category,
        source: 'manual',
      })
      await load()
      setNewItem({ name: '', quantity: '', unit: '', expiry_date: '', category: 'other' })
      setShowAdd(false)
    } catch (e) { console.error(e) }
  }

  const filteredIngredients = activeCategory
    ? ingredients.filter((i) => i.category === activeCategory)
    : ingredients

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p>로딩 중...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>
      <header style={{
        background: 'white', borderBottom: '1px solid #D3D1C7',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/dashboard" style={{ textDecoration: 'none', color: '#1D9E75', fontSize: 14 }}>← 대시보드</Link>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>🥬 냉장고 관리</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {selectionMode ? (
            <button onClick={() => { setSelectionMode(false); setSelected(new Set()) }}
              style={{ background: 'transparent', border: '1px solid #5DCAA5', color: '#5DCAA5', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>
              취소
            </button>
          ) : ingredients.length > 0 && (
            <button onClick={() => setSelectionMode(true)}
              style={{ background: '#FAC775', border: 'none', color: '#1A1A1A', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
              선택 삭제
            </button>
          )}
          <button onClick={() => setShowAdd(true)}
            style={{ background: '#1D9E75', border: 'none', color: 'white', borderRadius: 8, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
            + 재료 추가
          </button>
        </div>
      </header>

      {selectionMode && (
        <div style={{
          background: 'rgba(250,199,117,0.08)', borderBottom: '2px solid #FAC775',
          padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{selected.size}개 선택됨</span>
            <button onClick={selectAll} style={{ fontSize: 13, color: '#1D9E75', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              전체 선택
            </button>
          </div>
          {selected.size > 0 && (
            <button onClick={deleteSelected}
              style={{ background: '#E24B4A', color: 'white', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
              🗑 삭제 ({selected.size}개)
            </button>
          )}
        </div>
      )}

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              background: activeCategory === null ? '#1D9E75' : '#F1EFE8',
              color: activeCategory === null ? 'white' : '#5F5E5A',
              border: 'none', borderRadius: 99, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600,
            }}
          >
            전체 ({ingredients.length})
          </button>
          {CATEGORIES.map((c) => {
            const count = ingredients.filter((i) => i.category === c.key).length
            if (count === 0) return null
            return (
              <button key={c.key}
                onClick={() => setActiveCategory(activeCategory === c.key ? null : c.key)}
                style={{
                  background: activeCategory === c.key ? '#1D9E75' : '#F1EFE8',
                  color: activeCategory === c.key ? 'white' : '#5F5E5A',
                  border: 'none', borderRadius: 99, padding: '6px 16px', fontSize: 13, cursor: 'pointer',
                }}
              >
                {c.label} ({count})
              </button>
            )
          })}
        </div>

        {filteredIngredients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#5F5E5A' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🥬</div>
            <p style={{ fontSize: 16 }}>냉장고가 비어있어요!</p>
            <p style={{ fontSize: 13 }}>AI 사진 분석이나 수동으로 재료를 추가해보세요</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredIngredients.map((item) => (
              <div key={item.id} style={{
                background: selected.has(item.id) ? 'rgba(29,158,117,0.08)' : 'white',
                border: selected.has(item.id) ? '1px solid #1D9E75' : '0.5px solid #D3D1C7',
                borderLeft: selected.has(item.id) ? '3px solid #1D9E75' : '0.5px solid #D3D1C7',
                borderRadius: 12, padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: 16,
                cursor: selectionMode ? 'pointer' : 'default',
              }}
              onClick={() => selectionMode && toggleSelect(item.id)}
              >
                {selectionMode && (
                  <div style={{
                    width: 20, height: 20, borderRadius: 4,
                    border: '2px solid #1D9E75',
                    background: selected.has(item.id) ? '#1D9E75' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {selected.has(item.id) && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</span>
                  {item.quantity && (
                    <span style={{ fontSize: 13, color: '#5F5E5A', marginLeft: 8 }}>
                      {item.quantity}{item.unit}
                    </span>
                  )}
                  {item.source === 'ai_analysis' && (
                    <span style={{ fontSize: 11, background: '#E1F5EE', color: '#1D9E75', borderRadius: 99, padding: '1px 6px', marginLeft: 8, fontWeight: 600 }}>
                      AI
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ExpiryBadge expiryDate={item.expiry_date} />
                  {!selectionMode && (
                    <button
                      onClick={() => fridgeApi.deleteIngredient(item.id).then(load)}
                      style={{ background: 'transparent', border: 'none', color: '#D3D1C7', cursor: 'pointer', fontSize: 16, padding: '4px' }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 40, width: 480, maxWidth: '90vw' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>재료 추가</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input placeholder="재료명 *" value={newItem.name}
                onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                style={{ border: '1px solid #D3D1C7', borderRadius: 8, padding: '10px 14px', fontSize: 14 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" placeholder="수량" value={newItem.quantity}
                  onChange={(e) => setNewItem((p) => ({ ...p, quantity: e.target.value }))}
                  style={{ flex: 1, border: '1px solid #D3D1C7', borderRadius: 8, padding: '10px 14px', fontSize: 14 }} />
                <input placeholder="단위 (개, g, ml...)" value={newItem.unit}
                  onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))}
                  style={{ flex: 1, border: '1px solid #D3D1C7', borderRadius: 8, padding: '10px 14px', fontSize: 14 }} />
              </div>
              <input type="date" value={newItem.expiry_date}
                onChange={(e) => setNewItem((p) => ({ ...p, expiry_date: e.target.value }))}
                style={{ border: '1px solid #D3D1C7', borderRadius: 8, padding: '10px 14px', fontSize: 14 }} />
              <select value={newItem.category}
                onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))}
                style={{ border: '1px solid #D3D1C7', borderRadius: 8, padding: '10px 14px', fontSize: 14 }}>
                {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ background: 'transparent', border: '1px solid #D3D1C7', borderRadius: 8, padding: '10px 24px', fontSize: 14, cursor: 'pointer' }}>
                취소
              </button>
              <button onClick={addIngredient}
                style={{ background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
