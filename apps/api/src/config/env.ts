import { z } from 'zod';
import { randomBytes } from 'node:crypto';

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    API_PORT: z.coerce.number().int().positive().default(4000),
    WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
    JWT_SECRET: z.string().min(32).optional(),
    CSRF_SECRET: z.string().min(32).optional(),
    JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(28_800),
    COOKIE_SECURE: z.enum(['true', 'false']).optional(),
    ATTACHMENT_STORAGE: z.enum(['local', 's3']).default('local'),
    UPLOAD_DIRECTORY: z.string().min(1).default('./uploads'),
    AWS_REGION: z.string().min(1).default('us-east-1'),
    S3_BUCKET: z.string().min(3).optional(),
    S3_KEY_PREFIX: z.string().trim().min(1).default('attachments'),
  })
  .superRefine((value, context) => {
    if (value.ATTACHMENT_STORAGE === 's3' && !value.S3_BUCKET) {
      context.addIssue({
        code: 'custom',
        path: ['S3_BUCKET'],
        message: 'S3_BUCKET is required when ATTACHMENT_STORAGE=s3.',
      });
    }
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
