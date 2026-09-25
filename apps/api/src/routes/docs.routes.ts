import { Router } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { openApiDocument } from '../openapi.js';

export function createDocsRouter() {
  const router = Router();

  router.get('/v1/openapi.json', (_request, response) => {
    response.status(200).json(openApiDocument);
  });

  router.use(
    '/docs',
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }),
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: 'Client Project Portal API',
      swaggerOptions: { persistAuthorization: false },
    }),
  );

  return router;
}
