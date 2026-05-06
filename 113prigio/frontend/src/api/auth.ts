import { apiClient } from './client'
import type { User } from '../types'

export const authApi = {
  getLoginUrl: async (): Promise<{ authorization_url: string }> => {
    const res = await apiClient.get('/auth/google/login')
    return res.data
  },
  me: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me')
    return res.data
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
}
