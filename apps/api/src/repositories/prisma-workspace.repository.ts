import { Prisma, type PrismaClient } from '@prisma/client';

import type {
  CreateClientInput,
  CreateProjectInput,
  CreateRequirementInput,
  PaginationQuery,
  ProjectListQuery,
  RequirementListQuery,
  RequirementTransitionInput,
  UpdateRequirementInput,
} from '@client-portal/shared';

import type { AuthenticatedScope } from '../domain/auth.js';
import { AppError } from '../domain/errors.js';
import type {
  Page,
  PendingAttachment,
  ProjectRecord,
  WorkspaceRepository,
} from '../domain/workspace.js';
import { prisma } from '../lib/prisma.js';
import { createRequirementNotifications } from './notification-recipient.js';

const projectSelect = {
  id: true,
  organizationId: true,
  clientId: true,
  name: true,
  description: true,
  createdAt: true,
  client: { select: { id: true, name: true } },
  _count: { select: { requirements: true } },
} satisfies Prisma.ProjectSelect;

const requirementSelect = {
  id: true,
  organizationId: true,
  projectId: true,
  createdById: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, name: true } },
  attachments: {
    orderBy: { createdAt: 'asc' as const },
    select: { id: true, fileName: true, size: true, createdAt: true },
  },
} satisfies Prisma.RequirementSelect;

function toProject(
  record: Prisma.ProjectGetPayload<{ select: typeof projectSelect }>,
): ProjectRecord {
  const { _count, ...project } = record;
  return { ...project, requirementCount: _count.requirements };
}

function pageOf<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number,
): Page<T> {
  return { items, page, pageSize, total };
}

function uniqueConflict(error: unknown, code: string, message: string): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw new AppError(409, code, message);
  }
  throw error;
}

export class PrismaWorkspaceRepository implements WorkspaceRepository {
  constructor(private readonly database: PrismaClient = prisma) {}

  async listClients(scope: AuthenticatedScope, pagination: PaginationQuery) {
    const where: Prisma.ClientWhereInput = {
      organizationId: scope.organizationId,
      ...(scope.role === 'CLIENT'
        ? { id: scope.clientId ?? '__unassigned_client__' }
        : {}),
    };
    const [items, total] = await this.database.$transaction([
      this.database.client.findMany({
        where,
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.database.client.count({ where }),
    ]);
    return pageOf(items, pagination.page, pagination.pageSize, total);
  }

  async createClient(scope: AuthenticatedScope, input: CreateClientInput) {
    try {
      return await this.database.$transaction(async (transaction) => {
        const client = await transaction.client.create({
          data: { ...input, organizationId: scope.organizationId },
        });
        await transaction.activityLog.create({
          data: {
            organizationId: scope.organizationId,
            actorId: scope.userId,
            entityType: 'CLIENT',
            entityId: client.id,
            action: 'CLIENT_CREATED',
            metadata: { name: client.name },
          },
        });
        return client;
      });
    } catch (error: unknown) {
      return uniqueConflict(
        error,
        'CLIENT_EXISTS',
        'A client with this name already exists.',
      );
    }
  }

  async listProjects(scope: AuthenticatedScope, query: ProjectListQuery) {
    const where: Prisma.ProjectWhereInput = {
      organizationId: scope.organizationId,
      ...(scope.role === 'CLIENT'
        ? { clientId: scope.clientId ?? '__unassigned_client__' }
        : query.clientId
          ? { clientId: query.clientId }
          : {}),
    };
    const [records, total] = await this.database.$transaction([
      this.database.project.findMany({
        where,
        select: projectSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.database.project.count({ where }),
    ]);
    return pageOf(records.map(toProject), query.page, query.pageSize, total);
  }

  async findProject(scope: AuthenticatedScope, projectId: string) {
    const record = await this.database.project.findFirst({
      where: {
        id: projectId,
        organizationId: scope.organizationId,
        ...(scope.role === 'CLIENT'
          ? { clientId: scope.clientId ?? '__unassigned_client__' }
          : {}),
      },
      select: projectSelect,
    });
    return record ? toProject(record) : null;
  }

  async createProject(scope: AuthenticatedScope, input: CreateProjectInput) {
    try {
      return await this.database.$transaction(async (transaction) => {
        const client = await transaction.client.findFirst({
          where: { id: input.clientId, organizationId: scope.organizationId },
          select: { id: true },
        });
        if (!client)
          throw new AppError(404, 'CLIENT_NOT_FOUND', 'Client was not found.');

        const project = await transaction.project.create({
          data: { ...input, organizationId: scope.organizationId },
          select: projectSelect,
        });
        await transaction.activityLog.create({
          data: {
            organizationId: scope.organizationId,
            actorId: scope.userId,
            entityType: 'PROJECT',
            entityId: project.id,
            action: 'PROJECT_CREATED',
            metadata: { clientId: project.clientId, name: project.name },
          },
        });
        return toProject(project);
      });
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      return uniqueConflict(
        error,
        'PROJECT_EXISTS',
        'A project with this name already exists for the client.',
      );
    }
  }

  async listRequirements(
    scope: AuthenticatedScope,
    projectId: string,
    query: RequirementListQuery,
  ) {
    const project = await this.findProject(scope, projectId);
    if (!project) return null;
    const where: Prisma.RequirementWhereInput = {
      organizationId: scope.organizationId,
      projectId,
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await this.database.$transaction([
      this.database.requirement.findMany({
        where,
        select: requirementSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.database.requirement.count({ where }),
    ]);
    return pageOf(items, query.page, query.pageSize, total);
  }

  async findRequirement(scope: AuthenticatedScope, requirementId: string) {
    return this.database.requirement.findFirst({
      where: {
        id: requirementId,
        organizationId: scope.organizationId,
        ...(scope.role === 'CLIENT'
          ? { project: { clientId: scope.clientId ?? '__unassigned_client__' } }
          : {}),
      },
      select: requirementSelect,
    });
  }

  async createRequirement(
    scope: AuthenticatedScope,
    projectId: string,
    input: CreateRequirementInput,
    attachment?: PendingAttachment,
  ) {
    return this.database.$transaction(async (transaction) => {
      const project = await transaction.project.findFirst({
        where: {
          id: projectId,
          organizationId: scope.organizationId,
          clientId: scope.clientId ?? '__unassigned_client__',
        },
        select: { id: true },
      });
      if (!project) return null;

      const requirement = await transaction.requirement.create({
        data: {
          ...input,
          organizationId: scope.organizationId,
          projectId,
          createdById: scope.userId,
          ...(attachment
            ? {
                attachments: {
                  create: {
                    organizationId: scope.organizationId,
                    uploadedById: scope.userId,
                    ...attachment,
                  },
                },
              }
            : {}),
        },
        select: requirementSelect,
      });
      await transaction.activityLog.create({
        data: {
          organizationId: scope.organizationId,
          actorId: scope.userId,
          entityType: 'REQUIREMENT',
          entityId: requirement.id,
          action: 'REQUIREMENT_SUBMITTED',
          metadata: {
            projectId,
            priority: requirement.priority,
            hasAttachment: Boolean(attachment),
          },
        },
      });
      return requirement;
    });
  }

  async updateRequirement(
    scope: AuthenticatedScope,
    requirementId: string,
    input: UpdateRequirementInput,
  ) {
    return this.database.$transaction(async (transaction) => {
      const existing = await transaction.requirement.findFirst({
        where: {
          id: requirementId,
          organizationId: scope.organizationId,
          createdById: scope.userId,
          status: { in: ['SUBMITTED', 'NEEDS_INFO'] },
          project: { clientId: scope.clientId ?? '__unassigned_client__' },
        },
        select: { id: true },
      });
      if (!existing) return null;
      const requirement = await transaction.requirement.update({
        where: { id: existing.id },
        data: input,
        select: requirementSelect,
      });
      await transaction.activityLog.create({
        data: {
          organizationId: scope.organizationId,
          actorId: scope.userId,
          entityType: 'REQUIREMENT',
          entityId: requirement.id,
          action: 'REQUIREMENT_UPDATED',
          metadata: { fields: Object.keys(input) },
        },
      });
      return requirement;
    });
  }

  async transitionRequirement(
    scope: AuthenticatedScope,
    requirementId: string,
    currentStatus: Parameters<WorkspaceRepository['transitionRequirement']>[2],
    input: RequirementTransitionInput,
  ) {
    return this.database.$transaction(async (transaction) => {
      const result = await transaction.requirement.updateMany({
        where: {
          id: requirementId,
          organizationId: scope.organizationId,
          status: currentStatus,
        },
        data: {
          status: input.to,
          rejectionReason: input.to === 'REJECTED' ? input.reason : null,
        },
      });
      if (result.count !== 1) return null;

      await transaction.activityLog.create({
        data: {
          organizationId: scope.organizationId,
          actorId: scope.userId,
          entityType: 'REQUIREMENT',
          entityId: requirementId,
          action: 'REQUIREMENT_STATUS_CHANGED',
          metadata: {
            from: currentStatus,
            to: input.to,
            ...(input.reason ? { reason: input.reason } : {}),
          },
        },
      });
      await createRequirementNotifications(transaction, {
        organizationId: scope.organizationId,
        actorId: scope.userId,
        requirementId,
        type: 'REQUIREMENT_STATUS_CHANGED',
        includeClient: true,
      });
      return transaction.requirement.findUnique({
        where: { id: requirementId },
        select: requirementSelect,
      });
    });
  }

  async listRequirementActivity(
    scope: AuthenticatedScope,
    requirementId: string,
    pagination: PaginationQuery,
  ) {
    if (!(await this.findRequirement(scope, requirementId))) return null;
    const where: Prisma.ActivityLogWhereInput = {
      organizationId: scope.organizationId,
      entityType: 'REQUIREMENT',
      entityId: requirementId,
      ...(scope.role === 'CLIENT'
        ? {
            NOT: {
              action: 'COMMENT_CREATED',
              metadata: { path: ['visibility'], equals: 'INTERNAL' },
            },
          }
        : {}),
    };
    const [items, total] = await this.database.$transaction([
      this.database.activityLog.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
        select: {
          id: true,
          organizationId: true,
          actorId: true,
          entityType: true,
          entityId: true,
          action: true,
          metadata: true,
          createdAt: true,
          actor: { select: { id: true, name: true, role: true } },
        },
      }),
      this.database.activityLog.count({ where }),
    ]);
    return pageOf(
      items.map((item) => ({
        ...item,
        entityType: 'REQUIREMENT' as const,
        metadata: item.metadata as Record<string, unknown>,
      })),
      pagination.page,
      pagination.pageSize,
      total,
    );
  }

  async canDeliverRequirement(
    scope: AuthenticatedScope,
    requirementId: string,
  ) {
    const [total, incomplete] = await this.database.$transaction([
      this.database.task.count({
        where: {
          organizationId: scope.organizationId,
          requirementId,
          requirement: {
            organizationId: scope.organizationId,
            status: 'IN_PROGRESS',
          },
        },
      }),
      this.database.task.count({
        where: {
          organizationId: scope.organizationId,
          requirementId,
          status: { not: 'DONE' },
          requirement: {
            organizationId: scope.organizationId,
            status: 'IN_PROGRESS',
          },
        },
      }),
    ]);
    return total > 0 && incomplete === 0;
  }
}
