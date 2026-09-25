import type { Prisma, PrismaClient } from '@prisma/client';

import type {
  NotificationListQuery,
  NotificationType,
} from '@client-portal/shared';

import type { AuthenticatedScope } from '../domain/auth.js';
import type {
  NotificationCursor,
  NotificationRecord,
  NotificationRepository,
} from '../domain/notification.js';
import type { Page } from '../domain/workspace.js';
import { prisma } from '../lib/prisma.js';

const notificationSelect = {
  id: true,
  organizationId: true,
  userId: true,
  type: true,
  entityType: true,
  entityId: true,
  readAt: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

type SelectedNotification = Prisma.NotificationGetPayload<{
  select: typeof notificationSelect;
}>;

function toNotification(record: SelectedNotification): NotificationRecord {
  return {
    ...record,
    type: record.type as NotificationType,
    entityType: 'REQUIREMENT',
  };
}

export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly database: PrismaClient = prisma) {}

  async listNotifications(
    scope: AuthenticatedScope,
    query: NotificationListQuery,
  ) {
    const where: Prisma.NotificationWhereInput = {
      organizationId: scope.organizationId,
      userId: scope.userId,
      ...(query.unreadOnly ? { readAt: null } : {}),
    };
    const [records, total] = await this.database.$transaction([
      this.database.notification.findMany({
        where,
        select: notificationSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.database.notification.count({ where }),
    ]);
    return {
      items: records.map(toNotification),
      page: query.page,
      pageSize: query.pageSize,
      total,
    } satisfies Page<NotificationRecord>;
  }

  async markRead(scope: AuthenticatedScope, notificationId: string) {
    const existing = await this.database.notification.findFirst({
      where: {
        id: notificationId,
        organizationId: scope.organizationId,
        userId: scope.userId,
      },
      select: notificationSelect,
    });
    if (!existing) return null;
    if (existing.readAt) return toNotification(existing);
    const notification = await this.database.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
      select: notificationSelect,
    });
    return toNotification(notification);
  }

  async listEventsAfter(scope: AuthenticatedScope, cursor: NotificationCursor) {
    const records = await this.database.notification.findMany({
      where: {
        organizationId: scope.organizationId,
        userId: scope.userId,
        OR: [
          { createdAt: { gt: cursor.createdAt } },
          { createdAt: cursor.createdAt, id: { gt: cursor.id } },
        ],
      },
      select: notificationSelect,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: 100,
    });
    return records.map(toNotification);
  }
}
