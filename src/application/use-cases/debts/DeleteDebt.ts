import { IDebtRepository } from '../../../domain/repositories/IDebtRepository';
import { NotFoundError, ForbiddenError } from '../../../shared/errors/AppError';
import { ICacheRepository } from '../../../infrastructure/database/redis/RedisCache';
import { logger } from '../../../shared/utils/logger';

export class DeleteDebt {
    constructor(
        private readonly debtRepository: IDebtRepository,
        private readonly cacheRepository: ICacheRepository
    ) { }

    async execute(debtId: string, userId: string): Promise<void> {
        const debt = await this.debtRepository.findById(debtId);

        if (!debt) {
            throw new NotFoundError('Deuda no encontrada');
        }

        // Only creditor can delete the debt
        if (debt.creditorId !== userId) {
            throw new ForbiddenError('Solo el acreedor puede eliminar la deuda');
        }

        await this.debtRepository.delete(debtId);

        // Invalidate cache for both creditor and debtor
        try {
            await this.cacheRepository.deletePattern(`debts:${debt.creditorId}:*`);
            await this.cacheRepository.deletePattern(`debts:${debt.debtorId}:*`);
            logger.debug(`Cache invalidated after delete for debt: ${debtId}`);
        } catch (error) {
            logger.error(`Failed to invalidate cache: ${error}`);
        }
    }
}