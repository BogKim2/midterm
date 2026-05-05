'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'

interface NavigationProps {
  user: Session['user']
}

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/today', label: '오늘' },
    { href: '/feed', label: '발견' },
    { href: '/write', label: '쓰기' },
    { href: '/me', label: '나' },
  ]

  return (
    <header
      className="sticky top-0 z-10 border-b"
      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
    >
      <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/today"
          className="text-base font-light"
          style={{ fontFamily: "'Noto Serif KR', serif", color: 'var(--color-accent)' }}
        >
          글결
        </Link>

        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm transition-colors"
              style={{
                color: pathname.startsWith(item.href)
                  ? 'var(--color-accent)'
                  : 'var(--color-text-muted)',
                fontWeight: pathname.startsWith(item.href) ? '500' : '400',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
