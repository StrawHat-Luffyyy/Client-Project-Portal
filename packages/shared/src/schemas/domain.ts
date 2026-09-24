import { z } from 'zod';

export const roleSchema = z.enum(['ADMIN', 'PM', 'ENGINEER', 'CLIENT']);
export const requirementPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const requirementStatusSchema = z.enum([
  'SUBMITTED',
  'IN_REVIEW',
  'NEEDS_INFO',
  'APPROVED',
  'IN_PROGRESS',
  'DELIVERED',
  'REJECTED',
]);
export const taskStatusSchema = z.enum([
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE',
]);
export const commentVisibilitySchema = z.enum(['INTERNAL', 'CLIENT_VISIBLE']);

export type Role = z.infer<typeof roleSchema>;
export type RequirementPriority = z.infer<typeof requirementPrioritySchema>;
export type RequirementStatus = z.infer<typeof requirementStatusSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type CommentVisibility = z.infer<typeof commentVisibilitySchema>;
