import type {
  DashboardActivity,
  DashboardProjectProgress,
  RequirementStatus,
  Role,
} from '@client-portal/shared';

import type { AuthenticatedScope } from './auth.js';

export interface DashboardRecord {
  role: Role;
  totals: {
    projects: number;
    requirements: number;
    tasks: number;
    doneTasks: number;
  };
  requirementStatuses: Array<{
    status: RequirementStatus;
    count: number;
  }>;
  projectProgress: DashboardProjectProgress[];
  recentActivity: Array<
    Omit<DashboardActivity, 'createdAt'> & { createdAt: Date }
  >;
}

export interface DashboardRepository {
  getDashboard(scope: AuthenticatedScope): Promise<DashboardRecord>;
}
