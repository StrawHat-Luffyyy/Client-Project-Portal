import { describe, expect, it } from 'vitest';

import type { AuthenticatedScope } from '../src/domain/auth.js';
import {
  assertResourceScope,
  tenantFilter,
} from '../src/services/tenant-scope.js';

const clientScope: AuthenticatedScope = {
  userId: 'client-user-a',
  organizationId: 'organization-a',
  clientId: 'client-a',
  role: 'CLIENT',
};

describe('central tenant scope policy', () => {
  it('derives organization and client filters from the authenticated scope', () => {
    expect(tenantFilter(clientScope)).toEqual({
      organizationId: 'organization-a',
      clientId: 'client-a',
    });
  });

  it('hides resources from another organization', () => {
    expect(() =>
      assertResourceScope(clientScope, {
        organizationId: 'organization-b',
        clientId: 'client-a',
      }),
    ).toThrowError('Resource was not found.');
  });

  it('hides resources owned by another client in the same organization', () => {
    expect(() =>
      assertResourceScope(clientScope, {
        organizationId: 'organization-a',
        clientId: 'client-b',
      }),
    ).toThrowError('Resource was not found.');
  });

  it('allows an internal user to access clients within their organization', () => {
    expect(() =>
      assertResourceScope(
        { ...clientScope, userId: 'pm-a', clientId: null, role: 'PM' },
        { organizationId: 'organization-a', clientId: 'client-b' },
      ),
    ).not.toThrow();
  });
});
