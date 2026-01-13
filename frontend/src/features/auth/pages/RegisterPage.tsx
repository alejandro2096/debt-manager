import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/router/routes'
import { authService } from '@/features/auth/services/authService'
import { useAuth } from '@/shared/hooks/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth() 

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await authService.register({ name, email, password })

      login({ token: res.token, user: res.user })


      navigate(ROUTES.debts, { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'No se pudo registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full">
      <h2 className="text-2xl font-bold">Registro</h2>
      <p className="mt-2 text-sm text-zinc-400">Crea tu cuenta.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 w-full">
        <div>
          <label className="block text-sm mb-2">Nombre</label>
          <input
            className="w-full rounded-md bg-slate-800/60 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Email</label>
          <input
            className="w-full rounded-md bg-slate-800/60 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@dominio.com"
            type="email"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Contraseña</label>
          <input
            className="w-full rounded-md bg-slate-800/60 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            type="password"
            required
            minLength={6}
          />
        </div>

        {error && (
          <div className="text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-slate-700/70 px-4 py-3 font-semibold disabled:opacity-60"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p className="text-sm text-zinc-400">
          ¿Ya tienes cuenta?{' '}
          <Link to={ROUTES.login} className="text-indigo-400 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  )
}
