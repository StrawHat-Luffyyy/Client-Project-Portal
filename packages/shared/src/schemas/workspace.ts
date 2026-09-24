import { z } from 'zod';

import {
  requirementPrioritySchema,
  requirementStatusSchema,
} from './domain.js';

const identifierSchema = z.string().trim().min(1).max(128);

export const clientSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  contactEmail: z.string().email(),
  createdAt: z.string().datetime(),
});

export const createClientSchema = z.object({
  name: z.string().trim().min(2).max(100),
  contactEmail: z.string().trim().toLowerCase().email().max(254),
});

export const projectSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  clientId: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string().datetime(),
  client: z.object({ id: z.string(), name: z.string() }),
  requirementCount: z.number().int().nonnegative(),
});

export const createProjectSchema = z.object({
  clientId: identifierSchema,
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(2_000),
});

export const attachmentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  size: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});

export const requirementSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  projectId: z.string(),
  createdById: z.string(),
  title: z.string(),
  description: z.string(),
  priority: requirementPrioritySchema,
  status: requirementStatusSchema,
  rejectionReason: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.object({ id: z.string(), name: z.string() }),
  attachments: z.array(attachmentSchema),
});

export const createRequirementSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(20).max(10_000),
  priority: requirementPrioritySchema,
});

export const updateRequirementSchema = createRequirementSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one requirement field must be provided.',
  });

export const projectListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  clientId: identifierSchema.optional(),
});

export const requirementListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: requirementStatusSchema.optional(),
});

export type Client = z.infer<typeof clientSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type Project = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type Requirement = z.infer<typeof requirementSchema>;
export type CreateRequirementInput = z.infer<typeof createRequirementSchema>;
export type UpdateRequirementInput = z.infer<typeof updateRequirementSchema>;
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;
export type RequirementListQuery = z.infer<typeof requirementListQuerySchema>;
