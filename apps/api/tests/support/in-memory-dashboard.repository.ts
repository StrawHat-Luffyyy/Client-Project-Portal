import type { RequirementStatus, Role } from '@client-portal/shared';

import type { AuthenticatedScope } from '../../src/domain/auth.js';
import type {
  DashboardRecord,
  DashboardRepository,
} from '../../src/domain/dashboard.js';

export interface DashboardFixtureProject {
  id: string;
  organizationId: string;
  clientId: string;
  clientName: string;
  name: string;
  requirements: Array<{
    id: string;
    title: string;
    status: RequirementStatus;
    tasks: Array<{
      assigneeId: string | null;
      status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
    }>;
  }>;
}

export interface DashboardFixtureActivity {
  id: string;
  organizationId: string;
  requirementId: string;
  action: string;
  visibility?: 'INTERNAL' | 'CLIENT_VISIBLE';
  createdAt: Date;
  actor: { id: string; name: string; role: Role };
}

const statuses = [
  'SUBMITTED',
  'IN_REVIEW',
  'NEEDS_INFO',
  'APPROVED',
  'IN_PROGRESS',
  'DELIVERED',
  'REJECTED',
] satisfies RequirementStatus[];

export class InMemoryDashboardRepository implements DashboardRepository {
  projects: DashboardFixtureProject[] = [];
  activities: DashboardFixtureActivity[] = [];

  getDashboard(scope: AuthenticatedScope): Promise<DashboardRecord> {
    const projects = this.projects
      .filter(
        (project) =>
          project.organizationId === scope.organizationId &&
          (scope.role !== 'CLIENT' || project.clientId === scope.clientId) &&
          (scope.role !== 'ENGINEER' ||
            project.requirements.some((requirement) =>
              requirement.tasks.some(
                (task) => task.assigneeId === scope.userId,
              ),
            )),
      )
      .map((project) => ({
        ...project,
        requirements: project.requirements
          .filter(
            (requirement) =>
              scope.role !== 'ENGINEER' ||
              requirement.tasks.some(
                (task) => task.assigneeId === scope.userId,
              ),
          )
          .map((requirement) => ({
            ...requirement,
            tasks: requirement.tasks.filter(
              (task) =>
                scope.role !== 'ENGINEER' || task.assigneeId === scope.userId,
            ),
          })),
      }));
    const requirements = projects.flatMap((project) =>
      project.requirements.map((requirement) => ({
        ...requirement,
        projectId: project.id,
        projectName: project.name,
      })),
    );
    const requirementIds = new Set(
      requirements.map((requirement) => requirement.id),
    );
    const tasks = requirements.flatMap((requirement) => requirement.tasks);

    return Promise.resolve({
      role: scope.role,
      totals: {
        projects: projects.length,
        requirements: requirements.length,
        tasks: tasks.length,
        doneTasks: tasks.filter((task) => task.status === 'DONE').length,
      },
      requirementStatuses: statuses.map((status) => ({
        status,
        count: requirements.filter(
          (requirement) => requirement.status === status,
        ).length,
      })),
      projectProgress: projects.map((project) => {
        const projectTasks = project.requirements.flatMap(
          (requirement) => requirement.tasks,
        );
        return {
          id: project.id,
          name: project.name,
          clientName: project.clientName,
          requirementCount: project.requirements.length,
          totalTasks: projectTasks.length,
          doneTasks: projectTasks.filter((task) => task.status === 'DONE')
            .length,
        };
      }),
      recentActivity: this.activities
        .filter(
          (activity) =>
            activity.organizationId === scope.organizationId &&
            requirementIds.has(activity.requirementId) &&
            !(scope.role === 'CLIENT' && activity.visibility === 'INTERNAL'),
        )
        .sort(
          (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
        )
        .slice(0, 8)
        .map((activity) => {
          const requirement = requirements.find(
            (item) => item.id === activity.requirementId,
          )!;
          return {
            id: activity.id,
            requirementId: activity.requirementId,
            requirementTitle: requirement.title,
            projectName: requirement.projectName,
            action: activity.action,
            createdAt: activity.createdAt,
            actor: activity.actor,
          };
        }),
    });
  }
}
