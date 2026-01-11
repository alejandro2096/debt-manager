export const CONSTANTS = {
    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'default-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // Pagination
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,

    // Cache TTL (in seconds)
    CACHE_TTL: {
        USER: 3600, // 1 hour
        DEBT: 1800, // 30 minutes
        LIST: 600, // 10 minutes
    },

    // Debt
    MIN_DEBT_AMOUNT: 0.01,
    MAX_DEBT_AMOUNT: 999999999.99,

    // Rate Limiting
    RATE_LIMIT: {
        WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
        MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    },
} as const;

export const DEBT_STATUS = {
    PENDING: 'PENDING',
    PAID: 'PAID',
} as const;

export type DebtStatus = (typeof DEBT_STATUS)[keyof typeof DEBT_STATUS];