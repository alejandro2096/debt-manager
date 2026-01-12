import { PrismaClient } from '@prisma/client';
import { IDebtRepository, DebtFilters, PaginatedResult } from '../../../domain/repositories/IDebtRepository';
import { Debt } from '../../../domain/entities/Debt';
import { CONSTANTS, DEBT_STATUS } from '../../../shared/utils/constants';

export class PrismaDebtRepository implements IDebtRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(debt: Debt): Promise<Debt> {
    const created = await this.prisma.debt.create({
      data: {
        id: debt.id,
        creditorId: debt.creditorId,
        debtorId: debt.debtorId,
        amount: debt.amount,
        description: debt.description,
        status: debt.status,
        dueDate: debt.dueDate,
        paidAt: debt.paidAt,
      },
    });

    return Debt.create({
      ...created,
      amount: Number(created.amount),
      status: created.status as any,
    });
  }

  async findById(id: string): Promise<Debt | null> {
    const debt = await this.prisma.debt.findUnique({
      where: { id },
    });

    if (!debt) return null;

    return Debt.create({
      ...debt,
      amount: Number(debt.amount),
      status: debt.status as any,
    });
  }

  async update(id: string, data: Partial<Debt>): Promise<Debt> {
    const updated = await this.prisma.debt.update({
      where: { id },
      data: {
        amount: data.amount,
        description: data.description,
        status: data.status,
        dueDate: data.dueDate,
        paidAt: data.paidAt,
      },
    });

    return Debt.create({
      ...updated,
      amount: Number(updated.amount),
      status: updated.status as any,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.debt.delete({
      where: { id },
    });
  }

  async findByUser(userId: string, filters?: DebtFilters): Promise<PaginatedResult<Debt>> {
    const page = filters?.page || CONSTANTS.DEFAULT_PAGE;
    const limit = Math.min(filters?.limit || CONSTANTS.DEFAULT_LIMIT, CONSTANTS.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { creditorId: userId },
        { debtorId: userId },
      ],
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.creditorId) {
      where.creditorId = filters.creditorId;
    }

    if (filters?.debtorId) {
      where.debtorId = filters.debtorId;
    }

    const [debts, total] = await Promise.all([
      this.prisma.debt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.debt.count({ where }),
    ]);

    const data = debts.map(debt => 
      Debt.create({
        ...debt,
        amount: Number(debt.amount),
        status: debt.status as any,
      })
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsPaid(id: string): Promise<Debt> {
    const updated = await this.prisma.debt.update({
      where: { id },
      data: {
        status: DEBT_STATUS.PAID,
        paidAt: new Date(),
      },
    });

    return Debt.create({
      ...updated,
      amount: Number(updated.amount),
      status: updated.status as any,
    });
  }

  async getTotalsByUser(userId: string): Promise<{
    totalPending: number;
    totalPaid: number;
    amountPending: number;
    amountPaid: number;
  }> {
    const [pending, paid] = await Promise.all([
      this.prisma.debt.aggregate({
        where: {
          OR: [{ creditorId: userId }, { debtorId: userId }],
          status: DEBT_STATUS.PENDING,
        },
        _count: true,
        _sum: { amount: true },
      }),
      this.prisma.debt.aggregate({
        where: {
          OR: [{ creditorId: userId }, { debtorId: userId }],
          status: DEBT_STATUS.PAID,
        },
        _count: true,
        _sum: { amount: true },
      }),
    ]);

    return {
      totalPending: pending._count,
      totalPaid: paid._count,
      amountPending: Number(pending._sum.amount || 0),
      amountPaid: Number(paid._sum.amount || 0),
    };
  }
}