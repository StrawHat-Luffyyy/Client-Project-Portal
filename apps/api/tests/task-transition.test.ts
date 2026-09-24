import type { TaskStatus } from '@client-portal/shared';
import { describe, expect, it } from 'vitest';

import {
  assertTaskTransition,
  nextTaskStatus,
} from '../src/domain/task-transition.js';

describe('task transition policy', () => {
  it.each<[TaskStatus, TaskStatus | null]>([
    ['TODO', 'IN_PROGRESS'],
    ['IN_PROGRESS', 'IN_REVIEW'],
    ['IN_REVIEW', 'DONE'],
    ['DONE', null],
  ])('returns the next valid status from %s', (from, expected) => {
    expect(nextTaskStatus(from)).toBe(expected);
  });

  it('returns a consistent conflict for an invalid move', () => {
    try {
      assertTaskTransition('TODO', 'DONE');
      throw new Error('Expected task transition validation to fail.');
    } catch (error: unknown) {
      expect(error).toMatchObject({
        statusCode: 409,
        code: 'INVALID_TASK_TRANSITION',
      });
    }
  });
});
