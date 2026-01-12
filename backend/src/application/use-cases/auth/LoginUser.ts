import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { BcryptHasher } from '../../../infrastructure/security/BcryptHasher';
import { JwtTokenManager } from '../../../infrastructure/security/JwtTokenManager';
import { LoginDTO, AuthResponseDTO } from '../../dto/auth.dto';
import { UnauthorizedError } from '../../../shared/errors/AppError';

export class LoginUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: BcryptHasher,
    private readonly tokenManager: JwtTokenManager
  ) {}

  async execute(data: LoginDTO): Promise<AuthResponseDTO> {
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Verify password
    const isPasswordValid = await this.hasher.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Generate JWT token
    const token = this.tokenManager.generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }
}