import { useEffect, useState } from 'react'
import { debtsService, type DebtStats } from '../services/debtsService'

export function useDebtStats() {
  const [stats, setStats] = useState<DebtStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await debtsService.stats()
      setStats(data)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Error cargando estadísticas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let alive = true

    ;(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await debtsService.stats()
        if (!alive) return
        setStats(data)
      } catch (e: any) {
        if (!alive) return
        setError(e?.response?.data?.message || e?.message || 'Error cargando estadísticas')
      } finally {
        if (!alive) return
        setIsLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  return { stats, isLoading, error, refetch, setStats }
}
