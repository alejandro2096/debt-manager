import type { AuthUser } from '@/core/types/Auth'

const KEY = 'dm_user'

export function setUser(user: AuthUser) {
  localStorage.setItem(KEY, JSON.stringify(user))
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function clearUser() {
  localStorage.removeItem(KEY)
}
