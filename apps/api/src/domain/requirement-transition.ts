import type {
  RequirementStatus,
  RequirementTransitionInput,
} from '@client-portal/shared';

import { AppError } from './errors.js';

const pmTransitions: Readonly<
  Partial<Record<RequirementStatus, readonly RequirementStatus[]>>
> = {
  SUBMITTED: ['IN_REVIEW'],
  IN_REVIEW: ['NEEDS_INFO', 'APPROVED', 'REJECTED'],
  NEEDS_INFO: ['IN_REVIEW'],
};

export function allowedPmRequirementTransitions(
  from: RequirementStatus,
): readonly RequirementStatus[] {
  return pmTransitions[from] ?? [];
}

export function assertPmRequirementTransition(
  from: RequirementStatus,
  input: RequirementTransitionInput,
) {
  if (!allowedPmRequirementTransitions(from).includes(input.to)) {
    throw new AppError(
      409,
      'INVALID_REQUIREMENT_TRANSITION',
      `Requirement cannot transition from ${from} to ${input.to}.`,
    );
  }
}
