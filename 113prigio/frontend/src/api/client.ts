import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true,
})

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      try {
        await apiClient.post('/auth/refresh')
        return apiClient(error.config)
      } catch {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)
