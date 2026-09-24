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

import type { AuthenticatedScope } from '../domain/auth.js';
import { AppError } from '../domain/errors.js';
import { assertPmRequirementTransition } from '../domain/requirement-transition.js';
import type {
  AttachmentStorage,
  UploadedFile,
  WorkspaceRepository,
} from '../domain/workspace.js';

export class WorkspaceService {
  constructor(
    private readonly repository: WorkspaceRepository,
    private readonly attachments: AttachmentStorage,
  ) {}

  listClients(scope: AuthenticatedScope, pagination: PaginationQuery) {
    return this.repository.listClients(scope, pagination);
  }

  createClient(scope: AuthenticatedScope, input: CreateClientInput) {
    return this.repository.createClient(scope, input);
  }

  listProjects(scope: AuthenticatedScope, query: ProjectListQuery) {
    return this.repository.listProjects(scope, query);
  }

  async getProject(scope: AuthenticatedScope, projectId: string) {
    const project = await this.repository.findProject(scope, projectId);
    if (!project)
      throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project was not found.');
    return project;
  }

  createProject(scope: AuthenticatedScope, input: CreateProjectInput) {
    return this.repository.createProject(scope, input);
  }

  async listRequirements(
    scope: AuthenticatedScope,
    projectId: string,
    query: RequirementListQuery,
  ) {
    const page = await this.repository.listRequirements(
      scope,
      projectId,
      query,
    );
    if (!page)
      throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project was not found.');
    return page;
  }

  async getRequirement(scope: AuthenticatedScope, requirementId: string) {
    const requirement = await this.repository.findRequirement(
      scope,
      requirementId,
    );
    if (!requirement) {
      throw new AppError(
        404,
        'REQUIREMENT_NOT_FOUND',
        'Requirement was not found.',
      );
    }
    return requirement;
  }

  async createRequirement(
    scope: AuthenticatedScope,
    projectId: string,
    input: CreateRequirementInput,
    file?: UploadedFile,
  ) {
    const attachment = file ? await this.attachments.store(file) : undefined;
    try {
      const requirement = await this.repository.createRequirement(
        scope,
        projectId,
        input,
        attachment,
      );
      if (!requirement) {
        throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project was not found.');
      }
      return requirement;
    } catch (error: unknown) {
      if (attachment) await this.attachments.remove(attachment.storageKey);
      throw error;
    }
  }

  async updateRequirement(
    scope: AuthenticatedScope,
    requirementId: string,
    input: UpdateRequirementInput,
  ) {
    const requirement = await this.repository.updateRequirement(
      scope,
      requirementId,
      input,
    );
    if (!requirement) {
      throw new AppError(
        404,
        'REQUIREMENT_NOT_EDITABLE',
        'The requirement was not found or can no longer be edited.',
      );
    }
    return requirement;
  }

  async transitionRequirement(
    scope: AuthenticatedScope,
    requirementId: string,
    input: RequirementTransitionInput,
  ) {
    const existing = await this.getRequirement(scope, requirementId);
    assertPmRequirementTransition(existing.status, input);
    if (
      input.to === 'DELIVERED' &&
      !(await this.repository.canDeliverRequirement(scope, requirementId))
    ) {
      throw new AppError(
        409,
        'REQUIREMENT_NOT_DELIVERABLE',
        'Delivery can only be confirmed after every task is done.',
      );
    }
    const requirement = await this.repository.transitionRequirement(
      scope,
      requirementId,
      existing.status,
      input,
    );
    if (!requirement) {
      throw new AppError(
        409,
        'REQUIREMENT_CHANGED',
        'The requirement changed before the transition could be completed.',
      );
    }
    return requirement;
  }

  async listRequirementActivity(
    scope: AuthenticatedScope,
    requirementId: string,
    pagination: PaginationQuery,
  ) {
    const page = await this.repository.listRequirementActivity(
      scope,
      requirementId,
      pagination,
    );
    if (!page) {
      throw new AppError(
        404,
        'REQUIREMENT_NOT_FOUND',
        'Requirement was not found.',
      );
    }
    return page;
  }
}
