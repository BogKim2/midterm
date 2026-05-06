import { apiClient } from './client'

export const analysisApi = {
  uploadAndAnalyze: async (files: File[]): Promise<any> => {
    const formData = new FormData()
    files.forEach((f) => formData.append('images', f))
    const res = await apiClient.post('/api/v1/analysis/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
}
