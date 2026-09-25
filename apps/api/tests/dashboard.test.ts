import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { dashboardSchema } from '@client-portal/shared';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/lib/security.js';
import { InMemoryDashboardRepository } from './support/in-memory-dashboard.repository.js';
import { InMemoryIdentityRepository } from './support/in-memory-identity.repository.js';

const password = 'StrongPassword123';
const csrfSchema = z.object({ data: z.object({ csrfToken: z.string() }) });
const dashboardResponseSchema = z.object({ data: dashboardSchema });

async function authenticatedAgent(
  app: ReturnType<typeof createApp>,
  email: string,
) {
  const agent = request.agent(app);
  const csrfResponse = await agent.get('/api/v1/auth/csrf').expect(200);
  const csrf = csrfSchema.parse(csrfResponse.body as unknown).data.csrfToken;
  await agent
    .post('/api/v1/auth/login')
    .set('x-csrf-token', csrf)
    .send({ email, password })
    .expect(200);
  return agent;
}

describe('role-aware dashboard API', () => {
  const identities = new InMemoryIdentityRepository();
  const dashboard = new InMemoryDashboardRepository();
  const app = createApp({ dashboard, identities });

  beforeAll(async () => {
    const passwordHash = await hashPassword(password);
    identities.addUser({
      id: 'client-user-a',
      organizationId: 'organization-a',
      clientId: 'client-a',
      name: 'Client A',
      email: 'client-a@example.com',
      passwordHash,
      role: 'CLIENT',
    });
    identities.addUser({
      id: 'engineer-a',
      organizationId: 'organization-a',
      clientId: null,
      name: 'Engineer A',
      email: 'engineer-a@example.com',
      passwordHash,
      role: 'ENGINEER',
    });
    identities.addUser({
      id: 'pm-a',
      organizationId: 'organization-a',
      clientId: null,
      name: 'PM A',
      email: 'pm-a@example.com',
      passwordHash,
      role: 'PM',
    });
    identities.addUser({
      id: 'pm-b',
      organizationId: 'organization-b',
      clientId: null,
      name: 'PM B',
      email: 'pm-b@example.com',
      passwordHash,
      role: 'PM',
    });
    dashboard.projects.push(
      {
        id: 'project-a',
        organizationId: 'organization-a',
        clientId: 'client-a',
        clientName: 'Client A',
        name: 'Visible project',
        requirements: [
          {
            id: 'requirement-a',
            title: 'Visible requirement',
            status: 'IN_PROGRESS',
            tasks: [
              { assigneeId: 'engineer-a', status: 'DONE' },
              { assigneeId: 'engineer-other', status: 'TODO' },
            ],
          },
        ],
      },
      {
        id: 'project-other-client',
        organizationId: 'organization-a',
        clientId: 'client-b',
        clientName: 'Client B',
        name: 'Other client project',
        requirements: [
          {
            id: 'requirement-other-client',
            title: 'Other client requirement',
            status: 'SUBMITTED',
            tasks: [],
          },
        ],
      },
      {
        id: 'project-other-organization',
        organizationId: 'organization-b',
        clientId: 'client-c',
        clientName: 'Client C',
        name: 'Other organization project',
        requirements: [
          {
            id: 'requirement-other-organization',
            title: 'Other organization requirement',
            status: 'APPROVED',
            tasks: [],
          },
        ],
      },
    );
    dashboard.activities.push(
      {
        id: 'activity-visible',
        organizationId: 'organization-a',
        requirementId: 'requirement-a',
        action: 'COMMENT_CREATED',
        visibility: 'CLIENT_VISIBLE',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
        actor: { id: 'pm-a', name: 'PM A', role: 'PM' },
      },
      {
        id: 'activity-internal',
        organizationId: 'organization-a',
        requirementId: 'requirement-a',
        action: 'COMMENT_CREATED',
        visibility: 'INTERNAL',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
        actor: { id: 'pm-a', name: 'PM A', role: 'PM' },
      },
    );
  });

  it('limits a CLIENT dashboard to its client and visible activity', async () => {
    const agent = await authenticatedAgent(app, 'client-a@example.com');
    const response = await agent.get('/api/v1/dashboard').expect(200);
    const result = dashboardResponseSchema.parse(response.body as unknown).data;

    expect(result.totals).toEqual({
      projects: 1,
      requirements: 1,
      tasks: 2,
      doneTasks: 1,
    });
    expect(result.projectProgress.map((project) => project.name)).toEqual([
      'Visible project',
    ]);
    expect(result.recentActivity.map((activity) => activity.id)).toEqual([
      'activity-visible',
    ]);
  });

  it('limits an ENGINEER dashboard to assigned work', async () => {
    const agent = await authenticatedAgent(app, 'engineer-a@example.com');
    const response = await agent.get('/api/v1/dashboard').expect(200);
    const result = dashboardResponseSchema.parse(response.body as unknown).data;

    expect(result.totals).toEqual({
      projects: 1,
      requirements: 1,
      tasks: 1,
      doneTasks: 1,
    });
    expect(result.projectProgress[0]).toMatchObject({
      name: 'Visible project',
      totalTasks: 1,
      doneTasks: 1,
    });
  });

  it('shows organization delivery work to a PM without crossing tenants', async () => {
    const agent = await authenticatedAgent(app, 'pm-a@example.com');
    const response = await agent.get('/api/v1/dashboard').expect(200);
    const result = dashboardResponseSchema.parse(response.body as unknown).data;

    expect(result.totals.projects).toBe(2);
    expect(result.projectProgress.map((project) => project.name)).toEqual([
      'Visible project',
      'Other client project',
    ]);
    expect(JSON.stringify(result)).not.toContain('Other organization');
  });

  it('requires authentication', async () => {
    await request(app).get('/api/v1/dashboard').expect(401);
  });
});
