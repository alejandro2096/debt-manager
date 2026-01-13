import React, { createContext, useMemo, useState } from 'react'
import { clearToken, getToken, setToken } from '@/core/auth/tokenStorage'
import type { AuthUser } from '@/core/types/Auth'
import { clearUser, getUser, setUser } from '@/core/auth/userStorage'

type AuthPayload = {
  token: string
  user: AuthUser
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (payload: AuthPayload) => void
  logout: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [user, setUserState] = useState<AuthUser | null>(() => getUser())

  const value = useMemo<AuthState>(() => {
    const login = (payload: AuthPayload) => {
      setToken(payload.token)
      setUser(payload.user)
      setTokenState(payload.token)
      setUserState(payload.user)
    }

    const logout = () => {
      clearToken()
      clearUser()
      setTokenState(null)
      setUserState(null)
    }

    return { token, user, isAuthenticated: Boolean(token), login, logout }
  }, [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
