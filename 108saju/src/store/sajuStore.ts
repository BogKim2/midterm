import { create } from 'zustand'
import type { SajuAnalysis, SajuInput } from '../types'

type SajuStore = {
  currentInput: SajuInput | null
  currentAnalysis: SajuAnalysis | null
  isAnalyzing: boolean
  setInput: (input: SajuInput) => void
  setAnalysis: (analysis: SajuAnalysis | null) => void
  setAnalyzing: (value: boolean) => void
  reset: () => void
}

export const useSajuStore = create<SajuStore>((set) => ({
  currentInput: null,
  currentAnalysis: null,
  isAnalyzing: false,
  setInput: (input) => set({ currentInput: input }),
  setAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  setAnalyzing: (value) => set({ isAnalyzing: value }),
  reset: () => set({ currentInput: null, currentAnalysis: null, isAnalyzing: false }),
}))
