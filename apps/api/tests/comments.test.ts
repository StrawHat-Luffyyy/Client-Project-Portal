import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/lib/security.js';
import { InMemoryCommentRepository } from './support/in-memory-comment.repository.js';
import { InMemoryIdentityRepository } from './support/in-memory-identity.repository.js';
import { InMemoryTaskRepository } from './support/in-memory-task.repository.js';
import {
  InMemoryAttachmentStorage,
  InMemoryWorkspaceRepository,
} from './support/in-memory-workspace.repository.js';

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

describe('requirement and task comments API', () => {
  const identities = new InMemoryIdentityRepository();
  const workspace = new InMemoryWorkspaceRepository();
  const tasks = new InMemoryTaskRepository(workspace);
  const comments = new InMemoryCommentRepository(workspace, tasks);
  const app = createApp({
    identities,
    workspace,
    tasks,
    comments,
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
      comments.authors.set(id, { id, name: id, role });
    }
    workspace.projects.push(
      {
        id: 'project-a',
        organizationId: 'organization-a',
        clientId: 'client-a',
        name: 'Project A',
        description: 'Project A description.',
        createdAt: new Date(),
        client: { id: 'client-a', name: 'Client A' },
        requirementCount: 1,
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
        id: 'requirement-a',
        organizationId: 'organization-a',
        projectId: 'project-a',
        createdById: 'client-user-a',
        title: 'Requirement A',
        description: 'Requirement for comment visibility tests.',
        priority: 'HIGH',
        status: 'APPROVED',
        rejectionReason: null,
        createdAt: now,
        updatedAt: now,
        createdBy: { id: 'client-user-a', name: 'Client A User' },
        attachments: [],
      },
      {
        id: 'requirement-b',
        organizationId: 'organization-a',
        projectId: 'project-b',
        createdById: 'client-user-b',
        title: 'Requirement B',
        description: 'Requirement owned by another client.',
        priority: 'LOW',
        status: 'APPROVED',
        rejectionReason: null,
        createdAt: now,
        updatedAt: now,
        createdBy: { id: 'client-user-b', name: 'Client B User' },
        attachments: [],
      },
    );
    tasks.assignees.push(
      { id: 'engineer-a', name: 'Engineer A', email: 'engineer-a@example.com' },
      { id: 'engineer-b', name: 'Engineer B', email: 'engineer-b@example.com' },
    );
    await tasks.createTask(
      {
        userId: 'pm-a',
        organizationId: 'organization-a',
        clientId: null,
        role: 'PM',
      },
      'requirement-a',
      {
        idempotencyKey: '55555555-5555-4555-8555-555555555555',
        title: 'Assigned task',
        description: 'Task assigned for comment access tests.',
        assigneeId: 'engineer-a',
      },
    );
  });

  it('never exposes internal requirement comments to a client', async () => {
    const pm = await authenticatedAgent(app, 'pm-a@example.com');
    const pmToken = await csrf(pm);
    await pm
      .post('/api/v1/requirements/requirement-a/comments')
      .set('x-csrf-token', pmToken)
      .send({ body: 'Internal delivery risk.', visibility: 'INTERNAL' })
      .expect(201);
    await pm
      .post('/api/v1/requirements/requirement-a/comments')
      .set('x-csrf-token', pmToken)
      .send({
        body: 'Client-visible progress update.',
        visibility: 'CLIENT_VISIBLE',
      })
      .expect(201);

    const client = await authenticatedAgent(app, 'client-user-a@example.com');
    const visible = await client
      .get('/api/v1/requirements/requirement-a/comments?pageSize=100')
      .expect(200);
    expect(visible.body).toMatchObject({
      data: [
        {
          body: 'Client-visible progress update.',
          visibility: 'CLIENT_VISIBLE',
        },
      ],
      pagination: { total: 1 },
    });
    const activity = await client
      .get('/api/v1/requirements/requirement-a/activity?pageSize=100')
      .expect(200);
    const commentActivity = z
      .object({ data: z.array(z.object({ action: z.string() })) })
      .parse(activity.body as unknown)
      .data.filter((item) => item.action === 'COMMENT_CREATED');
    expect(commentActivity).toHaveLength(1);
    const clientToken = await csrf(client);
    await client
      .post('/api/v1/requirements/requirement-a/comments')
      .set('x-csrf-token', clientToken)
      .send({ body: 'Attempted internal note.', visibility: 'INTERNAL' })
      .expect(403, {
        error: {
          code: 'COMMENT_VISIBILITY_FORBIDDEN',
          message: 'Clients can only create client-visible comments.',
        },
      });
  });

  it('enforces client and organization scope before comment access', async () => {
    const otherClient = await authenticatedAgent(
      app,
      'client-user-b@example.com',
    );
    await otherClient
      .get('/api/v1/requirements/requirement-a/comments')
      .expect(404);
    const otherOrganization = await authenticatedAgent(app, 'pm-c@example.com');
    await otherOrganization
      .get('/api/v1/requirements/requirement-a/comments')
      .expect(404);
  });

  it('supports one reply level with matching visibility', async () => {
    const client = await authenticatedAgent(app, 'client-user-a@example.com');
    const token = await csrf(client);
    const parent = await client
      .post('/api/v1/requirements/requirement-a/comments')
      .set('x-csrf-token', token)
      .send({
        body: 'Could you confirm the delivery date?',
        visibility: 'CLIENT_VISIBLE',
      })
      .expect(201);
    const parentId = z
      .object({ data: z.object({ id: z.string() }) })
      .parse(parent.body as unknown).data.id;
    const reply = await client
      .post('/api/v1/requirements/requirement-a/comments')
      .set('x-csrf-token', token)
      .send({
        body: 'Adding the requested context.',
        visibility: 'CLIENT_VISIBLE',
        parentId,
      })
      .expect(201);
    const replyId = z
      .object({ data: z.object({ id: z.string() }) })
      .parse(reply.body as unknown).data.id;
    await client
      .post('/api/v1/requirements/requirement-a/comments')
      .set('x-csrf-token', token)
      .send({
        body: 'A nested reply is not allowed.',
        visibility: 'CLIENT_VISIBLE',
        parentId: replyId,
      })
      .expect(409);

    const pm = await authenticatedAgent(app, 'pm-a@example.com');
    const pmToken = await csrf(pm);
    await pm
      .post('/api/v1/requirements/requirement-a/comments')
      .set('x-csrf-token', pmToken)
      .send({
        body: 'Visibility cannot change in a reply.',
        visibility: 'INTERNAL',
        parentId,
      })
      .expect(409);
  });

  it('limits task comments to the assigned engineer and logs mutations', async () => {
    const task = tasks.tasks[0]!;
    const otherEngineer = await authenticatedAgent(
      app,
      'engineer-b@example.com',
    );
    await otherEngineer.get(`/api/v1/tasks/${task.id}/comments`).expect(404);

    const engineer = await authenticatedAgent(app, 'engineer-a@example.com');
    const token = await csrf(engineer);
    await engineer
      .post(`/api/v1/tasks/${task.id}/comments`)
      .set('x-csrf-token', token)
      .send({
        body: 'Implementation detail for the delivery team.',
        visibility: 'INTERNAL',
      })
      .expect(201);
    const client = await authenticatedAgent(app, 'client-user-a@example.com');
    const clientView = await client
      .get(`/api/v1/tasks/${task.id}/comments`)
      .expect(200);
    expect(clientView.body).toMatchObject({
      data: [],
      pagination: { total: 0 },
    });
    expect(
      workspace.activities.filter(
        (activity) => activity.action === 'COMMENT_CREATED',
      ),
    ).toHaveLength(5);
  });
});
