import { Router } from 'express'
import { UsersController } from '../controllers/UsersController'
import { authMiddleware } from '../middlewares/auth.middleware'

export const usersRouter = (authController: UsersController): Router => {
  const router = Router()
  router.get('/users', authMiddleware, authController.list)
  return router;
}
