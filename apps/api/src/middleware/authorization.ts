import type { Role } from '@client-portal/shared';
import type { RequestHandler } from 'express';

import { forbidden, unauthorized } from '../domain/errors.js';

export function requireRole(...allowedRoles: Role[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth) return next(unauthorized());
    if (!allowedRoles.includes(request.auth.role)) return next(forbidden());
    return next();
  };
}
