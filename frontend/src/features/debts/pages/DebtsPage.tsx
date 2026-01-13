import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/app/router/routes'
import { useDebts } from '@/features/debts/hooks/useDebts'
import { debtsService, type Debt } from '@/features/debts/services/debtsService'
import { axiosInstance } from '@/core/api/axiosInstance'
import { useAuth } from '@/shared/hooks/useAuth'

type StatusFilter = 'ALL' | 'PENDING' | 'PAID'

type UserOption = {
  id: string
  name: string
  email: string
}

type DebtStats = {
  totalPaid: number
  totalPending: number
  countPaid: number
  countPending: number
  toReceivePending: number
  toPayPending: number
  netPending: number
  amountPending: number
  amountPaid: number
}

function formatMoney(value: number) {
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value)
  } catch {
    return `$${value}`
  }
}

function toDateInputValue(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

/** Hook local para stats (no necesitas crear otro archivo) */
function useDebtStats() {
  const [stats, setStats] = useState<DebtStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await axiosInstance.get('/debts/stats')
      // backend: { success, data }
      setStats(res.data.data as DebtStats)
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
        const res = await axiosInstance.get('/debts/stats')
        if (!alive) return
        setStats(res.data.data as DebtStats)
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

function CreateDebtModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => Promise<void> | void
}) {
  const { user } = useAuth() as any

  const [users, setUsers] = useState<UserOption[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  const [debtorId, setDebtorId] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [description, setDescription] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('') // YYYY-MM-DD

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // SOLO pedimos usuarios cuando el modal esté abierto
  useEffect(() => {
    if (!open) return

    let alive = true
    ;(async () => {
      setUsersLoading(true)
      setUsersError(null)
      try {
        const res = await axiosInstance.get('/users')
        // backend: { success, data }
        const raw = res.data.data
        const list: any[] = raw?.items ?? raw?.users ?? raw ?? []

        const normalized: UserOption[] = (Array.isArray(list) ? list : []).map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
        }))

        const meId = user?.id
        const filtered = meId ? normalized.filter((u) => u.id !== meId) : normalized

        if (!alive) return
        setUsers(filtered)

        if (!debtorId && filtered.length > 0) setDebtorId(filtered[0].id)
      } catch (e: any) {
        if (!alive) return
        setUsersError(e?.response?.data?.message || e?.message || 'No se pudieron cargar usuarios')
      } finally {
        if (!alive) return
        setUsersLoading(false)
      }
    })()

    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // reset al cerrar
  useEffect(() => {
    if (!open) {
      setError(null)
      setUsersError(null)
      setDebtorId('')
      setAmount(0)
      setDescription('')
      setDueDate('')
      setIsSaving(false)
    }
  }, [open])

  if (!open) return null

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      if (!debtorId) throw new Error('Selecciona un usuario (deudor).')
      if (!amount || amount <= 0) throw new Error('El monto debe ser mayor a 0.')

      const payload: any = {
        debtorId,
        amount,
        description: description.trim() ? description.trim() : undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      }

      await debtsService.create(payload)
      await onCreated()
      onClose()
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'No se pudo crear la deuda')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* overlay blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} aria-hidden="true" />

      {/* modal */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">Nueva deuda</h3>
            <p className="mt-0.5 text-xs text-zinc-400">Crea una deuda para un usuario existente.</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 hover:border-zinc-600"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-5 py-5">
          <label className="block">
            <span className="text-sm text-zinc-200">Deudor</span>

            {usersLoading ? (
              <div className="mt-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400">
                Cargando usuarios…
              </div>
            ) : usersError ? (
              <div className="mt-1 rounded-xl border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                {usersError}
              </div>
            ) : (
              <select
                value={debtorId}
                onChange={(e) => setDebtorId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-600"
                required
              >
                {users.length === 0 ? (
                  <option value="">No hay usuarios</option>
                ) : (
                  users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} · {u.email}
                    </option>
                  ))
                )}
              </select>
            )}
          </label>

          <label className="block">
            <span className="text-sm text-zinc-200">Monto</span>
            <input
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-600"
              placeholder="Ej: 50000"
            />
          </label>

          {/* Si quieres habilitar descripción y vencimiento, descomenta */}
          {/* <label className="block">
            <span className="text-sm text-zinc-200">Descripción (opcional)</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-600"
              placeholder="Ej: Almuerzo, préstamo, etc."
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-200">Fecha de vencimiento (opcional)</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-600"
            />
          </label> */}

          {error && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 hover:border-zinc-600"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving || usersLoading || !!usersError}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 hover:border-zinc-600"
            >
              {isSaving ? 'Creando…' : 'Crear deuda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DebtsPage() {
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const filters = useMemo(() => {
    const base: any = { page, limit: 10 }
    if (status === 'ALL') return base
    return { ...base, status }
  }, [page, status])

  const { items, isLoading, error, pagination, refetch } = useDebts(filters)
  const { stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDebtStats()

  useEffect(() => {
    setPage(1)
  }, [status])

  const canPrev = (pagination?.page ?? 1) > 1
  const canNext = pagination ? pagination.page < pagination.totalPages : false

  function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  const onExportCSV = async () => {
    try {
      const { blob, filename } = await debtsService.export('csv')
      downloadBlob(blob, filename)
      ;(window as any).__toast?.(`Descargado: ${filename}`, 'success')
    } catch {
      ;(window as any).__toast?.('No se pudo exportar el CSV', 'error')
    }
  }

  const netClass = (stats?.netPending ?? 0) >= 0 ? 'text-emerald-200' : 'text-red-200'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Deudas</h2>
          <p className="mt-1 text-sm text-zinc-400">Filtro: pendientes o pagadas.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-300">Filtro</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
            >
              <option value="ALL">Todas</option>
              <option value="PENDING">Pendientes</option>
              <option value="PAID">Pagadas</option>
            </select>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 hover:border-zinc-600"
          >
            Nueva deuda
          </button>

          <button
            onClick={onExportCSV}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 hover:border-zinc-600"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-xs text-zinc-400">Pendiente total</div>
          <div className="mt-1 text-xl font-semibold text-zinc-100">
            {statsLoading ? '—' : formatMoney(stats?.amountPending ?? 0)}
          </div>
          <div className="mt-1 text-xs text-zinc-500">{statsLoading ? '' : `${stats?.totalPending ?? 0} deudas`}</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-xs text-zinc-400">Total pagado</div>
          <div className="mt-1 text-xl font-semibold text-zinc-100">
            {statsLoading ? '—' : formatMoney(stats?.amountPaid ?? 0)}
          </div>
          <div className="mt-1 text-xs text-zinc-500">{statsLoading ? '' : `${stats?.totalPaid ?? 0} deudas`}</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="text-xs text-zinc-400">Saldo neto pendiente</div>
          <div className={`mt-1 text-xl font-semibold ${netClass}`}>
            {statsLoading ? '—' : formatMoney((stats?.amountPending ?? 0) + (stats?.amountPaid ?? 0))}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {/* {statsLoading
              ? ''
              : `Te deben: ${formatMoney(stats?.toReceivePending ?? 0)} · Debes: ${formatMoney(stats?.toPayPending ?? 0)}`} */}
          </div>
        </div>
      </div>

      {statsError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          <span>{statsError}</span>
          <button
            onClick={refetchStats}
            className="rounded-lg border border-red-900/60 bg-red-950/20 px-3 py-2 text-xs text-red-200 hover:border-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {isLoading && <p className="text-zinc-400">Cargando...</p>}

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {!isLoading && !error && items.length === 0 && <p className="text-zinc-400">Aún no tienes deudas.</p>}

      <ul className="space-y-3">
        {items.map((d: Debt) => (
          <li key={d.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-zinc-100">{formatMoney(d.amount)}</span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs border ${
                      d.status === 'PAID'
                        ? 'bg-emerald-950/40 text-emerald-200 border-emerald-900/50'
                        : 'bg-amber-950/40 text-amber-200 border-amber-900/50'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>

                {d.description && <p className="mt-2 text-sm text-zinc-300">{d.description}</p>}
                <p className="mt-2 text-xs text-zinc-500">Vence: {toDateInputValue(d.dueDate) || '—'}</p>
              </div>

              <Link
                to={ROUTES.debtDetail(d.id)}
                className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 hover:border-zinc-500"
              >
                Ver
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {!!pagination && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-zinc-400">
            Página {pagination.page} de {pagination.totalPages} · Total {pagination.totalPages ?? '—'} · Límite {pagination.limit}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 hover:border-zinc-600 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              disabled={!canNext}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 hover:border-zinc-600 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <CreateDebtModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={async () => {
          // refresca lista + stats
          await refetch()
          await refetchStats()
        }}
      />
    </div>
  )
}
