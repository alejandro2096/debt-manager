import { DebtStatus } from '../../shared/utils/constants';

export interface CreateDebtDTO {
  debtorId: string;
  amount: number;
  description?: string;
  dueDate?: Date;
}

export interface UpdateDebtDTO {
  amount?: number;
  description?: string;
  dueDate?: Date;
}

export interface DebtResponseDTO {
  id: string;
  creditorId: string;
  debtorId: string;
  amount: number;
  description: string | null;
  status: DebtStatus;
  dueDate: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DebtListFiltersDTO {
  status?: DebtStatus;
  creditorId?: string;
  debtorId?: string;
  page?: number;
  limit?: number;
}

export interface DebtStatsDTO {
  totalPending: number;
  totalPaid: number;
  amountPending: number;
  amountPaid: number;
}