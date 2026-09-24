import { z } from 'zod';

import { commentVisibilitySchema, roleSchema } from './domain.js';

export const commentAuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: roleSchema,
});

export const commentSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  authorId: z.string(),
  requirementId: z.string().nullable(),
  taskId: z.string().nullable(),
  parentId: z.string().nullable(),
  body: z.string(),
  visibility: commentVisibilitySchema,
  createdAt: z.string().datetime(),
  author: commentAuthorSchema,
});

export const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(5_000),
  visibility: commentVisibilitySchema,
  parentId: z.string().trim().min(1).max(128).nullable().optional(),
});

export type Comment = z.infer<typeof commentSchema>;
export type CommentAuthor = z.infer<typeof commentAuthorSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
