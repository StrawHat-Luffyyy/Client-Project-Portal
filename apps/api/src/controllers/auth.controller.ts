import { loginSchema, registerOrganizationSchema } from '@client-portal/shared';
import type { RequestHandler } from 'express';

import {
  clearAccessCookie,
  clearCsrfCookie,
  setAccessCookie,
} from '../http/cookies.js';
import type { AuthService } from '../services/auth.service.js';

export function createAuthController(authService: AuthService) {
  const registerOrganization: RequestHandler = async (request, response) => {
    const result = await authService.registerOrganization(
      registerOrganizationSchema.parse(request.body),
    );
    setAccessCookie(response, result.accessToken);
    response.status(201).json({ data: { user: result.user } });
  };

  const login: RequestHandler = async (request, response) => {
    const result = await authService.login(loginSchema.parse(request.body));
    setAccessCookie(response, result.accessToken);
    response.status(200).json({ data: { user: result.user } });
  };

  const logout: RequestHandler = (_request, response) => {
    clearAccessCookie(response);
    clearCsrfCookie(response);
    response.status(204).send();
  };

  const me: RequestHandler = async (request, response) => {
    const user = await authService.getCurrentUser(request.auth!.userId);
    response.status(200).json({ data: { user } });
  };

  return { registerOrganization, login, logout, me };
}
