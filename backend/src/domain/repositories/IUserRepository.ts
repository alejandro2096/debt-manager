import { User } from '../entities/User';

export type PublicUser = {
  id: string
  name: string
  email: string
}

export interface PaginatedResultUsers {
    data: PublicUser[];
    // total: number;
    // page: number;
    // limit: number;
    // totalPages: number;
}

export interface IUserRepository {
    create(user: User): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<void>;
    existsByEmail(email: string): Promise<boolean>;
    listPublic(): Promise<PaginatedResultUsers>
}