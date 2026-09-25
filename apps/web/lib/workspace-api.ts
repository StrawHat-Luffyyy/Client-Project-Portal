import {
  authUserSchema,
  clientSchema,
  commentSchema,
  dashboardSchema,
  notificationSchema,
  paginationMetaSchema,
  projectSchema,
  requirementActivitySchema,
  requirementSchema,
  taskAssigneeSchema,
  taskSchema,
} from '@client-portal/shared';
import { z } from 'zod';

export const meResponseSchema = z.object({
  data: z.object({ user: authUserSchema }),
});

export const clientsResponseSchema = z.object({
  data: z.array(clientSchema),
  pagination: paginationMetaSchema,
});

export const clientResponseSchema = z.object({ data: clientSchema });

export const projectsResponseSchema = z.object({
  data: z.array(projectSchema),
  pagination: paginationMetaSchema,
});

export const projectResponseSchema = z.object({ data: projectSchema });

export const requirementsResponseSchema = z.object({
  data: z.array(requirementSchema),
  pagination: paginationMetaSchema,
});

export const requirementResponseSchema = z.object({ data: requirementSchema });

export const requirementActivityResponseSchema = z.object({
  data: z.array(requirementActivitySchema),
  pagination: paginationMetaSchema,
});

export const tasksResponseSchema = z.object({
  data: z.array(taskSchema),
  pagination: paginationMetaSchema,
});

export const taskResponseSchema = z.object({ data: taskSchema });

export const taskAssigneesResponseSchema = z.object({
  data: z.array(taskAssigneeSchema),
});

export const commentsResponseSchema = z.object({
  data: z.array(commentSchema),
  pagination: paginationMetaSchema,
});

export const commentResponseSchema = z.object({ data: commentSchema });

export const notificationsResponseSchema = z.object({
  data: z.array(notificationSchema),
  pagination: paginationMetaSchema,
});

export const notificationResponseSchema = z.object({
  data: notificationSchema,
});

export const dashboardResponseSchema = z.object({ data: dashboardSchema });
