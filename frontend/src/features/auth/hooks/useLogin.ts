import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/features/auth/services/authService'
import type { LoginDTO } from '@/core/types/Auth'
import { useAuth } from '@/shared/hooks/useAuth'
import { ROUTES } from '@/app/router/routes'

type UseLoginResult = {
  isLoading: boolean
  error: string | null
  login: (payload: LoginDTO) => Promise<void>
}

export function useLogin(): UseLoginResult {
  const navigate = useNavigate()
  const { login: setAuth } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (payload: LoginDTO) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await authService.login(payload)
      const token = result?.token
      const user = result?.user

      if (!token) throw new Error('No se recibió token en la respuesta del servidor.')
      if (!user) throw new Error('No se recibió user en la respuesta del servidor.')

      setAuth({ token, user })
      navigate(ROUTES.debts, { replace: true })
    } catch (e: any) {
      const message =
        typeof e?.response?.data?.message === 'string'
          ? e.response.data.message
          : e?.message || 'Error al iniciar sesión'

      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, error, login }
}
