import type { NotificationListQuery } from '@client-portal/shared';

import type { AuthenticatedScope } from '../domain/auth.js';
import { AppError } from '../domain/errors.js';
import type {
  NotificationCursor,
  NotificationRecord,
  NotificationRepository,
} from '../domain/notification.js';

export class NotificationService {
  constructor(private readonly repository: NotificationRepository) {}

  private href(scope: AuthenticatedScope, notification: NotificationRecord) {
    return scope.role === 'ENGINEER'
      ? '/board'
      : `/requirements/${notification.entityId}`;
  }

  present(scope: AuthenticatedScope, notification: NotificationRecord) {
    return {
      ...notification,
      href: this.href(scope, notification),
    };
  }

  async listNotifications(
    scope: AuthenticatedScope,
    query: NotificationListQuery,
  ) {
    const page = await this.repository.listNotifications(scope, query);
    return {
      ...page,
      items: page.items.map((item) => this.present(scope, item)),
    };
  }

  async markRead(scope: AuthenticatedScope, notificationId: string) {
    const notification = await this.repository.markRead(scope, notificationId);
    if (!notification) {
      throw new AppError(
        404,
        'NOTIFICATION_NOT_FOUND',
        'Notification was not found.',
      );
    }
    return this.present(scope, notification);
  }

  async listEventsAfter(scope: AuthenticatedScope, cursor: NotificationCursor) {
    const notifications = await this.repository.listEventsAfter(scope, cursor);
    return notifications.map((item) => this.present(scope, item));
  }
}
