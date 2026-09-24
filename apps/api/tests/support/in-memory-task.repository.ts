import type {
  CreateTaskInput,
  MoveTaskInput,
  PaginationQuery,
  TaskAssignee,
  TaskListQuery,
  TaskStatus,
  UpdateTaskInput,
} from '@client-portal/shared';

import type { AuthenticatedScope } from '../../src/domain/auth.js';
import { AppError } from '../../src/domain/errors.js';
import type { TaskRecord, TaskRepository } from '../../src/domain/task.js';
import type { Page } from '../../src/domain/workspace.js';
import type { InMemoryWorkspaceRepository } from './in-memory-workspace.repository.js';

function page<T>(items: T[], query: PaginationQuery): Page<T> {
  const start = (query.page - 1) * query.pageSize;
  return {
    items: items.slice(start, start + query.pageSize),
    page: query.page,
    pageSize: query.pageSize,
    total: items.length,
  };
}

export class InMemoryTaskRepository implements TaskRepository {
  tasks: TaskRecord[] = [];
  assignees: TaskAssignee[] = [];
  private readonly idempotentTasks = new Map<string, TaskRecord>();

  constructor(private readonly workspace: InMemoryWorkspaceRepository) {}

  private taskRecord(
    scope: AuthenticatedScope,
    requirementId: string,
    input: CreateTaskInput,
  ): TaskRecord | null {
    const requirement = this.workspace.requirements.find(
      (item) =>
        item.id === requirementId &&
        item.organizationId === scope.organizationId &&
        item.status === 'APPROVED',
    );
    const project = this.workspace.projects.find(
      (item) => item.id === requirement?.projectId,
    );
    if (!requirement || !project) return null;
    const assignee = input.assigneeId
      ? this.assignees.find((item) => item.id === input.assigneeId)
      : null;
    if (input.assigneeId && !assignee) {
      throw new AppError(
        404,
        'ASSIGNEE_NOT_FOUND',
        'The selected engineer was not found.',
      );
    }
    const now = new Date();
    return {
      id: `task-${this.tasks.length + 1}`,
      organizationId: scope.organizationId,
      requirementId,
      title: input.title,
      description: input.description,
      status: 'TODO',
      assigneeId: input.assigneeId ?? null,
      estimateHours: input.estimateHours ?? null,
      dueDate: input.dueDate
        ? new Date(`${input.dueDate}T00:00:00.000Z`)
        : null,
      position: this.tasks.filter(
        (item) => item.requirementId === requirementId,
      ).length,
      createdAt: now,
      updatedAt: now,
      assignee: assignee ?? null,
      requirement: {
        id: requirement.id,
        title: requirement.title,
        status: requirement.status,
        project: { id: project.id, name: project.name },
      },
    };
  }

  async listRequirementTasks(
    scope: AuthenticatedScope,
    requirementId: string,
    pagination: PaginationQuery,
  ) {
    if (!(await this.workspace.findRequirement(scope, requirementId))) {
      return null;
    }
    return page(
      this.tasks.filter(
        (task) =>
          task.organizationId === scope.organizationId &&
          task.requirementId === requirementId,
      ),
      pagination,
    );
  }

  createTask(
    scope: AuthenticatedScope,
    requirementId: string,
    input: CreateTaskInput,
  ) {
    const existing = this.idempotentTasks.get(
      `${scope.organizationId}:${input.idempotencyKey}`,
    );
    if (existing) return Promise.resolve(existing);
    const task = this.taskRecord(scope, requirementId, input);
    if (!task) return Promise.resolve(null);
    this.tasks.push(task);
    this.idempotentTasks.set(
      `${scope.organizationId}:${input.idempotencyKey}`,
      task,
    );
    this.recordActivity(scope, requirementId, 'TASK_CREATED', {
      taskId: task.id,
      title: task.title,
      assigneeId: task.assigneeId,
    });
    return Promise.resolve(task);
  }

  findTask(scope: AuthenticatedScope, taskId: string) {
    const task = this.tasks.find(
      (item) =>
        item.id === taskId &&
        item.organizationId === scope.organizationId &&
        (scope.role !== 'ENGINEER' || item.assigneeId === scope.userId),
    );
    return Promise.resolve(task ?? null);
  }

  async updateTask(
    scope: AuthenticatedScope,
    taskId: string,
    input: UpdateTaskInput,
  ) {
    const task = await this.findTask(scope, taskId);
    if (
      !task ||
      task.status !== 'TODO' ||
      task.requirement.status !== 'APPROVED'
    ) {
      return null;
    }
    const assignee = input.assigneeId
      ? this.assignees.find((item) => item.id === input.assigneeId)
      : null;
    if (input.assigneeId && !assignee) {
      throw new AppError(
        404,
        'ASSIGNEE_NOT_FOUND',
        'The selected engineer was not found.',
      );
    }
    Object.assign(task, {
      ...input,
      ...(input.assigneeId !== undefined
        ? { assignee: assignee ?? null, assigneeId: input.assigneeId }
        : {}),
      ...(input.dueDate !== undefined
        ? {
            dueDate: input.dueDate
              ? new Date(`${input.dueDate}T00:00:00.000Z`)
              : null,
          }
        : {}),
      updatedAt: new Date(),
    });
    this.recordActivity(scope, task.requirementId, 'TASK_UPDATED', {
      taskId,
      fields: Object.keys(input),
    });
    return task;
  }

  async moveTask(
    scope: AuthenticatedScope,
    taskId: string,
    currentStatus: TaskStatus,
    input: MoveTaskInput,
  ) {
    const task = await this.findTask(scope, taskId);
    if (!task || task.status !== currentStatus) return null;
    task.status = input.to;
    task.updatedAt = new Date();
    this.recordActivity(scope, task.requirementId, 'TASK_STATUS_CHANGED', {
      taskId,
      from: currentStatus,
      to: input.to,
    });
    if (input.to === 'IN_PROGRESS') {
      const requirement = this.workspace.requirements.find(
        (item) => item.id === task.requirementId,
      );
      if (requirement?.status === 'APPROVED') {
        requirement.status = 'IN_PROGRESS';
        task.requirement.status = 'IN_PROGRESS';
        this.tasks
          .filter((item) => item.requirementId === task.requirementId)
          .forEach((item) => {
            item.requirement.status = 'IN_PROGRESS';
          });
        this.recordActivity(
          scope,
          task.requirementId,
          'REQUIREMENT_STATUS_CHANGED',
          {
            from: 'APPROVED',
            to: 'IN_PROGRESS',
            triggeredByTaskId: task.id,
          },
        );
      }
    }
    if (
      input.to === 'DONE' &&
      this.tasks
        .filter((item) => item.requirementId === task.requirementId)
        .every((item) => item.status === 'DONE')
    ) {
      this.workspace.deliverableRequirementIds.add(task.requirementId);
    }
    return task;
  }

  listBoardTasks(scope: AuthenticatedScope, query: TaskListQuery) {
    const visible = this.tasks.filter(
      (task) =>
        task.organizationId === scope.organizationId &&
        (scope.role === 'ENGINEER'
          ? task.assigneeId === scope.userId
          : !query.assigneeId || task.assigneeId === query.assigneeId) &&
        (!query.projectId || task.requirement.project.id === query.projectId),
    );
    return Promise.resolve(page(visible, query));
  }

  listAssignees() {
    return Promise.resolve(this.assignees);
  }

  private recordActivity(
    scope: AuthenticatedScope,
    requirementId: string,
    action: string,
    metadata: Record<string, unknown>,
  ) {
    this.workspace.activities.push({
      id: `activity-${this.workspace.activities.length + 1}`,
      organizationId: scope.organizationId,
      actorId: scope.userId,
      entityType: 'REQUIREMENT',
      entityId: requirementId,
      action,
      metadata,
      createdAt: new Date(),
      actor: { id: scope.userId, name: scope.userId, role: scope.role },
    });
  }
}
