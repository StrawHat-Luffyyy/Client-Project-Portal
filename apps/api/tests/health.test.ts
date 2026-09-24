import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createApp } from '../src/app.js';

describe('GET /api/v1/health', () => {
  it('returns a structured healthy response', async () => {
    const response = await request(createApp()).get('/api/v1/health');

    expect(response.status).toBe(200);
    const body = z
      .object({
        data: z.object({
          service: z.literal('api'),
          status: z.literal('ok'),
          timestamp: z.string().datetime(),
        }),
      })
      .parse(response.body as unknown);

    expect(body.data.status).toBe('ok');
  });

  it('uses the standard error envelope for unknown routes', async () => {
    const response = await request(createApp()).get('/api/v1/missing');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
      },
    });
  });
});
