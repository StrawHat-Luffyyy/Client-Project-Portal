import type {
  NotificationListQuery,
  NotificationType,
} from '@client-portal/shared';

import type { AuthenticatedScope } from './auth.js';
import type { Page } from './workspace.js';

export interface NotificationRecord {
  id: string;
  organizationId: string;
  userId: string;
  type: NotificationType;
  entityType: 'REQUIREMENT';
  entityId: string;
  readAt: Date | null;
  createdAt: Date;
}

export interface NotificationCursor {
  createdAt: Date;
  id: string;
}

export interface NotificationRepository {
  listNotifications(
    scope: AuthenticatedScope,
    query: NotificationListQuery,
  ): Promise<Page<NotificationRecord>>;
  markRead(
    scope: AuthenticatedScope,
    notificationId: string,
  ): Promise<NotificationRecord | null>;
  listEventsAfter(
    scope: AuthenticatedScope,
    cursor: NotificationCursor,
  ): Promise<NotificationRecord[]>;
}
