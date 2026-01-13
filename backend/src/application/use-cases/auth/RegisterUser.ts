import { randomUUID } from 'crypto';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { BcryptHasher } from '../../../infrastructure/security/BcryptHasher';
import { JwtTokenManager } from '../../../infrastructure/security/JwtTokenManager';
import { RegisterDTO, AuthResponseDTO } from '../../dto/auth.dto';
import { ConflictError } from '../../../shared/errors/AppError';

export class RegisterUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: BcryptHasher,
    private readonly tokenManager: JwtTokenManager
  ) {}

  async execute(data: RegisterDTO): Promise<AuthResponseDTO> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }

    // Hash password
    const hashedPassword = await this.hasher.hash(data.password);

    // Create user
    const user = User.create({
      id: randomUUID(),
      email: data.email,
      password: hashedPassword,
      name: data.name,
    });

    // Save to database
    const createdUser = await this.userRepository.create(user);

    // Generate JWT token
    const token = this.tokenManager.generateToken({
      userId: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
    });

    return {
      user: {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
      },
      token,
    };
  }
}