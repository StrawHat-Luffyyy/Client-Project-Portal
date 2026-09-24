import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { env } from './config/env.js';
import type { IdentityRepository } from './domain/auth.js';
import { logger } from './lib/logger.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { PrismaIdentityRepository } from './repositories/prisma-identity.repository.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { createInviteRouter } from './routes/invite.routes.js';
import { AuthService } from './services/auth.service.js';
import { InviteService } from './services/invite.service.js';

export interface AppDependencies {
  identities?: IdentityRepository;
}

export function createApp(dependencies: AppDependencies = {}) {
  const app = express();
  const identities = dependencies.identities ?? new PrismaIdentityRepository();
  const authService = new AuthService(identities);
  const inviteService = new InviteService(identities);

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

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
