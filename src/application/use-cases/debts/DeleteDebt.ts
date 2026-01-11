import { IDebtRepository } from '../../../domain/repositories/IDebtRepository';
import { NotFoundError, ForbiddenError } from '../../../shared/errors/AppError';

export class DeleteDebt {
  constructor(private readonly debtRepository: IDebtRepository) {}

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
  }
}