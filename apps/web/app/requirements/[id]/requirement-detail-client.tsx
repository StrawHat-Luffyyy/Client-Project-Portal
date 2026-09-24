'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { FormAlert } from '../../../components/auth/form-controls';
import {
  PriorityBadge,
  StatusBadge,
} from '../../../components/workspace/status-badge';
import {
  AuthenticatedScreen,
  WorkspaceShell,
} from '../../../components/workspace/workspace-shell';
import { apiRequest } from '../../../lib/api-client';
import { requirementResponseSchema } from '../../../lib/workspace-api';

function RequirementContent({ requirementId }: { requirementId: string }) {
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
    return <FormAlert message={requirement.error.message} />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
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
                  {attachment.fileName} · {(attachment.size / 1024).toFixed(1)}{' '}
                  KB
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
      <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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
          description="Requirement details and submitted context."
          title="Requirement"
          user={user}
        >
          <RequirementContent requirementId={requirementId} />
        </WorkspaceShell>
      )}
    </AuthenticatedScreen>
  );
}
