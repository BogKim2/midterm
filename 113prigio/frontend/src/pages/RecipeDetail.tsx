import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { addBookmark, removeBookmark, isBookmarked } from '../utils/bookmarks'
import type { RecipeDetail as RecipeDetailType } from '../types'

function CoupangLink({ ingredient }: { ingredient: string }) {
  return (
    <a
      href={`https://www.coupang.com/np/search?q=${encodeURIComponent(ingredient)}`}
      target="_blank" rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '4px 10px', borderRadius: 9999,
        background: '#E1F5EE', color: '#1D9E75',
        fontSize: 13, textDecoration: 'none', fontWeight: 600,
      }}
    >
      🛒 {ingredient}
    </a>
  )
}

export default function RecipeDetail() {
  const [recipe, setRecipe] = useState<RecipeDetailType | null>(null)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('prigio_current_recipe')
    if (stored) {
      const r = JSON.parse(stored)
      setRecipe(r)
      setBookmarked(isBookmarked(r.title))
    }
  }, [])

  if (!recipe) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <p>레시피를 불러올 수 없습니다.</p>
        <Link to="/recipes" style={{ color: '#1D9E75' }}>← 레시피로 돌아가기</Link>
      </div>
    </div>
  )

  const toggleBookmark = () => {
    if (bookmarked) { removeBookmark(recipe.title); setBookmarked(false) }
    else { addBookmark(recipe); setBookmarked(true) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>
      <header style={{
        background: 'white', borderBottom: '1px solid #D3D1C7',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 64,
      }}>
        <Link to="/recipes" style={{ textDecoration: 'none', color: '#1D9E75', fontSize: 14 }}>← 레시피 목록</Link>
        <button onClick={toggleBookmark}
          style={{
            background: bookmarked ? '#1D9E75' : 'transparent',
            border: `1px solid ${bookmarked ? '#1D9E75' : '#D3D1C7'}`,
            color: bookmarked ? 'white' : '#5F5E5A',
            borderRadius: 8, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600,
          }}>
          {bookmarked ? '📌 저장됨' : '📌 저장'}
        </button>
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>{recipe.title}</h1>
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <span style={{ background: '#E1F5EE', color: '#1D9E75', borderRadius: 99, padding: '6px 16px', fontSize: 14, fontWeight: 600 }}>
            ⏱️ {recipe.cooking_time}
          </span>
          <span style={{ background: '#F1EFE8', color: '#5F5E5A', borderRadius: 99, padding: '6px 16px', fontSize: 14 }}>
            {recipe.difficulty}
          </span>
        </div>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>재료</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {recipe.ingredients.map((ing, i) => {
              const isMissing = recipe.missing_ingredients?.includes(ing.name)
              return isMissing ? (
                <CoupangLink key={i} ingredient={ing.name} />
              ) : (
                <span key={i} style={{
                  background: '#E1F5EE', color: '#1D9E75',
                  borderRadius: 99, padding: '4px 12px', fontSize: 13, fontWeight: 600,
                }}>
                  ✓ {ing.name} {ing.amount}
                </span>
              )
            })}
          </div>
          {recipe.missing_ingredients?.length > 0 && (
            <p style={{ fontSize: 13, color: '#5F5E5A', marginTop: 12 }}>
              🛒 표시된 재료는 쿠팡에서 구매할 수 있습니다 (클릭 시 새 탭)
            </p>
          )}
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>조리법</h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recipe.steps.map((step, i) => (
              <li key={i} style={{
                display: 'flex', gap: 16, marginBottom: 16,
                background: 'white', borderRadius: 12, padding: '16px 20px', border: '0.5px solid #D3D1C7',
              }}>
                <span style={{
                  width: 32, height: 32, background: '#1D9E75', color: 'white',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 15, lineHeight: 1.7, alignSelf: 'center' }}>{step.replace(/^\d+\.\s*/, '')}</span>
              </li>
            ))}
          </ol>
        </section>

        {recipe.tips && (
          <section style={{ marginBottom: 32 }}>
            <div style={{ background: '#E1F5EE', borderRadius: 12, padding: '16px 20px', border: '1px solid #5DCAA5' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#1D9E75' }}>💡 조리 팁</h3>
              <p style={{ fontSize: 14, color: '#1A1A1A', margin: 0, lineHeight: 1.7 }}>{recipe.tips}</p>
            </div>
          </section>
        )}

        {recipe.nutrition && (
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>영양정보</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { icon: '🔥', label: '칼로리', value: recipe.nutrition.calories, unit: 'kcal' },
                { icon: '💪', label: '단백질', value: recipe.nutrition.protein, unit: 'g' },
                { icon: '🌾', label: '탄수화물', value: recipe.nutrition.carbs, unit: 'g' },
                { icon: '🥑', label: '지방', value: recipe.nutrition.fat, unit: 'g' },
              ].map((n) => (
                <div key={n.label} style={{
                  background: 'white', borderRadius: 12, padding: '20px', border: '0.5px solid #D3D1C7',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{n.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{n.value ?? '-'}</div>
                  <div style={{ fontSize: 12, color: '#5F5E5A' }}>{n.unit}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginTop: 4 }}>{n.label}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#888780', textAlign: 'center', marginTop: 12 }}>1인분 기준</p>
          </section>
        )}
      </div>
    </div>
  )
}
