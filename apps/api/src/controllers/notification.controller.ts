import { notificationListQuerySchema } from '@client-portal/shared';
import type { RequestHandler } from 'express';
import { z } from 'zod';

import { logger } from '../lib/logger.js';
import type { NotificationService } from '../services/notification.service.js';

const idParamsSchema = z.object({ id: z.string().trim().min(1).max(128) });

function notificationJson<T extends { createdAt: Date; readAt: Date | null }>(
  notification: T,
) {
  return {
    ...notification,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  };
}

export function createNotificationController(service: NotificationService) {
  const listNotifications: RequestHandler = async (request, response) => {
    const page = await service.listNotifications(
      request.auth!,
      notificationListQuerySchema.parse(request.query),
    );
    response.json({
      data: page.items.map(notificationJson),
      pagination: {
        page: page.page,
        pageSize: page.pageSize,
        total: page.total,
        totalPages: Math.ceil(page.total / page.pageSize),
      },
    });
  };

  const markRead: RequestHandler = async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const notification = await service.markRead(request.auth!, id);
    response.json({ data: notificationJson(notification) });
  };

  const events: RequestHandler = (request, response) => {
    response.status(200);
    response.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    response.flushHeaders();
    response.write('retry: 3000\n');
    response.write('event: ready\ndata: {}\n\n');

    let closed = false;
    let timer: NodeJS.Timeout | undefined;
    let cursor = { createdAt: new Date(), id: '' };

    const poll = async () => {
      if (closed) return;
      try {
        const notifications = await service.listEventsAfter(
          request.auth!,
          cursor,
        );
        for (const notification of notifications) {
          response.write(`id: ${notification.id}\n`);
          response.write('event: notification\n');
          response.write(
            `data: ${JSON.stringify({ notification: notificationJson(notification) })}\n\n`,
          );
          cursor = {
            createdAt: notification.createdAt,
            id: notification.id,
          };
        }
      } catch (error: unknown) {
        logger.error(
          { error, userId: request.auth?.userId },
          'SSE notification poll failed',
        );
      } finally {
        if (!closed) timer = setTimeout(() => void poll(), 1_000);
      }
    };

    const heartbeat = setInterval(() => {
      if (!closed) response.write(': heartbeat\n\n');
    }, 15_000);
    void poll();

    request.on('close', () => {
      closed = true;
      if (timer) clearTimeout(timer);
      clearInterval(heartbeat);
      response.end();
    });
  };

  return { events, listNotifications, markRead };
}
