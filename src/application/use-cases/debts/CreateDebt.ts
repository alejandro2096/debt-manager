import { v4 as uuidv4 } from 'uuid';
import { IDebtRepository } from '../../../domain/repositories/IDebtRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { Debt } from '../../../domain/entities/Debt';
import { CreateDebtDTO, DebtResponseDTO } from '../../dto/debt.dto';
import { ValidationError, NotFoundError } from '../../../shared/errors/AppError';
import { CONSTANTS } from '../../../shared/utils/constants';

export class CreateDebt {
  constructor(
    private readonly debtRepository: IDebtRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(creditorId: string, data: CreateDebtDTO): Promise<DebtResponseDTO> {
    // Validate amount
    if (data.amount <= 0) {
      throw new ValidationError('El monto debe ser mayor a 0');
    }

    if (data.amount < CONSTANTS.MIN_DEBT_AMOUNT || data.amount > CONSTANTS.MAX_DEBT_AMOUNT) {
      throw new ValidationError(`El monto debe estar entre ${CONSTANTS.MIN_DEBT_AMOUNT} y ${CONSTANTS.MAX_DEBT_AMOUNT}`);
    }

    // Validate debtor exists
    const debtor = await this.userRepository.findById(data.debtorId);
    if (!debtor) {
      throw new NotFoundError('El deudor no existe');
    }

    // Cannot create debt to yourself
    if (creditorId === data.debtorId) {
      throw new ValidationError('No puedes crear una deuda contigo mismo');
    }

    // Create debt
    const debt = Debt.create({
      id: uuidv4(),
      creditorId,
      debtorId: data.debtorId,
      amount: data.amount,
      description: data.description || null,
      dueDate: data.dueDate || null,
    });

    const createdDebt = await this.debtRepository.create(debt);

    return createdDebt.toJSON();
  }
}