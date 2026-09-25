import type { Prisma, PrismaClient } from '@prisma/client';

import type {
  CreateCommentInput,
  PaginationQuery,
} from '@client-portal/shared';

import type { AuthenticatedScope } from '../domain/auth.js';
import type {
  CommentRecord,
  CommentRepository,
  CommentTarget,
} from '../domain/comment.js';
import { AppError } from '../domain/errors.js';
import type { Page } from '../domain/workspace.js';
import { prisma } from '../lib/prisma.js';
import { createRequirementNotifications } from './notification-recipient.js';

const commentSelect = {
  id: true,
  organizationId: true,
  authorId: true,
  requirementId: true,
  taskId: true,
  parentId: true,
  body: true,
  visibility: true,
  createdAt: true,
  author: { select: { id: true, name: true, role: true } },
} satisfies Prisma.CommentSelect;

type SelectedComment = Prisma.CommentGetPayload<{
  select: typeof commentSelect;
}>;

function toComment(comment: SelectedComment): CommentRecord {
  return comment;
}

function targetFilter(target: CommentTarget): Prisma.CommentWhereInput {
  return target.type === 'REQUIREMENT'
    ? { requirementId: target.id, taskId: null }
    : { taskId: target.id, requirementId: null };
}

function pageOf<T>(
  items: T[],
  pagination: PaginationQuery,
  total: number,
): Page<T> {
  return { ...pagination, items, total };
}

export class PrismaCommentRepository implements CommentRepository {
  constructor(private readonly database: PrismaClient = prisma) {}

  private async resolveTarget(
    scope: AuthenticatedScope,
    target: CommentTarget,
  ): Promise<{ requirementId: string; engineerIds?: string[] } | null> {
    if (target.type === 'REQUIREMENT') {
      const requirement = await this.database.requirement.findFirst({
        where: {
          id: target.id,
          organizationId: scope.organizationId,
          ...(scope.role === 'CLIENT'
            ? {
                project: {
                  clientId: scope.clientId ?? '__unassigned_client__',
                },
              }
            : scope.role === 'ENGINEER'
              ? { tasks: { some: { assigneeId: scope.userId } } }
              : {}),
        },
        select: { id: true },
      });
      return requirement ? { requirementId: requirement.id } : null;
    }

    const task = await this.database.task.findFirst({
      where: {
        id: target.id,
        organizationId: scope.organizationId,
        ...(scope.role === 'CLIENT'
          ? {
              requirement: {
                project: {
                  clientId: scope.clientId ?? '__unassigned_client__',
                },
              },
            }
          : scope.role === 'ENGINEER'
            ? { assigneeId: scope.userId }
            : {}),
      },
      select: { requirementId: true, assigneeId: true },
    });
    return task
      ? {
          requirementId: task.requirementId,
          engineerIds: task.assigneeId ? [task.assigneeId] : [],
        }
      : null;
  }

  async listComments(
    scope: AuthenticatedScope,
    target: CommentTarget,
    pagination: PaginationQuery,
  ) {
    if (!(await this.resolveTarget(scope, target))) return null;
    const where: Prisma.CommentWhereInput = {
      organizationId: scope.organizationId,
      ...targetFilter(target),
      ...(scope.role === 'CLIENT' ? { visibility: 'CLIENT_VISIBLE' } : {}),
    };
    const [comments, total] = await this.database.$transaction([
      this.database.comment.findMany({
        where,
        select: commentSelect,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      this.database.comment.count({ where }),
    ]);
    return pageOf(comments.map(toComment), pagination, total);
  }

  async createComment(
    scope: AuthenticatedScope,
    target: CommentTarget,
    input: CreateCommentInput,
  ) {
    const resolved = await this.resolveTarget(scope, target);
    if (!resolved) return null;

    return this.database.$transaction(async (transaction) => {
      if (input.parentId) {
        const parent = await transaction.comment.findFirst({
          where: {
            id: input.parentId,
            organizationId: scope.organizationId,
            ...targetFilter(target),
            ...(scope.role === 'CLIENT'
              ? { visibility: 'CLIENT_VISIBLE' }
              : {}),
          },
          select: { parentId: true, visibility: true },
        });
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

      const comment = await transaction.comment.create({
        data: {
          organizationId: scope.organizationId,
          authorId: scope.userId,
          requirementId: target.type === 'REQUIREMENT' ? target.id : null,
          taskId: target.type === 'TASK' ? target.id : null,
          parentId: input.parentId ?? null,
          body: input.body,
          visibility: input.visibility,
        },
        select: commentSelect,
      });
      await transaction.activityLog.create({
        data: {
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
        },
      });
      await createRequirementNotifications(transaction, {
        organizationId: scope.organizationId,
        actorId: scope.userId,
        requirementId: resolved.requirementId,
        type: 'COMMENT_CREATED',
        includeClient: comment.visibility === 'CLIENT_VISIBLE',
        engineerIds: resolved.engineerIds,
      });
      return toComment(comment);
    });
  }
}
