import { Router } from 'express';

import { createCommentController } from '../controllers/comment.controller.js';
import type { IdentityRepository } from '../domain/auth.js';
import { requireAuthentication } from '../middleware/authentication.js';
import { requireRole } from '../middleware/authorization.js';
import { requireCsrf } from '../middleware/csrf.js';
import type { CommentService } from '../services/comment.service.js';

export function createCommentRouters(
  service: CommentService,
  identities: IdentityRepository,
) {
  const authenticate = requireAuthentication(identities);

  function routerFor(target: 'REQUIREMENT' | 'TASK') {
    const router = Router();
    const controller = createCommentController(service, target);
    const authorize = [
      authenticate,
      requireRole('ADMIN', 'PM', 'ENGINEER', 'CLIENT'),
    ] as const;
    router.get('/:id/comments', ...authorize, controller.listComments);
    router.post(
      '/:id/comments',
      ...authorize,
      requireCsrf,
      controller.createComment,
    );
    return router;
  }

  return {
    requirementComments: routerFor('REQUIREMENT'),
    taskComments: routerFor('TASK'),
  };
}
