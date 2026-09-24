import type { AuthenticatedScope } from '../domain/auth.js';
import { AppError } from '../domain/errors.js';

export interface ScopedResource {
  organizationId: string;
  clientId?: string | null;
}

export function assertResourceScope(
  scope: AuthenticatedScope,
  resource: ScopedResource,
) {
  const wrongOrganization = resource.organizationId !== scope.organizationId;
  const wrongClient =
    scope.role === 'CLIENT' &&
    (!resource.clientId || resource.clientId !== scope.clientId);

  if (wrongOrganization || wrongClient) {
    throw new AppError(404, 'RESOURCE_NOT_FOUND', 'Resource was not found.');
  }
}

export function tenantFilter(scope: AuthenticatedScope) {
  return {
    organizationId: scope.organizationId,
    ...(scope.role === 'CLIENT'
      ? { clientId: scope.clientId ?? '__unassigned_client__' }
      : {}),
  };
}
