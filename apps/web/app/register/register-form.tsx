'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  authUserSchema,
  registerOrganizationSchema,
  type RegisterOrganizationInput,
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
} from '../../components/auth/form-controls';
import { apiRequest } from '../../lib/api-client';

const authResponseSchema = z.object({
  data: z.object({ user: authUserSchema }),
});

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<RegisterOrganizationInput>({
    resolver: zodResolver(registerOrganizationSchema),
    mode: 'onBlur',
    defaultValues: { organizationName: '', name: '', email: '', password: '' },
  });
  const mutation = useMutation({
    mutationFn: async (input: RegisterOrganizationInput) =>
      authResponseSchema.parse(
        await apiRequest<unknown>(
          '/auth/register-org',
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
      <FormField
        error={form.formState.errors.organizationName?.message}
        label="Organization name"
      >
        <TextInput
          autoComplete="organization"
          {...form.register('organizationName')}
        />
      </FormField>
      <FormField error={form.formState.errors.name?.message} label="Your name">
        <TextInput autoComplete="name" {...form.register('name')} />
      </FormField>
      <FormField
        error={form.formState.errors.email?.message}
        label="Work email"
      >
        <TextInput
          autoComplete="email"
          inputMode="email"
          type="email"
          {...form.register('email')}
        />
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
        Create organization
      </SubmitButton>
    </form>
  );
}
