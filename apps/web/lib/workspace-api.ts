import {
  authUserSchema,
  clientSchema,
  paginationMetaSchema,
  projectSchema,
  requirementSchema,
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
