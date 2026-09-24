import type {
  AcceptInviteInput,
  AuthUser,
  CreateInviteInput,
  RegisterOrganizationInput,
  Role,
} from '@client-portal/shared';

export interface UserWithPassword extends AuthUser {
  passwordHash: string;
}

export interface AuthenticatedScope {
  userId: string;
  organizationId: string;
  clientId: string | null;
  role: Role;
}

export interface CreatedInvite {
  id: string;
  email: string;
  role: Exclude<Role, 'ADMIN'>;
  clientId: string | null;
  expiresAt: Date;
}

export interface IdentityRepository {
  findUserByEmail(email: string): Promise<UserWithPassword | null>;
  findUserById(id: string): Promise<AuthUser | null>;
  createOrganizationAdmin(
    input: RegisterOrganizationInput,
    passwordHash: string,
  ): Promise<AuthUser>;
  organizationHasClient(
    organizationId: string,
    clientId: string,
  ): Promise<boolean>;
  createInvite(
    scope: AuthenticatedScope,
    input: CreateInviteInput,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<CreatedInvite>;
  acceptInvite(
    tokenHash: string,
    input: AcceptInviteInput,
    passwordHash: string,
    now: Date,
  ): Promise<AuthUser | null>;
}
