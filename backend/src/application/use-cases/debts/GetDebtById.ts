import { IDebtRepository } from '../../../domain/repositories/IDebtRepository';
import { DebtResponseDTO } from '../../dto/debt.dto';
import { NotFoundError, ForbiddenError } from '../../../shared/errors/AppError';

export class GetDebtById {
  constructor(private readonly debtRepository: IDebtRepository) {}

  async execute(debtId: string, userId: string): Promise<DebtResponseDTO> {
    const debt = await this.debtRepository.findById(debtId);

    if (!debt) {
      throw new NotFoundError('Deuda no encontrada');
    }

    // Verify user is involved in this debt
    if (debt.creditorId !== userId && debt.debtorId !== userId) {
      throw new ForbiddenError('No tienes permiso para ver esta deuda');
    }

    return debt.toJSON();
  }
}