'use client';

import {
  requirementTransitionSchema,
  type AuthUser,
  type RequirementActivity,
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

  if (requirement.isPending) {
    return (
      <p className="text-slate-600" aria-busy="true">
        Loading requirement…
      </p>
    );
  }
  if (requirement.isError)
    return (
      <main className="mx-auto max-w-xl px-5 py-20 sm:px-8">
        <QueryError
          message={requirement.error.message}
          onRetry={() => void requirement.refetch()}
          title="Unable to load this requirement"
        />
      </main>
    );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
      <div className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <PriorityBadge priority={requirement.data.priority} />
            <StatusBadge status={requirement.data.status} />
          </div>
          <h2 className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Description
          </h2>
          <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-800">
            {requirement.data.description}
          </p>
          {requirement.data.rejectionReason ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <h2 className="text-sm font-semibold text-red-950">
                Rejection reason
              </h2>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-red-800">
                {requirement.data.rejectionReason}
              </p>
            </div>
          ) : null}
          {requirement.data.attachments.length > 0 ? (
            <div className="mt-8 border-t border-slate-200 pt-5">
              <h2 className="text-sm font-semibold text-slate-950">
                Attachments
              </h2>
              <ul className="mt-3 grid gap-2">
                {requirement.data.attachments.map((attachment) => (
                  <li
                    className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700"
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
          requirementStatus={requirement.data.status}
          user={user}
        />
        <CommentThread
          targetId={requirementId}
          targetType="requirements"
          user={user}
        />
        <ActivityTimeline requirementId={requirementId} />
      </div>
      <aside className="space-y-6">
        {user.role === 'PM' ? (
          <TriagePanel
            requirementId={requirementId}
            status={requirement.data.status}
          />
        ) : null}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Submission</h2>
          <dl className="mt-4 grid gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Submitted by</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {requirement.data.createdBy.name}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Created</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {new Date(requirement.data.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Last updated</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {new Date(requirement.data.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
          <Link
            className="mt-6 inline-flex min-h-11 items-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            href={`/projects/${requirement.data.projectId}`}
          >
            Return to project
          </Link>
        </section>
      </aside>
    </div>
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
        <WorkspaceShell
          description="Review submitted context, control triage, and inspect the audit trail."
          title="Requirement"
          user={user}
        >
          <RequirementContent requirementId={requirementId} user={user} />
        </WorkspaceShell>
      )}
    </AuthenticatedScreen>
  );
}
