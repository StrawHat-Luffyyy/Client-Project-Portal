import {
  createClientSchema,
  createProjectSchema,
  createRequirementSchema,
  paginationQuerySchema,
  projectListQuerySchema,
  requirementListQuerySchema,
  requirementTransitionSchema,
  updateRequirementSchema,
} from '@client-portal/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';

import type {
  ClientRecord,
  Page,
  ProjectRecord,
  RequirementRecord,
  RequirementActivityRecord,
} from '../domain/workspace.js';
import type { WorkspaceService } from '../services/workspace.service.js';

const idParamsSchema = z.object({ id: z.string().trim().min(1).max(128) });

function pagination<T>(page: Page<T>) {
  return {
    page: page.page,
    pageSize: page.pageSize,
    total: page.total,
    totalPages: Math.ceil(page.total / page.pageSize),
  };
}

function clientJson(client: ClientRecord) {
  return { ...client, createdAt: client.createdAt.toISOString() };
}

function projectJson(project: ProjectRecord) {
  return { ...project, createdAt: project.createdAt.toISOString() };
}

function requirementJson(requirement: RequirementRecord) {
  return {
    ...requirement,
    createdAt: requirement.createdAt.toISOString(),
    updatedAt: requirement.updatedAt.toISOString(),
    attachments: requirement.attachments.map((attachment) => ({
      ...attachment,
      createdAt: attachment.createdAt.toISOString(),
    })),
  };
}

function requirementActivityJson(activity: RequirementActivityRecord) {
  return { ...activity, createdAt: activity.createdAt.toISOString() };
}

export function createWorkspaceController(service: WorkspaceService) {
  const listClients: RequestHandler = async (request, response) => {
    const page = await service.listClients(
      request.auth!,
      paginationQuerySchema.parse(request.query),
    );
    response.json({
      data: page.items.map(clientJson),
      pagination: pagination(page),
    });
  };

  const createClient: RequestHandler = async (request, response) => {
    const client = await service.createClient(
      request.auth!,
      createClientSchema.parse(request.body),
    );
    response.status(201).json({ data: clientJson(client) });
  };

  const listProjects: RequestHandler = async (request, response) => {
    const page = await service.listProjects(
      request.auth!,
      projectListQuerySchema.parse(request.query),
    );
    response.json({
      data: page.items.map(projectJson),
      pagination: pagination(page),
    });
  };

  const getProject: RequestHandler = async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const project = await service.getProject(request.auth!, id);
    response.json({ data: projectJson(project) });
  };

  const createProject: RequestHandler = async (request, response) => {
    const project = await service.createProject(
      request.auth!,
      createProjectSchema.parse(request.body),
    );
    response.status(201).json({ data: projectJson(project) });
  };

  const listRequirements: RequestHandler = async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const page = await service.listRequirements(
      request.auth!,
      id,
      requirementListQuerySchema.parse(request.query),
    );
    response.json({
      data: page.items.map(requirementJson),
      pagination: pagination(page),
    });
  };

  const getRequirement: RequestHandler = async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const requirement = await service.getRequirement(request.auth!, id);
    response.json({ data: requirementJson(requirement) });
  };

  const createRequirement: RequestHandler = async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const requirement = await service.createRequirement(
      request.auth!,
      id,
      createRequirementSchema.parse(request.body),
      request.file
        ? {
            originalName: request.file.originalname,
            data: request.file.buffer,
            size: request.file.size,
          }
        : undefined,
    );
    response.status(201).json({ data: requirementJson(requirement) });
  };

  const updateRequirement: RequestHandler = async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const requirement = await service.updateRequirement(
      request.auth!,
      id,
      updateRequirementSchema.parse(request.body),
    );
    response.json({ data: requirementJson(requirement) });
  };

  const transitionRequirement: RequestHandler = async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const requirement = await service.transitionRequirement(
      request.auth!,
      id,
      requirementTransitionSchema.parse(request.body),
    );
    response.json({ data: requirementJson(requirement) });
  };

  const listRequirementActivity: RequestHandler = async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const page = await service.listRequirementActivity(
      request.auth!,
      id,
      paginationQuerySchema.parse(request.query),
    );
    response.json({
      data: page.items.map(requirementActivityJson),
      pagination: pagination(page),
    });
  };

  return {
    createClient,
    createProject,
    createRequirement,
    getProject,
    getRequirement,
    listClients,
    listProjects,
    listRequirements,
    listRequirementActivity,
    transitionRequirement,
    updateRequirement,
  };
}
