import type { TaskStatus } from '@client-portal/shared';

import { AppError } from './errors.js';

const transitions: Readonly<Partial<Record<TaskStatus, TaskStatus>>> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'IN_REVIEW',
  IN_REVIEW: 'DONE',
};

export function nextTaskStatus(from: TaskStatus): TaskStatus | null {
  return transitions[from] ?? null;
}

export function assertTaskTransition(from: TaskStatus, to: TaskStatus) {
  if (nextTaskStatus(from) !== to) {
    throw new AppError(
      409,
      'INVALID_TASK_TRANSITION',
      `Task cannot transition from ${from} to ${to}.`,
    );
  }
}
