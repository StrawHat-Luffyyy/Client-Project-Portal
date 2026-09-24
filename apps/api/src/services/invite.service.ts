import type {
  AcceptInviteInput,
  CreateInviteInput,
} from '@client-portal/shared';

import type { AuthenticatedScope, IdentityRepository } from '../domain/auth.js';
import { AppError } from '../domain/errors.js';
import {
  createAccessToken,
  createInviteToken,
  hashInviteToken,
  hashPassword,
} from '../lib/security.js';

const INVITE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export class InviteService {
  constructor(private readonly identities: IdentityRepository) {}

  async create(
    scope: AuthenticatedScope,
    input: CreateInviteInput,
    now = new Date(),
  ) {
    if (input.role === 'CLIENT') {
      const clientId = input.clientId;
      if (!clientId) {
        throw new AppError(
          400,
          'VALIDATION_ERROR',
          'clientId is required for CLIENT invitations.',
        );
      }
      const clientExists = await this.identities.organizationHasClient(
        scope.organizationId,
        clientId,
      );
      if (!clientExists) {
        throw new AppError(404, 'CLIENT_NOT_FOUND', 'Client was not found.');
      }
    }

    const token = createInviteToken();
    const invite = await this.identities.createInvite(
      scope,
      input,
      hashInviteToken(token),
      new Date(now.getTime() + INVITE_LIFETIME_MS),
    );

    return { ...invite, token };
  }

  async accept(token: string, input: AcceptInviteInput, now = new Date()) {
    const passwordHash = await hashPassword(input.password);
    const user = await this.identities.acceptInvite(
      hashInviteToken(token),
      input,
      passwordHash,
      now,
    );
    if (!user) {
      throw new AppError(
        410,
        'INVITE_INVALID',
        'This invitation is invalid or has expired.',
      );
    }

    return { user, accessToken: createAccessToken(user.id) };
  }
}
