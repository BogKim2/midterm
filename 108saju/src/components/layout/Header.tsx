import { NavLink } from 'react-router-dom'
import { Button } from '../ui/Button'
import './layout.css'

const links = [
  { to: '/analysis', label: '사주분석' },
  { to: '/compatibility', label: '궁합' },
  { to: '/calendar', label: '캘린더' },
  { to: '/timeline', label: '타임라인' },
]

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink className="brand" to="/">
          <span className="brand__mark">✦</span>
          <span>사주AI</span>
        </NavLink>

        <nav className="site-nav" aria-label="주요 메뉴">
          {links.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) => `site-nav__link${isActive ? ' is-active' : ''}`}
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <NavLink to="/login" className="site-nav__link">
            로그인
          </NavLink>
          <Button as="link" to="/input" size="sm">
            시작하기
          </Button>
        </div>
      </div>
    </header>
  )
}
