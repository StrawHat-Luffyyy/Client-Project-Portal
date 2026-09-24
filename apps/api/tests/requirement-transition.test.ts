import type { RequirementStatus } from '@client-portal/shared';
import { describe, expect, it } from 'vitest';

import {
  allowedPmRequirementTransitions,
  assertPmRequirementTransition,
} from '../src/domain/requirement-transition.js';

describe('requirement transition policy', () => {
  it.each<[RequirementStatus, RequirementStatus[]]>([
    ['SUBMITTED', ['IN_REVIEW']],
    ['IN_REVIEW', ['NEEDS_INFO', 'APPROVED', 'REJECTED']],
    ['NEEDS_INFO', ['IN_REVIEW']],
    ['APPROVED', []],
    ['IN_PROGRESS', []],
    ['DELIVERED', []],
    ['REJECTED', []],
  ])('allows only PM triage transitions from %s', (from, expected) => {
    expect(allowedPmRequirementTransitions(from)).toEqual(expected);
  });

  it('returns a consistent conflict for an invalid transition', () => {
    try {
      assertPmRequirementTransition('SUBMITTED', { to: 'APPROVED' });
      throw new Error('Expected transition validation to fail.');
    } catch (error: unknown) {
      expect(error).toMatchObject({
        statusCode: 409,
        code: 'INVALID_REQUIREMENT_TRANSITION',
      });
    }
  });
});
