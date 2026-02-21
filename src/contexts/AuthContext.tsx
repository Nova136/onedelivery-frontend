import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Role = 'admin' | 'customer'

export interface User {
  username: string
  role: Role
  displayName: string
}

// Hardcoded credentials (for demo only)
const USERS: { username: string; password: string; role: Role; displayName: string }[] = [
  { username: 'admin', password: 'admin', role: 'admin', displayName: 'Admin' },
  { username: 'customer', password: 'customer', role: 'customer', displayName: 'Customer' },
]

interface AuthContextValue {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem('onedelivery_user')
    if (stored) {
      try {
        return JSON.parse(stored) as User
      } catch {
        return null
      }
    }
    return null
  })

  const login = useCallback((username: string, password: string): boolean => {
    const u = USERS.find(
      (x) => x.username === username && x.password === password
    )
    if (!u) return false
    const userData: User = {
      username: u.username,
      role: u.role,
      displayName: u.displayName,
    }
    setUser(userData)
    sessionStorage.setItem('onedelivery_user', JSON.stringify(userData))
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem('onedelivery_user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
