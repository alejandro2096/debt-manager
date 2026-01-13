export const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
  },
  debts: {
    list: '/debts',
    create: '/debts',
    stats: '/debts/stats',
    export: '/debts/export',
    detail: (id: string) => `/debts/${id}`,
    update: (id: string) => `/debts/${id}`,
    delete: (id: string) => `/debts/${id}`,
    markAsPaid: (id: string) => `/debts/${id}/pay`,
  },
} as const
