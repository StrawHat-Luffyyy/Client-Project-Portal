import type { Prisma } from '@prisma/client';

import { describe, expect, it, vi } from 'vitest';

import { createRequirementNotifications } from '../src/repositories/notification-recipient.js';

function transactionWithRecipients(recipientIds: string[]) {
  const findRequirement = vi.fn().mockResolvedValue({
    project: { clientId: 'client-a' },
    tasks: [{ assigneeId: 'engineer-a' }, { assigneeId: 'engineer-b' }],
  });
  const findUsers = vi
    .fn()
    .mockResolvedValue(recipientIds.map((id) => ({ id })));
  const createMany = vi.fn().mockResolvedValue({ count: recipientIds.length });
  const transaction = {
    requirement: { findFirst: findRequirement },
    user: { findMany: findUsers },
    notification: { createMany },
  } as unknown as Prisma.TransactionClient;
  return { createMany, findUsers, transaction };
}

describe('notification recipient policy', () => {
  it('includes the owning client and only the specified task engineer', async () => {
    const { createMany, findUsers, transaction } = transactionWithRecipients([
      'pm-a',
      'client-user-a',
      'engineer-a',
    ]);
    await createRequirementNotifications(transaction, {
      organizationId: 'organization-a',
      actorId: 'actor-a',
      requirementId: 'requirement-a',
      type: 'TASK_STATUS_CHANGED',
      includeClient: true,
      engineerIds: ['engineer-a'],
    });

    expect(findUsers).toHaveBeenCalledWith({
      where: {
        organizationId: 'organization-a',
        id: { not: 'actor-a' },
        OR: [
          { role: { in: ['ADMIN', 'PM'] } },
          { role: 'CLIENT', clientId: 'client-a' },
          { role: 'ENGINEER', id: { in: ['engineer-a'] } },
        ],
      },
      select: { id: true },
    });
    expect(createMany).toHaveBeenCalledWith({
      data: [
        {
          organizationId: 'organization-a',
          userId: 'pm-a',
          type: 'TASK_STATUS_CHANGED',
          entityType: 'REQUIREMENT',
          entityId: 'requirement-a',
        },
        {
          organizationId: 'organization-a',
          userId: 'client-user-a',
          type: 'TASK_STATUS_CHANGED',
          entityType: 'REQUIREMENT',
          entityId: 'requirement-a',
        },
        {
          organizationId: 'organization-a',
          userId: 'engineer-a',
          type: 'TASK_STATUS_CHANGED',
          entityType: 'REQUIREMENT',
          entityId: 'requirement-a',
        },
      ],
    });
  });

  it('excludes clients from internal comment notifications', async () => {
    const { findUsers, transaction } = transactionWithRecipients(['pm-a']);
    await createRequirementNotifications(transaction, {
      organizationId: 'organization-a',
      actorId: 'engineer-a',
      requirementId: 'requirement-a',
      type: 'COMMENT_CREATED',
      includeClient: false,
    });

    expect(findUsers).toHaveBeenCalledWith({
      where: {
        organizationId: 'organization-a',
        id: { not: 'engineer-a' },
        OR: [
          { role: { in: ['ADMIN', 'PM'] } },
          {
            role: 'ENGINEER',
            id: { in: ['engineer-a', 'engineer-b'] },
          },
        ],
      },
      select: { id: true },
    });
  });
});
