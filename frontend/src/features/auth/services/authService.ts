import type { LoginDTO } from '@/core/types/Auth'
import { axiosInstance } from '@/core/api/axiosInstance'

type AuthPayload = {
  user: { id: string; email: string; name: string }
  token: string
}

export const authService = {
  async login(payload: LoginDTO): Promise<AuthPayload> {
    const { data } = await axiosInstance.post('/auth/login', payload)
    return data.data
  },

  async register(payload: { name: string; email: string; password: string }): Promise<AuthPayload> {
    const { data } = await axiosInstance.post('/auth/register', payload)
    return data.data
  },
}
