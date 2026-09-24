import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { unauthorized } from '../domain/errors.js';

const PASSWORD_ROUNDS = 12;

export function hashPassword(password: string) {
  return bcrypt.hash(password, PASSWORD_ROUNDS);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function createAccessToken(userId: string) {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: userId,
    expiresIn: env.JWT_EXPIRES_IN_SECONDS,
    issuer: 'client-project-portal',
    audience: 'client-project-portal-web',
  });
}

export function verifyAccessToken(token: string) {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'client-project-portal',
      audience: 'client-project-portal-web',
    });

    if (typeof payload === 'string' || !payload.sub) {
      throw unauthorized();
    }

    return payload.sub;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AppError') {
      throw error;
    }
    throw unauthorized();
  }
}

export function createInviteToken() {
  return randomBytes(32).toString('base64url');
}

export function hashInviteToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function createCsrfToken() {
  const nonce = randomBytes(24).toString('base64url');
  const signature = createHmac('sha256', env.CSRF_SECRET)
    .update(nonce)
    .digest('base64url');
  return `${nonce}.${signature}`;
}

export function verifyCsrfToken(token: string) {
  const [nonce, signature, ...rest] = token.split('.');
  if (!nonce || !signature || rest.length > 0) return false;

  const expected = createHmac('sha256', env.CSRF_SECRET).update(nonce).digest();
  const provided = Buffer.from(signature, 'base64url');
  return (
    expected.length === provided.length && timingSafeEqual(expected, provided)
  );
}

export function safeTokenEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}
