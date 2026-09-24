import type { AuthenticatedScope } from '../domain/auth.js';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedScope;
    }
  }
}

export {};
