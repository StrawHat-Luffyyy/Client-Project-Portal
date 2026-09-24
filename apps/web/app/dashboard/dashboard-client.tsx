'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  authUserSchema,
  createInviteSchema,
  type AuthUser,
  type CreateInviteInput,
} from '@client-portal/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  FormAlert,
  FormField,
  SelectInput,
  SubmitButton,
  TextInput,
} from '../../components/auth/form-controls';
import { ApiClientError, apiRequest } from '../../lib/api-client';

const meResponseSchema = z.object({ data: z.object({ user: authUserSchema }) });
const inviteResponseSchema = z.object({
  data: z.object({
    invite: z.object({
      id: z.string(),
      email: z.string().email(),
      role: z.string(),
      clientId: z.string().nullable(),
      expiresAt: z.string(),
      inviteLink: z.string().url(),
    }),
  }),
});

function InviteForm() {
  const form = useForm<CreateInviteInput>({
    resolver: zodResolver(createInviteSchema),
    mode: 'onBlur',
    defaultValues: { email: '', role: 'ENGINEER' },
  });
  const role = form.watch('role');
  const mutation = useMutation({
    mutationFn: async (input: CreateInviteInput) =>
      inviteResponseSchema.parse(
        await apiRequest<unknown>(
          '/invites',
          { method: 'POST', body: JSON.stringify(input) },
          { csrf: true },
        ),
      ),
    onSuccess: () => form.reset({ email: '', role: 'ENGINEER' }),
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">
        Invite a teammate
      </h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Invitation links are shown here for manual sharing during the MVP.
      </p>
      <form
        className="mt-6 grid gap-5"
        onSubmit={(event) =>
          void form.handleSubmit((values) => mutation.mutate(values))(event)
        }
        noValidate
      >
        <FormAlert message={mutation.error?.message} />
        {mutation.data ? (
          <div
            className="rounded-md border border-emerald-200 bg-emerald-50 p-3"
            role="status"
          >
            <p className="text-sm font-medium text-emerald-950">
              Invitation created
            </p>
            <a
              className="mt-1 block break-all text-sm text-blue-700 underline underline-offset-4"
              href={mutation.data.data.invite.inviteLink}
            >
              {mutation.data.data.invite.inviteLink}
            </a>
          </div>
        ) : null}
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            error={form.formState.errors.email?.message}
            label="Email address"
          >
            <TextInput
              autoComplete="email"
              type="email"
              {...form.register('email')}
            />
          </FormField>
          <FormField error={form.formState.errors.role?.message} label="Role">
            <SelectInput {...form.register('role')}>
              <option value="PM">Project manager</option>
              <option value="ENGINEER">Engineer</option>
              <option value="CLIENT">Client user</option>
            </SelectInput>
          </FormField>
        </div>
        {role === 'CLIENT' ? (
          <FormField
            error={form.formState.errors.clientId?.message}
            helper="Client selection will replace this ID field when client management is added in Phase 3."
            label="Client ID"
          >
            <TextInput
              {...form.register('clientId', {
                setValueAs: (value: string) => value || undefined,
              })}
            />
          </FormField>
        ) : null}
        <div className="sm:max-w-52">
          <SubmitButton pending={mutation.isPending}>
            Create invitation
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}

function DashboardContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useMutation({
    mutationFn: () =>
      apiRequest<void>('/auth/logout', { method: 'POST' }, { csrf: true }),
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
    },
  });

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <span className="text-sm font-semibold text-slate-950">
            Client Project Portal
          </span>
          <button
            className="min-h-11 cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
            type="button"
          >
            {logout.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
          {user.role}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Welcome, {user.name}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Authentication is active. Project workflow modules will appear here as
          the next phases are completed.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Account scope
            </h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {user.email}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Organization ID</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-800">
                  {user.organizationId}
                </dd>
              </div>
              {user.clientId ? (
                <div>
                  <dt className="text-slate-500">Client ID</dt>
                  <dd className="mt-1 break-all font-mono text-xs text-slate-800">
                    {user.clientId}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
          {user.role === 'ADMIN' ? <InviteForm /> : null}
        </div>
        <FormAlert message={logout.error?.message} />
      </main>
    </>
  );
}

export function DashboardClient() {
  const router = useRouter();
  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () =>
      meResponseSchema.parse(await apiRequest<unknown>('/auth/me')).data.user,
    retry: false,
  });

  useEffect(() => {
    if (query.error instanceof ApiClientError && query.error.status === 401) {
      router.replace('/login');
    }
  }, [query.error, router]);

  if (query.isPending) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8" aria-busy="true">
        <p className="text-slate-600">Loading your workspace…</p>
      </main>
    );
  }

  if (query.isError) {
    return (
      <main className="mx-auto max-w-xl px-5 py-20 sm:px-8">
        <h1 className="text-2xl font-semibold text-slate-950">
          Unable to load your workspace
        </h1>
        <p className="mt-3 text-slate-600">{query.error.message}</p>
        <button
          className="mt-6 min-h-11 cursor-pointer rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          onClick={() => void query.refetch()}
          type="button"
        >
          Try again
        </button>
      </main>
    );
  }

  return <DashboardContent user={query.data} />;
}
