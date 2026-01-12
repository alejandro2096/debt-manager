import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/shared/layout/AppLayout'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import DebtsPage from '@/features/debts/pages/DebtsPage'
import DebtDetailPage from '@/features/debts/pages/DebtDetailPage'
import { ROUTES } from './routes'
import ProtectedRoute from '@/shared/components/ProtectedRoute'


export const router = createBrowserRouter([
  { path: '/', element: <Navigate to={ROUTES.debts} replace /> },

  { path: ROUTES.login, element: <LoginPage /> },
  { path: ROUTES.register, element: <RegisterPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.debts, element: <DebtsPage /> },
          { path: '/debts/:id', element: <DebtDetailPage /> },
        ],
      },
    ],
  },

])
