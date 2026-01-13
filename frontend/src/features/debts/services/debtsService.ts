import { axiosInstance } from '@/core/api/axiosInstance'

export type DebtStatus = 'PENDING' | 'PAID' | 'pending' | 'paid'

export type Debt = {
    id: string
    creditorId: string
    debtorId: string
    amount: number
    description: string | null
    dueDate: string | null
    status: DebtStatus
    createdAt?: string
    updatedAt?: string
    paidAt?: string | null
}

export type Pagination = {
    total: number
    page: number
    limit: number
    totalPages: number
}

type ApiResponse<T> = {
    success: boolean
    data: T
    pagination?: Pagination
    message?: string
}

export type DebtFilters = {
    status?: DebtStatus
    creditorId?: string
    debtorId?: string
    page?: number
    limit?: number
}

export type CreateDebtDTO = {
    debtorId: string
    amount: number
    description?: string
    dueDate?: string
}

export type UpdateDebtDTO = {
    amount?: number
    description?: string
    dueDate?: string
}

export type DebtStats = {
    totalPaid: number
    totalPending: number
    countPaid: number
    countPending: number
    toReceivePending: number
    toPayPending: number
    netPending: number
}

export const debtsService = {
    async list(filters?: DebtFilters) {
        const { data } = await axiosInstance.get<ApiResponse<Debt[]>>('/debts', { params: filters })
        return { items: data.data, pagination: data.pagination! }
    },

    async getById(id: string) {
        const { data } = await axiosInstance.get<ApiResponse<Debt>>(`/debts/${id}`)
        return data.data
    },

    async create(payload: CreateDebtDTO) {
        const { data } = await axiosInstance.post<ApiResponse<Debt>>('/debts', payload)
        return data.data
    },

    async update(id: string, payload: UpdateDebtDTO) {
        const { data } = await axiosInstance.put<ApiResponse<Debt>>(`/debts/${id}`, payload)
        return data.data
    },

    async remove(id: string) {
        await axiosInstance.delete(`/debts/${id}`)
    },

    async markAsPaid(id: string) {
        const { data } = await axiosInstance.patch<ApiResponse<Debt>>(`/debts/${id}/pay`)
        return data.data
    },

    async getStats() {
        const { data } = await axiosInstance.get<ApiResponse<any>>('/debts/stats')
        return data.data
    },

    // async export(format: 'json' | 'csv' = 'json') {
    //     const res = await axiosInstance.get(`/debts/export`, {
    //         params: { format },
    //         responseType: 'blob',
    //     })
    //     return res.data as Blob
    // },
    async export(format: 'csv' | 'json' = 'csv') {
        const res = await axiosInstance.get('/debts/export', {
            params: { format },
            responseType: 'blob',
        })

        const contentType = res.headers['content-type'] ?? 'application/octet-stream'
        const disposition = res.headers['content-disposition'] ?? ''
        const filename = getFilenameFromDisposition(disposition) ?? `debts.${format}`

        return { blob: new Blob([res.data], { type: contentType }), filename }
    },

    async stats(): Promise<DebtStats> {
        const res = await axiosInstance.get('/debts/stats')

        // backend típico: { success: true, data: {...} }
        const payload = (res.data?.data ?? res.data) as DebtStats

        return payload
    },
}

function getFilenameFromDisposition(disposition: string): string | null {
    const match = /filename="?([^"]+)"?/i.exec(disposition)
    return match?.[1] ?? null
}
