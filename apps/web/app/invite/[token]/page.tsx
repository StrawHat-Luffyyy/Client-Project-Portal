import type { Metadata } from 'next';

import { AuthShell } from '../../../components/auth/auth-shell';
import { AcceptInviteForm } from './accept-invite-form';

export const metadata: Metadata = {
  title: 'Accept invitation | Client Project Portal',
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <AuthShell
      alternateHref="/login"
      alternateLabel="Sign in instead"
      alternateText="Already accepted this invitation?"
      description="Choose your name and password to join your organization workspace."
      eyebrow="You’re invited"
      title="Complete your account"
    >
      <AcceptInviteForm token={token} />
    </AuthShell>
  );
}
