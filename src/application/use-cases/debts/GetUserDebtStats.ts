import { IDebtRepository } from '../../../domain/repositories/IDebtRepository';
import { DebtStatsDTO } from '../../dto/debt.dto';

export class GetUserDebtStats {
  constructor(private readonly debtRepository: IDebtRepository) {}

  async execute(userId: string): Promise<DebtStatsDTO> {
    const stats = await this.debtRepository.getTotalsByUser(userId);

    return stats;
  }
}