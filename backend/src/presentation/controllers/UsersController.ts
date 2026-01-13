import { Request, Response, NextFunction } from 'express'
import { ListUsers } from '../../application/use-cases/users/ListUsers'
import { AuthenticatedRequest } from '../../shared/types/express';

export class UsersController {
    constructor(private readonly listUsers: ListUsers) { }

    // list = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const users = await this.listUsers.execute()
    //         return res.status(200).json({ success: true, data: users })
    //     } catch (err) {
    //         next(err)
    //     }
    // }

      list = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
            try {

                const result = await this.listUsers.execute();
    
                res.status(200).json({
                    success: true,
                    data: result.data,
                    // pagination: {
                    //     total: result.total,
                    //     page: result.page,
                    //     limit: result.limit,
                    //     totalPages: result.totalPages,
                    // },
                });
            } catch (error) {
                next(error);
            }
        };
}
