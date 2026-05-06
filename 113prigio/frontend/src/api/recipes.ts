import { apiClient } from './client'

export const recipesApi = {
  getCandidates: async (data: object): Promise<any> => {
    const res = await apiClient.post('/api/v1/recipes/ai/candidates', data)
    return res.data
  },
  generateRecipe: async (data: object): Promise<any> => {
    const res = await apiClient.post('/api/v1/recipes/ai/generate', data)
    return res.data
  },
  getCurated: async (): Promise<any> => {
    const res = await apiClient.get('/api/v1/recipes/curated')
    return res.data
  },
}
