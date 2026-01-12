import { Request, Response, NextFunction } from 'express';
import { jwtTokenManager } from '../../infrastructure/security/JwtTokenManager';
import { UnauthorizedError } from '../../shared/errors/AppError';
import { AuthenticatedRequest } from '../../shared/types/express';

export const authMiddleware = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedError('Token no proporcionado');
        }

        const [bearer, token] = authHeader.split(' ');

        if (bearer !== 'Bearer' || !token) {
            throw new UnauthorizedError('Formato de token inválido');
        }

        const payload = jwtTokenManager.verifyToken(token);

        (req as AuthenticatedRequest).user = {
            id: payload.userId,
            email: payload.email,
            name: payload.name,
        };

        next();
    } catch (error) {
        next(error);
    }
};