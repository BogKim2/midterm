'use client'

import { useState } from 'react'
import Link from 'next/link'

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

interface PostCardProps {
  post: Post
  onSaveToggle?: () => void
  showActions?: boolean
  onEdit?: (post: Post) => void
  onDelete?: (id: string) => void
}

export default function PostCard({ post, onSaveToggle, showActions, onEdit, onDelete }: PostCardProps) {
  const [saving, setSaving] = useState(false)

  async function handleSaveToggle() {
    setSaving(true)
    try {
      await fetch('/api/saved/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType: 'user', itemId: post.id }),
      })
      onSaveToggle?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-6 border"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <h2
          className="text-base font-medium"
          style={{ fontFamily: "'Noto Serif KR', serif", color: 'var(--color-text)' }}
        >
          {post.title}
        </h2>
        {post.visibility === 'private' && (
          <span className="text-xs px-2 py-0.5 rounded ml-2 shrink-0" style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            비공개
          </span>
        )}
      </div>

      <p
        className="text-sm mb-4 line-clamp-3 leading-relaxed"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {post.body}
      </p>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {post.author && (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {post.author.name ?? '익명'}
            </span>
          )}
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {new Date(post.createdAt).toLocaleDateString('ko-KR')}
          </span>
        </div>

        <div className="flex gap-2">
          {!post.isOwn && onSaveToggle && (
            <button
              onClick={handleSaveToggle}
              disabled={saving}
              className="text-xs px-3 py-1 rounded-full transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
            >
              {saving ? '...' : '저장'}
            </button>
          )}
          {showActions && post.isOwn && (
            <>
              <button
                onClick={() => onEdit?.(post)}
                className="text-xs px-3 py-1 rounded-full transition-colors"
                style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
              >
                수정
              </button>
              <button
                onClick={() => onDelete?.(post.id)}
                className="text-xs px-3 py-1 rounded-full transition-colors"
                style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
