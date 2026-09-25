import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createApp } from '../src/app.js';

describe('API documentation', () => {
  it('serves a public OpenAPI document for every API domain', async () => {
    const response = await request(createApp()).get('/api/v1/openapi.json');

    expect(response.status).toBe(200);
    const body = z
      .object({
        openapi: z.string(),
        paths: z.record(z.string(), z.unknown()),
      })
      .parse(response.body as unknown);
    expect(body.openapi).toBe('3.1.0');
    expect(body.paths).toHaveProperty('/auth/login');
    expect(body.paths).toHaveProperty('/projects/{id}/requirements');
    expect(body.paths).toHaveProperty('/requirements/{id}/transition');
    expect(body.paths).toHaveProperty('/tasks/{id}/move');
    expect(body.paths).toHaveProperty('/events');
  });

  it('serves the interactive Swagger UI', async () => {
    const response = await request(createApp()).get('/api/docs/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<div id="swagger-ui"></div>');
    expect(response.headers['content-security-policy']).toContain(
      "script-src 'self' 'unsafe-inline'",
    );
  });
});
