import { Router } from 'express';

import type { IdentityRepository } from '../domain/auth.js';
import { createInviteController } from '../controllers/invite.controller.js';
import { requireAuthentication } from '../middleware/authentication.js';
import { requireRole } from '../middleware/authorization.js';
import { requireCsrf } from '../middleware/csrf.js';
import { createAuthRateLimit } from '../middleware/rate-limit.js';
import type { InviteService } from '../services/invite.service.js';

export function createInviteRouter(
  inviteService: InviteService,
  identities: IdentityRepository,
  webOrigin: string,
) {
  const router = Router();
  const controller = createInviteController(inviteService, webOrigin);

  router.post(
    '/',
    requireAuthentication(identities),
    requireRole('ADMIN'),
    requireCsrf,
    controller.create,
  );
  router.post(
    '/:token/accept',
    createAuthRateLimit(),
    requireCsrf,
    controller.accept,
  );

  return router;
}
