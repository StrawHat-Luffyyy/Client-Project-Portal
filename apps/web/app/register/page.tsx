import type { Metadata } from 'next';

import { AuthShell } from '../../components/auth/auth-shell';
import { RegisterForm } from './register-form';

export const metadata: Metadata = {
  title: 'Create organization | Client Project Portal',
};

export default function RegisterPage() {
  return (
    <AuthShell
      alternateHref="/login"
      alternateLabel="Sign in"
      alternateText="Already have an account?"
      description="Create the first administrator account for a new organization."
      eyebrow="Organization setup"
      title="Create your workspace"
    >
      <RegisterForm />
    </AuthShell>
  );
}
