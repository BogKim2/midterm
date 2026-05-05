"use client"
import { useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { getStoredUser } from "@/lib/api"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, setLoading } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem("fridgechef_token")
    const user = getStoredUser()
    if (token && user) {
      setAuth(token, user)
    } else {
      setLoading(false)
    }
  }, [setAuth, setLoading])

  return <>{children}</>
}
