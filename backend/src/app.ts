import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createRoutes } from './presentation/routes';
import { errorHandler } from './presentation/middlewares/error.middleware';
import { AuthController } from './presentation/controllers/AuthController';
import { DebtController } from './presentation/controllers/DebtController';
import { CONSTANTS } from './shared/utils/constants';

export const createApp = (
    authController: AuthController,
    debtController: DebtController
): Application => {
    const app = express();

    // Security middlewares
    app.use(helmet());
    app.use(cors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
        windowMs: CONSTANTS.RATE_LIMIT.WINDOW_MS,
        max: CONSTANTS.RATE_LIMIT.MAX_REQUESTS,
        message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde',
    });
    app.use('/api', limiter);

    // Body parser
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.use('/api/v1', createRoutes(authController, debtController));

    // Error handler (must be last)
    app.use(errorHandler);

    return app;
};