import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDebts } from '@/features/debts/hooks/useDebts'
import { ROUTES } from '@/app/router/routes'

type StatusFilter = 'ALL' | 'PENDING' | 'PAID'

export default function DebtsPage() {
  const [status, setStatus] = useState<StatusFilter>('ALL')

  const filters = useMemo(() => {
    const base = { page: 1, limit: 10 }

    if (status === 'ALL') return base

    return { ...base, status }
  }, [status])

  const { items, isLoading, error, pagination } = useDebts(filters as any)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Deudas</h2>
          <p className="mt-1 text-sm text-zinc-400">Filtro: pendientes o pagadas.</p>
        </div>

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
      </div>

      {isLoading && <p className="text-zinc-400">Cargando...</p>}
      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <p className="text-zinc-400">Aún no tienes deudas.</p>
      )}

      <ul className="space-y-3">
        {items.map((d) => (
          <li key={d.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-zinc-100">${d.amount}</span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs border ${d.status === 'PAID'
                        ? 'bg-emerald-950/40 text-emerald-200 border-emerald-900/50'
                        : 'bg-amber-950/40 text-amber-200 border-amber-900/50'
                      }`}
                  >
                    {d.status}
                  </span>
                </div>

                {d.description && <p className="mt-2 text-sm text-zinc-300">{d.description}</p>}
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
        <div className="text-xs text-zinc-400">
          Página {pagination.page} · {items.length} items · Límite {pagination.limit}
        </div>
      )}
    </div>
  )
}
