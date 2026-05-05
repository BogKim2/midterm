"use client"
import { create } from "zustand"
import type { FridgeItem } from "@/types"
import { fridgeApi } from "@/lib/api"

interface FridgeState {
  items: FridgeItem[]
  isLoading: boolean
  error: string | null
  fetch: () => Promise<void>
  add: (item: Omit<FridgeItem, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>
  update: (id: number, data: Partial<FridgeItem>) => Promise<void>
  remove: (id: number) => Promise<void>
}

export const useFridgeStore = create<FridgeState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  fetch: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await fridgeApi.list()
      set({ items: data })
    } catch {
      set({ error: "재료를 불러오지 못했습니다." })
    } finally {
      set({ isLoading: false })
    }
  },
  add: async (item) => {
    const { data } = await fridgeApi.add(item)
    set({ items: [...get().items, data] })
  },
  update: async (id, patch) => {
    const { data } = await fridgeApi.update(id, patch)
    set({ items: get().items.map((i) => (i.id === id ? data : i)) })
  },
  remove: async (id) => {
    await fridgeApi.remove(id)
    set({ items: get().items.filter((i) => i.id !== id) })
  },
}))
