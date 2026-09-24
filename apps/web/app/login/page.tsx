import type { Metadata } from 'next';

import { LoginForm } from './login-form';
import { AuthShell } from '../../components/auth/auth-shell';

export const metadata: Metadata = { title: 'Sign in | Client Project Portal' };

export default function LoginPage() {
  return (
    <AuthShell
      alternateHref="/register"
      alternateLabel="Create an organization"
      alternateText="New to the portal?"
      description="Use your organization account to continue to your project workspace."
      eyebrow="Welcome back"
      title="Sign in"
    >
      <LoginForm />
    </AuthShell>
  );
}
