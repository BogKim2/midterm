'use client'

import { useEffect, useState } from 'react'
import GGNav from '@/components/layout/GGNav'
import GGIcon from '@/components/ui/GGIcon'

interface Post {
  id: string
  userId: string
  title: string
  body: string
  visibility: string
  tags: string[]
  createdAt: string
  author: { id: string; name: string | null; avatarUrl: string | null } | null
  isOwn: boolean
}

const CATEGORIES = ['전체', '고요', '위로', '사랑', '용기', '그리움', '사색']

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return '오늘'
  if (days === 1) return '어제'
  return `${days}일 전`
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('전체')

  useEffect(() => {
    fetchFeed()
  }, [])

  async function fetchFeed() {
    try {
      const res = await fetch('/api/posts?scope=feed')
      const json = await res.json()
      if (json.ok) setPosts(json.data)
    } finally {
      setLoading(false)
    }
  }

  const filtered = activeCategory === '전체'
    ? posts
    : posts.filter(p => p.tags.includes(activeCategory))

  return (
    <>
      <GGNav active="발견" />
      <main
        className="fade-in"
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '72px 56px 80px' }}
      >
        {/* Header Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '5fr 7fr',
            gap: '64px',
            marginBottom: '64px',
            paddingBottom: '64px',
            borderBottom: '1px solid var(--rule)',
          }}
        >
          <div>
            <p className="eyebrow" style={{ marginBottom: '20px' }}>― 발견 / Discover</p>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(36px, 4vw, 60px)',
                fontWeight: 400,
                color: 'var(--ink-deep)',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              조용히 누군가가{' '}
              <em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>남겨둔 문장들.</em>
            </h1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                color: 'var(--ink-2)',
                lineHeight: 1.7,
                marginBottom: '16px',
              }}
            >
              누군가의 한 문장은, 또 다른 누군가의 새벽이 됩니다.
            </p>
            <p className="eyebrow">{posts.length}편의 글이 모여 있습니다</p>
          </div>
        </div>

        {/* Category Filter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 0,
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                  ...(activeCategory === cat
                    ? { backgroundColor: 'var(--btn-bg)', color: 'var(--btn-fg)', border: '1px solid var(--btn-bg)' }
                    : { backgroundColor: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--rule-strong)' }),
                }}
              >
                {cat}{cat === '전체' ? '' : ''}
              </button>
            ))}
          </div>
          <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            최신순 <GGIcon name="arrow-down" size={10} stroke={1.5} color="var(--ink-3)" />
          </p>
        </div>

        {/* Card Grid */}
        {loading ? (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <p className="eyebrow">불러오는 중...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <p
              style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--ink-3)' }}
            >
              아직 공개된 글이 없습니다
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1px',
              backgroundColor: 'var(--rule)',
              marginTop: '1px',
              borderTop: '1px solid var(--rule)',
            }}
          >
            {filtered.map((post, idx) => (
              <FeedCard key={post.id} post={post} index={idx} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}

function FeedCard({ post, index }: { post: Post; index: number }) {
  const excerpt = post.body.length > 120 ? post.body.slice(0, 120) + '…' : post.body

  return (
    <article
      className="card"
      style={{ padding: '36px', minHeight: '220px', backgroundColor: 'var(--bg)' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '24px', height: '100%' }}>
        {/* Index number */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '38px',
            color: 'var(--ink-4)',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Content */}
        <div>
          {post.tags[0] && (
            <p className="eyebrow" style={{ color: 'var(--accent)', marginBottom: '12px' }}>
              ― {post.tags[0]}
            </p>
          )}
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '24px',
              fontWeight: 400,
              color: 'var(--ink-deep)',
              letterSpacing: '-0.01em',
              lineHeight: 1.35,
              marginBottom: '12px',
            }}
          >
            {post.title}
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '14px',
              lineHeight: 1.7,
              color: 'var(--ink-2)',
              maxWidth: '480px',
              marginBottom: '16px',
            }}
          >
            {excerpt}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              color: 'var(--ink-3)',
              letterSpacing: '0.04em',
            }}
          >
            {post.author?.name ?? '익명'} · {timeAgo(post.createdAt)}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: '4px' }}
          >
            <GGIcon name="bookmark" size={16} stroke={1.25} />
          </button>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: '4px' }}
          >
            <GGIcon name="heart" size={16} stroke={1.25} />
          </button>
        </div>
      </div>
    </article>
  )
}
