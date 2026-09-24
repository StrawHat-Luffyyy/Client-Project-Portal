import type {
  CreateTaskInput,
  MoveTaskInput,
  PaginationQuery,
  TaskAssignee,
  TaskListQuery,
  TaskStatus,
  UpdateTaskInput,
} from '@client-portal/shared';

import type { AuthenticatedScope } from './auth.js';
import type { Page } from './workspace.js';

export interface TaskRecord {
  id: string;
  organizationId: string;
  requirementId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: string | null;
  estimateHours: number | null;
  dueDate: Date | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  assignee: TaskAssignee | null;
  requirement: {
    id: string;
    title: string;
    status:
      | 'SUBMITTED'
      | 'IN_REVIEW'
      | 'NEEDS_INFO'
      | 'APPROVED'
      | 'IN_PROGRESS'
      | 'DELIVERED'
      | 'REJECTED';
    project: { id: string; name: string };
  };
}

export interface TaskRepository {
  listRequirementTasks(
    scope: AuthenticatedScope,
    requirementId: string,
    pagination: PaginationQuery,
  ): Promise<Page<TaskRecord> | null>;
  createTask(
    scope: AuthenticatedScope,
    requirementId: string,
    input: CreateTaskInput,
  ): Promise<TaskRecord | null>;
  findTask(
    scope: AuthenticatedScope,
    taskId: string,
  ): Promise<TaskRecord | null>;
  updateTask(
    scope: AuthenticatedScope,
    taskId: string,
    input: UpdateTaskInput,
  ): Promise<TaskRecord | null>;
  moveTask(
    scope: AuthenticatedScope,
    taskId: string,
    currentStatus: TaskStatus,
    input: MoveTaskInput,
  ): Promise<TaskRecord | null>;
  listBoardTasks(
    scope: AuthenticatedScope,
    query: TaskListQuery,
  ): Promise<Page<TaskRecord>>;
  listAssignees(scope: AuthenticatedScope): Promise<TaskAssignee[]>;
}
