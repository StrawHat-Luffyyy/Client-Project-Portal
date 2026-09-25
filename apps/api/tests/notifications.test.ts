import http from 'node:http';

import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/lib/security.js';
import { InMemoryIdentityRepository } from './support/in-memory-identity.repository.js';
import { InMemoryNotificationRepository } from './support/in-memory-notification.repository.js';

const password = 'StrongPassword123';
const csrfSchema = z.object({ data: z.object({ csrfToken: z.string() }) });

async function login(email: string) {
  const agent = request.agent(app);
  const csrfResponse = await agent.get('/api/v1/auth/csrf').expect(200);
  const token = csrfSchema.parse(csrfResponse.body as unknown).data.csrfToken;
  const response = await agent
    .post('/api/v1/auth/login')
    .set('x-csrf-token', token)
    .send({ email, password })
    .expect(200);
  return { agent, token, response };
}

const identities = new InMemoryIdentityRepository();
const notifications = new InMemoryNotificationRepository();
const app = createApp({ identities, notifications });
const server = http.createServer(app);

describe('notification and SSE API', () => {
  beforeAll(async () => {
    const passwordHash = await hashPassword(password);
    for (const [id, organizationId, clientId, role] of [
      ['pm-a', 'organization-a', null, 'PM'],
      ['client-a', 'organization-a', 'customer-a', 'CLIENT'],
      ['pm-b', 'organization-b', null, 'PM'],
    ] as const) {
      identities.addUser({
        id,
        organizationId,
        clientId,
        name: id,
        email: `${id}@example.com`,
        passwordHash,
        role,
      });
    }
    const now = new Date(Date.now() - 5_000);
    notifications.notifications.push(
      {
        id: 'notification-a-unread',
        organizationId: 'organization-a',
        userId: 'pm-a',
        type: 'COMMENT_CREATED',
        entityType: 'REQUIREMENT',
        entityId: 'requirement-a',
        readAt: null,
        createdAt: now,
      },
      {
        id: 'notification-client-a',
        organizationId: 'organization-a',
        userId: 'client-a',
        type: 'TASK_STATUS_CHANGED',
        entityType: 'REQUIREMENT',
        entityId: 'requirement-a',
        readAt: null,
        createdAt: now,
      },
      {
        id: 'notification-b',
        organizationId: 'organization-b',
        userId: 'pm-b',
        type: 'REQUIREMENT_STATUS_CHANGED',
        entityType: 'REQUIREMENT',
        entityId: 'requirement-b',
        readAt: null,
        createdAt: now,
      },
    );
    await new Promise<void>((resolve) => server.listen(0, resolve));
  });

  afterAll(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  );

  it('lists and marks only the authenticated user notifications', async () => {
    const { agent, token } = await login('pm-a@example.com');
    const listed = await agent
      .get('/api/v1/notifications?unreadOnly=true')
      .expect(200);
    expect(listed.body).toMatchObject({
      data: [
        {
          id: 'notification-a-unread',
          href: '/requirements/requirement-a',
        },
      ],
      pagination: { total: 1 },
    });
    await agent
      .post('/api/v1/notifications/notification-client-a/read')
      .set('x-csrf-token', token)
      .expect(404);
    const read = await agent
      .post('/api/v1/notifications/notification-a-unread/read')
      .set('x-csrf-token', token)
      .expect(200);
    expect(read.body).toMatchObject({
      data: { id: 'notification-a-unread' },
    });
    const readAt = z
      .object({ data: z.object({ readAt: z.string().datetime() }) })
      .parse(read.body as unknown).data.readAt;
    expect(readAt).toBeTruthy();
    const repeated = await agent
      .post('/api/v1/notifications/notification-a-unread/read')
      .set('x-csrf-token', token)
      .expect(200);
    expect(repeated.body).toMatchObject({
      data: { readAt },
    });
    const remaining = await agent
      .get('/api/v1/notifications?unreadOnly=true')
      .expect(200);
    expect(remaining.body).toMatchObject({ pagination: { total: 0 } });
  });

  it('requires authentication and CSRF protection', async () => {
    await request(app).get('/api/v1/notifications').expect(401);
    await request(app).get('/api/v1/events').expect(401);
    const { agent } = await login('client-a@example.com');
    await agent
      .post('/api/v1/notifications/notification-client-a/read')
      .expect(403);
  });

  it('streams only recipient-specific SSE notifications', async () => {
    const { response } = await login('client-a@example.com');
    const setCookie = response.headers['set-cookie'] as unknown as string[];
    const cookie = setCookie.map((value) => value.split(';')[0]).join('; ');
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('No test port.');

    const received = await new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('Timed out waiting for SSE notification.')),
        4_000,
      );
      let body = '';
      let seeded = false;
      const stream = http.get(
        {
          hostname: '127.0.0.1',
          port: address.port,
          path: '/api/v1/events',
          headers: { Cookie: cookie },
        },
        (eventResponse) => {
          expect(eventResponse.headers['content-type']).toContain(
            'text/event-stream',
          );
          eventResponse.on('data', (chunk: Buffer) => {
            body += chunk.toString();
            if (body.includes('event: ready') && !seeded) {
              seeded = true;
              const createdAt = new Date(Date.now() + 10);
              notifications.notifications.push(
                {
                  id: 'notification-live-client',
                  organizationId: 'organization-a',
                  userId: 'client-a',
                  type: 'COMMENT_CREATED',
                  entityType: 'REQUIREMENT',
                  entityId: 'requirement-a',
                  readAt: null,
                  createdAt,
                },
                {
                  id: 'notification-live-other-user',
                  organizationId: 'organization-a',
                  userId: 'pm-a',
                  type: 'COMMENT_CREATED',
                  entityType: 'REQUIREMENT',
                  entityId: 'requirement-a',
                  readAt: null,
                  createdAt,
                },
              );
            }
            if (
              body.includes('event: notification') &&
              body.includes('"id":"notification-live-client"')
            ) {
              clearTimeout(timeout);
              stream.destroy();
              resolve(body);
            }
          });
        },
      );
      stream.on('error', (error) => {
        if ((error as NodeJS.ErrnoException).code !== 'ECONNRESET') {
          clearTimeout(timeout);
          reject(error);
        }
      });
    });
    expect(received).toContain('event: notification');
    expect(received).toContain('notification-live-client');
    expect(received).not.toContain('notification-live-other-user');
  });
});
