'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProjectSchema,
  type CreateProjectInput,
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
} from '../../components/auth/form-controls';
import {
  AuthenticatedScreen,
  WorkspaceShell,
} from '../../components/workspace/workspace-shell';
import { apiRequest } from '../../lib/api-client';
import {
  clientsResponseSchema,
  projectResponseSchema,
  projectsResponseSchema,
} from '../../lib/workspace-api';

function ProjectForm() {
  const queryClient = useQueryClient();
  const clients = useQuery({
    queryKey: ['clients', { pageSize: 100 }],
    queryFn: async () =>
      clientsResponseSchema.parse(
        await apiRequest<unknown>('/clients?pageSize=100'),
      ),
  });
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    mode: 'onBlur',
    defaultValues: { clientId: '', name: '', description: '' },
  });
  const mutation = useMutation({
    mutationFn: async (input: CreateProjectInput) =>
      projectResponseSchema.parse(
        await apiRequest<unknown>(
          '/projects',
          { method: 'POST', body: JSON.stringify(input) },
          { csrf: true },
        ),
      ),
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Create a project</h2>
      <p className="mt-1 text-sm text-slate-600">
        Assign every project to an existing client account.
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
          <FormAlert message="Project created." success />
        ) : null}
        <FormField
          error={form.formState.errors.clientId?.message}
          label="Client"
        >
          <SelectInput
            {...form.register('clientId')}
            disabled={clients.isPending || clients.isError}
          >
            <option value="">Select a client</option>
            {clients.data?.data.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </SelectInput>
        </FormField>
        {clients.isError ? <FormAlert message={clients.error.message} /> : null}
        <FormField
          error={form.formState.errors.name?.message}
          label="Project name"
        >
          <TextInput {...form.register('name')} />
        </FormField>
        <FormField
          error={form.formState.errors.description?.message}
          label="Description"
        >
          <TextAreaInput {...form.register('description')} />
        </FormField>
        <div className="sm:max-w-52">
          <SubmitButton pending={mutation.isPending}>
            Create project
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}

function ProjectsContent({ canCreate }: { canCreate: boolean }) {
  const [page, setPage] = useState(1);
  const projects = useQuery({
    queryKey: ['projects', { page }],
    queryFn: async () =>
      projectsResponseSchema.parse(
        await apiRequest<unknown>(`/projects?page=${page}&pageSize=10`),
      ),
  });

  return (
    <div
      className={`grid gap-6 ${canCreate ? 'lg:grid-cols-[1.25fr_0.75fr]' : ''}`}
    >
      <section>
        <h2 className="text-lg font-semibold text-slate-950">
          Project portfolio
        </h2>
        {projects.isPending ? (
          <p className="mt-4 text-slate-600" aria-busy="true">
            Loading projects…
          </p>
        ) : null}
        {projects.isError ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm text-red-800" role="alert">
              {projects.error.message}
            </p>
            <button
              className="mt-3 min-h-11 cursor-pointer rounded-md border border-red-300 px-4 text-sm font-semibold text-red-800"
              onClick={() => void projects.refetch()}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : null}
        {projects.data?.data.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h3 className="font-semibold text-slate-950">No projects yet</h3>
            <p className="mt-2 text-sm text-slate-600">
              {canCreate
                ? 'Create the first project after adding a client.'
                : 'Your client account has no assigned projects yet.'}
            </p>
          </div>
        ) : null}
        <div className="mt-4 grid gap-4">
          {projects.data?.data.map((project) => (
            <Link
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300"
              href={`/projects/${project.id}`}
              key={project.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    {project.client.name}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">
                    {project.name}
                  </h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {project.requirementCount} requirements
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {project.description}
              </p>
            </Link>
          ))}
        </div>
        {projects.data && projects.data.pagination.totalPages > 1 ? (
          <nav
            aria-label="Project pages"
            className="mt-5 flex items-center justify-between gap-4"
          >
            <button
              className="min-h-11 cursor-pointer rounded-md border border-slate-300 px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
              type="button"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {page} of {projects.data.pagination.totalPages}
            </span>
            <button
              className="min-h-11 cursor-pointer rounded-md border border-slate-300 px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page >= projects.data.pagination.totalPages}
              onClick={() => setPage((value) => value + 1)}
              type="button"
            >
              Next
            </button>
          </nav>
        ) : null}
      </section>
      {canCreate ? <ProjectForm /> : null}
    </div>
  );
}

export function ProjectsClient() {
  return (
    <AuthenticatedScreen>
      {(user) => (
        <WorkspaceShell
          description="Projects are scoped to your organization and, for client users, to the assigned client account."
          title="Projects"
          user={user}
        >
          <ProjectsContent
            canCreate={user.role === 'ADMIN' || user.role === 'PM'}
          />
        </WorkspaceShell>
      )}
    </AuthenticatedScreen>
  );
}
