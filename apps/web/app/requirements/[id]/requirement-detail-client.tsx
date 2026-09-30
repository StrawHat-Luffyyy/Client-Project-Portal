'use client';

import {
  requirementTransitionSchema,
  type AuthUser,
  type RequirementActivity,
  type Requirement,
  type RequirementStatus,
  type RequirementTransitionInput,
} from '@client-portal/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  FormAlert,
  FormField,
  SelectInput,
  SubmitButton,
  TextAreaInput,
} from '../../../components/auth/form-controls';
import {
  PriorityBadge,
  StatusBadge,
} from '../../../components/workspace/status-badge';
import {
  AuthenticatedScreen,
  WorkspaceShell,
} from '../../../components/workspace/workspace-shell';
import { QueryError } from '../../../components/workspace/query-error';
import { RequirementTasks } from '../../../components/workspace/requirement-tasks';
import { CommentThread } from '../../../components/workspace/comment-thread';
import { apiRequest } from '../../../lib/api-client';
import {
  requirementActivityResponseSchema,
  requirementResponseSchema,
} from '../../../lib/workspace-api';

const pmTransitions: Partial<Record<RequirementStatus, RequirementStatus[]>> = {
  SUBMITTED: ['IN_REVIEW'],
  IN_REVIEW: ['NEEDS_INFO', 'APPROVED', 'REJECTED'],
  NEEDS_INFO: ['IN_REVIEW'],
  IN_PROGRESS: ['DELIVERED'],
};
const noTransitions: RequirementStatus[] = [];

function statusLabel(status: RequirementStatus) {
  return status.toLowerCase().replaceAll('_', ' ');
}

function activityTitle(activity: RequirementActivity) {
  if (activity.action === 'REQUIREMENT_SUBMITTED')
    return 'Requirement submitted';
  if (activity.action === 'REQUIREMENT_UPDATED')
    return 'Requirement details updated';
  if (activity.action === 'TASK_CREATED') {
    const title = activity.metadata.title;
    return typeof title === 'string'
      ? `Task created: ${title}`
      : 'Task created';
  }
  if (activity.action === 'TASK_UPDATED') return 'Task details updated';
  if (activity.action === 'COMMENT_CREATED') {
    return activity.metadata.targetType === 'TASK'
      ? 'Task comment added'
      : 'Requirement comment added';
  }
  if (activity.action === 'TASK_STATUS_CHANGED') {
    const from = activity.metadata.from;
    const to = activity.metadata.to;
    if (typeof from === 'string' && typeof to === 'string') {
      return `Task moved from ${from.toLowerCase().replaceAll('_', ' ')} to ${to.toLowerCase().replaceAll('_', ' ')}`;
    }
  }
  if (activity.action === 'REQUIREMENT_STATUS_CHANGED') {
    const from = activity.metadata.from;
    const to = activity.metadata.to;
    if (typeof from === 'string' && typeof to === 'string') {
      return `Status changed from ${from.toLowerCase().replaceAll('_', ' ')} to ${to.toLowerCase().replaceAll('_', ' ')}`;
    }
  }
  return activity.action.toLowerCase().replaceAll('_', ' ');
}

function ActivityTimeline({ requirementId }: { requirementId: string }) {
  const activity = useQuery({
    queryKey: ['requirement', requirementId, 'activity'],
    queryFn: async () =>
      requirementActivityResponseSchema.parse(
        await apiRequest<unknown>(`/requirements/${requirementId}/activity`),
      ).data,
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Activity</h2>
      <p className="mt-1 text-sm text-slate-500">
        An immutable history of changes to this requirement.
      </p>
      {activity.isPending ? (
        <p className="mt-5 text-sm text-slate-600" aria-busy="true">
          Loading activity…
        </p>
      ) : activity.isError ? (
        <div className="mt-5">
          <QueryError
            message={activity.error.message}
            onRetry={() => void activity.refetch()}
            title="Unable to load activity"
          />
        </div>
      ) : activity.data.length === 0 ? (
        <p className="mt-5 rounded-lg bg-slate-50 px-4 py-5 text-sm text-slate-600">
          No activity has been recorded yet.
        </p>
      ) : (
        <ol className="mt-6 space-y-5 border-l border-slate-200 pl-5">
          {activity.data.map((item) => {
            const reason = item.metadata.reason;
            return (
              <li className="relative" key={item.id}>
                <span
                  aria-hidden="true"
                  className="absolute -left-[1.56rem] top-1.5 size-2 rounded-full bg-blue-600 ring-4 ring-white"
                />
                <p className="text-sm font-semibold capitalize text-slate-900">
                  {activityTitle(item)}
                </p>
                {typeof reason === 'string' ? (
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {reason}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-slate-500">
                  {item.actor.name} ·{' '}
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function TriagePanel({
  requirementId,
  status,
}: {
  requirementId: string;
  status: RequirementStatus;
}) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState<string>();
  const transitions = pmTransitions[status] ?? noTransitions;
  const form = useForm<RequirementTransitionInput>({
    resolver: zodResolver(requirementTransitionSchema),
    shouldUnregister: true,
    defaultValues: { to: transitions[0] ?? 'IN_REVIEW' },
  });
  const selectedStatus = form.watch('to');
  const reasonRequired =
    selectedStatus === 'NEEDS_INFO' || selectedStatus === 'REJECTED';

  useEffect(() => {
    form.reset({ to: transitions[0] ?? 'IN_REVIEW' });
  }, [form, status, transitions]);

  const transition = useMutation({
    mutationFn: async (input: RequirementTransitionInput) =>
      requirementResponseSchema.parse(
        await apiRequest<unknown>(
          `/requirements/${requirementId}/transition`,
          { method: 'POST', body: JSON.stringify(input) },
          { csrf: true },
        ),
      ).data,
    onSuccess: async (updated) => {
      setSuccess(`Requirement moved to ${statusLabel(updated.status)}.`);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['requirement', requirementId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['requirement', requirementId, 'activity'],
        }),
        queryClient.invalidateQueries({ queryKey: ['requirements'] }),
      ]);
    },
  });

  return (
    <section className="rounded-xl border border-blue-200 bg-blue-50/60 p-6">
      <h2 className="text-lg font-semibold text-slate-950">PM triage</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Move this requirement through the controlled review workflow.
      </p>
      {transitions.length === 0 ? (
        <p className="mt-5 rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
          No PM triage actions are available from this status.
        </p>
      ) : (
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) =>
            void form.handleSubmit((input) => {
              setSuccess(undefined);
              transition.mutate(input);
            })(event)
          }
        >
          <FormField
            error={form.formState.errors.to?.message}
            label="Next status"
          >
            <SelectInput {...form.register('to')}>
              {transitions.map((nextStatus) => (
                <option key={nextStatus} value={nextStatus}>
                  {statusLabel(nextStatus)}
                </option>
              ))}
            </SelectInput>
          </FormField>
          {reasonRequired ? (
            <FormField
              error={form.formState.errors.reason?.message}
              helper="This explanation is visible in the requirement activity history."
              label={
                selectedStatus === 'REJECTED'
                  ? 'Rejection reason'
                  : 'Information needed'
              }
            >
              <TextAreaInput
                placeholder={
                  selectedStatus === 'REJECTED'
                    ? 'Explain why this requirement cannot proceed.'
                    : 'Describe the information needed from the client.'
                }
                {...form.register('reason')}
              />
            </FormField>
          ) : null}
          <FormAlert message={transition.error?.message} />
          <FormAlert message={success} success />
          <SubmitButton pending={transition.isPending}>
            Apply transition
          </SubmitButton>
        </form>
      )}
    </section>
  );
}

function RequirementContent({
  requirement,
  requirementId,
  user,
}: {
  requirement: Requirement;
  requirementId: string;
  user: AuthUser;
}) {
  const statusPath: RequirementStatus[] = [
    'SUBMITTED',
    'IN_REVIEW',
    'APPROVED',
    'IN_PROGRESS',
    'DELIVERED',
  ];
  const currentStage =
    requirement.status === 'NEEDS_INFO' ? 'IN_REVIEW' : requirement.status;
  const currentIndex = statusPath.indexOf(currentStage);
  const stageCopy =
    user.role === 'CLIENT'
      ? requirement.status === 'NEEDS_INFO'
        ? 'Your team is waiting for more information from you.'
        : requirement.status === 'SUBMITTED' ||
            requirement.status === 'IN_REVIEW'
          ? 'Your project manager is reviewing this request.'
          : requirement.status === 'DELIVERED'
            ? 'The project manager has confirmed delivery.'
            : 'The engineering team is working through the approved tasks.'
      : user.role === 'PM'
        ? requirement.status === 'SUBMITTED' ||
          requirement.status === 'IN_REVIEW' ||
          requirement.status === 'NEEDS_INFO'
          ? 'Review the request and decide the next triage step.'
          : requirement.status === 'IN_PROGRESS'
            ? 'Confirm delivery when all task work is complete.'
            : 'This request has reached its final state.'
        : requirement.status === 'DELIVERED' ||
            requirement.status === 'REJECTED'
          ? 'No further delivery action is expected.'
          : 'Follow the task breakdown for the next engineering action.';
  return (
    <div className="space-y-5">
      <section className="requirement-overview">
        <div className="requirement-overview-top">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={requirement.priority} />
            <StatusBadge status={requirement.status} />
          </div>
          <Link
            className="button-secondary"
            href={`/projects/${requirement.projectId}`}
          >
            View project
          </Link>
        </div>
        <div
          aria-label="Requirement progress"
          className="requirement-flow"
          role="list"
        >
          {statusPath.map((status, index) => (
            <div
              aria-current={status === currentStage ? 'step' : undefined}
              className={`requirement-flow-step${status === currentStage ? ' current' : index < currentIndex ? ' complete' : ''}`}
              key={status}
              role="listitem"
            >
              <span aria-hidden="true" className="requirement-flow-dot">
                {index < currentIndex ? '✓' : index + 1}
              </span>
              <span>{status.replaceAll('_', ' ').toLowerCase()}</span>
            </div>
          ))}
        </div>
        {requirement.status === 'NEEDS_INFO' ? (
          <p className="requirement-substate">
            <span className="status-chip status-warning">
              Needs information
            </span>
            <span>
              This request returns to review when the client responds.
            </span>
          </p>
        ) : requirement.status === 'REJECTED' ? (
          <p className="requirement-substate">
            <span className="status-chip status-danger">Rejected</span>
            <span>This request is closed.</span>
          </p>
        ) : null}
      </section>

      <section aria-label="Next action" className="next-action-band">
        <div className="next-action-copy">
          <p className="operational-eyebrow">NEXT ACTION</p>
          <h2 className="section-title">
            {user.role === 'PM' &&
            ['SUBMITTED', 'IN_REVIEW', 'NEEDS_INFO'].includes(
              requirement.status,
            )
              ? 'Project manager review'
              : user.role === 'CLIENT' && requirement.status === 'NEEDS_INFO'
                ? 'Information requested'
                : user.role === 'ENGINEER' &&
                    requirement.status === 'IN_PROGRESS'
                  ? 'Engineering delivery'
                  : 'Current owner'}
          </h2>
          <p className="section-description">{stageCopy}</p>
        </div>
        {user.role === 'PM' ? (
          <TriagePanel
            requirementId={requirementId}
            status={requirement.status}
          />
        ) : null}
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(260px,.7fr)]">
        <div className="grid min-w-0 gap-5">
          <section className="panel p-5 sm:p-6">
            <div className="flex flex-wrap gap-2">
              <p className="m-0 text-xs font-bold uppercase tracking-[.09em] text-[#61748a]">
                Request details
              </p>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-[#34465a]">
              {requirement.description}
            </p>
            {requirement.rejectionReason ? (
              <div className="mt-5 rounded-md border border-[#f2c2c2] bg-[#fff5f5] p-4">
                <h2 className="text-sm font-semibold text-[var(--color-danger)]">
                  Rejection reason
                </h2>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#7f1d1d]">
                  {requirement.rejectionReason}
                </p>
              </div>
            ) : null}
            {requirement.attachments.length > 0 ? (
              <div className="mt-5 border-t border-[#e8edf2] pt-4">
                <h2 className="section-title">Attachments</h2>
                <ul className="mt-3 grid gap-2">
                  {requirement.attachments.map((attachment) => (
                    <li
                      className="rounded-md bg-[#f6f8fa] px-3 py-2 text-sm text-[#34465a]"
                      key={attachment.id}
                    >
                      {attachment.fileName} ·{' '}
                      {(attachment.size / 1024).toFixed(1)} KB
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
          <RequirementTasks
            requirementId={requirementId}
            requirementStatus={requirement.status}
            user={user}
          />
          <CommentThread
            targetId={requirementId}
            targetType="requirements"
            user={user}
          />
          <ActivityTimeline requirementId={requirementId} />
        </div>
        <aside className="grid content-start gap-5">
          <section className="panel p-5">
            <h2 className="section-title">Submission</h2>
            <dl className="mt-4 grid gap-4 text-sm">
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Submitted by
                </dt>
                <dd className="mt-1 font-semibold text-[var(--color-foreground)]">
                  {requirement.createdBy.name}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Created
                </dt>
                <dd className="mt-1 font-medium text-[#34465a]">
                  {new Date(requirement.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted-foreground)]">
                  Last updated
                </dt>
                <dd className="mt-1 font-medium text-[#34465a]">
                  {new Date(requirement.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

function RequirementWorkspace({
  requirementId,
  user,
}: {
  requirementId: string;
  user: AuthUser;
}) {
  const requirement = useQuery({
    queryKey: ['requirement', requirementId],
    queryFn: async () =>
      requirementResponseSchema.parse(
        await apiRequest<unknown>(`/requirements/${requirementId}`),
      ).data,
  });
  if (requirement.isPending)
    return (
      <main className="mx-auto max-w-6xl px-5 py-12" aria-busy="true">
        <div className="h-7 w-48 animate-pulse rounded bg-[#e8edf2]" />
        <div className="mt-5 h-40 animate-pulse rounded-lg bg-[#e8edf2]" />
        <p className="sr-only">Loading requirement details</p>
      </main>
    );
  if (requirement.isError)
    return (
      <main className="mx-auto max-w-xl px-5 py-20">
        <QueryError
          message={requirement.error.message}
          onRetry={() => void requirement.refetch()}
          title="Unable to load this requirement"
        />
      </main>
    );
  return (
    <WorkspaceShell
      description={`${requirement.data.createdBy.name} · Request in project workspace`}
      title={requirement.data.title}
      titleAriaLabel={`Requirement: ${requirement.data.title}`}
      user={user}
    >
      <RequirementContent
        requirement={requirement.data}
        requirementId={requirementId}
        user={user}
      />
    </WorkspaceShell>
  );
}

export function RequirementDetailClient({
  requirementId,
}: {
  requirementId: string;
}) {
  return (
    <AuthenticatedScreen>
      {(user) => (
        <RequirementWorkspace requirementId={requirementId} user={user} />
      )}
    </AuthenticatedScreen>
  );
}
