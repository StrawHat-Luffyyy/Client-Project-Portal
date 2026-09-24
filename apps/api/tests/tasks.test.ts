import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/lib/security.js';
import { InMemoryAttachmentStorage } from './support/in-memory-workspace.repository.js';
import { InMemoryIdentityRepository } from './support/in-memory-identity.repository.js';
import { InMemoryTaskRepository } from './support/in-memory-task.repository.js';
import { InMemoryWorkspaceRepository } from './support/in-memory-workspace.repository.js';

const password = 'StrongPassword123';
const csrfSchema = z.object({ data: z.object({ csrfToken: z.string() }) });

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

describe('task breakdown and board API', () => {
  const identities = new InMemoryIdentityRepository();
  const workspace = new InMemoryWorkspaceRepository();
  const tasks = new InMemoryTaskRepository(workspace);
  const app = createApp({
    identities,
    workspace,
    tasks,
    attachmentStorage: new InMemoryAttachmentStorage(),
  });

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
        name: clientId,
        contactEmail: `${clientId}@example.com`,
        createdAt: new Date(),
      });
    }
    for (const [id, organizationId, clientId, role] of [
      ['pm-a', 'organization-a', null, 'PM'],
      ['engineer-a', 'organization-a', null, 'ENGINEER'],
      ['engineer-b', 'organization-a', null, 'ENGINEER'],
      ['client-user-a', 'organization-a', 'client-a', 'CLIENT'],
      ['client-user-b', 'organization-a', 'client-b', 'CLIENT'],
      ['pm-c', 'organization-b', null, 'PM'],
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
    tasks.assignees.push(
      { id: 'engineer-a', name: 'Engineer A', email: 'engineer-a@example.com' },
      { id: 'engineer-b', name: 'Engineer B', email: 'engineer-b@example.com' },
    );
    workspace.projects.push(
      {
        id: 'project-a',
        organizationId: 'organization-a',
        clientId: 'client-a',
        name: 'Project A',
        description: 'Project A description.',
        createdAt: new Date(),
        client: { id: 'client-a', name: 'Client A' },
        requirementCount: 2,
      },
      {
        id: 'project-b',
        organizationId: 'organization-a',
        clientId: 'client-b',
        name: 'Project B',
        description: 'Project B description.',
        createdAt: new Date(),
        client: { id: 'client-b', name: 'Client B' },
        requirementCount: 1,
      },
    );
    const now = new Date();
    workspace.requirements.push(
      {
        id: 'requirement-approved',
        organizationId: 'organization-a',
        projectId: 'project-a',
        createdById: 'client-user-a',
        title: 'Approved requirement',
        description: 'Ready for a task breakdown and implementation work.',
        priority: 'HIGH',
        status: 'APPROVED',
        rejectionReason: null,
        createdAt: now,
        updatedAt: now,
        createdBy: { id: 'client-user-a', name: 'Client User A' },
        attachments: [],
      },
      {
        id: 'requirement-submitted',
        organizationId: 'organization-a',
        projectId: 'project-a',
        createdById: 'client-user-a',
        title: 'Submitted requirement',
        description: 'This requirement has not completed PM review yet.',
        priority: 'LOW',
        status: 'SUBMITTED',
        rejectionReason: null,
        createdAt: now,
        updatedAt: now,
        createdBy: { id: 'client-user-a', name: 'Client User A' },
        attachments: [],
      },
      {
        id: 'requirement-client-b',
        organizationId: 'organization-a',
        projectId: 'project-b',
        createdById: 'client-user-b',
        title: 'Other client requirement',
        description: 'This requirement belongs to another client account.',
        priority: 'MEDIUM',
        status: 'APPROVED',
        rejectionReason: null,
        createdAt: now,
        updatedAt: now,
        createdBy: { id: 'client-user-b', name: 'Client User B' },
        attachments: [],
      },
    );
  });

  it('allows only a PM to create tasks for an approved scoped requirement', async () => {
    const pm = await authenticatedAgent(app, 'pm-a@example.com');
    const token = await csrf(pm);
    const created = await pm
      .post('/api/v1/requirements/requirement-approved/tasks')
      .set('x-csrf-token', token)
      .send({
        idempotencyKey: '11111111-1111-4111-8111-111111111111',
        title: 'Implement reporting endpoint',
        description: 'Create the authenticated endpoint and response contract.',
        assigneeId: 'engineer-a',
        estimateHours: 6.5,
        dueDate: '2026-10-15',
      })
      .expect(201);
    expect(created.body).toMatchObject({
      data: {
        organizationId: 'organization-a',
        requirementId: 'requirement-approved',
        status: 'TODO',
        assignee: { id: 'engineer-a' },
        estimateHours: 6.5,
      },
    });
    const createdBody = z
      .object({ data: z.object({ id: z.string() }) })
      .parse(created.body as unknown);
    const replayed = await pm
      .post('/api/v1/requirements/requirement-approved/tasks')
      .set('x-csrf-token', token)
      .send({
        idempotencyKey: '11111111-1111-4111-8111-111111111111',
        title: 'Implement reporting endpoint',
        description: 'Create the authenticated endpoint and response contract.',
        assigneeId: 'engineer-a',
        estimateHours: 6.5,
        dueDate: '2026-10-15',
      })
      .expect(201);
    expect(replayed.body).toMatchObject({ data: { id: createdBody.data.id } });
    expect(tasks.tasks).toHaveLength(1);

    await pm
      .post('/api/v1/requirements/requirement-submitted/tasks')
      .set('x-csrf-token', token)
      .send({
        idempotencyKey: '22222222-2222-4222-8222-222222222222',
        title: 'Too early',
        description: 'Tasks cannot be created before requirement approval.',
      })
      .expect(409);
    const client = await authenticatedAgent(app, 'client-user-a@example.com');
    const clientToken = await csrf(client);
    await client
      .post('/api/v1/requirements/requirement-approved/tasks')
      .set('x-csrf-token', clientToken)
      .send({
        idempotencyKey: '33333333-3333-4333-8333-333333333333',
        title: 'Unauthorized task',
        description: 'Clients must not create task breakdown records.',
      })
      .expect(403);

    const visible = await client
      .get('/api/v1/requirements/requirement-approved/tasks')
      .expect(200);
    expect(visible.body).toMatchObject({ pagination: { total: 1 } });
    const otherClient = await authenticatedAgent(
      app,
      'client-user-b@example.com',
    );
    await otherClient
      .get('/api/v1/requirements/requirement-approved/tasks')
      .expect(404);
    const otherOrganization = await authenticatedAgent(app, 'pm-c@example.com');
    const otherOrganizationToken = await csrf(otherOrganization);
    await otherOrganization
      .post('/api/v1/requirements/requirement-approved/tasks')
      .set('x-csrf-token', otherOrganizationToken)
      .send({
        idempotencyKey: '44444444-4444-4444-8444-444444444444',
        title: 'Cross-tenant task',
        description: 'Cross-tenant task creation must never succeed.',
      })
      .expect(409);
  });

  it('supports PM task edits and scoped board filters before work starts', async () => {
    const task = tasks.tasks[0]!;
    const pm = await authenticatedAgent(app, 'pm-a@example.com');
    const token = await csrf(pm);
    const updated = await pm
      .patch(`/api/v1/tasks/${task.id}`)
      .set('x-csrf-token', token)
      .send({ title: 'Implement reporting API endpoint', estimateHours: 8 })
      .expect(200);
    expect(updated.body).toMatchObject({
      data: { title: 'Implement reporting API endpoint', estimateHours: 8 },
    });

    const board = await pm
      .get('/api/v1/tasks?projectId=project-a&assigneeId=engineer-a')
      .expect(200);
    expect(board.body).toMatchObject({ pagination: { total: 1 } });
    const assignees = await pm.get('/api/v1/tasks/assignees').expect(200);
    const assigneeBody = z
      .object({ data: z.array(z.object({ id: z.string() })) })
      .parse(assignees.body as unknown);
    expect(assigneeBody.data).toHaveLength(2);
  });

  it('enforces assigned-engineer moves and the delivery invariant', async () => {
    const task = tasks.tasks[0]!;
    const otherEngineer = await authenticatedAgent(
      app,
      'engineer-b@example.com',
    );
    const otherToken = await csrf(otherEngineer);
    await otherEngineer
      .post(`/api/v1/tasks/${task.id}/move`)
      .set('x-csrf-token', otherToken)
      .send({ to: 'IN_PROGRESS' })
      .expect(404);

    const engineer = await authenticatedAgent(app, 'engineer-a@example.com');
    const token = await csrf(engineer);
    const board = await engineer.get('/api/v1/tasks').expect(200);
    expect(board.body).toMatchObject({ pagination: { total: 1 } });
    await engineer
      .post(`/api/v1/tasks/${task.id}/move`)
      .set('x-csrf-token', token)
      .send({ to: 'DONE' })
      .expect(409);

    await engineer
      .post(`/api/v1/tasks/${task.id}/move`)
      .set('x-csrf-token', token)
      .send({ to: 'IN_PROGRESS' })
      .expect(200);
    expect(
      workspace.requirements.find((item) => item.id === 'requirement-approved')
        ?.status,
    ).toBe('IN_PROGRESS');

    const pm = await authenticatedAgent(app, 'pm-a@example.com');
    const pmToken = await csrf(pm);
    await pm
      .post('/api/v1/requirements/requirement-approved/transition')
      .set('x-csrf-token', pmToken)
      .send({ to: 'DELIVERED' })
      .expect(409, {
        error: {
          code: 'REQUIREMENT_NOT_DELIVERABLE',
          message: 'Delivery can only be confirmed after every task is done.',
        },
      });

    await engineer
      .post(`/api/v1/tasks/${task.id}/move`)
      .set('x-csrf-token', token)
      .send({ to: 'IN_REVIEW' })
      .expect(200);
    await engineer
      .post(`/api/v1/tasks/${task.id}/move`)
      .set('x-csrf-token', token)
      .send({ to: 'DONE' })
      .expect(200);
    await pm
      .post('/api/v1/requirements/requirement-approved/transition')
      .set('x-csrf-token', pmToken)
      .send({ to: 'DELIVERED' })
      .expect(200);

    const client = await authenticatedAgent(app, 'client-user-a@example.com');
    const activity = await client
      .get('/api/v1/requirements/requirement-approved/activity?pageSize=20')
      .expect(200);
    const activityBody = z
      .object({ data: z.array(z.object({ action: z.string() })) })
      .parse(activity.body as unknown);
    const actions = activityBody.data.map((item) => item.action);
    expect(actions).toEqual(
      expect.arrayContaining([
        'TASK_CREATED',
        'TASK_UPDATED',
        'TASK_STATUS_CHANGED',
        'REQUIREMENT_STATUS_CHANGED',
      ]),
    );
  });
});
