import { IDebtRepository, PaginatedResult } from '../../../domain/repositories/IDebtRepository';
import { DebtListFiltersDTO, DebtResponseDTO } from '../../dto/debt.dto';

export class ListUserDebts {
  constructor(private readonly debtRepository: IDebtRepository) {}

  async execute(
    userId: string,
    filters: DebtListFiltersDTO
  ): Promise<PaginatedResult<DebtResponseDTO>> {
    const result = await this.debtRepository.findByUser(userId, filters);

    return {
      ...result,
      data: result.data.map(debt => debt.toJSON()),
    };
  }
}