import type {
  CommentAuthor,
  CreateCommentInput,
  PaginationQuery,
} from '@client-portal/shared';

import type { AuthenticatedScope } from '../../src/domain/auth.js';
import type {
  CommentRecord,
  CommentRepository,
  CommentTarget,
} from '../../src/domain/comment.js';
import { AppError } from '../../src/domain/errors.js';
import type { Page } from '../../src/domain/workspace.js';
import type { InMemoryTaskRepository } from './in-memory-task.repository.js';
import type { InMemoryWorkspaceRepository } from './in-memory-workspace.repository.js';

function page<T>(items: T[], query: PaginationQuery): Page<T> {
  const start = (query.page - 1) * query.pageSize;
  return {
    items: items.slice(start, start + query.pageSize),
    page: query.page,
    pageSize: query.pageSize,
    total: items.length,
  };
}

export class InMemoryCommentRepository implements CommentRepository {
  comments: CommentRecord[] = [];
  authors = new Map<string, CommentAuthor>();

  constructor(
    private readonly workspace: InMemoryWorkspaceRepository,
    private readonly tasks: InMemoryTaskRepository,
  ) {}

  private async resolveTarget(
    scope: AuthenticatedScope,
    target: CommentTarget,
  ) {
    if (target.type === 'REQUIREMENT') {
      const requirement = await this.workspace.findRequirement(
        scope,
        target.id,
      );
      if (!requirement) return null;
      if (
        scope.role === 'ENGINEER' &&
        !this.tasks.tasks.some(
          (task) =>
            task.requirementId === target.id &&
            task.assigneeId === scope.userId,
        )
      ) {
        return null;
      }
      return { requirementId: target.id };
    }

    const task = this.tasks.tasks.find(
      (item) =>
        item.id === target.id && item.organizationId === scope.organizationId,
    );
    if (!task) return null;
    if (scope.role === 'ENGINEER' && task.assigneeId !== scope.userId) {
      return null;
    }
    if (
      scope.role === 'CLIENT' &&
      !(await this.workspace.findRequirement(scope, task.requirementId))
    ) {
      return null;
    }
    return { requirementId: task.requirementId };
  }

  async listComments(
    scope: AuthenticatedScope,
    target: CommentTarget,
    pagination: PaginationQuery,
  ) {
    if (!(await this.resolveTarget(scope, target))) return null;
    const comments = this.comments.filter(
      (comment) =>
        comment.organizationId === scope.organizationId &&
        (target.type === 'REQUIREMENT'
          ? comment.requirementId === target.id && comment.taskId === null
          : comment.taskId === target.id && comment.requirementId === null) &&
        (scope.role !== 'CLIENT' || comment.visibility === 'CLIENT_VISIBLE'),
    );
    return page(comments, pagination);
  }

  async createComment(
    scope: AuthenticatedScope,
    target: CommentTarget,
    input: CreateCommentInput,
  ) {
    const resolved = await this.resolveTarget(scope, target);
    if (!resolved) return null;
    if (input.parentId) {
      const parent = this.comments.find(
        (comment) =>
          comment.id === input.parentId &&
          comment.organizationId === scope.organizationId &&
          (target.type === 'REQUIREMENT'
            ? comment.requirementId === target.id && comment.taskId === null
            : comment.taskId === target.id && comment.requirementId === null) &&
          (scope.role !== 'CLIENT' || comment.visibility === 'CLIENT_VISIBLE'),
      );
      if (!parent) {
        throw new AppError(
          404,
          'COMMENT_PARENT_NOT_FOUND',
          'Parent comment was not found.',
        );
      }
      if (parent.parentId) {
        throw new AppError(
          409,
          'COMMENT_REPLY_DEPTH_EXCEEDED',
          'Comments support one reply level.',
        );
      }
      if (parent.visibility !== input.visibility) {
        throw new AppError(
          409,
          'COMMENT_VISIBILITY_MISMATCH',
          'A reply must use the same visibility as its parent.',
        );
      }
    }
    const author = this.authors.get(scope.userId) ?? {
      id: scope.userId,
      name: scope.userId,
      role: scope.role,
    };
    const comment: CommentRecord = {
      id: `comment-${this.comments.length + 1}`,
      organizationId: scope.organizationId,
      authorId: scope.userId,
      requirementId: target.type === 'REQUIREMENT' ? target.id : null,
      taskId: target.type === 'TASK' ? target.id : null,
      parentId: input.parentId ?? null,
      body: input.body,
      visibility: input.visibility,
      createdAt: new Date(),
      author,
    };
    this.comments.push(comment);
    this.workspace.activities.push({
      id: `activity-${this.workspace.activities.length + 1}`,
      organizationId: scope.organizationId,
      actorId: scope.userId,
      entityType: 'REQUIREMENT',
      entityId: resolved.requirementId,
      action: 'COMMENT_CREATED',
      metadata: {
        commentId: comment.id,
        targetType: target.type,
        targetId: target.id,
        visibility: comment.visibility,
        parentId: comment.parentId,
      },
      createdAt: new Date(),
      actor: author,
    });
    return comment;
  }
}
