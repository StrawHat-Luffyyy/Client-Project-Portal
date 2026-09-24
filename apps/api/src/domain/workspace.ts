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

import type { AuthenticatedScope } from './auth.js';

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ClientRecord {
  id: string;
  organizationId: string;
  name: string;
  contactEmail: string;
  createdAt: Date;
}

export interface ProjectRecord {
  id: string;
  organizationId: string;
  clientId: string;
  name: string;
  description: string;
  createdAt: Date;
  client: { id: string; name: string };
  requirementCount: number;
}

export interface AttachmentRecord {
  id: string;
  fileName: string;
  size: number;
  createdAt: Date;
}

export interface RequirementRecord {
  id: string;
  organizationId: string;
  projectId: string;
  createdById: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status:
    | 'SUBMITTED'
    | 'IN_REVIEW'
    | 'NEEDS_INFO'
    | 'APPROVED'
    | 'IN_PROGRESS'
    | 'DELIVERED'
    | 'REJECTED';
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: { id: string; name: string };
  attachments: AttachmentRecord[];
}

export interface PendingAttachment {
  fileName: string;
  storageKey: string;
  size: number;
}

export interface RequirementActivityRecord {
  id: string;
  organizationId: string;
  actorId: string;
  entityType: 'REQUIREMENT';
  entityId: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  actor: {
    id: string;
    name: string;
    role: 'ADMIN' | 'PM' | 'ENGINEER' | 'CLIENT';
  };
}

export interface WorkspaceRepository {
  listClients(
    scope: AuthenticatedScope,
    pagination: PaginationQuery,
  ): Promise<Page<ClientRecord>>;
  createClient(
    scope: AuthenticatedScope,
    input: CreateClientInput,
  ): Promise<ClientRecord>;
  listProjects(
    scope: AuthenticatedScope,
    query: ProjectListQuery,
  ): Promise<Page<ProjectRecord>>;
  findProject(
    scope: AuthenticatedScope,
    projectId: string,
  ): Promise<ProjectRecord | null>;
  createProject(
    scope: AuthenticatedScope,
    input: CreateProjectInput,
  ): Promise<ProjectRecord>;
  listRequirements(
    scope: AuthenticatedScope,
    projectId: string,
    query: RequirementListQuery,
  ): Promise<Page<RequirementRecord> | null>;
  findRequirement(
    scope: AuthenticatedScope,
    requirementId: string,
  ): Promise<RequirementRecord | null>;
  createRequirement(
    scope: AuthenticatedScope,
    projectId: string,
    input: CreateRequirementInput,
    attachment?: PendingAttachment,
  ): Promise<RequirementRecord | null>;
  updateRequirement(
    scope: AuthenticatedScope,
    requirementId: string,
    input: UpdateRequirementInput,
  ): Promise<RequirementRecord | null>;
  transitionRequirement(
    scope: AuthenticatedScope,
    requirementId: string,
    currentStatus: RequirementRecord['status'],
    input: RequirementTransitionInput,
  ): Promise<RequirementRecord | null>;
  listRequirementActivity(
    scope: AuthenticatedScope,
    requirementId: string,
    pagination: PaginationQuery,
  ): Promise<Page<RequirementActivityRecord> | null>;
  canDeliverRequirement(
    scope: AuthenticatedScope,
    requirementId: string,
  ): Promise<boolean>;
}

export interface UploadedFile {
  originalName: string;
  data: Buffer;
  size: number;
}

export interface AttachmentStorage {
  store(file: UploadedFile): Promise<PendingAttachment>;
  remove(storageKey: string): Promise<void>;
}
