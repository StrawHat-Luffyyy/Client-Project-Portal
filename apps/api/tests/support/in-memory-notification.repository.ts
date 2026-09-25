import type { NotificationListQuery } from '@client-portal/shared';

import type { AuthenticatedScope } from '../../src/domain/auth.js';
import type {
  NotificationCursor,
  NotificationRecord,
  NotificationRepository,
} from '../../src/domain/notification.js';

export class InMemoryNotificationRepository implements NotificationRepository {
  notifications: NotificationRecord[] = [];

  listNotifications(scope: AuthenticatedScope, query: NotificationListQuery) {
    const visible = this.notifications
      .filter(
        (notification) =>
          notification.organizationId === scope.organizationId &&
          notification.userId === scope.userId &&
          (!query.unreadOnly || !notification.readAt),
      )
      .sort(
        (left, right) =>
          right.createdAt.getTime() - left.createdAt.getTime() ||
          right.id.localeCompare(left.id),
      );
    const start = (query.page - 1) * query.pageSize;
    return Promise.resolve({
      items: visible.slice(start, start + query.pageSize),
      page: query.page,
      pageSize: query.pageSize,
      total: visible.length,
    });
  }

  markRead(scope: AuthenticatedScope, notificationId: string) {
    const notification = this.notifications.find(
      (item) =>
        item.id === notificationId &&
        item.organizationId === scope.organizationId &&
        item.userId === scope.userId,
    );
    if (!notification) return Promise.resolve(null);
    if (notification.readAt) return Promise.resolve(notification);
    notification.readAt = new Date();
    return Promise.resolve(notification);
  }

  listEventsAfter(scope: AuthenticatedScope, cursor: NotificationCursor) {
    return Promise.resolve(
      this.notifications
        .filter(
          (notification) =>
            notification.organizationId === scope.organizationId &&
            notification.userId === scope.userId &&
            (notification.createdAt > cursor.createdAt ||
              (notification.createdAt.getTime() ===
                cursor.createdAt.getTime() &&
                notification.id > cursor.id)),
        )
        .sort(
          (left, right) =>
            left.createdAt.getTime() - right.createdAt.getTime() ||
            left.id.localeCompare(right.id),
        ),
    );
  }
}
