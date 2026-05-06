import { apiClient } from './client'
import type { QuotaStatus } from '../types'

export const quotaApi = {
  getStatus: async (): Promise<QuotaStatus> => {
    const res = await apiClient.get('/api/v1/quota/status')
    return res.data
  },
}
