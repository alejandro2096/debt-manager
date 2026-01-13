import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { DebtController } from '../controllers/DebtController';
import { createAuthRoutes } from './auth.routes';
import { createDebtRoutes } from './debt.routes';
import { usersRouter } from './users.routes';
import { UsersController } from '../controllers/UsersController';

export const createRoutes = (
    authController: AuthController,
    debtController: DebtController,
    usersController: UsersController
): Router => {
    const router = Router();

    // Health check
    router.get('/health', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'Server is running',
            timestamp: new Date().toISOString(),
        });
    });

    // Mount routes
    router.use('/auth', createAuthRoutes(authController));
    router.use('/debts', createDebtRoutes(debtController));
    router.use('/users', usersRouter(usersController));

    return router;
};