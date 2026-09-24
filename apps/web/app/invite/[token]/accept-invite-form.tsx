'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  acceptInviteSchema,
  authUserSchema,
  type AcceptInviteInput,
} from '@client-portal/shared';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  FormAlert,
  FormField,
  SubmitButton,
  TextInput,
} from '../../../components/auth/form-controls';
import { apiRequest } from '../../../lib/api-client';

const authResponseSchema = z.object({
  data: z.object({ user: authUserSchema }),
});

export function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const form = useForm<AcceptInviteInput>({
    resolver: zodResolver(acceptInviteSchema),
    mode: 'onBlur',
    defaultValues: { name: '', password: '' },
  });
  const mutation = useMutation({
    mutationFn: async (input: AcceptInviteInput) =>
      authResponseSchema.parse(
        await apiRequest<unknown>(
          `/invites/${encodeURIComponent(token)}/accept`,
          { method: 'POST', body: JSON.stringify(input) },
          { csrf: true },
        ),
      ),
    onSuccess: () => router.push('/dashboard'),
  });

  return (
    <form
      className="space-y-5"
      onSubmit={(event) =>
        void form.handleSubmit((values) => mutation.mutate(values))(event)
      }
      noValidate
    >
      <FormAlert message={mutation.error?.message} />
      <FormField error={form.formState.errors.name?.message} label="Your name">
        <TextInput autoComplete="name" {...form.register('name')} />
      </FormField>
      <FormField
        error={form.formState.errors.password?.message}
        helper="Use 12 or more characters with uppercase, lowercase, and a number."
        label="Password"
      >
        <TextInput
          autoComplete="new-password"
          type="password"
          {...form.register('password')}
        />
      </FormField>
      <SubmitButton pending={mutation.isPending}>
        Accept invitation
      </SubmitButton>
    </form>
  );
}
