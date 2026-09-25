import type { RequestHandler } from 'express';

import type { DashboardService } from '../services/dashboard.service.js';

export function createDashboardController(service: DashboardService) {
  const getDashboard: RequestHandler = async (request, response) => {
    response.json({ data: await service.getDashboard(request.auth!) });
  };

  return { getDashboard };
}
