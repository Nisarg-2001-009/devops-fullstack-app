import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const parseError = (err) => {
    const detail = err.response?.data?.detail
    if (!detail) return 'An error occurred'
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', ')
    return JSON.stringify(detail)
  }

  useEffect(() => {
    if (token) {
      setUser({ token })
    }
  }, [token])

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)
      const response = await authAPI.login(formData)
      const { access_token } = response.data
      localStorage.setItem('token', access_token)
      setToken(access_token)
      setUser({ email, token: access_token })
      return true
    } catch (err) {
      setError(parseError(err))
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      await authAPI.register({ email, password })
      return true
    } catch (err) {
      setError(parseError(err))
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
