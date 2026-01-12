import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types/express';
import { CreateDebt } from '../../application/use-cases/debts/CreateDebt';
import { GetDebtById } from '../../application/use-cases/debts/GetDebtById';
import { UpdateDebt } from '../../application/use-cases/debts/UpdateDebt';
import { DeleteDebt } from '../../application/use-cases/debts/DeleteDebt';
import { ListUserDebts } from '../../application/use-cases/debts/ListUserDebts';
import { MarkDebtAsPaid } from '../../application/use-cases/debts/MarkDebtAsPaid';
import { GetUserDebtStats } from '../../application/use-cases/debts/GetUserDebtStats';
import { CSVExporter } from '../../infrastructure/exporters/CSVExporter';
import { JSONExporter } from '../../infrastructure/exporters/JSONExporter';

export class DebtController {
    constructor(
        private readonly createDebt: CreateDebt,
        private readonly getDebtById: GetDebtById,
        private readonly updateDebt: UpdateDebt,
        private readonly deleteDebt: DeleteDebt,
        private readonly listUserDebts: ListUserDebts,
        private readonly markDebtAsPaid: MarkDebtAsPaid,
        private readonly getUserDebtStats: GetUserDebtStats
    ) { }

    create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user!.id;
            const result = await this.createDebt.execute(userId, req.body);

            res.status(201).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user!.id;
            const id = req.params.id as string;
            const result = await this.getDebtById.execute(id, userId);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user!.id;
            const id = req.params.id as string;
            const result = await this.updateDebt.execute(id, userId, req.body);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user!.id;
            const id = req.params.id as string;
            await this.deleteDebt.execute(id, userId);

            res.status(200).json({
                success: true,
                message: 'Deuda eliminada exitosamente',
            });
        } catch (error) {
            next(error);
        }
    };

    list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user!.id;
            const result = await this.listUserDebts.execute(userId, req.query as any);

            res.status(200).json({
                success: true,
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    totalPages: result.totalPages,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    markAsPaid = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user!.id;
            const id = req.params.id as string;
            const result = await this.markDebtAsPaid.execute(id, userId);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    getStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user!.id;
            const result = await this.getUserDebtStats.execute(userId);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    export = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user!.id;
            const { format = 'json' } = req.query;

            const result = await this.listUserDebts.execute(userId, { limit: 1000 });

            if (format === 'csv') {
                const csv = CSVExporter.arrayToCSV(result.data);
                const filename = CSVExporter.generateFilename('debts');

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.status(200).send(csv);
            } else {
                const json = JSONExporter.arrayToJSON(result.data);
                const filename = JSONExporter.generateFilename('debts');

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.status(200).send(json);
            }
        } catch (error) {
            next(error);
        }
    };
}