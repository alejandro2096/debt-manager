import { axiosInstance } from '@/core/api/axiosInstance'

export type UserListItem = {
    id: string
    name: string
    email: string
}

export const usersService = {
    async list(): Promise<UserListItem[]> {
        const { data } = await axiosInstance.get('/users')
        return data.data ?? data.items ?? data
    },
}
