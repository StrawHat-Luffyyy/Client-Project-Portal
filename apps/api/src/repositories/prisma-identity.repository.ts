import { Prisma, type PrismaClient } from '@prisma/client';

import type {
  AuthUser,
  RegisterOrganizationInput,
} from '@client-portal/shared';

import type {
  AuthenticatedScope,
  CreatedInvite,
  IdentityRepository,
  UserWithPassword,
} from '../domain/auth.js';
import { AppError } from '../domain/errors.js';
import { prisma } from '../lib/prisma.js';

const publicUserSelect = {
  id: true,
  organizationId: true,
  clientId: true,
  name: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

export class PrismaIdentityRepository implements IdentityRepository {
  constructor(private readonly database: PrismaClient = prisma) {}

  async findUserByEmail(email: string): Promise<UserWithPassword | null> {
    return this.database.user.findUnique({
      where: { email },
      select: { ...publicUserSelect, passwordHash: true },
    });
  }

  async findUserById(id: string): Promise<AuthUser | null> {
    return this.database.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }

  async createOrganizationAdmin(
    input: RegisterOrganizationInput,
    passwordHash: string,
  ): Promise<AuthUser> {
    try {
      return await this.database.$transaction(async (transaction) => {
        const organization = await transaction.organization.create({
          data: { name: input.organizationName },
        });
        const user = await transaction.user.create({
          data: {
            organizationId: organization.id,
            name: input.name,
            email: input.email,
            passwordHash,
            role: 'ADMIN',
          },
          select: publicUserSelect,
        });

        await transaction.activityLog.create({
          data: {
            organizationId: organization.id,
            actorId: user.id,
            entityType: 'ORGANIZATION',
            entityId: organization.id,
            action: 'ORGANIZATION_REGISTERED',
            metadata: { organizationName: organization.name },
          },
        });

        return user;
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new AppError(
          409,
          'ACCOUNT_EXISTS',
          'An account already exists for this email.',
        );
      }
      throw error;
    }
  }

  async organizationHasClient(
    organizationId: string,
    clientId: string,
  ): Promise<boolean> {
    const client = await this.database.client.findFirst({
      where: { id: clientId, organizationId },
      select: { id: true },
    });
    return client !== null;
  }

  async createInvite(
    scope: AuthenticatedScope,
    input: Parameters<IdentityRepository['createInvite']>[1],
    tokenHash: string,
    expiresAt: Date,
  ): Promise<CreatedInvite> {
    const existingUser = await this.database.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });
    if (existingUser) {
      throw new AppError(
        409,
        'ACCOUNT_EXISTS',
        'An account already exists for this email.',
      );
    }

    return this.database.$transaction(async (transaction) => {
      const invite = await transaction.invite.create({
        data: {
          organizationId: scope.organizationId,
          clientId: input.clientId,
          email: input.email,
          role: input.role,
          token: tokenHash,
          expiresAt,
        },
        select: {
          id: true,
          email: true,
          role: true,
          clientId: true,
          expiresAt: true,
        },
      });

      await transaction.activityLog.create({
        data: {
          organizationId: scope.organizationId,
          actorId: scope.userId,
          entityType: 'INVITE',
          entityId: invite.id,
          action: 'INVITE_CREATED',
          metadata: { email: invite.email, role: invite.role },
        },
      });

      return { ...invite, role: input.role };
    });
  }

  async acceptInvite(
    tokenHash: string,
    input: Parameters<IdentityRepository['acceptInvite']>[1],
    passwordHash: string,
    now: Date,
  ): Promise<AuthUser | null> {
    try {
      return await this.database.$transaction(async (transaction) => {
        const invite = await transaction.invite.findUnique({
          where: { token: tokenHash },
        });
        if (!invite || invite.acceptedAt || invite.expiresAt <= now)
          return null;

        const claimed = await transaction.invite.updateMany({
          where: { id: invite.id, acceptedAt: null, expiresAt: { gt: now } },
          data: { acceptedAt: now },
        });
        if (claimed.count !== 1) return null;

        const user = await transaction.user.create({
          data: {
            organizationId: invite.organizationId,
            clientId: invite.clientId,
            name: input.name,
            email: invite.email,
            passwordHash,
            role: invite.role,
          },
          select: publicUserSelect,
        });

        await transaction.activityLog.create({
          data: {
            organizationId: invite.organizationId,
            actorId: user.id,
            entityType: 'INVITE',
            entityId: invite.id,
            action: 'INVITE_ACCEPTED',
            metadata: { userId: user.id },
          },
        });

        return user;
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new AppError(
          409,
          'ACCOUNT_EXISTS',
          'An account already exists for this email.',
        );
      }
      throw error;
    }
  }
}
