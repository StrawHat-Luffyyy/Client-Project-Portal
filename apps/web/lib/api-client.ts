import { apiErrorSchema } from '@client-portal/shared';
import { z } from 'zod';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function getCsrfToken() {
  const response = await fetch(`${API_URL}/auth/csrf`, {
    credentials: 'include',
  });
  if (!response.ok)
    throw new ApiClientError(
      'CSRF_UNAVAILABLE',
      'Unable to secure this request.',
      500,
    );
  const body = z
    .object({ data: z.object({ csrfToken: z.string() }) })
    .parse((await response.json()) as unknown);
  return body.data.csrfToken;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: { csrf?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('accept', 'application/json');
  if (init.body) headers.set('content-type', 'application/json');
  if (options.csrf) headers.set('x-csrf-token', await getCsrfToken());

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const parsed = apiErrorSchema.safeParse(
      await response.json().catch(() => null),
    );
    throw new ApiClientError(
      parsed.success ? parsed.data.error.code : 'REQUEST_FAILED',
      parsed.success
        ? parsed.data.error.message
        : 'The request could not be completed.',
      response.status,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
