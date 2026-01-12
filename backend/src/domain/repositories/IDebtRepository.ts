import { Debt } from '../entities/Debt';
import { DebtStatus } from '../../shared/utils/constants';

export interface DebtFilters {
    status?: DebtStatus;
    creditorId?: string;
    debtorId?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IDebtRepository {
    create(debt: Debt): Promise<Debt>;
    findById(id: string): Promise<Debt | null>;
    update(id: string, data: Partial<Debt>): Promise<Debt>;
    delete(id: string): Promise<void>;
    findByUser(userId: string, filters?: DebtFilters): Promise<PaginatedResult<Debt>>;
    markAsPaid(id: string): Promise<Debt>;
    getTotalsByUser(userId: string): Promise<{
        totalPending: number;
        totalPaid: number;
        amountPending: number;
        amountPaid: number;
    }>;
}