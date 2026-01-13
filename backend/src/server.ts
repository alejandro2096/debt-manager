import 'dotenv/config';
import { createApp } from './app';
import { connectDatabase, disconnectDatabase, prisma } from './infrastructure/database/prisma/prismaClient';
import { getRedisCache } from './infrastructure/database/redis/RedisCache';
import { logger } from './shared/utils/logger';

// Repositories
import { PrismaUserRepository } from './infrastructure/database/prisma/PrismaUserRepository';
import { PrismaDebtRepository } from './infrastructure/database/prisma/PrismaDebtRepository';

// Security
import { bcryptHasher } from './infrastructure/security/BcryptHasher';
import { jwtTokenManager } from './infrastructure/security/JwtTokenManager';

// Use Cases - Auth
import { RegisterUser } from './application/use-cases/auth/RegisterUser';
import { LoginUser } from './application/use-cases/auth/LoginUser';
import { ListUsers } from './application/use-cases/users/ListUsers';

// Use Cases - Debts
import { CreateDebt } from './application/use-cases/debts/CreateDebt';
import { GetDebtById } from './application/use-cases/debts/GetDebtById';
import { UpdateDebt } from './application/use-cases/debts/UpdateDebt';
import { DeleteDebt } from './application/use-cases/debts/DeleteDebt';
import { ListUserDebts } from './application/use-cases/debts/ListUserDebts';
import { MarkDebtAsPaid } from './application/use-cases/debts/MarkDebtAsPaid';
import { GetUserDebtStats } from './application/use-cases/debts/GetUserDebtStats';

// Controllers
import { AuthController } from './presentation/controllers/AuthController';
import { DebtController } from './presentation/controllers/DebtController';
import { UsersController } from './presentation/controllers/UsersController';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    try {
        // Connect to databases
        logger.info('Connecting to databases...');
        await connectDatabase();

        const redisCache = getRedisCache();
        await redisCache.connect();

        // Initialize repositories
        const userRepository = new PrismaUserRepository(prisma);
        const debtRepository = new PrismaDebtRepository(prisma);

        // Initialize use cases - Auth
        const registerUser = new RegisterUser(userRepository, bcryptHasher, jwtTokenManager);
        const loginUser = new LoginUser(userRepository, bcryptHasher, jwtTokenManager);
        const listUsers = new ListUsers(userRepository);

        // Initialize use cases - Debts (WITH REDIS CACHE)
        const createDebt = new CreateDebt(debtRepository, userRepository, redisCache);
        const getDebtById = new GetDebtById(debtRepository);
        const updateDebt = new UpdateDebt(debtRepository, redisCache);
        const deleteDebt = new DeleteDebt(debtRepository, redisCache);
        const listUserDebts = new ListUserDebts(debtRepository, redisCache);
        const markDebtAsPaid = new MarkDebtAsPaid(debtRepository, redisCache);
        const getUserDebtStats = new GetUserDebtStats(debtRepository);

        // Initialize controllers
        const authController = new AuthController(registerUser, loginUser);
        const debtController = new DebtController(
            createDebt,
            getDebtById,
            updateDebt,
            deleteDebt,
            listUserDebts,
            markDebtAsPaid,
            getUserDebtStats
        );
        const usersController = new UsersController(listUsers);

        // Create Express app
        const app = createApp(authController, debtController, usersController);

        // Start server
        const server = app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`API URL: http://localhost:${PORT}/api/v1`);
            logger.info(`Redis cache: ENABLED`);
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal: string) => {
            logger.info(`${signal} received, closing server gracefully...`);

            server.close(async () => {
                logger.info('HTTP server closed');

                await disconnectDatabase();
                await redisCache.disconnect();

                logger.info('Databases disconnected');
                process.exit(0);
            });

            // Force close after 10 seconds
            setTimeout(() => {
                logger.error('Forcing shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

bootstrap();