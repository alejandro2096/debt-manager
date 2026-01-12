import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { ROUTES } from '@/app/router/routes'

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />
  return <Outlet />
}
