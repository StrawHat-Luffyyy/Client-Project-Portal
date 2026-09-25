import { Router } from 'express';

import { createDashboardController } from '../controllers/dashboard.controller.js';
import type { IdentityRepository } from '../domain/auth.js';
import { requireAuthentication } from '../middleware/authentication.js';
import type { DashboardService } from '../services/dashboard.service.js';

export function createDashboardRouter(
  service: DashboardService,
  identities: IdentityRepository,
) {
  const router = Router();
  const controller = createDashboardController(service);

  router.use(requireAuthentication(identities));
  router.get('/', controller.getDashboard);

  return router;
}
