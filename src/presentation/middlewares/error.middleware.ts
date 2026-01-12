import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';

export const errorHandler = (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (error instanceof AppError) {
        logger.error(`${error.name}: ${error.message}`);

        res.status(error.statusCode).json({
            success: false,
            error: {
                message: error.message,
                statusCode: error.statusCode,
            },
        });
        return;
    }

    // Unexpected errors
    logger.error(`Unexpected Error: ${error.message}`);
    logger.error(error.stack);

    res.status(500).json({
        success: false,
        error: {
            message: 'Error interno del servidor',
            statusCode: 500,
        },
    });
};