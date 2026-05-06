import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { authApi } from './api/auth'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Fridge from './pages/Fridge'
import Analyze from './pages/Analyze'
import Recipes from './pages/Recipes'
import RecipeDetail from './pages/RecipeDetail'
import Subscription from './pages/Subscription'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore()
  if (!initialized) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>
            <span className="logo-text" style={{ color: '#1A1A1A' }}>Pri</span>
            <span className="logo-text" style={{ color: '#1D9E75' }}>gio.</span>
          </div>
          <p style={{ color: '#5F5E5A' }}>로딩 중...</p>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const { setUser, setInitialized } = useAuthStore()

  useEffect(() => {
    authApi.me()
      .then((user) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setInitialized(true))
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/fridge" element={<ProtectedRoute><Fridge /></ProtectedRoute>} />
        <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
        <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
        <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
