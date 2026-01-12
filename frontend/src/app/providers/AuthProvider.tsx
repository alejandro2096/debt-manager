import React, { createContext, useMemo, useState } from 'react'

type AuthState = {
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

const STORAGE_KEY = 'dm_token'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))

  const value = useMemo<AuthState>(() => {
    const login = (newToken: string) => {
      localStorage.setItem(STORAGE_KEY, newToken)
      setToken(newToken)
    }

    const logout = () => {
      localStorage.removeItem(STORAGE_KEY)
      setToken(null)
    }

    return { token, isAuthenticated: Boolean(token), login, logout }
  }, [token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
