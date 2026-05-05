import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
import { StarField } from '../ui/StarField'

export function AppShell() {
  return (
    <div className="app-shell">
      <StarField density="high" />
      <div className="app-shell__content">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </div>
  )
}
