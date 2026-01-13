import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '@/app/router/routes'
import { debtsService, type Debt } from '@/features/debts/services/debtsService'
import { useDebt } from '../hooks/useDebt'

function formatMoney(value: number) {
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value)
  } catch {
    return `$${value}`
  }
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-CO')
}

function toDateInputValue(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

function EditDebtModal({
  open,
  onClose,
  debt,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  debt: Debt
  onSaved: (updated: Debt) => void
}) {

  const [amount, setAmount] = useState<number>(debt.amount)
  const [description, setDescription] = useState<string>(debt.description ?? '')
  const [dueDate, setDueDate] = useState<string>(toDateInputValue(debt.dueDate))

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const payload = {
        amount,
        description: description.trim() ? description.trim() : undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      }

      const updated = await debtsService.update(debt.id, payload)
      onSaved(updated)
      onClose()
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'No se pudo actualizar la deuda')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Cerrar modal" />

      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">Editar deuda</h3>
            <p className="mt-0.5 text-xs text-zinc-400">Solo puedes editar deudas pendientes.</p>
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
            <span className="text-sm text-zinc-200">Monto</span>
            <input
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-600"
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-200">Descripción (opcional)</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-600"
              placeholder="Ej: préstamo, almuerzo, etc."
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-200">Vencimiento (opcional)</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-600"
            />
          </label>

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
              disabled={isSaving}
              className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-60"
            >
              {isSaving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DebtDetailPage() {
  
  const { id } = useParams()
  const navigate = useNavigate()

  const debtId = id ?? ''

  const { item, isLoading, error, refetch, setItem } = useDebt(debtId)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isActing, setIsActing] = useState(false)

  const canMutate = item?.status === 'PENDING'

  const onMarkPaid = async () => {
    if (!item) return
    setIsActing(true)
    setActionError(null)
    try {
      const updated = await debtsService.markAsPaid(item.id)
      setItem(updated)
    } catch (e: any) {
      setActionError(e?.response?.data?.message || e?.message || 'No se pudo marcar como pagada')
    } finally {
      setIsActing(false)
    }
  }

  const onDelete = async () => {
    if (!item) return
    const ok = window.confirm('¿Eliminar esta deuda? Esta acción no se puede deshacer.')
    if (!ok) return

    setIsActing(true)
    setActionError(null)
    try {
      await debtsService.remove(item.id)
      navigate(ROUTES.debts, { replace: true })
    } catch (e: any) {
      setActionError(e?.response?.data?.message || e?.message || 'No se pudo eliminar la deuda')
    } finally {
      setIsActing(false)
    }
  }

  if (!debtId) {
    return (
      <div className="space-y-4">
        <p className="text-zinc-300">ID inválido.</p>
        <Link to={ROUTES.debts} className="text-zinc-100 underline underline-offset-4">
          Volver
        </Link>
      </div>
    )
  }

  console.log({ item })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Detalle de deuda</h2>
          <p className="mt-1 text-sm text-zinc-400">Consulta y acciones sobre una deuda.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 hover:border-zinc-600"
          >
            Refrescar
          </button>

          <Link
            to={ROUTES.debts}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 hover:border-zinc-600"
          >
            Volver
          </Link>
        </div>
      </div>

      {isLoading && <p className="text-zinc-400">Cargando…</p>}

      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {item && (
        <>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-semibold text-zinc-100">{formatMoney(item.amount)}</div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs border ${item.status === 'PAID'
                        ? 'bg-emerald-950/40 text-emerald-200 border-emerald-900/50'
                        : 'bg-amber-950/40 text-amber-200 border-amber-900/50'
                      }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-zinc-300">
                  <div>
                    <span className="text-zinc-400">Descripción:</span> {item.description?.trim() ? item.description : '—'}
                  </div>
                  <div>
                    <span className="text-zinc-400">Vence:</span> {formatDate(item.dueDate)}
                  </div>
                  <div>
                    <span className="text-zinc-400">Creada:</span> {formatDate(item.createdAt)}
                  </div>
                  <div>
                    <span className="text-zinc-400">Pagada:</span> {formatDate(item.paidAt)}
                  </div>
                </div>

                <div className="mt-3 text-xs text-zinc-500">
                  <div>ID: {item.id}</div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[230px]">
                {actionError && (
                  <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                    {actionError}
                  </div>
                )}

                {item.status === 'PENDING' && (
                  <button
                    onClick={onMarkPaid}
                    disabled={isActing}
                    className="rrounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 hover:border-zinc-600"
                  >
                    {isActing ? 'Procesando…' : 'Marcar como pagada'}
                  </button>
                )}

                <button
                  onClick={() => setIsEditOpen(true)}
                  disabled={!canMutate || isActing}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 hover:border-zinc-600 disabled:opacity-50"
                >
                  Editar
                </button>

                <button
                  onClick={onDelete}
                  disabled={!canMutate || isActing}
                  className="rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-2 text-sm text-red-200 hover:border-red-700 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>

          <EditDebtModal
            open={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            debt={item}
            onSaved={(updated) => setItem(updated)}
          />
        </>
      )}
    </div>
  )
}
