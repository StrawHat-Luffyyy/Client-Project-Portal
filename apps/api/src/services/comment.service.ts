import type {
  CreateCommentInput,
  PaginationQuery,
} from '@client-portal/shared';

import type { AuthenticatedScope } from '../domain/auth.js';
import type { CommentRepository, CommentTarget } from '../domain/comment.js';
import { AppError } from '../domain/errors.js';

export class CommentService {
  constructor(private readonly repository: CommentRepository) {}

  async listComments(
    scope: AuthenticatedScope,
    target: CommentTarget,
    pagination: PaginationQuery,
  ) {
    const comments = await this.repository.listComments(
      scope,
      target,
      pagination,
    );
    if (!comments) {
      throw new AppError(
        404,
        'COMMENT_TARGET_NOT_FOUND',
        'Comment target was not found.',
      );
    }
    return comments;
  }

  async createComment(
    scope: AuthenticatedScope,
    target: CommentTarget,
    input: CreateCommentInput,
  ) {
    if (scope.role === 'CLIENT' && input.visibility === 'INTERNAL') {
      throw new AppError(
        403,
        'COMMENT_VISIBILITY_FORBIDDEN',
        'Clients can only create client-visible comments.',
      );
    }
    const comment = await this.repository.createComment(scope, target, input);
    if (!comment) {
      throw new AppError(
        404,
        'COMMENT_TARGET_NOT_FOUND',
        'Comment target was not found.',
      );
    }
    return comment;
  }
}
