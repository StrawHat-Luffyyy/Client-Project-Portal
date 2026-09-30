import type {
  RequirementPriority,
  RequirementStatus,
} from '@client-portal/shared';

const statusClasses: Record<RequirementStatus, string> = {
  SUBMITTED: 'status-neutral',
  IN_REVIEW: 'status-indigo',
  NEEDS_INFO: 'status-warning',
  APPROVED: 'status-teal',
  IN_PROGRESS: 'status-info',
  DELIVERED: 'status-success',
  REJECTED: 'status-danger',
};

export function StatusBadge({ status }: { status: RequirementStatus }) {
  return (
    <span className={`status-chip ${statusClasses[status]}`}>
      {status.replaceAll('_', ' ')}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: RequirementPriority }) {
  return (
    <span
      className={`priority-chip ${priority === 'HIGH' ? 'priority-high' : priority === 'MEDIUM' ? 'priority-medium' : 'priority-low'}`}
    >
      {priority}
    </span>
  );
}
