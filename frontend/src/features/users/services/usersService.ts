import { axiosInstance } from '@/core/api/axiosInstance'

export type PublicUser = {
  id: string
  name: string
  email: string
}

type ApiResponse<T> = {
  success: boolean
  data: T
}

export const usersService = {
  async list(): Promise<PublicUser[]> {
    const { data } = await axiosInstance.get<ApiResponse<PublicUser[]>>('/users')
    return data.data
  },
}
