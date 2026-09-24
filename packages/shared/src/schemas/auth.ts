import { z } from 'zod';

import { roleSchema } from './domain.js';

const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters.')
  .max(128, 'Password must be at most 128 characters.')
  .regex(/[a-z]/, 'Password must include a lowercase letter.')
  .regex(/[A-Z]/, 'Password must include an uppercase letter.')
  .regex(/[0-9]/, 'Password must include a number.');

export const registerOrganizationSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

export const createInviteSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    role: roleSchema.exclude(['ADMIN']),
    clientId: z.string().trim().min(1).max(100).optional(),
  })
  .superRefine((value, context) => {
    if (value.role === 'CLIENT' && !value.clientId) {
      context.addIssue({
        code: 'custom',
        message: 'clientId is required for CLIENT invitations.',
        path: ['clientId'],
      });
    }

    if (value.role !== 'CLIENT' && value.clientId) {
      context.addIssue({
        code: 'custom',
        message: 'clientId is only valid for CLIENT invitations.',
        path: ['clientId'],
      });
    }
  });

export const acceptInviteSchema = z.object({
  name: z.string().trim().min(2).max(100),
  password: passwordSchema,
});

export const authUserSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  clientId: z.string().nullable(),
  name: z.string(),
  email: z.string().email(),
  role: roleSchema,
});

export type RegisterOrganizationInput = z.infer<
  typeof registerOrganizationSchema
>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateInviteInput = z.infer<typeof createInviteSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
