import { IDebtRepository, PaginatedResult } from '../../../domain/repositories/IDebtRepository';
import { DebtListFiltersDTO, DebtResponseDTO } from '../../dto/debt.dto';
import { ICacheRepository } from '../../../infrastructure/database/redis/RedisCache';
import { CONSTANTS } from '../../../shared/utils/constants';
import { logger } from '../../../shared/utils/logger';

export class ListUserDebts {
    constructor(
        private readonly debtRepository: IDebtRepository,
        private readonly cacheRepository: ICacheRepository
    ) { }

    async execute(
        userId: string,
        filters: DebtListFiltersDTO
    ): Promise<PaginatedResult<DebtResponseDTO>> {
        // Generate cache key
        const cacheKey = this.generateCacheKey(userId, filters);

        try {
            // Try to get from cache
            const cached = await this.cacheRepository.get<PaginatedResult<DebtResponseDTO>>(cacheKey);

            if (cached) {
                logger.debug(`Cache HIT for key: ${cacheKey}`);
                return cached;
            }

            logger.debug(`Cache MISS for key: ${cacheKey}`);
        } catch (error) {
            logger.error(`Cache error: ${error}`);
            // Continue to database if cache fails
        }

        // Get from database
        const result = await this.debtRepository.findByUser(userId, filters);

        const response = {
            ...result,
            data: result.data.map(debt => debt.toJSON()),
        };

        // Save to cache
        try {
            await this.cacheRepository.set(
                cacheKey,
                response,
                CONSTANTS.CACHE_TTL.LIST
            );
            logger.debug(`Cached result for key: ${cacheKey}`);
        } catch (error) {
            logger.error(`Failed to cache result: ${error}`);
            // Don't fail the request if caching fails
        }

        return response;
    }

    private generateCacheKey(userId: string, filters: DebtListFiltersDTO): string {
        const parts = [
            'debts',
            userId,
            filters.status || 'all',
            filters.page || '1',
            filters.limit || '10',
        ];

        if (filters.creditorId) parts.push(`creditor:${filters.creditorId}`);
        if (filters.debtorId) parts.push(`debtor:${filters.debtorId}`);

        return parts.join(':');
    }
}