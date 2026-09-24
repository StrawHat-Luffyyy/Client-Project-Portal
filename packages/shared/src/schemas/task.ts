import { z } from 'zod';

import { taskStatusSchema } from './domain.js';

const identifierSchema = z.string().trim().min(1).max(128);

export const taskAssigneeSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export const taskSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  requirementId: z.string(),
  title: z.string(),
  description: z.string(),
  status: taskStatusSchema,
  assigneeId: z.string().nullable(),
  estimateHours: z.number().positive().nullable(),
  dueDate: z.string().datetime().nullable(),
  position: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  assignee: taskAssigneeSchema.nullable(),
  requirement: z.object({
    id: z.string(),
    title: z.string(),
    project: z.object({ id: z.string(), name: z.string() }),
  }),
});

export const createTaskSchema = z.object({
  idempotencyKey: z.string().uuid(),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(5_000),
  assigneeId: identifierSchema.nullable().optional(),
  estimateHours: z.number().positive().max(9_999).nullable().optional(),
  dueDate: z.string().date().nullable().optional(),
});

export const updateTaskSchema = createTaskSchema
  .omit({ idempotencyKey: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one task field must be provided.',
  });

export const moveTaskSchema = z.object({ to: taskStatusSchema });

export const taskListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(100),
  projectId: identifierSchema.optional(),
  assigneeId: identifierSchema.optional(),
});

export type Task = z.infer<typeof taskSchema>;
export type TaskAssignee = z.infer<typeof taskAssigneeSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;
