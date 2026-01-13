import { axiosInstance } from '@/core/api/axiosInstance'

export type UserListItem = { id: string; name: string; email: string }

type ApiResponse<T> = { success: boolean; data: T }

export const usersService = {
  async list(): Promise<UserListItem[]> {
    const { data } = await axiosInstance.get<ApiResponse<UserListItem[]>>('/users')
    return data.data
  },
}
