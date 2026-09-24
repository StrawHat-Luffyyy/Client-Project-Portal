import type {
  CommentAuthor,
  CommentVisibility,
  CreateCommentInput,
  PaginationQuery,
} from '@client-portal/shared';

import type { AuthenticatedScope } from './auth.js';
import type { Page } from './workspace.js';

export type CommentTarget =
  { type: 'REQUIREMENT'; id: string } | { type: 'TASK'; id: string };

export interface CommentRecord {
  id: string;
  organizationId: string;
  authorId: string;
  requirementId: string | null;
  taskId: string | null;
  parentId: string | null;
  body: string;
  visibility: CommentVisibility;
  createdAt: Date;
  author: CommentAuthor;
}

export interface CommentRepository {
  listComments(
    scope: AuthenticatedScope,
    target: CommentTarget,
    pagination: PaginationQuery,
  ): Promise<Page<CommentRecord> | null>;
  createComment(
    scope: AuthenticatedScope,
    target: CommentTarget,
    input: CreateCommentInput,
  ): Promise<CommentRecord | null>;
}
