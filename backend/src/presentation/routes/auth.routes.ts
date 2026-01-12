import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateBody } from '../middlewares/validation.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';

export const createAuthRoutes = (authController: AuthController): Router => {
    const router = Router();

    router.post('/register', validateBody(registerSchema), authController.register);
    router.post('/login', validateBody(loginSchema), authController.login);

    return router;
};