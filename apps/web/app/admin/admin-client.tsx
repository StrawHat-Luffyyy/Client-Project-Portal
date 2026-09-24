'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  createClientSchema,
  createInviteSchema,
  type AuthUser,
  type CreateClientInput,
  type CreateInviteInput,
} from '@client-portal/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  FormAlert,
  FormField,
  SelectInput,
  SubmitButton,
  TextInput,
} from '../../components/auth/form-controls';
import {
  AuthenticatedScreen,
  WorkspaceShell,
} from '../../components/workspace/workspace-shell';
import { apiRequest } from '../../lib/api-client';
import {
  clientResponseSchema,
  clientsResponseSchema,
} from '../../lib/workspace-api';

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

function ClientForm() {
  const queryClient = useQueryClient();
  const form = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    mode: 'onBlur',
    defaultValues: { name: '', contactEmail: '' },
  });
  const mutation = useMutation({
    mutationFn: async (input: CreateClientInput) =>
      clientResponseSchema.parse(
        await apiRequest<unknown>(
          '/clients',
          { method: 'POST', body: JSON.stringify(input) },
          { csrf: true },
        ),
      ),
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Add a client</h2>
      <p className="mt-1 text-sm text-slate-600">
        Client accounts own projects and define client-user access boundaries.
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
          <FormAlert message="Client created." success />
        ) : null}
        <FormField
          error={form.formState.errors.name?.message}
          label="Client name"
        >
          <TextInput {...form.register('name')} />
        </FormField>
        <FormField
          error={form.formState.errors.contactEmail?.message}
          label="Contact email"
        >
          <TextInput
            autoComplete="email"
            type="email"
            {...form.register('contactEmail')}
          />
        </FormField>
        <div className="sm:max-w-52">
          <SubmitButton pending={mutation.isPending}>Add client</SubmitButton>
        </div>
      </form>
    </section>
  );
}

function InviteForm({ clients }: { clients: { id: string; name: string }[] }) {
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
      <h2 className="text-lg font-semibold text-slate-950">Invite a user</h2>
      <p className="mt-1 text-sm text-slate-600">
        Invitation links are shown for manual sharing in the MVP.
      </p>
      <form
        className="mt-5 grid gap-5"
        noValidate
        onSubmit={(event) =>
          void form.handleSubmit((values) => mutation.mutate(values))(event)
        }
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
        {role === 'CLIENT' ? (
          <FormField
            error={form.formState.errors.clientId?.message}
            label="Client"
          >
            <SelectInput
              {...form.register('clientId', {
                setValueAs: (value: string) => value || undefined,
              })}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </SelectInput>
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

function AdminContent({ user }: { user: AuthUser }) {
  const clients = useQuery({
    queryKey: ['clients', { pageSize: 100 }],
    queryFn: async () =>
      clientsResponseSchema.parse(
        await apiRequest<unknown>('/clients?pageSize=100'),
      ),
  });

  if (user.role !== 'ADMIN' && user.role !== 'PM') {
    return (
      <WorkspaceShell
        description="This area is restricted to organization administrators and project managers."
        title="Access restricted"
        user={user}
      >
        <FormAlert message="You do not have permission to manage clients." />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      description="Manage the client accounts that own projects and the users who collaborate on them."
      title="Clients & team"
      user={user}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section>
          <h2 className="text-lg font-semibold text-slate-950">
            Client accounts
          </h2>
          {clients.isPending ? (
            <p className="mt-4 text-slate-600" aria-busy="true">
              Loading clients…
            </p>
          ) : null}
          {clients.isError ? (
            <div className="mt-4">
              <FormAlert message={clients.error.message} />
            </div>
          ) : null}
          {clients.data?.data.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <h3 className="font-semibold text-slate-950">No clients yet</h3>
              <p className="mt-2 text-sm text-slate-600">
                Add the first client to begin creating projects.
              </p>
            </div>
          ) : null}
          <div className="mt-4 grid gap-3">
            {clients.data?.data.map((client) => (
              <article
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                key={client.id}
              >
                <h3 className="font-semibold text-slate-950">{client.name}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {client.contactEmail}
                </p>
              </article>
            ))}
          </div>
        </section>
        <div className="grid content-start gap-6">
          <ClientForm />
          {user.role === 'ADMIN' && clients.data ? (
            <InviteForm clients={clients.data.data} />
          ) : null}
        </div>
      </div>
    </WorkspaceShell>
  );
}

export function AdminClient() {
  return (
    <AuthenticatedScreen>
      {(user) => <AdminContent user={user} />}
    </AuthenticatedScreen>
  );
}
