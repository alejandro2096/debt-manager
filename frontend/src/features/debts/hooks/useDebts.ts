import { useEffect, useState } from 'react'
import { debtsService, type Debt, type DebtFilters, type Pagination } from '../services/debtsService'

export function useDebts(filters?: DebtFilters) {
    const [items, setItems] = useState<Debt[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let alive = true;

        (async () => {
            setIsLoading(true)
            setError(null)
            try {
                const res = await debtsService.list(filters)
                if (!alive) return
                setItems(res.items)
                setPagination(res.pagination)
            } catch (e: any) {
                if (!alive) return
                setError(e?.response?.data?.message || e?.message || 'Error cargando deudas')
            } finally {
                if (!alive) return
                setIsLoading(false)
            }
        })()

        return () => {
            alive = false
        }
    }, [JSON.stringify(filters ?? {})])

    return {
        items, pagination, isLoading, error, refetch: async () => {
            const res = await debtsService.list(filters)
            setItems(res.items)
            setPagination(res.pagination)
        }
    }
}
