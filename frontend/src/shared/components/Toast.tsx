import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export type ToastState = {
    open: boolean
    message: string
    type: ToastType
}

export default function Toast({
    open,
    message,
    type,
    onClose,
    duration = 2500,
}: {
    open: boolean
    message: string
    type: ToastType
    onClose: () => void
    duration?: number
}) {
    useEffect(() => {
        if (!open) return
        const t = setTimeout(onClose, duration)
        return () => clearTimeout(t)
    }, [open, duration, onClose])

    if (!open) return null

    const styles =
        type === 'success'
            ? 'border-emerald-900/50 bg-emerald-950/40 text-emerald-200'
            : type === 'error'
                ? 'border-red-900/50 bg-red-950/30 text-red-200'
                : 'border-zinc-800 bg-zinc-950 text-zinc-200'

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            <div className={`rounded-xl border px-4 py-3 text-sm shadow-xl ${styles}`}>
                {message}
            </div>
        </div>
    )
}
