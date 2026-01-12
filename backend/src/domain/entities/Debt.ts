import { DEBT_STATUS, DebtStatus } from '../../shared/utils/constants';

export class Debt {
    constructor(
        public readonly id: string,
        public readonly creditorId: string,
        public readonly debtorId: string,
        public readonly amount: number,
        public readonly description: string | null,
        public readonly status: DebtStatus,
        public readonly dueDate: Date | null,
        public readonly paidAt: Date | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    static create(data: {
        id: string;
        creditorId: string;
        debtorId: string;
        amount: number;
        description?: string | null;
        status?: DebtStatus;
        dueDate?: Date | null;
        paidAt?: Date | null;
        createdAt?: Date;
        updatedAt?: Date;
    }): Debt {
        return new Debt(
            data.id,
            data.creditorId,
            data.debtorId,
            data.amount,
            data.description || null,
            data.status || DEBT_STATUS.PENDING,
            data.dueDate || null,
            data.paidAt || null,
            data.createdAt || new Date(),
            data.updatedAt || new Date()
        );
    }

    isPending(): boolean {
        return this.status === DEBT_STATUS.PENDING;
    }

    isPaid(): boolean {
        return this.status === DEBT_STATUS.PAID;
    }

    canBeModified(): boolean {
        return this.isPending();
    }

    toJSON() {
        return {
            id: this.id,
            creditorId: this.creditorId,
            debtorId: this.debtorId,
            amount: this.amount,
            description: this.description,
            status: this.status,
            dueDate: this.dueDate,
            paidAt: this.paidAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}