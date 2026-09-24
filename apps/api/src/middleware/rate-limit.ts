import { rateLimit } from 'express-rate-limit';

export function createAuthRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_request, response) => {
      response.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many authentication attempts. Please try again later.',
        },
      });
    },
  });
}
