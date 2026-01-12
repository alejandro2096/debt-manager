import { IDebtRepository } from '../../../domain/repositories/IDebtRepository';
import { DebtResponseDTO } from '../../dto/debt.dto';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../shared/errors/AppError';
import { ICacheRepository } from '../../../infrastructure/database/redis/RedisCache';
import { logger } from '../../../shared/utils/logger';

export class MarkDebtAsPaid {
    constructor(
        private readonly debtRepository: IDebtRepository,
        private readonly cacheRepository: ICacheRepository
    ) { }

    async execute(debtId: string, userId: string): Promise<DebtResponseDTO> {
        const debt = await this.debtRepository.findById(debtId);

        if (!debt) {
            throw new NotFoundError('Deuda no encontrada');
        }

        // Only creditor can mark as paid
        if (debt.creditorId !== userId) {
            throw new ForbiddenError('Solo el acreedor puede marcar la deuda como pagada');
        }

        // Check if already paid
        if (debt.isPaid()) {
            throw new ValidationError('La deuda ya está marcada como pagada');
        }

        const updatedDebt = await this.debtRepository.markAsPaid(debtId);

        // Invalidate cache for both creditor and debtor
        try {
            await this.cacheRepository.deletePattern(`debts:${debt.creditorId}:*`);
            await this.cacheRepository.deletePattern(`debts:${debt.debtorId}:*`);
            logger.debug(`Cache invalidated after marking as paid for debt: ${debtId}`);
        } catch (error) {
            logger.error(`Failed to invalidate cache: ${error}`);
        }

        return updatedDebt.toJSON();
    }
}