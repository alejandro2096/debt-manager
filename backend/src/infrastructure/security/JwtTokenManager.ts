import jwt from 'jsonwebtoken';
import { CONSTANTS } from '../../shared/utils/constants';
import { UnauthorizedError } from '../../shared/errors/AppError';

export interface JwtPayload {
    userId: string;
    email: string;
    name: string;
}

export class JwtTokenManager {
    private readonly secret: string;
    private readonly expiresIn: string;

    constructor() {
        this.secret = CONSTANTS.JWT_SECRET;
        this.expiresIn = CONSTANTS.JWT_EXPIRES_IN;
    }

    generateToken(payload: JwtPayload): string {
        return jwt.sign(payload, this.secret, {
            expiresIn: this.expiresIn as any,
        });
    }

    verifyToken(token: string): JwtPayload {
        try {
            const decoded = jwt.verify(token, this.secret) as JwtPayload;
            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedError('Token expirado');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedError('Token inválido');
            }
            throw new UnauthorizedError('Error al verificar token');
        }
    }

    decodeToken(token: string): JwtPayload | null {
        try {
            return jwt.decode(token) as JwtPayload;
        } catch (error) {
            return null;
        }
    }
}

export const jwtTokenManager = new JwtTokenManager();