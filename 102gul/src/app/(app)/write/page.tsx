'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PostInputSchema, type PostInput } from '@/lib/validators/post'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import GGNav from '@/components/layout/GGNav'
import GGIcon from '@/components/ui/GGIcon'

export default function WritePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostInput>({
    resolver: zodResolver(PostInputSchema),
    defaultValues: { visibility: 'private', tags: [] },
  })

  const tags = watch('tags')
  const body = watch('body') ?? ''
  const title = watch('title') ?? ''

  function addTag() {
    const t = tagInput.trim()
    if (!t || tags.length >= 5 || tags.includes(t)) return
    setValue('tags', [...tags, t])
    setTagInput('')
  }

  function removeTag(tag: string) {
    setValue('tags', tags.filter(t => t !== tag))
  }

  async function onSubmit(data: PostInput) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.ok) router.push('/me')
    } finally {
      setSubmitting(false)
    }
  }

  const visibility = watch('visibility')

  return (
    <>
      <GGNav active="쓰기" />
      <main
        className="fade-in"
        style={{ maxWidth: '780px', margin: '0 auto', padding: '72px 24px 80px' }}
      >
        {/* Meta row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '48px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.16em',
            color: 'var(--ink-3)',
          }}
        >
          <span>― 새 글결 ―</span>
          <span>초안</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Title */}
          <div style={{ marginBottom: '32px' }}>
            <input
              {...register('title')}
              placeholder="제목을 입력하세요"
              className="gg-input"
              style={{ fontSize: '46px', letterSpacing: '-0.015em', fontWeight: 400 }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
              }}
            >
              {errors.title && (
                <div className="gg-error">{errors.title.message}</div>
              )}
              <span
                className="gg-label"
                style={{
                  marginLeft: 'auto',
                  color: title.length > 35 ? 'var(--accent)' : 'var(--ink-3)',
                }}
              >
                제목 · {title.length} / 40자
              </span>
            </div>
          </div>

          {/* Tags */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '32px',
              flexWrap: 'wrap',
            }}
          >
            <span className="eyebrow" style={{ marginRight: '4px' }}>― 결</span>
            {tags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => removeTag(tag)}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  color: 'var(--accent)',
                  border: '1px solid var(--rule-strong)',
                  background: 'none',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  borderRadius: 0,
                  letterSpacing: '0.04em',
                }}
              >
                #{tag} ×
              </button>
            ))}
            <div style={{ display: 'flex', gap: '4px' }}>
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="+ 추가"
                maxLength={10}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  border: 'none',
                  borderBottom: '1px solid var(--rule)',
                  background: 'transparent',
                  color: 'var(--ink-2)',
                  outline: 'none',
                  padding: '4px 0',
                  width: '80px',
                  letterSpacing: '0.04em',
                }}
              />
            </div>
          </div>

          {/* Body */}
          <div style={{ marginBottom: '32px' }}>
            <textarea
              {...register('body')}
              placeholder="마음에 담아두고 싶은 글을 써보세요"
              style={{
                width: '100%',
                height: '280px',
                resize: 'none',
                border: 'none',
                borderBottom: '1px solid var(--rule)',
                background: 'transparent',
                fontFamily: 'var(--font-serif)',
                fontSize: '21px',
                lineHeight: '1.95',
                color: 'var(--ink)',
                outline: 'none',
                padding: '0 0 16px 0',
              }}
            />
            {errors.body && <div className="gg-error">{errors.body.message}</div>}
          </div>

          {/* Bottom bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0',
              borderTop: '1px solid var(--rule)',
              borderBottom: '1px solid var(--rule)',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', gap: '24px' }}>
              <span
                className="gg-label"
                style={{ color: body.length > 550 ? 'var(--accent)' : 'var(--ink-3)' }}
              >
                본문 · {body.length} / 600자
              </span>
              <span
                className="gg-label"
                style={{ color: title.length > 35 ? 'var(--accent)' : 'var(--ink-3)' }}
              >
                제목 · {title.length} / 40자
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setValue('visibility', 'private')}
                style={{
                  padding: '8px 16px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  letterSpacing: '0.06em',
                  border: '1px solid var(--rule-strong)',
                  borderRadius: 0,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  backgroundColor: visibility === 'private' ? 'var(--bg-2)' : 'transparent',
                  color: 'var(--ink-2)',
                }}
              >
                비공개
              </button>
              <button
                type="button"
                onClick={() => setValue('visibility', 'public')}
                style={{
                  padding: '8px 16px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  letterSpacing: '0.06em',
                  border: '1px solid var(--rule-strong)',
                  borderRadius: 0,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  backgroundColor: visibility === 'public' ? 'var(--bg-2)' : 'transparent',
                  color: 'var(--ink-2)',
                }}
              >
                발견에 공개
              </button>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ opacity: submitting ? 0.5 : 1 }}
            >
              {submitting ? '저장 중...' : '발행하기'}
              <GGIcon name="arrow-right" size={14} stroke={1.5} color="var(--btn-fg)" />
            </button>
          </div>
        </form>
      </main>
    </>
  )
}
