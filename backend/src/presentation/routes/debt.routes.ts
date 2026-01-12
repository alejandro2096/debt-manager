import { Router } from 'express';
import { DebtController } from '../controllers/DebtController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validation.middleware';
import { createDebtSchema, updateDebtSchema, debtFiltersSchema } from '../validators/debt.validator';

export const createDebtRoutes = (debtController: DebtController): Router => {
  const router = Router();

  // All debt routes require authentication
  router.use(authMiddleware);

  // Get user debt statistics
  router.get('/stats', debtController.getStats);

  // Export debts
  router.get('/export', debtController.export);

  // List user debts with filters
  router.get('/', validateQuery(debtFiltersSchema), debtController.list);

  // Create new debt
  router.post('/', validateBody(createDebtSchema), debtController.create);

  // Get debt by ID
  router.get('/:id', debtController.getById);

  // Update debt
  router.put('/:id', validateBody(updateDebtSchema), debtController.update);

  // Delete debt
  router.delete('/:id', debtController.delete);

  // Mark debt as paid
  router.patch('/:id/pay', debtController.markAsPaid);

  return router;
};