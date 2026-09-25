import { Router } from 'express';

import { createNotificationController } from '../controllers/notification.controller.js';
import type { IdentityRepository } from '../domain/auth.js';
import { requireAuthentication } from '../middleware/authentication.js';
import { requireCsrf } from '../middleware/csrf.js';
import type { NotificationService } from '../services/notification.service.js';

export function createNotificationRouters(
  service: NotificationService,
  identities: IdentityRepository,
) {
  const authenticate = requireAuthentication(identities);
  const controller = createNotificationController(service);
  const notifications = Router();
  const events = Router();

  notifications.use(authenticate);
  notifications.get('/', controller.listNotifications);
  notifications.post('/:id/read', requireCsrf, controller.markRead);
  events.get('/', authenticate, controller.events);

  return { events, notifications };
}
