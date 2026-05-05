'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import GGMark from '@/components/ui/GGMark'
import GGIcon from '@/components/ui/GGIcon'

type NavItem = '오늘' | '발견' | '쓰기' | '마이'

interface GGNavProps {
  active?: NavItem
}

const navLinks: { label: NavItem; href: string }[] = [
  { label: '오늘', href: '/today' },
  { label: '발견', href: '/feed' },
  { label: '쓰기', href: '/write' },
  { label: '마이', href: '/me' },
]

export default function GGNav({ active }: GGNavProps) {
  const { data: session } = useSession()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('gg-theme') as 'light' | 'dark' | null
    if (saved) setTheme(saved)
  }, [])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('gg-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <nav
      style={{
        width: '100%',
        padding: '22px 56px',
        borderBottom: '1px solid var(--rule)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          color: 'var(--ink-deep)',
        }}
      >
        <GGMark size={22} color="var(--ink-deep)" />
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--ink-deep)' }}>
          글결
        </span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {navLinks.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              letterSpacing: '0.04em',
              textDecoration: 'none',
              color: active === label ? 'var(--ink-deep)' : 'var(--ink-2)',
              borderBottom: active === label ? '1px solid var(--accent)' : '1px solid transparent',
              paddingBottom: '2px',
              transition: 'color 0.15s ease',
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Right: search + theme toggle + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          aria-label="검색"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', padding: '4px', transition: 'color 0.15s ease' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}
        >
          <GGIcon name="search" size={16} stroke={1.25} />
        </button>

        <button
          onClick={toggleTheme}
          aria-label="테마 전환"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', padding: '4px', transition: 'color 0.15s ease' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}
        >
          <GGIcon name={theme === 'light' ? 'moon' : 'sun'} size={16} stroke={1.25} />
        </button>

        <Link href="/me" aria-label="프로필" style={{ textDecoration: 'none' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-4)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', color: 'var(--ink-2)' }}>
                {session?.user?.name?.[0] ?? '글'}
              </span>
            )}
          </div>
        </Link>
      </div>
    </nav>
  )
}
