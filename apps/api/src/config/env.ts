import { z } from 'zod';
import { randomBytes } from 'node:crypto';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(32).optional(),
  CSRF_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(28_800),
  COOKIE_SECURE: z.enum(['true', 'false']).optional(),
  ATTACHMENT_STORAGE: z.literal('local').default('local'),
  UPLOAD_DIRECTORY: z.string().min(1).default('./uploads'),
});

const parsedEnv = envSchema.parse(process.env);

if (
  parsedEnv.NODE_ENV === 'production' &&
  (!parsedEnv.JWT_SECRET || !parsedEnv.CSRF_SECRET)
) {
  throw new Error('JWT_SECRET and CSRF_SECRET are required in production.');
}

export const env = {
  ...parsedEnv,
  JWT_SECRET: parsedEnv.JWT_SECRET ?? randomBytes(32).toString('base64url'),
  CSRF_SECRET: parsedEnv.CSRF_SECRET ?? randomBytes(32).toString('base64url'),
  COOKIE_SECURE:
    parsedEnv.COOKIE_SECURE === undefined
      ? parsedEnv.NODE_ENV === 'production'
      : parsedEnv.COOKIE_SECURE === 'true',
};
