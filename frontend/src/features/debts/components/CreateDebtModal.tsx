import { useEffect, useMemo, useState } from 'react'
import { usersService, type UserListItem } from '@/features/users/services/usersService'
import { debtsService } from '@/features/debts/services/debtsService'

type Props = {
    onClose: () => void
    onCreated: () => Promise<void> | void
}

export default function CreateDebtModal({ onClose, onCreated }: Props) {
    const [users, setUsers] = useState<UserListItem[]>([])
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)
    const [usersError, setUsersError] = useState<string | null>(null)

    const [debtorId, setDebtorId] = useState('')
    const [amount, setAmount] = useState<number>(0)
    const [description, setDescription] = useState('')
    const [dueDate, setDueDate] = useState('') // YYYY-MM-DD

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    // Cargar usuarios SOLO cuando el modal existe (o sea, abierto)
    useEffect(() => {
        let alive = true
            ; (async () => {
                setIsLoadingUsers(true)
                setUsersError(null)
                try {
                    const list = await usersService.list()
                    if (!alive) return
                    setUsers(list)
                } catch (e: any) {
                    if (!alive) return
                    setUsersError(e?.response?.data?.message || e?.message || 'Error cargando usuarios')
                } finally {
                    if (!alive) return
                    setIsLoadingUsers(false)
                }
            })()
        return () => {
            alive = false
        }
    }, [])

    // cerrar con ESC
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [onClose])

    const canSubmit = useMemo(() => {
        return debtorId && amount > 0 && !isSubmitting
    }, [debtorId, amount, isSubmitting])

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError(null)

        if (!debtorId) {
            setSubmitError('Selecciona un deudor.')
            return
        }
        if (!amount || amount <= 0) {
            setSubmitError('El monto debe ser mayor a 0.')
            return
        }

        setIsSubmitting(true)
        try {
            await debtsService.create({
                debtorId,
                amount,
                description: description.trim() || undefined,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            })
            await onCreated()
        } catch (e: any) {
            const message =
                typeof e?.response?.data?.message === 'string'
                    ? e.response.data.message
                    : e?.message || 'No se pudo crear la deuda'
            setSubmitError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50">
            {/* backdrop */}
            <button
                type="button"
                aria-label="Cerrar"
                onClick={onClose}
                className="absolute inset-0 h-full w-full bg-black/60"
            />

            {/* panel */}
            <div className="relative mx-auto mt-24 w-[92%] max-w-lg">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                        <div>
                            <h3 className="text-base font-semibold text-zinc-100">Crear deuda</h3>
                            <p className="mt-0.5 text-xs text-zinc-400">Selecciona el deudor y define el monto.</p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-200 hover:border-zinc-600"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4 px-5 py-4">
                        <div className="grid grid-cols-1 gap-4">
                            <label className="block">
                                <span className="text-sm text-zinc-200">Deudor</span>

                                {isLoadingUsers ? (
                                    <div className="mt-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400">
                                        Cargando usuarios…
                                    </div>
                                ) : usersError ? (
                                    <div className="mt-1 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                                        {usersError}
                                    </div>
                                ) : (
                                    <select
                                        value={debtorId}
                                        onChange={(e) => setDebtorId(e.target.value)}
                                        required
                                        className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
                                    >
                                        <option value="" disabled>
                                            Selecciona un usuario…
                                        </option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} · {u.email}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </label>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="text-sm text-zinc-200">Monto</span>
                                    <input
                                        type="number"
                                        min={0}
                                        step="1"
                                        value={Number.isFinite(amount) ? amount : 0}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
                                        placeholder="0"
                                        required
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm text-zinc-200">Vence (opcional)</span>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
                                    />
                                </label>
                            </div>

                            <label className="block">
                                <span className="text-sm text-zinc-200">Descripción (opcional)</span>
                                <input
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
                                    placeholder="Ej: préstamo, mercado, etc."
                                />
                            </label>
                        </div>

                        {submitError && (
                            <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                                {submitError}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-600"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? 'Creando…' : 'Crear deuda'}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="mt-3 text-center text-xs text-zinc-500">
                    Tip: ESC para cerrar.
                </p>
            </div>
        </div>
    )
}
