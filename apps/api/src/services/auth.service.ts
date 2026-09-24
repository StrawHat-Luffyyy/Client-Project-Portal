import type {
  AuthUser,
  LoginInput,
  RegisterOrganizationInput,
} from '@client-portal/shared';

import type { IdentityRepository } from '../domain/auth.js';
import { AppError } from '../domain/errors.js';
import {
  createAccessToken,
  hashPassword,
  verifyPassword,
} from '../lib/security.js';

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
}

export class AuthService {
  constructor(private readonly identities: IdentityRepository) {}

  async registerOrganization(
    input: RegisterOrganizationInput,
  ): Promise<AuthResult> {
    const passwordHash = await hashPassword(input.password);
    const user = await this.identities.createOrganizationAdmin(
      input,
      passwordHash,
    );
    return { user, accessToken: createAccessToken(user.id) };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const record = await this.identities.findUserByEmail(input.email);
    if (
      !record ||
      !(await verifyPassword(input.password, record.passwordHash))
    ) {
      throw new AppError(
        401,
        'INVALID_CREDENTIALS',
        'Email or password is incorrect.',
      );
    }

    const { passwordHash: _passwordHash, ...user } = record;
    void _passwordHash;
    return { user, accessToken: createAccessToken(user.id) };
  }

  async getCurrentUser(userId: string) {
    const user = await this.identities.findUserById(userId);
    if (!user) {
      throw new AppError(401, 'UNAUTHENTICATED', 'Authentication is required.');
    }
    return user;
  }
}
