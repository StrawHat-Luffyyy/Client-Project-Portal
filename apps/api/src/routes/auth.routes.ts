import { Router } from 'express';

import type { IdentityRepository } from '../domain/auth.js';
import { createAuthController } from '../controllers/auth.controller.js';
import { requireAuthentication } from '../middleware/authentication.js';
import { issueCsrfToken, requireCsrf } from '../middleware/csrf.js';
import { createAuthRateLimit } from '../middleware/rate-limit.js';
import type { AuthService } from '../services/auth.service.js';

export function createAuthRouter(
  authService: AuthService,
  identities: IdentityRepository,
) {
  const router = Router();
  const controller = createAuthController(authService);
  const authRateLimit = createAuthRateLimit();

  router.get('/csrf', issueCsrfToken);
  router.post(
    '/register-org',
    authRateLimit,
    requireCsrf,
    controller.registerOrganization,
  );
  router.post('/login', authRateLimit, requireCsrf, controller.login);
  router.post('/logout', requireCsrf, controller.logout);
  router.get('/me', requireAuthentication(identities), controller.me);

  return router;
}
