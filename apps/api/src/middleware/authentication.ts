import type { RequestHandler } from 'express';

import type { IdentityRepository } from '../domain/auth.js';
import { unauthorized } from '../domain/errors.js';
import { ACCESS_COOKIE_NAME } from '../http/cookies.js';
import { verifyAccessToken } from '../lib/security.js';

export function requireAuthentication(
  identities: IdentityRepository,
): RequestHandler {
  return async (request, _response, next) => {
    try {
      const cookies = request.cookies as
        Record<string, string | undefined> | undefined;
      const token = cookies?.[ACCESS_COOKIE_NAME];
      if (!token) throw unauthorized();

      const userId = verifyAccessToken(token);
      const user = await identities.findUserById(userId);
      if (!user) throw unauthorized();

      request.auth = {
        userId: user.id,
        organizationId: user.organizationId,
        clientId: user.clientId,
        role: user.role,
      };
      next();
    } catch (error: unknown) {
      next(error);
    }
  };
}
