import { Outlet, Link } from 'react-router-dom'
import { useCallback, useState } from 'react'
import { ROUTES } from '@/app/router/routes'
import { useAuth } from '@/shared/hooks/useAuth'
import Toast, { type ToastState } from '../components/Toast'

export default function AppLayout() {
  const { user, logout } = useAuth()

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    type: 'info',
  })

  const closeToast = useCallback(() => {
    setToast((t) => ({ ...t, open: false }))
  }, [])

    // helper global simple (para usarlo desde cualquier page sin Context extra)
    ; (window as any).__toast = (message: string, type: ToastState['type'] = 'info') => {
      setToast({ open: true, message, type })
    }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to={ROUTES.debts} className="text-lg font-semibold">
              Debt Manager
            </Link>
            {user && (
              <span className="text-sm text-zinc-400">
                {user.name} · {user.email}
              </span>
            )}
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:border-zinc-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  )
}
