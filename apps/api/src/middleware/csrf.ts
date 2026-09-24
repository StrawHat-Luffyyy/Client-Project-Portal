import type { RequestHandler } from 'express';

import { AppError } from '../domain/errors.js';
import { CSRF_COOKIE_NAME, setCsrfCookie } from '../http/cookies.js';
import {
  createCsrfToken,
  safeTokenEqual,
  verifyCsrfToken,
} from '../lib/security.js';

export const issueCsrfToken: RequestHandler = (_request, response) => {
  const token = createCsrfToken();
  setCsrfCookie(response, token);
  response.status(200).json({ data: { csrfToken: token } });
};

export const requireCsrf: RequestHandler = (request, _response, next) => {
  const cookies = request.cookies as
    Record<string, string | undefined> | undefined;
  const cookieToken = cookies?.[CSRF_COOKIE_NAME];
  const headerToken = request.header('x-csrf-token');

  if (
    !cookieToken ||
    !headerToken ||
    !safeTokenEqual(cookieToken, headerToken) ||
    !verifyCsrfToken(headerToken)
  ) {
    return next(
      new AppError(403, 'CSRF_INVALID', 'A valid CSRF token is required.'),
    );
  }

  return next();
};
