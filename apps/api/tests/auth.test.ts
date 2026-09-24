import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createApp } from '../src/app.js';
import { hashPassword } from '../src/lib/security.js';
import { InMemoryIdentityRepository } from './support/in-memory-identity.repository.js';

const password = 'StrongPassword123';

const csrfResponseSchema = z.object({
  data: z.object({ csrfToken: z.string() }),
});
const inviteResponseSchema = z.object({
  data: z.object({ invite: z.object({ inviteLink: z.string().url() }) }),
});

async function getCsrf(agent: ReturnType<typeof request.agent>) {
  const response = await agent.get('/api/v1/auth/csrf').expect(200);
  return csrfResponseSchema.parse(response.body as unknown).data.csrfToken;
}

async function login(
  agent: ReturnType<typeof request.agent>,
  email: string,
  loginPassword = password,
) {
  const csrfToken = await getCsrf(agent);
  return agent
    .post('/api/v1/auth/login')
    .set('x-csrf-token', csrfToken)
    .send({ email, password: loginPassword });
}

describe('authentication and authorization API', () => {
  const identities = new InMemoryIdentityRepository();
  const app = createApp({ identities });

  beforeAll(async () => {
    const passwordHash = await hashPassword(password);
    identities.addClient('organization-a', 'client-a');
    identities.addClient('organization-b', 'client-b');
    identities.addUser({
      id: 'admin-a',
      organizationId: 'organization-a',
      clientId: null,
      name: 'Admin A',
      email: 'admin-a@example.com',
      passwordHash,
      role: 'ADMIN',
    });
    identities.addUser({
      id: 'client-user-a',
      organizationId: 'organization-a',
      clientId: 'client-a',
      name: 'Client A',
      email: 'client-a@example.com',
      passwordHash,
      role: 'CLIENT',
    });
  });

  it('rejects state-changing requests without a CSRF token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin-a@example.com', password });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: {
        code: 'CSRF_INVALID',
        message: 'A valid CSRF token is required.',
      },
    });
  });

  it('registers an organization admin and authenticates through an httpOnly cookie', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrf(agent);
    const registration = await agent
      .post('/api/v1/auth/register-org')
      .set('x-csrf-token', csrfToken)
      .send({
        organizationName: 'New Organization',
        name: 'New Admin',
        email: 'new-admin@example.com',
        password,
      });

    expect(registration.status).toBe(201);
    const setCookieHeader = registration.headers['set-cookie'] ?? '';
    const serializedCookies = Array.isArray(setCookieHeader)
      ? setCookieHeader.join(';')
      : setCookieHeader;
    expect(serializedCookies).toContain('portal_access=');
    expect(serializedCookies).toContain('HttpOnly');
    expect(serializedCookies).toContain('SameSite=Lax');

    const me = await agent.get('/api/v1/auth/me');
    expect(me.status).toBe(200);
    expect(me.body).toMatchObject({
      data: { user: { email: 'new-admin@example.com' } },
    });
  });

  it('returns a generic error for invalid credentials', async () => {
    const response = await login(
      request.agent(app),
      'admin-a@example.com',
      'wrong-password',
    );
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect.',
      },
    });
  });

  it('prevents a CLIENT from creating invitations', async () => {
    const agent = request.agent(app);
    expect((await login(agent, 'client-a@example.com')).status).toBe(200);
    const response = await agent.post('/api/v1/invites').send({
      email: 'other@example.com',
      role: 'ENGINEER',
    });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action.',
      },
    });
  });

  it('does not allow an ADMIN to invite a client user into another organization client', async () => {
    const agent = request.agent(app);
    expect((await login(agent, 'admin-a@example.com')).status).toBe(200);
    const csrfToken = await getCsrf(agent);
    const response = await agent
      .post('/api/v1/invites')
      .set('x-csrf-token', csrfToken)
      .send({
        email: 'cross-tenant@example.com',
        role: 'CLIENT',
        clientId: 'client-b',
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: 'CLIENT_NOT_FOUND', message: 'Client was not found.' },
    });
  });

  it('creates and accepts a one-time tenant-scoped invitation', async () => {
    const adminAgent = request.agent(app);
    expect((await login(adminAgent, 'admin-a@example.com')).status).toBe(200);
    const adminCsrf = await getCsrf(adminAgent);
    const invitationResponse = await adminAgent
      .post('/api/v1/invites')
      .set('x-csrf-token', adminCsrf)
      .send({ email: 'engineer-a@example.com', role: 'ENGINEER' });

    expect(invitationResponse.status).toBe(201);
    const inviteLink = inviteResponseSchema.parse(
      invitationResponse.body as unknown,
    ).data.invite.inviteLink;
    const token = inviteLink.split('/').at(-1)!;

    const invitedAgent = request.agent(app);
    const inviteCsrf = await getCsrf(invitedAgent);
    const accepted = await invitedAgent
      .post(`/api/v1/invites/${token}/accept`)
      .set('x-csrf-token', inviteCsrf)
      .send({ name: 'Engineer A', password });

    expect(accepted.status).toBe(201);
    expect(accepted.body).toMatchObject({
      data: { user: { organizationId: 'organization-a', role: 'ENGINEER' } },
    });

    const replay = await request(app)
      .post(`/api/v1/invites/${token}/accept`)
      .set('Cookie', [`portal_csrf=${inviteCsrf}`])
      .set('x-csrf-token', inviteCsrf)
      .send({ name: 'Engineer A', password });
    expect(replay.status).toBe(410);
    expect(replay.body).toMatchObject({ error: { code: 'INVITE_INVALID' } });
  });

  it('clears authentication on logout', async () => {
    const agent = request.agent(app);
    expect((await login(agent, 'admin-a@example.com')).status).toBe(200);
    const csrfToken = await getCsrf(agent);
    await agent
      .post('/api/v1/auth/logout')
      .set('x-csrf-token', csrfToken)
      .expect(204);
    await agent.get('/api/v1/auth/me').expect(401);
  });
});
