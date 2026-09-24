import type {
  RequirementPriority,
  RequirementStatus,
} from '@client-portal/shared';

const statusClasses: Record<RequirementStatus, string> = {
  SUBMITTED: 'border-sky-200 bg-sky-50 text-sky-800',
  IN_REVIEW: 'border-violet-200 bg-violet-50 text-violet-800',
  NEEDS_INFO: 'border-amber-200 bg-amber-50 text-amber-900',
  APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  IN_PROGRESS: 'border-blue-200 bg-blue-50 text-blue-800',
  DELIVERED: 'border-teal-200 bg-teal-50 text-teal-800',
  REJECTED: 'border-red-200 bg-red-50 text-red-800',
};

export function StatusBadge({ status }: { status: RequirementStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[status]}`}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: RequirementPriority }) {
  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
      {priority}
    </span>
  );
}
