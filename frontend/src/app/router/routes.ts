export const ROUTES = {
  login: '/login',
  register: '/register',
  debts: '/debts',
  debtDetail: (id: string) => `/debts/${id}`,
} as const
