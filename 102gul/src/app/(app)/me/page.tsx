'use client'

import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
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

interface SavedItem {
  id: string
  itemType: string
  itemId: string
  content: { id: string; title: string; body: string; tags: string[] } | null
}

type Tab = 'saved' | 'posts'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()} · ${String(d.getMonth() + 1).padStart(2, '0')} · ${String(d.getDate()).padStart(2, '0')}`
}

export default function MePage() {
  const { data: session } = useSession()
  const [tab, setTab] = useState<Tab>('saved')
  const [savedItems, setSavedItems] = useState<SavedItem[]>([])
  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [editPost, setEditPost] = useState<Post | null>(null)

  useEffect(() => {
    Promise.all([fetchSaved(), fetchMyPosts()]).finally(() => setLoading(false))
  }, [])

  async function fetchSaved() {
    const res = await fetch('/api/saved')
    const json = await res.json()
    if (json.ok) setSavedItems(json.data)
  }

  async function fetchMyPosts() {
    const res = await fetch('/api/posts?scope=me')
    const json = await res.json()
    if (json.ok) setMyPosts(json.data)
  }

  async function handleDeletePost(id: string) {
    if (!confirm('글을 삭제하시겠습니까?')) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    await fetchMyPosts()
  }

  async function handleUpdatePost(post: Post, data: { title: string; body: string; visibility: string; tags: string[] }) {
    await fetch(`/api/posts/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setEditPost(null)
    await fetchMyPosts()
  }

  return (
    <>
      <GGNav active="마이" />
      <main
        className="fade-in"
        style={{ padding: '72px 56px 80px', maxWidth: '1200px', margin: '0 auto' }}
      >
        {/* Profile Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '4fr 8fr',
            gap: '64px',
            paddingBottom: '56px',
            borderBottom: '1px solid var(--rule)',
            marginBottom: '48px',
          }}
        >
          {/* Left: Avatar + name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                width: '148px',
                height: '148px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-3)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', color: 'var(--ink-3)' }}>
                  {session?.user?.name?.[0] ?? '글'}
                </span>
              )}
            </div>
            <p className="eyebrow">― 글결 멤버</p>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '42px',
                fontWeight: 400,
                color: 'var(--ink-deep)',
                letterSpacing: '-0.015em',
                lineHeight: 1.2,
              }}
            >
              {session?.user?.name ?? '독자'}
            </h1>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="btn-outline"
              style={{ width: 'fit-content', padding: '8px 16px', fontSize: '12px' }}
            >
              로그아웃
            </button>
          </div>

          {/* Right: Stats + tabs */}
          <div>
            {/* 4-stat grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '1px',
                backgroundColor: 'var(--rule)',
                marginBottom: '48px',
              }}
            >
              {[
                { label: '간직한 글', value: savedItems.length },
                { label: '쓴 글결', value: myPosts.length },
                { label: '연속 읽기', value: '—' },
                { label: '멤버십', value: '무료' },
              ].map(stat => (
                <div
                  key={stat.label}
                  style={{
                    backgroundColor: 'var(--bg)',
                    padding: '28px 24px',
                  }}
                >
                  <p className="eyebrow" style={{ marginBottom: '12px' }}>― {stat.label}</p>
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '36px',
                      fontWeight: 400,
                      color: 'var(--ink-deep)',
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--rule)' }}>
              {(['saved', 'posts'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: tab === t ? '1px solid var(--accent)' : '1px solid transparent',
                    marginBottom: '-1px',
                    padding: '0 0 12px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    color: tab === t ? 'var(--ink-deep)' : 'var(--ink-2)',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {t === 'saved'
                    ? `간직한 글 (${savedItems.length})`
                    : `내가 쓴 글 (${myPosts.length})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <p className="eyebrow" style={{ textAlign: 'center', padding: '48px 0' }}>불러오는 중...</p>
        ) : tab === 'saved' ? (
          <SavedGrid items={savedItems} />
        ) : (
          <PostsGrid
            posts={myPosts}
            onEdit={setEditPost}
            onDelete={handleDeletePost}
          />
        )}

        {editPost && (
          <EditModal
            post={editPost}
            onClose={() => setEditPost(null)}
            onSave={data => handleUpdatePost(editPost, data)}
          />
        )}
      </main>
    </>
  )
}

function SavedGrid({ items }: { items: SavedItem[] }) {
  if (items.length === 0) {
    return (
      <div style={{ padding: '64px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--ink-3)' }}>
          아직 간직한 글이 없습니다
        </p>
      </div>
    )
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', backgroundColor: 'var(--rule)' }}>
      {items.map((item, idx) =>
        item.content ? (
          <div
            key={item.id}
            className="card"
            style={{ padding: '32px', backgroundColor: 'var(--bg)' }}
          >
            <p className="eyebrow" style={{ marginBottom: '12px' }}>
              {String(idx + 1).padStart(2, '0')} ― {item.content.tags?.[0] ?? '글결'}
            </p>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                fontWeight: 400,
                color: 'var(--ink-deep)',
                letterSpacing: '-0.01em',
                lineHeight: 1.35,
                marginBottom: '12px',
              }}
            >
              {item.content.title}
            </h3>
            <p className="eyebrow">{item.itemType === 'daily' ? '오늘의 글' : '발견'}</p>
          </div>
        ) : null
      )}
    </div>
  )
}

function PostsGrid({
  posts,
  onEdit,
  onDelete,
}: {
  posts: Post[]
  onEdit: (p: Post) => void
  onDelete: (id: string) => void
}) {
  if (posts.length === 0) {
    return (
      <div style={{ padding: '64px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--ink-3)' }}>
          작성한 글이 없습니다
        </p>
      </div>
    )
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', backgroundColor: 'var(--rule)' }}>
      {posts.map((post, idx) => (
        <div
          key={post.id}
          className="card"
          style={{ padding: '32px', backgroundColor: 'var(--bg)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p className="eyebrow">
              {String(idx + 1).padStart(2, '0')} ― {post.tags?.[0] ?? '글결'}
            </p>
            <p className="eyebrow">{post.visibility === 'public' ? '공개' : '비공개'}</p>
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '22px',
              fontWeight: 400,
              color: 'var(--ink-deep)',
              letterSpacing: '-0.01em',
              lineHeight: 1.35,
              marginBottom: '12px',
            }}
          >
            {post.title}
          </h3>
          <p className="eyebrow" style={{ marginBottom: '16px' }}>{formatDate(post.createdAt)}</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onEdit(post)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: '4px' }}
            >
              <GGIcon name="pen" size={14} stroke={1.25} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function EditModal({
  post,
  onClose,
  onSave,
}: {
  post: Post
  onClose: () => void
  onSave: (data: { title: string; body: string; visibility: string; tags: string[] }) => void
}) {
  const [title, setTitle] = useState(post.title)
  const [body, setBody] = useState(post.body)
  const [visibility, setVisibility] = useState(post.visibility)
  const [tags, setTags] = useState<string[]>(post.tags)
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try { await onSave({ title, body, visibility, tags }) }
    finally { setSaving(false) }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--bg)',
          padding: '48px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 80px rgba(0,0,0,0.4)',
        }}
      >
        <p className="eyebrow" style={{ marginBottom: '24px' }}>― 글 수정</p>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={40}
          className="gg-input"
          style={{ fontSize: '24px', marginBottom: '24px' }}
        />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          maxLength={600}
          rows={8}
          style={{
            width: '100%',
            border: 'none',
            borderBottom: '1px solid var(--rule-strong)',
            background: 'transparent',
            fontFamily: 'var(--font-serif)',
            fontSize: '18px',
            lineHeight: '1.85',
            color: 'var(--ink)',
            outline: 'none',
            resize: 'none',
            padding: '0 0 16px',
            marginBottom: '24px',
          }}
        />
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {(['private', 'public'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setVisibility(v)}
              className={visibility === v ? 'btn-primary' : 'btn-outline'}
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              {v === 'private' ? '비공개' : '공개'}
            </button>
          ))}
        </div>
        <input
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              const t = tagInput.trim()
              if (t && tags.length < 5 && !tags.includes(t)) {
                setTags([...tags, t])
                setTagInput('')
              }
            }
          }}
          placeholder="태그 입력 후 Enter"
          maxLength={10}
          className="gg-input"
          style={{ marginBottom: '16px' }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
          {tags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => setTags(tags.filter(t => t !== tag))}
              className="tag"
            >
              #{tag} ×
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-outline">취소</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
