import { IDebtRepository } from '../../../domain/repositories/IDebtRepository';
import { DebtResponseDTO } from '../../dto/debt.dto';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../shared/errors/AppError';

export class MarkDebtAsPaid {
  constructor(private readonly debtRepository: IDebtRepository) {}

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

    return updatedDebt.toJSON();
  }
}