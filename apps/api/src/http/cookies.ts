import type { CookieOptions, Response } from 'express';

import { env } from '../config/env.js';

export const ACCESS_COOKIE_NAME = 'portal_access';
export const CSRF_COOKIE_NAME = 'portal_csrf';

const baseCookieOptions: CookieOptions = {
  secure: env.COOKIE_SECURE,
  sameSite: 'lax',
  path: '/',
};

export function setAccessCookie(response: Response, accessToken: string) {
  response.cookie(ACCESS_COOKIE_NAME, accessToken, {
    ...baseCookieOptions,
    httpOnly: true,
    maxAge: env.JWT_EXPIRES_IN_SECONDS * 1000,
  });
}

export function clearAccessCookie(response: Response) {
  response.clearCookie(ACCESS_COOKIE_NAME, {
    ...baseCookieOptions,
    httpOnly: true,
  });
}

export function setCsrfCookie(response: Response, token: string) {
  response.cookie(CSRF_COOKIE_NAME, token, {
    ...baseCookieOptions,
    httpOnly: false,
    maxAge: 24 * 60 * 60 * 1000,
  });
}

export function clearCsrfCookie(response: Response) {
  response.clearCookie(CSRF_COOKIE_NAME, {
    ...baseCookieOptions,
    httpOnly: false,
  });
}
