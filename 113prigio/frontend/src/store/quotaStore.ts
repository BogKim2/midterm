import { create } from 'zustand'
import type { QuotaStatus } from '../types'

interface QuotaStore {
  quotaStatus: QuotaStatus | null
  setQuotaStatus: (status: QuotaStatus | null) => void
}

export const useQuotaStore = create<QuotaStore>((set) => ({
  quotaStatus: null,
  setQuotaStatus: (quotaStatus) => set({ quotaStatus }),
}))
