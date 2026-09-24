import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/lib/security.js';
import { InMemoryIdentityRepository } from './support/in-memory-identity.repository.js';
import {
  InMemoryAttachmentStorage,
  InMemoryWorkspaceRepository,
} from './support/in-memory-workspace.repository.js';

const password = 'StrongPassword123';
const csrfSchema = z.object({ data: z.object({ csrfToken: z.string() }) });
const clientResponseSchema = z.object({
  data: z.object({ organizationId: z.string(), name: z.string() }),
});
const projectListResponseSchema = z.object({
  data: z.array(z.object({ id: z.string() })),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
const requirementResponseSchema = z.object({
  data: z.object({ title: z.string(), status: z.string() }),
});

async function csrf(agent: ReturnType<typeof request.agent>) {
  const response = await agent.get('/api/v1/auth/csrf').expect(200);
  return csrfSchema.parse(response.body as unknown).data.csrfToken;
}

async function authenticatedAgent(
  app: ReturnType<typeof createApp>,
  email: string,
) {
  const agent = request.agent(app);
  const token = await csrf(agent);
  await agent
    .post('/api/v1/auth/login')
    .set('x-csrf-token', token)
    .send({ email, password })
    .expect(200);
  return agent;
}

describe('clients, projects, and requirements API', () => {
  const identities = new InMemoryIdentityRepository();
  const workspace = new InMemoryWorkspaceRepository();
  const attachmentStorage = new InMemoryAttachmentStorage();
  const app = createApp({ identities, workspace, attachmentStorage });

  beforeAll(async () => {
    const passwordHash = await hashPassword(password);
    for (const [organizationId, clientId] of [
      ['organization-a', 'client-a'],
      ['organization-a', 'client-b'],
      ['organization-b', 'client-c'],
    ] as const) {
      identities.addClient(organizationId, clientId);
      workspace.clients.push({
        id: clientId,
        organizationId,
        name: clientId.toUpperCase(),
        contactEmail: `${clientId}@example.com`,
        createdAt: new Date(),
      });
    }
    for (const [id, organizationId, clientId, role] of [
      ['admin-a', 'organization-a', null, 'ADMIN'],
      ['pm-a', 'organization-a', null, 'PM'],
      ['engineer-a', 'organization-a', null, 'ENGINEER'],
      ['client-user-a', 'organization-a', 'client-a', 'CLIENT'],
      ['client-user-b', 'organization-a', 'client-b', 'CLIENT'],
      ['client-user-c', 'organization-b', 'client-c', 'CLIENT'],
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
    workspace.projects.push(
      {
        id: 'project-a',
        organizationId: 'organization-a',
        clientId: 'client-a',
        name: 'Project A',
        description: 'A scoped client project.',
        createdAt: new Date(),
        client: { id: 'client-a', name: 'CLIENT-A' },
        requirementCount: 0,
      },
      {
        id: 'project-b',
        organizationId: 'organization-a',
        clientId: 'client-b',
        name: 'Project B',
        description: 'Another client project.',
        createdAt: new Date(),
        client: { id: 'client-b', name: 'CLIENT-B' },
        requirementCount: 0,
      },
      {
        id: 'project-c',
        organizationId: 'organization-b',
        clientId: 'client-c',
        name: 'Project C',
        description: 'A project in another organization.',
        createdAt: new Date(),
        client: { id: 'client-c', name: 'CLIENT-C' },
        requirementCount: 0,
      },
    );
  });

  it('derives organization scope when an ADMIN creates a client', async () => {
    const agent = await authenticatedAgent(app, 'admin-a@example.com');
    const token = await csrf(agent);
    const response = await agent
      .post('/api/v1/clients')
      .set('x-csrf-token', token)
      .send({
        organizationId: 'organization-b',
        name: 'New Client',
        contactEmail: 'contact@example.com',
      })
      .expect(201);

    expect(clientResponseSchema.parse(response.body as unknown)).toMatchObject({
      data: { organizationId: 'organization-a', name: 'New Client' },
    });
  });

  it('supports paginated project listings', async () => {
    const agent = await authenticatedAgent(app, 'admin-a@example.com');
    const response = await agent
      .get('/api/v1/projects?page=1&pageSize=1')
      .expect(200);
    const body = projectListResponseSchema.parse(response.body as unknown);
    expect(body.pagination).toMatchObject({
      page: 1,
      pageSize: 1,
      total: 2,
      totalPages: 2,
    });
    expect(body.data).toHaveLength(1);
  });

  it('limits a CLIENT to projects belonging to their client account', async () => {
    const agent = await authenticatedAgent(app, 'client-user-a@example.com');
    const list = await agent.get('/api/v1/projects').expect(200);
    const body = projectListResponseSchema.parse(list.body as unknown);
    expect(body.data.map((project) => project.id)).toEqual(['project-a']);
    await agent.get('/api/v1/projects/project-b').expect(404);
    await agent.get('/api/v1/projects/project-c').expect(404);
  });

  it('allows a CLIENT to submit a requirement with an attachment to their project', async () => {
    const agent = await authenticatedAgent(app, 'client-user-a@example.com');
    const token = await csrf(agent);
    const response = await agent
      .post('/api/v1/projects/project-a/requirements')
      .set('x-csrf-token', token)
      .field('title', 'Monthly delivery summary')
      .field(
        'description',
        'Provide a downloadable summary of deliveries for each month.',
      )
      .field('priority', 'HIGH')
      .attach('attachment', Buffer.from('sample'), {
        filename: 'brief.txt',
        contentType: 'text/plain',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      data: {
        organizationId: 'organization-a',
        projectId: 'project-a',
        status: 'SUBMITTED',
        attachments: [{ fileName: 'brief.txt' }],
      },
    });
    expect(attachmentStorage.files).toHaveLength(1);
  });

  it('hides another client and organization when submitting or reading requirements', async () => {
    const agent = await authenticatedAgent(app, 'client-user-a@example.com');
    const token = await csrf(agent);
    for (const projectId of ['project-b', 'project-c']) {
      await agent
        .post(`/api/v1/projects/${projectId}/requirements`)
        .set('x-csrf-token', token)
        .field('title', 'Unauthorized requirement')
        .field(
          'description',
          'This requirement must never cross the tenant boundary.',
        )
        .field('priority', 'LOW')
        .expect(404);
    }

    const created = workspace.requirements[0]!;
    const otherClient = await authenticatedAgent(
      app,
      'client-user-b@example.com',
    );
    await otherClient.get(`/api/v1/requirements/${created.id}`).expect(404);
    const otherOrganization = await authenticatedAgent(
      app,
      'client-user-c@example.com',
    );
    await otherOrganization
      .get(`/api/v1/requirements/${created.id}`)
      .expect(404);
  });

  it('allows the submitting CLIENT to edit content but never status directly', async () => {
    const created = workspace.requirements[0]!;
    const agent = await authenticatedAgent(app, 'client-user-a@example.com');
    const token = await csrf(agent);
    const updated = await agent
      .patch(`/api/v1/requirements/${created.id}`)
      .set('x-csrf-token', token)
      .send({ title: 'Updated monthly delivery summary' })
      .expect(200);
    expect(
      requirementResponseSchema.parse(updated.body as unknown),
    ).toMatchObject({
      data: {
        title: 'Updated monthly delivery summary',
        status: 'SUBMITTED',
      },
    });

    await agent
      .patch(`/api/v1/requirements/${created.id}`)
      .set('x-csrf-token', token)
      .send({ status: 'APPROVED' })
      .expect(400);
  });

  it('prevents internal users from submitting client requirements', async () => {
    const agent = await authenticatedAgent(app, 'pm-a@example.com');
    const token = await csrf(agent);
    await agent
      .post('/api/v1/projects/project-a/requirements')
      .set('x-csrf-token', token)
      .field('title', 'Internal submission')
      .field(
        'description',
        'Project managers must not submit client requirements.',
      )
      .field('priority', 'MEDIUM')
      .expect(403);
  });

  it('does not expose the organization project portfolio to ENGINEER users', async () => {
    const agent = await authenticatedAgent(app, 'engineer-a@example.com');
    await agent.get('/api/v1/projects').expect(403);
    await agent.get('/api/v1/clients').expect(403);
  });
});
