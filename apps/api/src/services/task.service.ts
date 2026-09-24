import type {
  CreateTaskInput,
  MoveTaskInput,
  PaginationQuery,
  TaskListQuery,
  UpdateTaskInput,
} from '@client-portal/shared';

import type { AuthenticatedScope } from '../domain/auth.js';
import { AppError } from '../domain/errors.js';
import type { TaskRepository } from '../domain/task.js';
import { assertTaskTransition } from '../domain/task-transition.js';

export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  async listRequirementTasks(
    scope: AuthenticatedScope,
    requirementId: string,
    pagination: PaginationQuery,
  ) {
    const page = await this.repository.listRequirementTasks(
      scope,
      requirementId,
      pagination,
    );
    if (!page) {
      throw new AppError(
        404,
        'REQUIREMENT_NOT_FOUND',
        'Requirement was not found.',
      );
    }
    return page;
  }

  async createTask(
    scope: AuthenticatedScope,
    requirementId: string,
    input: CreateTaskInput,
  ) {
    const task = await this.repository.createTask(scope, requirementId, input);
    if (!task) {
      throw new AppError(
        409,
        'REQUIREMENT_NOT_TASKABLE',
        'Tasks can only be added to an approved requirement before work starts.',
      );
    }
    return task;
  }

  async updateTask(
    scope: AuthenticatedScope,
    taskId: string,
    input: UpdateTaskInput,
  ) {
    const task = await this.repository.updateTask(scope, taskId, input);
    if (!task) {
      throw new AppError(
        409,
        'TASK_NOT_EDITABLE',
        'The task was not found or can no longer be edited.',
      );
    }
    return task;
  }

  async moveTask(
    scope: AuthenticatedScope,
    taskId: string,
    input: MoveTaskInput,
  ) {
    const existing = await this.repository.findTask(scope, taskId);
    if (!existing) {
      throw new AppError(404, 'TASK_NOT_FOUND', 'Task was not found.');
    }
    if (!['APPROVED', 'IN_PROGRESS'].includes(existing.requirement.status)) {
      throw new AppError(
        409,
        'REQUIREMENT_NOT_ACTIVE',
        'The requirement is not available for task work.',
      );
    }
    assertTaskTransition(existing.status, input.to);
    const task = await this.repository.moveTask(
      scope,
      taskId,
      existing.status,
      input,
    );
    if (!task) {
      throw new AppError(
        409,
        'TASK_CHANGED',
        'The task changed before the move could be completed.',
      );
    }
    return task;
  }

  listBoardTasks(scope: AuthenticatedScope, query: TaskListQuery) {
    return this.repository.listBoardTasks(scope, query);
  }

  listAssignees(scope: AuthenticatedScope) {
    return this.repository.listAssignees(scope);
  }
}
