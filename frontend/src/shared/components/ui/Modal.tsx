import { useEffect } from 'react'

type ModalProps = {
  open: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        aria-label="Cerrar modal"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative mx-auto mt-16 w-[92%] max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-sm text-zinc-200 hover:border-zinc-700"
          >
            ✕
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
