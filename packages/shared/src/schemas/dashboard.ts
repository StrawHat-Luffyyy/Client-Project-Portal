import { z } from 'zod';

import { requirementStatusSchema, roleSchema } from './domain.js';

export const dashboardStatusCountSchema = z.object({
  status: requirementStatusSchema,
  count: z.number().int().nonnegative(),
});

export const dashboardProjectProgressSchema = z.object({
  id: z.string(),
  name: z.string(),
  clientName: z.string(),
  requirementCount: z.number().int().nonnegative(),
  totalTasks: z.number().int().nonnegative(),
  doneTasks: z.number().int().nonnegative(),
});

export const dashboardActivitySchema = z.object({
  id: z.string(),
  requirementId: z.string(),
  requirementTitle: z.string(),
  projectName: z.string(),
  action: z.string(),
  createdAt: z.string().datetime(),
  actor: z.object({
    id: z.string(),
    name: z.string(),
    role: roleSchema,
  }),
});

export const dashboardSchema = z.object({
  role: roleSchema,
  totals: z.object({
    projects: z.number().int().nonnegative(),
    requirements: z.number().int().nonnegative(),
    tasks: z.number().int().nonnegative(),
    doneTasks: z.number().int().nonnegative(),
  }),
  requirementStatuses: z.array(dashboardStatusCountSchema),
  projectProgress: z.array(dashboardProjectProgressSchema),
  recentActivity: z.array(dashboardActivitySchema),
});

export type Dashboard = z.infer<typeof dashboardSchema>;
export type DashboardProjectProgress = z.infer<
  typeof dashboardProjectProgressSchema
>;
export type DashboardActivity = z.infer<typeof dashboardActivitySchema>;
