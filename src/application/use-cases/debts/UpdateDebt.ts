import { IDebtRepository } from '../../../domain/repositories/IDebtRepository';
import { UpdateDebtDTO, DebtResponseDTO } from '../../dto/debt.dto';
import { ValidationError, NotFoundError, ForbiddenError } from '../../../shared/errors/AppError';
import { CONSTANTS } from '../../../shared/utils/constants';

export class UpdateDebt {
  constructor(private readonly debtRepository: IDebtRepository) {}

  async execute(debtId: string, userId: string, data: UpdateDebtDTO): Promise<DebtResponseDTO> {
    const debt = await this.debtRepository.findById(debtId);

    if (!debt) {
      throw new NotFoundError('Deuda no encontrada');
    }

    // Only creditor can update the debt
    if (debt.creditorId !== userId) {
      throw new ForbiddenError('Solo el acreedor puede editar la deuda');
    }

    // Cannot modify paid debts
    if (!debt.canBeModified()) {
      throw new ValidationError('No se puede modificar una deuda pagada');
    }

    // Validate amount if provided
    if (data.amount !== undefined) {
      if (data.amount <= 0) {
        throw new ValidationError('El monto debe ser mayor a 0');
      }

      if (data.amount < CONSTANTS.MIN_DEBT_AMOUNT || data.amount > CONSTANTS.MAX_DEBT_AMOUNT) {
        throw new ValidationError(`El monto debe estar entre ${CONSTANTS.MIN_DEBT_AMOUNT} y ${CONSTANTS.MAX_DEBT_AMOUNT}`);
      }
    }

    const updatedDebt = await this.debtRepository.update(debtId, data);

    return updatedDebt.toJSON();
  }
}