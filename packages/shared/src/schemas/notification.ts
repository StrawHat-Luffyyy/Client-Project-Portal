import { z } from 'zod';

export const notificationTypeSchema = z.enum([
  'REQUIREMENT_STATUS_CHANGED',
  'TASK_STATUS_CHANGED',
  'COMMENT_CREATED',
]);

export const notificationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  type: notificationTypeSchema,
  entityType: z.literal('REQUIREMENT'),
  entityId: z.string(),
  readAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  href: z.string(),
});

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
});

export const notificationEventSchema = z.object({
  notification: notificationSchema,
});

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;
export type NotificationEvent = z.infer<typeof notificationEventSchema>;
