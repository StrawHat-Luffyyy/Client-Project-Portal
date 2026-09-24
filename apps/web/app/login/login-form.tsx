'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  authUserSchema,
  loginSchema,
  type LoginInput,
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

export function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });
  const mutation = useMutation({
    mutationFn: async (input: LoginInput) =>
      authResponseSchema.parse(
        await apiRequest<unknown>(
          '/auth/login',
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
        error={form.formState.errors.email?.message}
        label="Email address"
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
        label="Password"
      >
        <TextInput
          autoComplete="current-password"
          type="password"
          {...form.register('password')}
        />
      </FormField>
      <SubmitButton pending={mutation.isPending}>Sign in</SubmitButton>
    </form>
  );
}
