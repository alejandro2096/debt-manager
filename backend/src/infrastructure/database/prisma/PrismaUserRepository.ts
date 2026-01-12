import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';

export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async create(user: User): Promise<User> {
        const created = await this.prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                password: user.password,
                name: user.name,
            },
        });

        return User.create(created);
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) return null;

        return User.create(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) return null;

        return User.create(user);
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                email: data.email,
                password: data.password,
                name: data.name,
            },
        });

        return User.create(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id },
        });
    }

    async existsByEmail(email: string): Promise<boolean> {
        const count = await this.prisma.user.count({
            where: { email },
        });

        return count > 0;
    }
}