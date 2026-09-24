import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';

const app = createApp();

const server = app.listen(env.API_PORT, () => {
  logger.info({ port: env.API_PORT }, 'API listening');
});

function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down API');
  server.close((error) => {
    if (error) {
      logger.error({ error }, 'Failed to close API server');
      process.exitCode = 1;
    }
    void prisma.$disconnect();
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
