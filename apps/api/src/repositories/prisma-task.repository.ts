import { Prisma, type PrismaClient } from '@prisma/client';

import type {
  CreateTaskInput,
  MoveTaskInput,
  PaginationQuery,
  TaskListQuery,
  TaskStatus,
  UpdateTaskInput,
} from '@client-portal/shared';

import type { AuthenticatedScope } from '../domain/auth.js';
import { AppError } from '../domain/errors.js';
import type { TaskRecord, TaskRepository } from '../domain/task.js';
import type { Page } from '../domain/workspace.js';
import { prisma } from '../lib/prisma.js';
import { createRequirementNotifications } from './notification-recipient.js';

const taskSelect = {
  id: true,
  organizationId: true,
  requirementId: true,
  title: true,
  description: true,
  status: true,
  assigneeId: true,
  estimateHours: true,
  dueDate: true,
  position: true,
  createdAt: true,
  updatedAt: true,
  assignee: { select: { id: true, name: true, email: true } },
  requirement: {
    select: {
      id: true,
      title: true,
      status: true,
      project: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.TaskSelect;

type SelectedTask = Prisma.TaskGetPayload<{ select: typeof taskSelect }>;

function toTask(record: SelectedTask): TaskRecord {
  return {
    ...record,
    estimateHours: record.estimateHours?.toNumber() ?? null,
  };
}

function pageOf<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number,
): Page<T> {
  return { items, page, pageSize, total };
}

function taskData(input: CreateTaskInput | UpdateTaskInput) {
  return {
    ...input,
    ...(input.dueDate !== undefined
      ? {
          dueDate: input.dueDate
            ? new Date(`${input.dueDate}T00:00:00.000Z`)
            : null,
        }
      : {}),
  };
}

async function requireEngineer(
  transaction: Prisma.TransactionClient,
  organizationId: string,
  assigneeId: string | null | undefined,
) {
  if (!assigneeId) return;
  const engineer = await transaction.user.findFirst({
    where: { id: assigneeId, organizationId, role: 'ENGINEER' },
    select: { id: true },
  });
  if (!engineer) {
    throw new AppError(
      404,
      'ASSIGNEE_NOT_FOUND',
      'The selected engineer was not found.',
    );
  }
}

export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly database: PrismaClient = prisma) {}

  async listRequirementTasks(
    scope: AuthenticatedScope,
    requirementId: string,
    pagination: PaginationQuery,
  ) {
    const requirement = await this.database.requirement.findFirst({
      where: {
        id: requirementId,
        organizationId: scope.organizationId,
        ...(scope.role === 'CLIENT'
          ? { project: { clientId: scope.clientId ?? '__unassigned_client__' } }
          : {}),
      },
      select: { id: true },
    });
    if (!requirement) return null;
    const where: Prisma.TaskWhereInput = {
      organizationId: scope.organizationId,
      requirementId,
    };
    const [records, total] = await this.database.$transaction([
      this.database.task.findMany({
        where,
        select: taskSelect,
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.database.task.count({ where }),
    ]);
    return pageOf(
      records.map(toTask),
      pagination.page,
      pagination.pageSize,
      total,
    );
  }

  async createTask(
    scope: AuthenticatedScope,
    requirementId: string,
    input: CreateTaskInput,
  ) {
    try {
      return await this.database.$transaction(async (transaction) => {
        const existing = await transaction.task.findFirst({
          where: {
            organizationId: scope.organizationId,
            idempotencyKey: input.idempotencyKey,
          },
          select: taskSelect,
        });
        if (existing) return toTask(existing);

        const requirement = await transaction.requirement.findFirst({
          where: {
            id: requirementId,
            organizationId: scope.organizationId,
            status: 'APPROVED',
          },
          select: { id: true },
        });
        if (!requirement) return null;
        await requireEngineer(
          transaction,
          scope.organizationId,
          input.assigneeId,
        );
        const aggregate = await transaction.task.aggregate({
          where: { organizationId: scope.organizationId, requirementId },
          _max: { position: true },
        });
        const task = await transaction.task.create({
          data: {
            organizationId: scope.organizationId,
            idempotencyKey: input.idempotencyKey,
            requirementId,
            title: input.title,
            description: input.description,
            assigneeId: input.assigneeId ?? null,
            estimateHours: input.estimateHours ?? null,
            dueDate: input.dueDate
              ? new Date(`${input.dueDate}T00:00:00.000Z`)
              : null,
            position: (aggregate._max.position ?? -1) + 1,
          },
          select: taskSelect,
        });
        await transaction.activityLog.create({
          data: {
            organizationId: scope.organizationId,
            actorId: scope.userId,
            entityType: 'REQUIREMENT',
            entityId: requirementId,
            action: 'TASK_CREATED',
            metadata: {
              taskId: task.id,
              title: task.title,
              assigneeId: task.assigneeId,
            },
          },
        });
        return toTask(task);
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await this.database.task.findFirst({
          where: {
            organizationId: scope.organizationId,
            idempotencyKey: input.idempotencyKey,
          },
          select: taskSelect,
        });
        if (existing) return toTask(existing);
      }
      throw error;
    }
  }

  async findTask(scope: AuthenticatedScope, taskId: string) {
    const task = await this.database.task.findFirst({
      where: {
        id: taskId,
        organizationId: scope.organizationId,
        ...(scope.role === 'ENGINEER' ? { assigneeId: scope.userId } : {}),
      },
      select: taskSelect,
    });
    return task ? toTask(task) : null;
  }

  async updateTask(
    scope: AuthenticatedScope,
    taskId: string,
    input: UpdateTaskInput,
  ) {
    return this.database.$transaction(async (transaction) => {
      const existing = await transaction.task.findFirst({
        where: {
          id: taskId,
          organizationId: scope.organizationId,
          status: 'TODO',
          requirement: { status: 'APPROVED' },
        },
        select: { id: true, requirementId: true },
      });
      if (!existing) return null;
      await requireEngineer(
        transaction,
        scope.organizationId,
        input.assigneeId,
      );
      const task = await transaction.task.update({
        where: { id: existing.id },
        data: taskData(input),
        select: taskSelect,
      });
      await transaction.activityLog.create({
        data: {
          organizationId: scope.organizationId,
          actorId: scope.userId,
          entityType: 'REQUIREMENT',
          entityId: existing.requirementId,
          action: 'TASK_UPDATED',
          metadata: { taskId, fields: Object.keys(input) },
        },
      });
      return toTask(task);
    });
  }

  async moveTask(
    scope: AuthenticatedScope,
    taskId: string,
    currentStatus: TaskStatus,
    input: MoveTaskInput,
  ) {
    return this.database.$transaction(async (transaction) => {
      const result = await transaction.task.updateMany({
        where: {
          id: taskId,
          organizationId: scope.organizationId,
          status: currentStatus,
          requirement: { status: { in: ['APPROVED', 'IN_PROGRESS'] } },
          ...(scope.role === 'ENGINEER' ? { assigneeId: scope.userId } : {}),
        },
        data: { status: input.to },
      });
      if (result.count !== 1) return null;
      const task = await transaction.task.findUniqueOrThrow({
        where: { id: taskId },
        select: taskSelect,
      });
      await transaction.activityLog.create({
        data: {
          organizationId: scope.organizationId,
          actorId: scope.userId,
          entityType: 'REQUIREMENT',
          entityId: task.requirementId,
          action: 'TASK_STATUS_CHANGED',
          metadata: { taskId, from: currentStatus, to: input.to },
        },
      });
      if (input.to === 'IN_PROGRESS') {
        const requirement = await transaction.requirement.updateMany({
          where: {
            id: task.requirementId,
            organizationId: scope.organizationId,
            status: 'APPROVED',
          },
          data: { status: 'IN_PROGRESS' },
        });
        if (requirement.count === 1) {
          await transaction.activityLog.create({
            data: {
              organizationId: scope.organizationId,
              actorId: scope.userId,
              entityType: 'REQUIREMENT',
              entityId: task.requirementId,
              action: 'REQUIREMENT_STATUS_CHANGED',
              metadata: {
                from: 'APPROVED',
                to: 'IN_PROGRESS',
                triggeredByTaskId: task.id,
              },
            },
          });
        }
      }
      await createRequirementNotifications(transaction, {
        organizationId: scope.organizationId,
        actorId: scope.userId,
        requirementId: task.requirementId,
        type: 'TASK_STATUS_CHANGED',
        includeClient: true,
        engineerIds: task.assigneeId ? [task.assigneeId] : [],
      });
      return toTask(task);
    });
  }

  async listBoardTasks(scope: AuthenticatedScope, query: TaskListQuery) {
    const where: Prisma.TaskWhereInput = {
      organizationId: scope.organizationId,
      ...(scope.role === 'ENGINEER'
        ? { assigneeId: scope.userId }
        : query.assigneeId
          ? { assigneeId: query.assigneeId }
          : {}),
      ...(query.projectId
        ? { requirement: { projectId: query.projectId } }
        : {}),
    };
    const [records, total] = await this.database.$transaction([
      this.database.task.findMany({
        where,
        select: taskSelect,
        orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.database.task.count({ where }),
    ]);
    return pageOf(records.map(toTask), query.page, query.pageSize, total);
  }

  listAssignees(scope: AuthenticatedScope) {
    return this.database.user.findMany({
      where: { organizationId: scope.organizationId, role: 'ENGINEER' },
      select: { id: true, name: true, email: true },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
  }
}
