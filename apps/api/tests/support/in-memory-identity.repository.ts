import { randomUUID } from 'node:crypto';

import type {
  AcceptInviteInput,
  AuthUser,
  CreateInviteInput,
  RegisterOrganizationInput,
} from '@client-portal/shared';

import type {
  AuthenticatedScope,
  CreatedInvite,
  IdentityRepository,
  UserWithPassword,
} from '../../src/domain/auth.js';
import { AppError } from '../../src/domain/errors.js';

interface StoredInvite extends CreatedInvite {
  organizationId: string;
  tokenHash: string;
  acceptedAt: Date | null;
}

export class InMemoryIdentityRepository implements IdentityRepository {
  readonly users: UserWithPassword[] = [];
  readonly invites: StoredInvite[] = [];
  readonly clients = new Set<string>();

  addClient(organizationId: string, clientId: string) {
    this.clients.add(`${organizationId}:${clientId}`);
  }

  addUser(user: UserWithPassword) {
    this.users.push(user);
  }

  findUserByEmail(email: string) {
    return Promise.resolve(
      this.users.find((user) => user.email === email) ?? null,
    );
  }

  findUserById(id: string) {
    return Promise.resolve(this.users.find((user) => user.id === id) ?? null);
  }

  async createOrganizationAdmin(
    input: RegisterOrganizationInput,
    passwordHash: string,
  ) {
    if (await this.findUserByEmail(input.email)) {
      throw new AppError(
        409,
        'ACCOUNT_EXISTS',
        'An account already exists for this email.',
      );
    }
    const user: UserWithPassword = {
      id: randomUUID(),
      organizationId: randomUUID(),
      clientId: null,
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'ADMIN',
    };
    this.users.push(user);
    return this.withoutPassword(user);
  }

  organizationHasClient(organizationId: string, clientId: string) {
    return Promise.resolve(this.clients.has(`${organizationId}:${clientId}`));
  }

  async createInvite(
    scope: AuthenticatedScope,
    input: CreateInviteInput,
    tokenHash: string,
    expiresAt: Date,
  ) {
    if (await this.findUserByEmail(input.email)) {
      throw new AppError(
        409,
        'ACCOUNT_EXISTS',
        'An account already exists for this email.',
      );
    }
    const invite: StoredInvite = {
      id: randomUUID(),
      organizationId: scope.organizationId,
      email: input.email,
      role: input.role,
      clientId: input.clientId ?? null,
      tokenHash,
      expiresAt,
      acceptedAt: null,
    };
    this.invites.push(invite);
    return invite;
  }

  async acceptInvite(
    tokenHash: string,
    input: AcceptInviteInput,
    passwordHash: string,
    now: Date,
  ): Promise<AuthUser | null> {
    const invite = this.invites.find(
      (candidate) => candidate.tokenHash === tokenHash,
    );
    if (!invite || invite.acceptedAt || invite.expiresAt <= now) return null;
    if (await this.findUserByEmail(invite.email)) {
      throw new AppError(
        409,
        'ACCOUNT_EXISTS',
        'An account already exists for this email.',
      );
    }

    invite.acceptedAt = now;
    const user: UserWithPassword = {
      id: randomUUID(),
      organizationId: invite.organizationId,
      clientId: invite.clientId,
      name: input.name,
      email: invite.email,
      passwordHash,
      role: invite.role,
    };
    this.users.push(user);
    return this.withoutPassword(user);
  }

  private withoutPassword(user: UserWithPassword): AuthUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    void _passwordHash;
    return publicUser;
  }
}
