export const ROUTES = {
  login: '/login',
  register: '/register',
  debts: '/debts',
  createDebt: '/debts/new',
  debtDetail: (id: string) => `/debts/${id}`,
} as const
