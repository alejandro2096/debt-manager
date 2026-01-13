import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDebts } from '@/features/debts/hooks/useDebts'
import { debtsService } from '@/features/debts/services/debtsService'

export default function DebtsPage() {
  const { items, isLoading, error, refetch } = useDebts({ page: 1, limit: 10 })

  const [debtorId, setDebtorId] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [uiError, setUiError] = useState<string | null>(null)

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUiError(null)
    setCreating(true)
    try {
      await debtsService.create({
        debtorId: debtorId.trim(),
        amount: Number(amount),
        description: description.trim() || undefined,
      })
      setDebtorId('')
      setAmount(0)
      setDescription('')
      await refetch()
    } catch (e: any) {
      setUiError(e?.response?.data?.message || e?.message || 'Error creando deuda')
    } finally {
      setCreating(false)
    }
  }

  const onPay = async (id: string) => {
    await debtsService.markAsPaid(id)
    await refetch()
  }

  const onDelete = async (id: string) => {
    await debtsService.remove(id)
    await refetch()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Deudas</h2>

      {/* CREATE */}
      <form onSubmit={onCreate} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="block md:col-span-1">
            <span className="text-sm text-zinc-200">Debtor ID</span>
            <input
              required
              value={debtorId}
              onChange={(e) => setDebtorId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
              placeholder="UUID del deudor"
            />
          </label>

          <label className="block md:col-span-1">
            <span className="text-sm text-zinc-200">Monto</span>
            <input
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
            />
          </label>

          <label className="block md:col-span-1">
            <span className="text-sm text-zinc-200">Descripción</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
              placeholder="Opcional"
            />
          </label>
        </div>

        {uiError && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            {uiError}
          </div>
        )}

        <button
          disabled={creating}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-60"
        >
          {creating ? 'Creando…' : 'Crear deuda'}
        </button>
      </form>

      {/* LIST */}
      {isLoading && <p className="text-zinc-400">Cargando...</p>}
      {error && <p className="text-red-300">{error}</p>}

      {!isLoading && !error && items.length === 0 && (
        <p className="text-zinc-400">Aún no tienes deudas.</p>
      )}

      <ul className="space-y-2">
        {items.map((d) => (
          <li key={d.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-zinc-100 font-medium">${d.amount}</div>
                <div className="text-xs text-zinc-400">{d.status}</div>
                {d.description && <div className="text-sm text-zinc-300 mt-1">{d.description}</div>}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/debts/${d.id}`}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                >
                  Ver
                </Link>

                {d.status !== 'PAID' && (
                  <button
                    onClick={() => onPay(d.id)}
                    className="rounded-lg bg-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-950"
                  >
                    Marcar pagada
                  </button>
                )}

                {d.status === 'PAID' && (
                  <button
                    onClick={() => onDelete(d.id)}
                    className="rounded-lg bg-red-200 px-3 py-2 text-sm font-semibold text-red-950"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
