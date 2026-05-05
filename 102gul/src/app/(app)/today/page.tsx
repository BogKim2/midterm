'use client'

import { useEffect, useState } from 'react'
import GGNav from '@/components/layout/GGNav'
import GGIcon from '@/components/ui/GGIcon'

interface DailyQuote {
  id: string
  quoteDate: string
  title: string
  body: string
  sourceType: string
  tags: string[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y} · ${m} · ${day}`
}

export default function TodayPage() {
  const [quote, setQuote] = useState<DailyQuote | null>(null)
  const [saved, setSaved] = useState(false)
  const [savedFading, setSavedFading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTodayQuote()
  }, [])

  async function fetchTodayQuote() {
    try {
      const res = await fetch('/api/quote/today')
      const json = await res.json()
      if (json.ok) {
        setQuote(json.data)
        await checkSaved(json.data.id)
      }
    } finally {
      setLoading(false)
    }
  }

  async function checkSaved(quoteId: string) {
    const res = await fetch('/api/saved')
    const json = await res.json()
    if (json.ok) {
      const isSaved = json.data.some(
        (item: { itemType: string; itemId: string }) =>
          item.itemType === 'daily' && item.itemId === quoteId
      )
      setSaved(isSaved)
    }
  }

  async function handleToggleSave() {
    if (!quote || saving) return
    setSaving(true)
    setSavedFading(true)
    try {
      const res = await fetch('/api/saved/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType: 'daily', itemId: quote.id }),
      })
      const json = await res.json()
      if (json.ok) {
        setTimeout(() => {
          setSaved(json.data.saved)
          setSavedFading(false)
        }, 400)
      }
    } finally {
      setSaving(false)
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const paragraphs = quote?.body.split('\n').filter(p => p.trim()) ?? []

  if (loading) {
    return (
      <>
        <GGNav active="오늘" />
        <main style={{ maxWidth: '780px', margin: '0 auto', padding: '96px 24px 80px' }}>
          <p className="eyebrow" style={{ marginBottom: '48px' }}>불러오는 중...</p>
        </main>
      </>
    )
  }

  if (!quote) {
    return (
      <>
        <GGNav active="오늘" />
        <main style={{ maxWidth: '780px', margin: '0 auto', padding: '96px 24px 80px' }}>
          <p className="eyebrow">오늘의 글을 불러올 수 없습니다</p>
        </main>
      </>
    )
  }

  return (
    <>
      <GGNav active="오늘" />
      <main
        className="fade-in"
        style={{ maxWidth: '780px', margin: '0 auto', padding: '96px 24px 80px' }}
      >
        {/* Meta row */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginBottom: '32px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.16em',
            color: 'var(--ink-3)',
          }}
        >
          <span>― {quote.tags[0] ?? '글결'} ―</span>
          <span>{formatDate(quote.quoteDate)}</span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 400,
            letterSpacing: '-0.018em',
            color: 'var(--ink-deep)',
            marginBottom: '12px',
            lineHeight: 1.2,
          }}
        >
          {quote.title}
        </h1>

        {/* Byline */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            letterSpacing: '0.04em',
            color: 'var(--ink-3)',
            marginBottom: '64px',
          }}
        >
          글결 큐레이션 · {quote.sourceType === 'ai' ? 'AI 보조 작성' : '편집부'}
        </p>

        {/* Hairline */}
        <hr className="hairline" style={{ marginBottom: '56px' }} />

        {/* Body */}
        <div className="reading-body">
          {paragraphs.map((para, i) => (
            <p key={i} style={{ marginBottom: i < paragraphs.length - 1 ? '0' : '0' }}>
              {para}
            </p>
          ))}
        </div>

        {/* Ellipsis */}
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

        {/* Tags */}
        {quote.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
            {quote.tags.map((tag) => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        {/* 3-column Action Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            borderTop: '1px solid var(--rule)',
            borderBottom: '1px solid var(--rule)',
            marginBottom: '48px',
          }}
        >
          {/* 간직하기 */}
          <button
            onClick={handleToggleSave}
            disabled={saving}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '28px 16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              opacity: savedFading ? 0 : 1,
              transition: 'opacity 0.4s ease',
            }}
          >
            <GGIcon
              name={saved ? 'bookmark-fill' : 'bookmark'}
              size={20}
              stroke={1.25}
              color={saved ? 'var(--accent)' : 'var(--ink-deep)'}
            />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--ink-deep)' }}>
              {saved ? '간직됨' : '간직하기'}
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--ink-3)' }}>
              저장 목록에 담기
            </span>
          </button>

          {/* 감상 남기기 */}
          <button
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '28px 16px',
              background: 'none',
              border: 'none',
              borderLeft: '1px solid var(--rule)',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-2)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <GGIcon name="pen" size={20} stroke={1.25} color="var(--ink-deep)" />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--ink-deep)' }}>
              감상 남기기
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--ink-3)' }}>
              나에게만 보이는 일기
            </span>
          </button>

          {/* 조용히 보내기 */}
          <button
            onClick={handleShare}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '28px 16px',
              background: 'none',
              border: 'none',
              borderLeft: '1px solid var(--rule)',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-2)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <GGIcon name="share" size={20} stroke={1.25} color="var(--ink-deep)" />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--ink-deep)' }}>
              조용히 보내기
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--ink-3)' }}>
              {copied ? '링크가 복사됐습니다' : '링크 공유'}
            </span>
          </button>
        </div>

        {/* Reader count */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            letterSpacing: '0.06em',
            color: 'var(--ink-3)',
            textAlign: 'center',
            marginTop: '48px',
          }}
        >
          오늘도 글결과 함께
        </p>

        {/* 어제/내일 nav */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            borderTop: '1px solid var(--rule)',
            marginTop: '96px',
          }}
        >
          <div style={{ padding: '32px 0' }}>
            <p className="eyebrow" style={{ marginBottom: '12px' }}>어제의 글</p>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                color: 'var(--ink-2)',
                fontWeight: 400,
              }}
            >
              지난 글결 보기
            </p>
          </div>
          <div style={{ padding: '32px 0', textAlign: 'right' }}>
            <p className="eyebrow" style={{ marginBottom: '12px' }}>내일</p>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                color: 'var(--ink-3)',
                fontWeight: 400,
                fontStyle: 'italic',
              }}
            >
              새벽 5시에 도착합니다
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
