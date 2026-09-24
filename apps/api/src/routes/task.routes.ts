import { Router } from 'express';

import { createTaskController } from '../controllers/task.controller.js';
import type { IdentityRepository } from '../domain/auth.js';
import { requireAuthentication } from '../middleware/authentication.js';
import { requireRole } from '../middleware/authorization.js';
import { requireCsrf } from '../middleware/csrf.js';
import type { TaskService } from '../services/task.service.js';

export function createTaskRouters(
  service: TaskService,
  identities: IdentityRepository,
) {
  const controller = createTaskController(service);
  const authenticate = requireAuthentication(identities);
  const requirementTasks = Router();
  const tasks = Router();

  requirementTasks.use(authenticate, requireRole('ADMIN', 'PM', 'CLIENT'));
  requirementTasks.get('/:id/tasks', controller.listRequirementTasks);
  requirementTasks.post(
    '/:id/tasks',
    requireRole('PM'),
    requireCsrf,
    controller.createTask,
  );

  tasks.use(authenticate, requireRole('PM', 'ENGINEER'));
  tasks.get('/', controller.listBoardTasks);
  tasks.get('/assignees', requireRole('PM'), controller.listAssignees);
  tasks.patch('/:id', requireRole('PM'), requireCsrf, controller.updateTask);
  tasks.post('/:id/move', requireCsrf, controller.moveTask);

  return { requirementTasks, tasks };
}
