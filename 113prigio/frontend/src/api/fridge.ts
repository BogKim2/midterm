import { apiClient } from './client'
import type { Refrigerator } from '../types'

export const fridgeApi = {
  get: async (): Promise<Refrigerator> => {
    const res = await apiClient.get('/api/v1/fridge')
    return res.data
  },
  addIngredient: async (data: object): Promise<any> => {
    const res = await apiClient.post('/api/v1/fridge/ingredients', data)
    return res.data
  },
  bulkAdd: async (items: object[]): Promise<any> => {
    const res = await apiClient.post('/api/v1/fridge/ingredients/bulk', items)
    return res.data
  },
  updateIngredient: async (id: string, data: object): Promise<any> => {
    const res = await apiClient.patch(`/api/v1/fridge/ingredients/${id}`, data)
    return res.data
  },
  deleteIngredient: async (id: string): Promise<any> => {
    const res = await apiClient.delete(`/api/v1/fridge/ingredients/${id}`)
    return res.data
  },
}
