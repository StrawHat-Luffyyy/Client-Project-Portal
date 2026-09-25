import type { Prisma } from '@prisma/client';

import type { NotificationType } from '@client-portal/shared';

export async function createRequirementNotifications(
  transaction: Prisma.TransactionClient,
  input: {
    organizationId: string;
    actorId: string;
    requirementId: string;
    type: NotificationType;
    includeClient: boolean;
    engineerIds?: string[];
  },
) {
  const requirement = await transaction.requirement.findFirst({
    where: {
      id: input.requirementId,
      organizationId: input.organizationId,
    },
    select: {
      project: { select: { clientId: true } },
      tasks: { select: { assigneeId: true } },
    },
  });
  if (!requirement) return;

  const engineerIds = [
    ...new Set(
      input.engineerIds ??
        requirement.tasks.flatMap((task) =>
          task.assigneeId ? [task.assigneeId] : [],
        ),
    ),
  ];
  const recipients = await transaction.user.findMany({
    where: {
      organizationId: input.organizationId,
      id: { not: input.actorId },
      OR: [
        { role: { in: ['ADMIN', 'PM'] } },
        ...(input.includeClient
          ? [
              {
                role: 'CLIENT' as const,
                clientId: requirement.project.clientId,
              },
            ]
          : []),
        ...(engineerIds.length > 0
          ? [{ role: 'ENGINEER' as const, id: { in: engineerIds } }]
          : []),
      ],
    },
    select: { id: true },
  });
  if (recipients.length === 0) return;

  await transaction.notification.createMany({
    data: recipients.map((recipient) => ({
      organizationId: input.organizationId,
      userId: recipient.id,
      type: input.type,
      entityType: 'REQUIREMENT' as const,
      entityId: input.requirementId,
    })),
  });
}
