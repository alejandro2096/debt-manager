import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { ROUTES } from '@/app/router/routes'

export default function LoginPage() {
  const { login, isLoading, error } = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login({ email: email.trim(), password })
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="text-2xl font-bold">Login</h2>
      <p className="mt-2 text-sm text-zinc-400">Accede a tu cuenta.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm text-zinc-200">Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-600"
            placeholder="tu@email.com"
          />
        </label>

        <label className="block">
          <span className="text-sm text-zinc-200">Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-600"
            placeholder="********"
          />
        </label>

        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-400">
        ¿No tienes cuenta?{' '}
        <Link to={ROUTES.register} className="text-zinc-100 underline underline-offset-4">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
