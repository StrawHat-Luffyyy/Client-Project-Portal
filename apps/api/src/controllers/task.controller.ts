import {
  createTaskSchema,
  moveTaskSchema,
  paginationQuerySchema,
  taskListQuerySchema,
  updateTaskSchema,
} from '@client-portal/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';

import type { TaskRecord } from '../domain/task.js';
import type { Page } from '../domain/workspace.js';
import type { TaskService } from '../services/task.service.js';

const idParamsSchema = z.object({ id: z.string().trim().min(1).max(128) });

function pagination<T>(page: Page<T>) {
  return {
    page: page.page,
    pageSize: page.pageSize,
    total: page.total,
    totalPages: Math.ceil(page.total / page.pageSize),
  };
}

function taskJson(task: TaskRecord) {
  const requirement = {
    id: task.requirement.id,
    title: task.requirement.title,
    project: task.requirement.project,
  };
  return {
    ...task,
    requirement,
    dueDate: task.dueDate?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export function createTaskController(service: TaskService) {
  const listRequirementTasks: RequestHandler = async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const page = await service.listRequirementTasks(
      request.auth!,
      id,
      paginationQuerySchema.parse(request.query),
    );
    response.json({
      data: page.items.map(taskJson),
      pagination: pagination(page),
    });
  };

  const createTask: RequestHandler = async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const task = await service.createTask(
      request.auth!,
      id,
      createTaskSchema.parse(request.body),
    );
    response.status(201).json({ data: taskJson(task) });
  };

  const updateTask: RequestHandler = async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const task = await service.updateTask(
      request.auth!,
      id,
      updateTaskSchema.parse(request.body),
    );
    response.json({ data: taskJson(task) });
  };

  const moveTask: RequestHandler = async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const task = await service.moveTask(
      request.auth!,
      id,
      moveTaskSchema.parse(request.body),
    );
    response.json({ data: taskJson(task) });
  };

  const listBoardTasks: RequestHandler = async (request, response) => {
    const page = await service.listBoardTasks(
      request.auth!,
      taskListQuerySchema.parse(request.query),
    );
    response.json({
      data: page.items.map(taskJson),
      pagination: pagination(page),
    });
  };

  const listAssignees: RequestHandler = async (request, response) => {
    response.json({ data: await service.listAssignees(request.auth!) });
  };

  return {
    createTask,
    listAssignees,
    listBoardTasks,
    listRequirementTasks,
    moveTask,
    updateTask,
  };
}
