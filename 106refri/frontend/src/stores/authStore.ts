"use client"
import { create } from "zustand"
import type { User } from "@/types"
import { setAuthToken, setStoredUser, clearAuthToken } from "@/lib/api"

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
  setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  setAuth: (token, user) => {
    setAuthToken(token)
    setStoredUser(user)
    set({ user, token, isLoading: false })
  },
  logout: () => {
    clearAuthToken()
    set({ user: null, token: null, isLoading: false })
  },
  setLoading: (v) => set({ isLoading: v }),
}))
