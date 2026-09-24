import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { env } from './config/env.js';
import type { IdentityRepository } from './domain/auth.js';
import type {
  AttachmentStorage,
  WorkspaceRepository,
} from './domain/workspace.js';
import type { TaskRepository } from './domain/task.js';
import { logger } from './lib/logger.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { PrismaIdentityRepository } from './repositories/prisma-identity.repository.js';
import { PrismaWorkspaceRepository } from './repositories/prisma-workspace.repository.js';
import { PrismaTaskRepository } from './repositories/prisma-task.repository.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { createInviteRouter } from './routes/invite.routes.js';
import { createTaskRouters } from './routes/task.routes.js';
import { createWorkspaceRouters } from './routes/workspace.routes.js';
import { AuthService } from './services/auth.service.js';
import { LocalAttachmentStorage } from './services/attachment-storage.service.js';
import { InviteService } from './services/invite.service.js';
import { TaskService } from './services/task.service.js';
import { WorkspaceService } from './services/workspace.service.js';

export interface AppDependencies {
  identities?: IdentityRepository;
  workspace?: WorkspaceRepository;
  tasks?: TaskRepository;
  attachmentStorage?: AttachmentStorage;
}

export function createApp(dependencies: AppDependencies = {}) {
  const app = express();
  const identities = dependencies.identities ?? new PrismaIdentityRepository();
  const workspace = dependencies.workspace ?? new PrismaWorkspaceRepository();
  const tasks = dependencies.tasks ?? new PrismaTaskRepository();
  const attachmentStorage =
    dependencies.attachmentStorage ??
    new LocalAttachmentStorage(env.UPLOAD_DIRECTORY);
  const authService = new AuthService(identities);
  const inviteService = new InviteService(identities);
  const workspaceService = new WorkspaceService(workspace, attachmentStorage);
  const taskService = new TaskService(tasks);
  const workspaceRouters = createWorkspaceRouters(workspaceService, identities);
  const taskRouters = createTaskRouters(taskService, identities);

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));

  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/auth', createAuthRouter(authService, identities));
  app.use(
    '/api/v1/invites',
    createInviteRouter(inviteService, identities, env.WEB_ORIGIN),
  );
  app.use('/api/v1/clients', workspaceRouters.clients);
  app.use('/api/v1/projects', workspaceRouters.projects);
  app.use('/api/v1/requirements', workspaceRouters.requirements);
  app.use('/api/v1/requirements', taskRouters.requirementTasks);
  app.use('/api/v1/tasks', taskRouters.tasks);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
