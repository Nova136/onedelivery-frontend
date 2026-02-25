import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import {
  loginApi,
  registerApi,
  setAuthToken,
  clearAuthToken,
  getAuthToken,
  type LoginDto,
  type RegisterDto,
} from '../api/auth'

export type Role = 'admin' | 'customer'

export interface User {
  email: string
  role: Role
  displayName: string
}

function mapRole(role: string | undefined): Role {
  if (role === 'Admin') return 'admin'
  return 'customer'
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (dto: RegisterDto) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const USER_STORAGE_KEY = 'onedelivery_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = getAuthToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    const stored = sessionStorage.getItem(USER_STORAGE_KEY)
    if (stored) {
      try {
        const u = JSON.parse(stored) as User
        setUser(u)
      } catch {
        setUser(null)
      }
    } else {
      setUser(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const dto: LoginDto = { email: email.trim(), password }
    try {
      const res = await loginApi(dto)
      const token = res.accessToken ?? res.token
      if (!token) throw new Error('No token in response')
      setAuthToken(token)
      const u: User = {
        email: res.email ?? email.trim(),
        role: mapRole(res.role),
        displayName: ((res.email ?? email.trim()).split('@')[0]) || (res.email ?? email.trim()),
      }
      setUser(u)
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u))
      return true
    } catch {
      return false
    }
  }, [])

  const register = useCallback(async (dto: RegisterDto) => {
    await registerApi(dto)
    // Optionally auto-login after register; for now caller can redirect to login
  }, [])

  const logout = useCallback(() => {
    clearAuthToken()
    setUser(null)
    sessionStorage.removeItem(USER_STORAGE_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
