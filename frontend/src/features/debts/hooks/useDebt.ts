import { useEffect, useState } from 'react'
import { debtsService, type Debt } from '../services/debtsService'

export function useDebt(debtId?: string) {
  const [item, setItem] = useState<Debt | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = async () => {
    if (!debtId) return
    const res = await debtsService.getById(debtId)
    setItem(res)
  }

  useEffect(() => {
    let alive = true

    ;(async () => {
      if (!debtId) return
      setIsLoading(true)
      setError(null)

      try {
        const res = await debtsService.getById(debtId)
        if (!alive) return
        setItem(res)
      } catch (e: any) {
        if (!alive) return
        setError(e?.response?.data?.message || e?.message || 'Error cargando deuda')
      } finally {
        if (!alive) return
        setIsLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [debtId])

  return { item, setItem, isLoading, error, refetch }
}
