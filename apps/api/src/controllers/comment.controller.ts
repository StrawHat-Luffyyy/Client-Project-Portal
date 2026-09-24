import {
  createCommentSchema,
  paginationQuerySchema,
} from '@client-portal/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';

import type { CommentRecord, CommentTarget } from '../domain/comment.js';
import type { Page } from '../domain/workspace.js';
import type { CommentService } from '../services/comment.service.js';

const idParamsSchema = z.object({ id: z.string().trim().min(1).max(128) });

function pagination<T>(page: Page<T>) {
  return {
    page: page.page,
    pageSize: page.pageSize,
    total: page.total,
    totalPages: Math.ceil(page.total / page.pageSize),
  };
}

function commentJson(comment: CommentRecord) {
  return { ...comment, createdAt: comment.createdAt.toISOString() };
}

export function createCommentController(
  service: CommentService,
  targetType: CommentTarget['type'],
) {
  function target(request: Parameters<RequestHandler>[0]): CommentTarget {
    const { id } = idParamsSchema.parse(request.params);
    return { type: targetType, id };
  }

  const listComments: RequestHandler = async (request, response) => {
    const page = await service.listComments(
      request.auth!,
      target(request),
      paginationQuerySchema.parse(request.query),
    );
    response.json({
      data: page.items.map(commentJson),
      pagination: pagination(page),
    });
  };

  const createComment: RequestHandler = async (request, response) => {
    const comment = await service.createComment(
      request.auth!,
      target(request),
      createCommentSchema.parse(request.body),
    );
    response.status(201).json({ data: commentJson(comment) });
  };

  return { createComment, listComments };
}
