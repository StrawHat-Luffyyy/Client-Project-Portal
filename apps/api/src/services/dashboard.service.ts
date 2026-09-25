import type { AuthenticatedScope } from '../domain/auth.js';
import type { DashboardRepository } from '../domain/dashboard.js';

export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}

  async getDashboard(scope: AuthenticatedScope) {
    const dashboard = await this.repository.getDashboard(scope);
    return {
      ...dashboard,
      recentActivity: dashboard.recentActivity.map((activity) => ({
        ...activity,
        createdAt: activity.createdAt.toISOString(),
      })),
    };
  }
}
