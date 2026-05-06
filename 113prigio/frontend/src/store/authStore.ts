import { create } from 'zustand'
import type { User } from '../types'

interface AuthStore {
  user: User | null
  initialized: boolean
  setUser: (user: User | null) => void
  setInitialized: (v: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  initialized: false,
  setUser: (user) => set({ user }),
  setInitialized: (initialized) => set({ initialized }),
}))
