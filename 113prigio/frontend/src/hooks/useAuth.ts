import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'

export function useAuth() {
  const { setUser, setInitialized } = useAuthStore()
  useEffect(() => {
    authApi.me()
      .then((user) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setInitialized(true))
  }, [])
}
