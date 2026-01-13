import { useEffect, useState } from 'react'
import { usersService, type UserListItem } from '../services/usersService'

export function useUsers() {
    const [users, setUsers] = useState<UserListItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let alive = true
            ; (async () => {
                setIsLoading(true)
                setError(null)
                try {
                    const res = await usersService.list()
                    if (!alive) return
                    setUsers(res)
                } catch (e: any) {
                    if (!alive) return
                    setError(e?.response?.data?.message || e?.message || 'Error cargando usuarios')
                } finally {
                    if (!alive) return
                    setIsLoading(false)
                }
            })()

        return () => {
            alive = false
        }
    }, [])

    return { users, isLoading, error }
}
