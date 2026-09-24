import { Router } from 'express';

import type { IdentityRepository } from '../domain/auth.js';
import { createWorkspaceController } from '../controllers/workspace.controller.js';
import { requireAuthentication } from '../middleware/authentication.js';
import { requireRole } from '../middleware/authorization.js';
import { requireCsrf } from '../middleware/csrf.js';
import { requirementUpload } from '../middleware/requirement-upload.js';
import type { WorkspaceService } from '../services/workspace.service.js';

export function createWorkspaceRouters(
  service: WorkspaceService,
  identities: IdentityRepository,
) {
  const controller = createWorkspaceController(service);
  const authenticate = requireAuthentication(identities);
  const clients = Router();
  const projects = Router();
  const requirements = Router();

  clients.use(authenticate, requireRole('ADMIN', 'PM', 'CLIENT'));
  clients.get('/', controller.listClients);
  clients.post(
    '/',
    requireRole('ADMIN', 'PM'),
    requireCsrf,
    controller.createClient,
  );

  projects.use(authenticate, requireRole('ADMIN', 'PM', 'CLIENT'));
  projects.get('/', controller.listProjects);
  projects.post(
    '/',
    requireRole('ADMIN', 'PM'),
    requireCsrf,
    controller.createProject,
  );
  projects.get('/:id', controller.getProject);
  projects.get('/:id/requirements', controller.listRequirements);
  projects.post(
    '/:id/requirements',
    requireRole('CLIENT'),
    requireCsrf,
    requirementUpload.single('attachment'),
    controller.createRequirement,
  );

  requirements.use(authenticate, requireRole('ADMIN', 'PM', 'CLIENT'));
  requirements.get('/:id', controller.getRequirement);
  requirements.patch(
    '/:id',
    requireRole('CLIENT'),
    requireCsrf,
    controller.updateRequirement,
  );

  return { clients, projects, requirements };
}
