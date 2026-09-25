import type { Prisma, PrismaClient } from '@prisma/client';

import type { RequirementStatus } from '@client-portal/shared';

import type { AuthenticatedScope } from '../domain/auth.js';
import type {
  DashboardRecord,
  DashboardRepository,
} from '../domain/dashboard.js';
import { prisma } from '../lib/prisma.js';

const requirementStatuses = [
  'SUBMITTED',
  'IN_REVIEW',
  'NEEDS_INFO',
  'APPROVED',
  'IN_PROGRESS',
  'DELIVERED',
  'REJECTED',
] satisfies RequirementStatus[];

export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly database: PrismaClient = prisma) {}

  async getDashboard(scope: AuthenticatedScope): Promise<DashboardRecord> {
    const engineerTaskWhere =
      scope.role === 'ENGINEER' ? { assigneeId: scope.userId } : undefined;
    const projectWhere: Prisma.ProjectWhereInput = {
      organizationId: scope.organizationId,
      ...(scope.role === 'CLIENT'
        ? { clientId: scope.clientId ?? '__missing-client-scope__' }
        : {}),
      ...(scope.role === 'ENGINEER'
        ? {
            requirements: {
              some: { tasks: { some: { assigneeId: scope.userId } } },
            },
          }
        : {}),
    };
    const projects = await this.database.project.findMany({
      where: projectWhere,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        name: true,
        client: { select: { name: true } },
        requirements: {
          ...(scope.role === 'ENGINEER'
            ? { where: { tasks: { some: { assigneeId: scope.userId } } } }
            : {}),
          select: {
            id: true,
            title: true,
            status: true,
            tasks: {
              ...(engineerTaskWhere ? { where: engineerTaskWhere } : {}),
              select: { status: true },
            },
          },
        },
      },
    });

    const requirements = projects.flatMap((project) =>
      project.requirements.map((requirement) => ({
        ...requirement,
        projectId: project.id,
        projectName: project.name,
      })),
    );
    const requirementIds = requirements.map((requirement) => requirement.id);
    const recentActivity =
      requirementIds.length === 0
        ? []
        : await this.database.activityLog.findMany({
            where: {
              organizationId: scope.organizationId,
              entityType: 'REQUIREMENT',
              entityId: { in: requirementIds },
              ...(scope.role === 'CLIENT'
                ? {
                    NOT: {
                      action: 'COMMENT_CREATED',
                      metadata: {
                        path: ['visibility'],
                        equals: 'INTERNAL',
                      },
                    },
                  }
                : {}),
            },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: 8,
            select: {
              id: true,
              entityId: true,
              action: true,
              createdAt: true,
              actor: { select: { id: true, name: true, role: true } },
            },
          });
    const requirementById = new Map(
      requirements.map((requirement) => [requirement.id, requirement]),
    );
    const tasks = requirements.flatMap((requirement) => requirement.tasks);

    return {
      role: scope.role,
      totals: {
        projects: projects.length,
        requirements: requirements.length,
        tasks: tasks.length,
        doneTasks: tasks.filter((task) => task.status === 'DONE').length,
      },
      requirementStatuses: requirementStatuses.map((status) => ({
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
          clientName: project.client.name,
          requirementCount: project.requirements.length,
          totalTasks: projectTasks.length,
          doneTasks: projectTasks.filter((task) => task.status === 'DONE')
            .length,
        };
      }),
      recentActivity: recentActivity.flatMap((activity) => {
        const requirement = requirementById.get(activity.entityId);
        return requirement
          ? [
              {
                id: activity.id,
                requirementId: requirement.id,
                requirementTitle: requirement.title,
                projectName: requirement.projectName,
                action: activity.action,
                createdAt: activity.createdAt,
                actor: activity.actor,
              },
            ]
          : [];
      }),
    };
  }
}
