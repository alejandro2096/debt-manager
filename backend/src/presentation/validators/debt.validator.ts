import { z } from 'zod';
import { CONSTANTS, DEBT_STATUS } from '../../shared/utils/constants';

export const createDebtSchema = z.object({
    debtorId: z.string().uuid('ID de deudor inválido'),
    amount: z
        .number()
        .positive('El monto debe ser positivo')
        .min(CONSTANTS.MIN_DEBT_AMOUNT, `El monto mínimo es ${CONSTANTS.MIN_DEBT_AMOUNT}`)
        .max(CONSTANTS.MAX_DEBT_AMOUNT, `El monto máximo es ${CONSTANTS.MAX_DEBT_AMOUNT}`),
    description: z.string().max(500, 'La descripción no puede tener más de 500 caracteres').optional(),
    dueDate: z.coerce.date().optional(),
});

export const updateDebtSchema = z.object({
    amount: z
        .number()
        .positive('El monto debe ser positivo')
        .min(CONSTANTS.MIN_DEBT_AMOUNT, `El monto mínimo es ${CONSTANTS.MIN_DEBT_AMOUNT}`)
        .max(CONSTANTS.MAX_DEBT_AMOUNT, `El monto máximo es ${CONSTANTS.MAX_DEBT_AMOUNT}`)
        .optional(),
    description: z.string().max(500, 'La descripción no puede tener más de 500 caracteres').optional(),
    dueDate: z.coerce.date().optional(),
});

export const debtFiltersSchema = z.object({
    status: z.enum([DEBT_STATUS.PENDING, DEBT_STATUS.PAID]).optional(),
    creditorId: z.string().uuid().optional(),
    debtorId: z.string().uuid().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(CONSTANTS.MAX_LIMIT).optional(),
});