import { IUserRepository, PaginatedResultUsers } from '../../../domain/repositories/IUserRepository'

export class ListUsers {
    constructor(private readonly userRepository: IUserRepository) { }

    async execute(): Promise<PaginatedResultUsers> {
        return this.userRepository.listPublic();
    }
}
