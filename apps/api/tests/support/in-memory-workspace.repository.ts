import type {
  CreateClientInput,
  CreateProjectInput,
  CreateRequirementInput,
  PaginationQuery,
  ProjectListQuery,
  RequirementListQuery,
  RequirementTransitionInput,
  UpdateRequirementInput,
} from '@client-portal/shared';

import type { AuthenticatedScope } from '../../src/domain/auth.js';
import type {
  AttachmentStorage,
  ClientRecord,
  Page,
  PendingAttachment,
  ProjectRecord,
  RequirementRecord,
  RequirementActivityRecord,
  UploadedFile,
  WorkspaceRepository,
} from '../../src/domain/workspace.js';

function page<T>(items: T[], query: PaginationQuery): Page<T> {
  const start = (query.page - 1) * query.pageSize;
  return {
    items: items.slice(start, start + query.pageSize),
    page: query.page,
    pageSize: query.pageSize,
    total: items.length,
  };
}

export class InMemoryWorkspaceRepository implements WorkspaceRepository {
  clients: ClientRecord[] = [];
  projects: ProjectRecord[] = [];
  requirements: RequirementRecord[] = [];
  activities: RequirementActivityRecord[] = [];
  deliverableRequirementIds = new Set<string>();

  listClients(scope: AuthenticatedScope, pagination: PaginationQuery) {
    const visible = this.clients.filter(
      (client) =>
        client.organizationId === scope.organizationId &&
        (scope.role !== 'CLIENT' || client.id === scope.clientId),
    );
    return Promise.resolve(page(visible, pagination));
  }

  createClient(scope: AuthenticatedScope, input: CreateClientInput) {
    const client: ClientRecord = {
      id: `client-${this.clients.length + 1}`,
      organizationId: scope.organizationId,
      ...input,
      createdAt: new Date(),
    };
    this.clients.push(client);
    return Promise.resolve(client);
  }

  listProjects(scope: AuthenticatedScope, query: ProjectListQuery) {
    const visible = this.projects.filter(
      (project) =>
        project.organizationId === scope.organizationId &&
        (scope.role === 'CLIENT'
          ? project.clientId === scope.clientId
          : !query.clientId || project.clientId === query.clientId),
    );
    return Promise.resolve(page(visible, query));
  }

  findProject(scope: AuthenticatedScope, projectId: string) {
    const project = this.projects.find(
      (item) =>
        item.id === projectId &&
        item.organizationId === scope.organizationId &&
        (scope.role !== 'CLIENT' || item.clientId === scope.clientId),
    );
    return Promise.resolve(project ?? null);
  }

  createProject(scope: AuthenticatedScope, input: CreateProjectInput) {
    const client = this.clients.find(
      (item) =>
        item.id === input.clientId &&
        item.organizationId === scope.organizationId,
    );
    if (!client) return Promise.reject(new Error('Client was not found.'));
    const project: ProjectRecord = {
      id: `project-${this.projects.length + 1}`,
      organizationId: scope.organizationId,
      ...input,
      createdAt: new Date(),
      client: { id: client.id, name: client.name },
      requirementCount: 0,
    };
    this.projects.push(project);
    return Promise.resolve(project);
  }

  async listRequirements(
    scope: AuthenticatedScope,
    projectId: string,
    query: RequirementListQuery,
  ) {
    if (!(await this.findProject(scope, projectId))) return null;
    const visible = this.requirements.filter(
      (item) =>
        item.organizationId === scope.organizationId &&
        item.projectId === projectId &&
        (!query.status || item.status === query.status),
    );
    return page(visible, query);
  }

  findRequirement(scope: AuthenticatedScope, requirementId: string) {
    const requirement = this.requirements.find(
      (item) =>
        item.id === requirementId &&
        item.organizationId === scope.organizationId,
    );
    if (!requirement) return Promise.resolve(null);
    const project = this.projects.find(
      (item) => item.id === requirement.projectId,
    );
    if (scope.role === 'CLIENT' && project?.clientId !== scope.clientId) {
      return Promise.resolve(null);
    }
    return Promise.resolve(requirement);
  }

  async createRequirement(
    scope: AuthenticatedScope,
    projectId: string,
    input: CreateRequirementInput,
    attachment?: PendingAttachment,
  ) {
    if (!(await this.findProject(scope, projectId))) return null;
    const now = new Date();
    const requirement: RequirementRecord = {
      id: `requirement-${this.requirements.length + 1}`,
      organizationId: scope.organizationId,
      projectId,
      createdById: scope.userId,
      ...input,
      status: 'SUBMITTED',
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
      createdBy: { id: scope.userId, name: 'Client User' },
      attachments: attachment
        ? [
            {
              id: 'attachment-1',
              fileName: attachment.fileName,
              size: attachment.size,
              createdAt: now,
            },
          ]
        : [],
    };
    this.requirements.push(requirement);
    const project = this.projects.find((item) => item.id === projectId);
    if (project) project.requirementCount += 1;
    return requirement;
  }

  async updateRequirement(
    scope: AuthenticatedScope,
    requirementId: string,
    input: UpdateRequirementInput,
  ) {
    const requirement = await this.findRequirement(scope, requirementId);
    if (
      !requirement ||
      requirement.createdById !== scope.userId ||
      !['SUBMITTED', 'NEEDS_INFO'].includes(requirement.status)
    ) {
      return null;
    }
    Object.assign(requirement, input, { updatedAt: new Date() });
    return requirement;
  }

  async transitionRequirement(
    scope: AuthenticatedScope,
    requirementId: string,
    currentStatus: RequirementRecord['status'],
    input: RequirementTransitionInput,
  ) {
    const requirement = await this.findRequirement(scope, requirementId);
    if (!requirement || requirement.status !== currentStatus) return null;
    requirement.status = input.to;
    requirement.rejectionReason =
      input.to === 'REJECTED' ? (input.reason ?? null) : null;
    requirement.updatedAt = new Date();
    this.activities.push({
      id: `activity-${this.activities.length + 1}`,
      organizationId: scope.organizationId,
      actorId: scope.userId,
      entityType: 'REQUIREMENT',
      entityId: requirementId,
      action: 'REQUIREMENT_STATUS_CHANGED',
      metadata: {
        from: currentStatus,
        to: input.to,
        ...(input.reason ? { reason: input.reason } : {}),
      },
      createdAt: new Date(),
      actor: { id: scope.userId, name: scope.userId, role: scope.role },
    });
    return requirement;
  }

  async listRequirementActivity(
    scope: AuthenticatedScope,
    requirementId: string,
    pagination: PaginationQuery,
  ) {
    if (!(await this.findRequirement(scope, requirementId))) return null;
    const visible = this.activities.filter(
      (activity) =>
        activity.organizationId === scope.organizationId &&
        activity.entityId === requirementId &&
        !(
          scope.role === 'CLIENT' &&
          activity.action === 'COMMENT_CREATED' &&
          activity.metadata.visibility === 'INTERNAL'
        ),
    );
    visible.reverse();
    return page(visible, pagination);
  }

  canDeliverRequirement(_scope: AuthenticatedScope, requirementId: string) {
    return Promise.resolve(this.deliverableRequirementIds.has(requirementId));
  }
}

export class InMemoryAttachmentStorage implements AttachmentStorage {
  files: UploadedFile[] = [];

  store(file: UploadedFile) {
    this.files.push(file);
    return Promise.resolve({
      fileName: file.originalName,
      storageKey: `stored-${this.files.length}`,
      size: file.size,
    });
  }

  remove() {
    this.files.pop();
    return Promise.resolve();
  }
}
