import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/api/v1/auth/register', data),
  login: (data) => api.post('/api/v1/auth/login', data),
}

export const accountsAPI = {
  getAll: () => api.get('/api/v1/accounts'),
  create: (data) => api.post('/api/v1/accounts', data),
}

export const transactionsAPI = {
  getAll: (params) => api.get('/api/v1/transactions', { params }),
  create: (data) => api.post('/api/v1/transactions', data),
  delete: (id) => api.delete(`/api/v1/transactions/${id}`),
}

export const analyticsAPI = {
  getSummary: () => api.get('/api/v1/analytics/summary'),
  getTrends: () => api.get('/api/v1/analytics/trends'),
  getBudgetVsActual: () => api.get('/api/v1/analytics/budget-vs-actual'),
}

export default api
