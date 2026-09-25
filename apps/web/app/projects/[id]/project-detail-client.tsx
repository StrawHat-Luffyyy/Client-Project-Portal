'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  createRequirementSchema,
  requirementStatusSchema,
  type AuthUser,
  type CreateRequirementInput,
} from '@client-portal/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  FormAlert,
  FormField,
  SelectInput,
  SubmitButton,
  TextAreaInput,
  TextInput,
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
import { apiRequest } from '../../../lib/api-client';
import {
  projectResponseSchema,
  requirementResponseSchema,
  requirementsResponseSchema,
} from '../../../lib/workspace-api';

const statuses = requirementStatusSchema.options;

function RequirementForm({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [attachment, setAttachment] = useState<File | null>(null);
  const form = useForm<CreateRequirementInput>({
    resolver: zodResolver(createRequirementSchema),
    mode: 'onBlur',
    defaultValues: { title: '', description: '', priority: 'MEDIUM' },
  });
  const mutation = useMutation({
    mutationFn: async (input: CreateRequirementInput) => {
      const body = new FormData();
      body.set('title', input.title);
      body.set('description', input.description);
      body.set('priority', input.priority);
      if (attachment) body.set('attachment', attachment);
      return requirementResponseSchema.parse(
        await apiRequest<unknown>(
          `/projects/${projectId}/requirements`,
          { method: 'POST', body },
          { csrf: true },
        ),
      );
    },
    onSuccess: async () => {
      form.reset();
      setAttachment(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
        queryClient.invalidateQueries({
          queryKey: ['requirements', projectId],
        }),
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
      ]);
    },
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">
        Submit a requirement
      </h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Describe the business outcome clearly. Your project team will review it
        next.
      </p>
      <form
        className="mt-5 grid gap-5"
        noValidate
        onSubmit={(event) =>
          void form.handleSubmit((values) => mutation.mutate(values))(event)
        }
      >
        <FormAlert message={mutation.error?.message} />
        {mutation.isSuccess ? (
          <FormAlert message="Requirement submitted for review." success />
        ) : null}
        <FormField error={form.formState.errors.title?.message} label="Title">
          <TextInput {...form.register('title')} />
        </FormField>
        <FormField
          error={form.formState.errors.description?.message}
          helper="Include the users affected, the desired outcome, and any important constraints."
          label="Description"
        >
          <TextAreaInput {...form.register('description')} />
        </FormField>
        <FormField
          error={form.formState.errors.priority?.message}
          label="Priority"
        >
          <SelectInput {...form.register('priority')}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </SelectInput>
        </FormField>
        <FormField
          helper="Optional. PDF, Word, text, PNG, or JPEG up to 10 MB."
          label="Supporting attachment"
        >
          <TextInput
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
            type="file"
          />
        </FormField>
        <div className="sm:max-w-56">
          <SubmitButton pending={mutation.isPending}>
            Submit requirement
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}

function ProjectContent({
  projectId,
  user,
}: {
  projectId: string;
  user: AuthUser;
}) {
  const [status, setStatus] = useState('');
  const project = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () =>
      projectResponseSchema.parse(
        await apiRequest<unknown>(`/projects/${projectId}`),
      ).data,
  });
  const requirements = useQuery({
    queryKey: ['requirements', projectId, { status }],
    queryFn: async () =>
      requirementsResponseSchema.parse(
        await apiRequest<unknown>(
          `/projects/${projectId}/requirements?pageSize=50${status ? `&status=${status}` : ''}`,
        ),
      ),
  });

  if (project.isPending) {
    return (
      <p className="text-slate-600" aria-busy="true">
        Loading project…
      </p>
    );
  }
  if (project.isError) {
    return (
      <main className="mx-auto max-w-xl px-5 py-20 sm:px-8">
        <QueryError
          message={project.error.message}
          onRetry={() => void project.refetch()}
          title="Unable to load this project"
        />
      </main>
    );
  }

  return (
    <WorkspaceShell
      actions={
        <Link
          className="min-h-11 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          href="/projects"
        >
          Back to projects
        </Link>
      }
      description={project.data.description}
      title={project.data.name}
      user={user}
    >
      <div
        className={`grid gap-6 ${user.role === 'CLIENT' ? 'lg:grid-cols-[1.15fr_0.85fr]' : ''}`}
      >
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-700">
                {project.data.client.name}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">
                Requirements
              </h2>
            </div>
            <label className="text-sm font-medium text-slate-700">
              Status
              <select
                className="ml-2 min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm"
                onChange={(event) => setStatus(event.target.value)}
                value={status}
              >
                <option value="">All statuses</option>
                {statuses.map((value) => (
                  <option key={value} value={value}>
                    {value.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {requirements.isPending ? (
            <p className="mt-4 text-slate-600" aria-busy="true">
              Loading requirements…
            </p>
          ) : null}
          {requirements.isError ? (
            <div className="mt-4">
              <QueryError
                message={requirements.error.message}
                onRetry={() => void requirements.refetch()}
                title="Unable to load requirements"
              />
            </div>
          ) : null}
          {requirements.data?.data.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <h3 className="font-semibold text-slate-950">
                No requirements found
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {status
                  ? 'Try another status filter.'
                  : user.role === 'CLIENT'
                    ? 'Submit the first requirement for this project.'
                    : 'The client has not submitted a requirement yet.'}
              </p>
            </div>
          ) : null}
          <div className="mt-4 grid gap-4">
            {requirements.data?.data.map((requirement) => (
              <Link
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300"
                href={`/requirements/${requirement.id}`}
                key={requirement.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-semibold text-slate-950">
                    {requirement.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <PriorityBadge priority={requirement.priority} />
                    <StatusBadge status={requirement.status} />
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                  {requirement.description}
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Submitted by {requirement.createdBy.name} ·{' '}
                  {new Date(requirement.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </section>
        {user.role === 'CLIENT' ? (
          <RequirementForm projectId={projectId} />
        ) : null}
      </div>
    </WorkspaceShell>
  );
}

export function ProjectDetailClient({ projectId }: { projectId: string }) {
  return (
    <AuthenticatedScreen>
      {(user) => <ProjectContent projectId={projectId} user={user} />}
    </AuthenticatedScreen>
  );
}
